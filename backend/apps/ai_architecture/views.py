from __future__ import annotations

import os
import io
import json
import uuid
import base64
import logging
import requests as http_requests
from django.conf import settings
from django.db.models import Avg, Q
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
import traceback
from pydantic import BaseModel, Field
from typing import List, Optional
from .models import (
    KnowledgeDocument, AIInstruction, ChatSession, ChatMessage,
    DrawingStylePreset, ImageFeedback, MaterialPrice, TokenUsage,
    BOQTemplate,
)

logger = logging.getLogger(__name__)


def _log_token_usage(user, session, endpoint, response_metadata):
    """
    Best-effort token usage logging. response_metadata comes from
    langchain's AIMessage.response_metadata which includes usage info.
    """
    try:
        usage = response_metadata.get('usage', {}) if response_metadata else {}
        if not usage:
            return
        TokenUsage.objects.create(
            user=user,
            session=session,
            endpoint=endpoint,
            model_name=response_metadata.get('model', settings.CLAUDE_MODEL),
            input_tokens=usage.get('input_tokens', 0),
            output_tokens=usage.get('output_tokens', 0),
        )
    except Exception as e:
        logger.debug("Token usage logging failed: %s", e)


# ── Pydantic schemas for structured output ───────────────────────────

class BOQItem(BaseModel):
    """A single item in a Bill of Quantities."""
    category: str = Field(description="e.g. Substructure / Superstructure / Finishes / Services")
    item_name: str = Field(description="e.g. Face Brick External Walls")
    description: str = Field(description="Detailed description of the item")
    unit: str = Field(description="m² / m³ / m / nr / item")
    quantity: float = Field(description="Measured quantity, estimate with (est.) in description if unsure")
    rate: float = Field(description="Unit rate in local currency, estimate if unknown")
    total_amount: float = Field(description="quantity × rate")
    labour_rate: Optional[float] = Field(default=None, description="Labour cost per unit, if requested by template")
    measurement_formula: Optional[str] = Field(default=None, description="How the quantity was calculated, e.g. '2×(12.5+8.0)×2.7'")

class BOQAnalysis(BaseModel):
    """Structured BOQ analysis result from Claude vision."""
    summary: str = Field(description="Brief overall description of what you see in the image")
    items: List[BOQItem] = Field(description="List of BOQ line items extracted from the image")
    compliance_notes: List[str] = Field(description="Any SI-56 or regulatory observations")
    recommendations: List[str] = Field(description="Suggested next steps for the builder")


# ── Tool definitions for Claude function-calling ─────────────────────

def _get_material_prices(material: str, region: str = "Zimbabwe") -> dict:
    """Look up current material prices for a given region."""
    # ── Try database first ──
    key = material.lower().strip()
    db_results = MaterialPrice.objects.filter(
        material__icontains=key,
        region__icontains=region,
    ).order_by('-updated_at')[:5]

    if db_results.exists():
        prices = [
            {
                "material": p.material,
                "unit": p.unit,
                "price": float(p.price),
                "currency": p.currency,
                "region": p.region,
                "supplier": p.supplier_name or "—",
                "updated": p.updated_at.isoformat() if p.updated_at else "",
            }
            for p in db_results
        ]
        return {"material": key, "region": region, "found": True, "prices": prices}

    # ── Fallback static price list ──
    _PRICE_DB = {
        "cement": {"unit": "50kg bag", "price": 12.50, "currency": "USD"},
        "river sand": {"unit": "m³", "price": 35.00, "currency": "USD"},
        "pit sand": {"unit": "m³", "price": 25.00, "currency": "USD"},
        "common bricks": {"unit": "1000 nr", "price": 85.00, "currency": "USD"},
        "face bricks": {"unit": "1000 nr", "price": 150.00, "currency": "USD"},
        "reinforcement steel": {"unit": "tonne", "price": 950.00, "currency": "USD"},
        "roofing sheets": {"unit": "sheet (0.6×3.6m)", "price": 18.00, "currency": "USD"},
        "timber (meranti)": {"unit": "m³", "price": 600.00, "currency": "USD"},
        "pvc pipes 110mm": {"unit": "6m length", "price": 22.00, "currency": "USD"},
        "ready-mix concrete c25": {"unit": "m³", "price": 120.00, "currency": "USD"},
    }
    for name, info in _PRICE_DB.items():
        if key in name or name in key:
            return {"material": name, "region": region, **info, "found": True, "source": "static_fallback"}
    return {"material": material, "region": region, "found": False,
            "message": f"Price for '{material}' not found. Ask the user for a manual quote."}


def _check_compliance(building_type: str, aspect: str) -> dict:
    """Check SI-56 / Zimbabwe building regulation compliance for a given aspect."""
    _RULES = {
        "minimum_room_sizes": {
            "bedroom": "9 m² minimum (SI-56 §4.3)",
            "kitchen": "5.5 m² minimum (SI-56 §4.4)",
            "bathroom": "2.5 m² minimum (SI-56 §4.5)",
            "living_room": "12 m² minimum (SI-56 §4.2)",
            "corridor_width": "900 mm minimum (SI-56 §4.7)",
        },
        "structural": {
            "foundation_depth": "Minimum 600 mm below natural ground level (SI-56 §3.2)",
            "wall_thickness": "Minimum 230 mm for load-bearing external walls (SI-56 §5.1)",
            "ceiling_height": "Minimum 2.4 m floor to ceiling (SI-56 §4.1)",
            "damp_proof_course": "DPC required at 150 mm above finished ground level (SI-56 §3.5)",
        },
        "fire_safety": {
            "escape_routes": "Every habitable room must have a window ≥ 0.5 m² (SI-56 §7.2)",
            "fire_walls": "Fire walls between units — 230 mm solid masonry (SI-56 §7.4)",
        },
    }
    aspect_lower = aspect.lower()
    results = []
    for category, rules in _RULES.items():
        for rule_key, rule_text in rules.items():
            if aspect_lower in rule_key or rule_key in aspect_lower or aspect_lower in category:
                results.append({"category": category, "rule": rule_key, "detail": rule_text})
    if results:
        return {"building_type": building_type, "aspect": aspect, "rules": results, "found": True}
    return {"building_type": building_type, "aspect": aspect, "found": False,
            "message": f"No specific rule found for '{aspect}'. General SI-56 guidelines apply."}


def _calculate_area(shape: str, dimensions: dict) -> dict:
    """Calculate area / volume for common construction shapes."""
    import math
    shape_lower = shape.lower()
    if shape_lower == "rectangle":
        length = dimensions.get("length", 0)
        width = dimensions.get("width", 0)
        return {"shape": shape, "area_m2": round(length * width, 2), "dimensions": dimensions}
    elif shape_lower == "circle":
        radius = dimensions.get("radius", 0)
        return {"shape": shape, "area_m2": round(math.pi * radius ** 2, 2), "dimensions": dimensions}
    elif shape_lower == "triangle":
        base = dimensions.get("base", 0)
        height = dimensions.get("height", 0)
        return {"shape": shape, "area_m2": round(0.5 * base * height, 2), "dimensions": dimensions}
    elif shape_lower in ("cuboid", "volume"):
        length = dimensions.get("length", 0)
        width = dimensions.get("width", 0)
        height = dimensions.get("height", 0)
        return {"shape": shape, "volume_m3": round(length * width * height, 2), "dimensions": dimensions}
    return {"shape": shape, "error": f"Unknown shape '{shape}'. Supported: rectangle, circle, triangle, cuboid."}


# Map tool names to callables
_TOOL_MAP = {
    "get_material_prices": _get_material_prices,
    "check_compliance": _check_compliance,
    "calculate_area": _calculate_area,
}

# ── Command detection ────────────────────────────────────────────────

_DRAW_KEYWORDS = ['/draw']
_PLANS_KEYWORDS = ['/plans']
_ANALYSE_KEYWORDS = ['/analyse', '/analyze']


def _is_drawing_request(text: str) -> bool:
    """Return True when the user's message looks like a drawing request."""
    lower = text.lower()
    return any(kw in lower for kw in _DRAW_KEYWORDS)


def _is_floor_plan_search(text: str) -> bool:
    """Return True when the user's message is a floor plan search request."""
    lower = text.lower()
    return any(kw in lower for kw in _PLANS_KEYWORDS)


def _is_analyse_request(text: str) -> bool:
    """Return True when the user wants AI-powered BOQ / floor plan analysis."""
    lower = text.lower()
    return any(kw in lower for kw in _ANALYSE_KEYWORDS)


def _extract_search_terms(text: str) -> str:
    """Strip the /plans command and return the remaining search terms."""
    lower = text.strip()
    for kw in _PLANS_KEYWORDS:
        if lower.lower().startswith(kw):
            return lower[len(kw):].strip()
    return lower


def _search_floor_plans(query: str, limit: int = 6) -> list:
    """
    Search FloorPlanDataset by title, description, and category name.
    Returns a list of dicts with plan details and image URLs.
    """
    from apps.builder_dashboard.models import FloorPlanDataset

    if not query:
        # No search terms — return the latest plans
        plans = FloorPlanDataset.objects.select_related('category').order_by('-created_at')[:limit]
    else:
        # Build search filter across title, description, and category name
        terms = query.split()
        q_filter = Q()
        for term in terms:
            q_filter |= (
                Q(title__icontains=term) |
                Q(description__icontains=term) |
                Q(category__name__icontains=term)
            )
        plans = FloorPlanDataset.objects.select_related('category').filter(q_filter).distinct().order_by('-created_at')[:limit]

    results = []
    for plan in plans:
        image_url = None
        if plan.image:
            try:
                image_url = plan.image.url
            except Exception:
                pass
        results.append({
            'id': plan.id,
            'title': plan.title,
            'description': plan.description or '',
            'category_name': plan.category.name if plan.category else 'Uncategorized',
            'image_url': image_url,
            'created_at': plan.created_at.isoformat() if plan.created_at else None,
        })
    return results


def _match_style_preset(text: str):
    """
    Find the best-matching active DrawingStylePreset for the user's query.
    Returns the preset or None.
    """
    lower = text.lower()
    presets = DrawingStylePreset.objects.filter(is_active=True).order_by('-priority')
    for preset in presets:
        if any(kw in lower for kw in preset.get_keywords_list()):
            return preset
    return None


def _get_top_rated_prompts(preset, limit=3):
    """
    Fetch the highest-rated prompts from ImageFeedback for a given preset.
    These serve as few-shot examples for Claude's prompt engineering.
    """
    if not preset:
        # Fall back to globally top-rated prompts
        feedback = ImageFeedback.objects.filter(
            rating__gte=4
        ).order_by('-rating', '-created_at')[:limit]
    else:
        feedback = ImageFeedback.objects.filter(
            preset_used=preset, rating__gte=4
        ).order_by('-rating', '-created_at')[:limit]

    return [f.original_prompt for f in feedback]


# ── Image generation ─────────────────────────────────────────────────

def _generate_image_from_gemini(prompt: str, negative_prompt: str = "", guidance_scale: float = 7.5) -> tuple[str | None, str | None]:
    """
    Call Google Gemini API (gemini-2.0-flash-preview-image-generation) to generate
    an architectural image.  Returns (image_url, error_message).
    image_url is the media-relative URL to the saved image, or None on error.
    error_message is a user-friendly string when generation fails, or None on success.
    """
    from PIL import Image

    api_key = settings.GEMINI_API_KEY
    if not api_key or 'your-' in api_key.lower() or len(api_key) < 10:
        logger.error("GEMINI_API_KEY is not configured or is a placeholder.")
        return None, (
            "⚠️ Image generation is not configured. The Gemini API key is missing or invalid. "
            "Please ask the admin to set a valid GEMINI_API_KEY in the environment."
        )

    model_name = settings.GEMINI_IMAGE_MODEL
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    # Build the prompt with negative prompt instructions appended
    enhanced_prompt = prompt
    if negative_prompt:
        enhanced_prompt += f" (Do NOT include: {negative_prompt})"

    payload = {
        "contents": [{
            "parts": [{"text": enhanced_prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["Text", "Image"],
            "temperature": 1.0,
            "topP": 0.95,
            "topK": 40,
        },
    }

    try:
        logger.info("[Gemini Image] Calling %s with prompt: %.120s…", model_name, enhanced_prompt)
        response = http_requests.post(url, json=payload, timeout=90.0)

        if response.status_code != 200:
            body = response.text[:500]
            logger.error("Gemini Image API HTTP %s: %s", response.status_code, body)
            return None, (
                f"⚠️ Image generation failed (HTTP {response.status_code}). "
                "The Gemini API returned an error. Please try again or contact support."
            )

        data = response.json()

        # Check for blocked / safety filtered responses
        if data.get("promptFeedback", {}).get("blockReason"):
            reason = data["promptFeedback"]["blockReason"]
            logger.warning("Gemini Image blocked: %s", reason)
            return None, (
                f"⚠️ Image generation was blocked by safety filters ({reason}). "
                "Please rephrase your request and try again."
            )

        candidates = data.get("candidates", [])
        if not candidates:
            logger.warning("No candidates returned from Gemini Image API. Response: %s", str(data)[:300])
            return None, "⚠️ The image model returned no results. Please try rephrasing your request."

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            logger.warning("No parts in the first candidate.")
            return None, "⚠️ The image model returned an empty response. Please try again."

        # The response may contain multiple parts: text part(s) and image part(s).
        # Iterate all parts to find the inlineData (image).
        b64_data = None
        mime_type = "image/png"
        for part in parts:
            inline_data = part.get("inlineData", {})
            if inline_data.get("data"):
                b64_data = inline_data["data"]
                mime_type = inline_data.get("mimeType", "image/png")
                break

        if not b64_data:
            # The model returned text only — no image was generated
            text_content = " ".join(p.get("text", "") for p in parts if "text" in p)
            logger.warning("Gemini returned text-only (no image). Text: %.200s", text_content)
            return None, (
                "⚠️ The image model did not generate an image for this request. "
                "It may have been too complex or filtered. Please try a simpler description."
            )

        # Decode the image
        img_bytes = base64.b64decode(b64_data)
        image = Image.open(io.BytesIO(img_bytes))

        # Save the image
        media_dir = os.path.join(settings.MEDIA_ROOT, 'ai_generated')
        os.makedirs(media_dir, exist_ok=True)
        ext = "png" if "png" in mime_type else "jpeg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(media_dir, filename)

        image.save(filepath, format=ext.upper())
        logger.info("[Gemini Image] Saved generated image: %s", filepath)

        return f"{settings.MEDIA_URL}ai_generated/{filename}", None

    except http_requests.exceptions.Timeout:
        logger.error("Gemini Image API timed out after 90s")
        return None, "⚠️ Image generation timed out. The request was too complex — please try a simpler description."
    except Exception as e:
        logger.error("Image generation error: %s", e)
        return None, f"⚠️ Image generation failed: {e}"


# ── Claude AI helpers ─────────────────────────────────────────────────

def _build_lc_messages(messages: list, system: str = "", images: list | None = None):
    """
    Convert raw message dicts into langchain message objects.
    Returns a list of langchain messages (with optional SystemMessage first).
    """
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

    lc_messages = []
    if system:
        # Enable Anthropic prompt caching for the (often-repeated) system prompt.
        # The cache_control header tells Claude to cache this block across requests.
        lc_messages.append(SystemMessage(
            content=system,
            additional_kwargs={"cache_control": {"type": "ephemeral"}},
        ))

    for i, m in enumerate(messages):
        role = m.get('role', 'user')
        content = m.get('content', '')

        # Last user message may carry images
        if i == len(messages) - 1 and role == 'user' and images:
            content_parts = [{"type": "text", "text": content}]
            for img_data in images:
                # Accept raw base64 or data-URL
                if img_data.startswith('data:'):
                    media_type = img_data.split(';')[0].split(':')[1]
                    b64 = img_data.split(',', 1)[1]
                else:
                    media_type = 'image/png'
                    b64 = img_data
                content_parts.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": b64,
                    }
                })
            lc_messages.append(HumanMessage(content=content_parts))
        elif role == 'user':
            lc_messages.append(HumanMessage(content=content))
        elif role == 'assistant':
            lc_messages.append(AIMessage(content=content))
        elif role == 'system':
            lc_messages.append(SystemMessage(content=content))

    return lc_messages


def _get_claude_llm(temperature: float = 0.7, max_tokens: int = 8192):
    """Return a ChatAnthropic instance with retry resilience."""
    from langchain_anthropic import ChatAnthropic
    return ChatAnthropic(
        model=settings.CLAUDE_MODEL,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=120.0,
        max_retries=3,            # retry on 5xx / transient errors
        default_headers={
            "anthropic-beta": "prompt-caching-2024-07-31",
        },
    )


def _call_claude(messages: list, system: str = "", max_tokens: int = 8192,
                 temperature: float = 0.7, images: list | None = None) -> str:
    """
    Call Anthropic Claude API via langchain-anthropic.
    *messages* is a list of dicts with 'role' and 'content'.
    *images* is an optional list of base64 data-URL strings to attach to the
    last user message (for vision / multimodal analysis).
    Returns the assistant text response.
    """
    llm = _get_claude_llm(temperature=temperature, max_tokens=max_tokens)
    lc_messages = _build_lc_messages(messages, system=system, images=images)
    response = llm.invoke(lc_messages)
    return response.content


def _call_claude_with_tools(messages: list, system: str = "", max_tokens: int = 8192,
                            temperature: float = 0.7, images: list | None = None) -> str:
    """
    Call Claude with tool-use (function-calling) support.
    Runs a tool-loop: if Claude emits tool_calls we execute them locally and
    feed results back until Claude returns a final text response.
    """
    from langchain_anthropic import ChatAnthropic
    from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

    llm = _get_claude_llm(temperature=temperature, max_tokens=max_tokens)

    # Define tools as langchain-compatible dicts
    tools = [
        {
            "name": "get_material_prices",
            "description": "Look up current construction material prices for a region. Use when the user asks about costs, pricing, or material rates.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "material": {"type": "string", "description": "Name of the construction material, e.g. 'cement', 'face bricks', 'reinforcement steel'"},
                    "region": {"type": "string", "description": "Region/country, defaults to Zimbabwe", "default": "Zimbabwe"},
                },
                "required": ["material"],
            },
        },
        {
            "name": "check_compliance",
            "description": "Check SI-56 / Zimbabwe building regulation compliance for a given building aspect. Use when the user asks about building codes, regulations, minimum sizes, or compliance.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "building_type": {"type": "string", "description": "Type of building, e.g. 'residential', 'commercial'"},
                    "aspect": {"type": "string", "description": "The aspect to check, e.g. 'bedroom', 'foundation_depth', 'ceiling_height', 'fire_safety'"},
                },
                "required": ["building_type", "aspect"],
            },
        },
        {
            "name": "calculate_area",
            "description": "Calculate area or volume for construction shapes. Use when the user asks to compute areas, perimeters, or volumes.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "shape": {"type": "string", "description": "Shape type: rectangle, circle, triangle, or cuboid"},
                    "dimensions": {
                        "type": "object",
                        "description": "Dimension values. For rectangle: length, width. Circle: radius. Triangle: base, height. Cuboid: length, width, height.",
                    },
                },
                "required": ["shape", "dimensions"],
            },
        },
    ]

    llm_with_tools = llm.bind_tools(tools)
    lc_messages = _build_lc_messages(messages, system=system, images=images)

    # Tool loop — max 5 rounds to prevent infinite loops
    for _round in range(5):
        response = llm_with_tools.invoke(lc_messages)

        if not response.tool_calls:
            # Final answer — return text
            return response.content

        # Execute each tool call
        lc_messages.append(response)  # Add AIMessage with tool_calls
        for tool_call in response.tool_calls:
            fn_name = tool_call["name"]
            fn_args = tool_call["args"]
            tool_fn = _TOOL_MAP.get(fn_name)
            if tool_fn:
                try:
                    result = tool_fn(**fn_args)
                except Exception as e:
                    result = {"error": str(e)}
            else:
                result = {"error": f"Unknown tool: {fn_name}"}

            lc_messages.append(ToolMessage(
                content=json.dumps(result),
                tool_call_id=tool_call["id"],
            ))

    # If we exhausted the loop, return whatever we have
    return response.content if hasattr(response, 'content') else "I was unable to complete the request."


def _stream_claude_with_tools(messages: list, system: str = "", max_tokens: int = 8192,
                               temperature: float = 0.7, images: list | None = None):
    """
    Stream Claude response with tool-use support, yielding SSE-formatted chunks.
    Yields str chunks suitable for StreamingHttpResponse.
    """
    from langchain_anthropic import ChatAnthropic
    from langchain_core.messages import ToolMessage

    llm = _get_claude_llm(temperature=temperature, max_tokens=max_tokens)

    tools = [
        {
            "name": "get_material_prices",
            "description": "Look up current construction material prices for a region.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "material": {"type": "string", "description": "Name of the construction material"},
                    "region": {"type": "string", "description": "Region/country", "default": "Zimbabwe"},
                },
                "required": ["material"],
            },
        },
        {
            "name": "check_compliance",
            "description": "Check SI-56 / Zimbabwe building regulation compliance.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "building_type": {"type": "string", "description": "Type of building"},
                    "aspect": {"type": "string", "description": "The aspect to check"},
                },
                "required": ["building_type", "aspect"],
            },
        },
        {
            "name": "calculate_area",
            "description": "Calculate area or volume for construction shapes.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "shape": {"type": "string", "description": "rectangle, circle, triangle, or cuboid"},
                    "dimensions": {"type": "object", "description": "Dimension values."},
                },
                "required": ["shape", "dimensions"],
            },
        },
    ]

    llm_with_tools = llm.bind_tools(tools)
    lc_messages = _build_lc_messages(messages, system=system, images=images)

    # Tool loop — max 5 rounds
    for _round in range(5):
        # First, invoke non-streaming to check for tool calls
        response = llm_with_tools.invoke(lc_messages)

        if not response.tool_calls:
            break

        # Execute tools silently (no streaming during tool execution)
        lc_messages.append(response)
        for tool_call in response.tool_calls:
            fn_name = tool_call["name"]
            fn_args = tool_call["args"]
            tool_fn = _TOOL_MAP.get(fn_name)
            if tool_fn:
                try:
                    result = tool_fn(**fn_args)
                except Exception as e:
                    result = {"error": str(e)}
            else:
                result = {"error": f"Unknown tool: {fn_name}"}

            lc_messages.append(ToolMessage(
                content=json.dumps(result),
                tool_call_id=tool_call["id"],
            ))
            # Yield a status event so the frontend knows tools are being called
            yield f"data: {json.dumps({'type': 'tool_status', 'tool': fn_name})}\n\n"
    else:
        # If we never broke out, just yield the last response content
        yield f"data: {json.dumps({'type': 'token', 'content': response.content})}\n\n"
        yield "data: [DONE]\n\n"
        return

    # Now stream the final answer (after all tools resolved)
    llm_plain = _get_claude_llm(temperature=temperature, max_tokens=max_tokens)
    for chunk in llm_plain.stream(lc_messages):
        if chunk.content:
            yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"

    yield "data: [DONE]\n\n"


# ── Chat Completion ──────────────────────────────────────────────────

class ChatCompletionView(APIView):
    """
    Main AI chat endpoint.
    • Chat / reasoning → Claude AI (Anthropic)
    • Image generation prompt engineering → Claude AI
    • Image generation → Gemini Nano Banana
    • Vision / multimodal analysis → Claude AI
    • /analyse command → Claude AI vision for BOQ extraction
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai_chat'

    def post(self, request):
        messages = request.data.get('messages', [])
        session_id = request.data.get('session_id')
        user_image_data = request.data.get('image')  # Optional base64 image
        user_pdf_data = request.data.get('pdf')  # Optional base64 PDF
        user = request.user

        if not messages:
            return Response({'error': 'No messages provided.'}, status=400)

        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Chat session not found.'}, status=404)
        else:
            first_msg = messages[0]['content'] if len(messages) > 0 else "New Chat"
            title = first_msg[:50] + "..." if len(first_msg) > 50 else first_msg
            session = ChatSession.objects.create(user=user, title=title)

        # Save the new user message to db
        if messages:
            latest_user_msg = messages[-1]
            if isinstance(latest_user_msg, dict) and latest_user_msg.get('role') == 'user':
                ChatMessage.objects.create(
                    session=session,
                    role='user',
                    content=latest_user_msg.get('content', '')
                )

        user_query = messages[-1]['content'] if messages else ""

        # Collect images for vision (if user attached one)
        vision_images = []
        if user_image_data:
            if not user_image_data.startswith('data:image/'):
                user_image_data = f"data:image/png;base64,{user_image_data}"
            vision_images.append(user_image_data)

        # PDF → page images for Claude vision
        if user_pdf_data:
            pdf_images = _extract_pdf_pages_as_images(user_pdf_data, max_pages=5)
            vision_images.extend(pdf_images)

        image_url = None
        matched_preset = None
        final_image_prompt = None
        floor_plan_results = None
        analyse_results = None
        draw_error = None

        # ── /analyse — BOQ / floor plan analysis via Claude vision ──
        if _is_analyse_request(user_query):
            analyse_results = self._handle_analyse(user_query, vision_images)

        # ── /plans — search existing floor plans ──
        elif _is_floor_plan_search(user_query):
            search_terms = _extract_search_terms(user_query)
            floor_plan_results = _search_floor_plans(search_terms, limit=6)

        # ── /draw — image generation via Gemini (prompt eng by Claude) ──
        elif _is_drawing_request(user_query):
            image_url, final_image_prompt, matched_preset, draw_error = self._handle_draw(user_query)

        # ── RAG retrieval ──
        context_text = ""
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_chroma import Chroma

            chroma_dir = os.path.join(settings.BASE_DIR, 'chroma_db')
            if os.path.exists(chroma_dir) and user_query:
                embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                vectorstore = Chroma(persist_directory=chroma_dir, embedding_function=embeddings)
                docs = vectorstore.similarity_search(user_query, k=3)
                if docs:
                    context_text = "\n\nRelevant Custom Knowledge Base Data:\n"
                    for d in docs:
                        context_text += f"---\n{d.page_content}\n"
        except Exception as e:
            logger.error("RAG Retrieval error: %s", e)

        # ── Build system prompt ──
        instruction_obj = AIInstruction.objects.filter(is_active=True).first()
        base_instruction = instruction_obj.instruction_text if instruction_obj else (
            "You are the DzeNhare Architecture AI, a helpful, professional AI assistant "
            "built into the builder dashboard. You specialize in construction, compliance "
            "regulations (like SI-56), and architectural guidance. Keep answers concise, "
            "helpful, and professional."
        )

        system_content = base_instruction

        if context_text:
            system_content += (
                f"\n\nCRITICAL KNOWLEDGE BASE INSTRUCTION: You must base your response STRICTLY and ENTIRELY on the following "
                f"extracted custom Knowledge Base Data. Do not extrapolate, summarize, or invent outside information that "
                f"is not explicitly supported by this text. If the answer is not contained in this data, clearly state that "
                f"the information is not available in the provided documents.\n"
                f"{context_text}"
            )
        if image_url:
            system_content += (
                "\n\nYou have just generated an architectural drawing/image for the user. "
                "The image is displayed alongside your message. Provide a brief description "
                "of what was generated, and any relevant architectural notes or suggestions."
            )
        elif draw_error:
            system_content += (
                f"\n\nIMPORTANT: The user requested a /draw image generation but it FAILED. "
                f"Error: {draw_error}\n"
                f"Do NOT try to draw or generate ASCII art or text diagrams as a substitute. "
                f"Instead, inform the user about the error and suggest they try again. "
                f"You may still describe what the architectural plan WOULD look like in words, "
                f"but do NOT attempt any visual representation."
            )
        if floor_plan_results is not None:
            if floor_plan_results:
                plans_summary = "\n".join(
                    f"- {p['title']} (Category: {p['category_name']}): {p['description'][:100]}"
                    for p in floor_plan_results
                )
                system_content += (
                    f"\n\nThe user searched for floor plans and {len(floor_plan_results)} matching plan(s) "
                    f"were found in the database. The plans are displayed as visual cards alongside your message. "
                    f"Here is a summary of the results:\n{plans_summary}\n\n"
                    f"Provide a helpful response describing the available plans, highlighting key features, "
                    f"and asking the user if any of these match their requirements. "
                    f"Do NOT try to generate markdown images or links — the images are shown automatically."
                )
            else:
                system_content += (
                    "\n\nThe user searched for floor plans but no matching plans were found in the database. "
                    "Let them know no results were found and suggest they try different search terms, "
                    "or they can use the /draw command to generate a custom floor plan image."
                )

        if analyse_results is not None:
            system_content += (
                "\n\nYou have just performed a BOQ / floor plan analysis. The structured analysis "
                "data is attached to this response and will be displayed in a table alongside your message. "
                "Provide a concise summary of the analysis findings, any compliance notes (e.g. SI-56), "
                "and recommend next steps. Do NOT repeat the entire table in your text — it is shown automatically."
            )

        # ── Call Claude for final response ──
        try:
            # Prepare conversation for Claude
            llm_messages = []
            for msg in messages:
                llm_messages.append({"role": msg['role'], "content": msg['content']})

            response_content = _call_claude_with_tools(
                messages=llm_messages,
                system=system_content,
                images=vision_images if vision_images else None,
            )

            result = {
                'message': response_content,
                'role': 'assistant',
            }
            if image_url:
                result['image_url'] = image_url
            if final_image_prompt:
                result['image_prompt'] = final_image_prompt
            if matched_preset:
                result['preset_id'] = matched_preset.id
                result['preset_name'] = matched_preset.name
            if floor_plan_results is not None:
                result['floor_plans'] = floor_plan_results
            if analyse_results is not None:
                result['analyse'] = analyse_results

            # Save assistant message to db
            ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=result['message'],
                image_url=image_url,
            )
            result['session_id'] = session.id

            return Response(result)

        except Exception as e:
            logger.exception("ChatCompletionView error")
            error_str = str(e)

            # Detect transient Anthropic errors and return a user-friendly message
            is_transient = any(kw in error_str.lower() for kw in [
                '502', '503', 'bad gateway', 'service unavailable',
                'overloaded', 'internal server error',
            ])
            is_auth = '401' in error_str or 'unauthorized' in error_str.lower()

            if is_transient:
                user_msg = (
                    "⚠️ The AI service (Anthropic) is temporarily unavailable. "
                    "This is usually resolved within a few minutes — please try again shortly."
                )
                http_status = 503
            elif is_auth:
                user_msg = (
                    "⚠️ The AI service returned an authentication error. "
                    "Please ask the admin to check the Anthropic API key."
                )
                http_status = 502
            else:
                user_msg = (
                    "I apologize, but my AI circuits are currently undergoing maintenance "
                    "or are not fully configured. Please contact support."
                )
                http_status = 500

            return Response({
                'error': error_str,
                'message': user_msg,
                'role': 'assistant',
            }, status=http_status)

    # ── /draw handler ────────────────────────────────────────────────
    def _handle_draw(self, user_query: str):
        """
        Prompt engineering via Claude → image generation via Gemini.
        Returns (image_url, final_prompt, matched_preset).
        """
        matched_preset = _match_style_preset(user_query)
        top_prompts = _get_top_rated_prompts(matched_preset, limit=3)

        if matched_preset:
            category_name = matched_preset.get_category_display()
            template_hint = matched_preset.prompt_template.replace(
                '{user_request}', user_query
            ).replace('{category}', category_name)
            style_hint = matched_preset.style_tokens
        else:
            category_name = "architectural drawing"
            template_hint = ""
            style_hint = "architectural blueprint, technical drawing, clean lines, professional CAD"

        examples_block = ""
        if top_prompts:
            examples_block = (
                "\n\nHere are examples of highly-rated prompts for this drawing type. "
                "Use them as style and quality references:\n"
            )
            for i, p in enumerate(top_prompts, 1):
                examples_block += f"Example {i}: {p}\n"

        prompt_system = (
            f"You are an expert architectural prompt engineer specializing in {category_name}s. "
            f"The user wants a 2D architectural drawing. "
            f"Generate a concise, vivid text-to-image prompt (max 150 words) that will produce "
            f"a professional-quality {category_name}.\n\n"
            f"REQUIREMENTS:\n"
            f"- Include style keywords: {style_hint}\n"
            f"- Specify view type (top-down, front elevation, cross section, etc.)\n"
            f"- Describe line weights, labeling, dimensions, and scale bar\n"
            f"- Use architectural terminology\n"
            f"- Add context about materials and construction standards\n"
        )
        if template_hint:
            prompt_system += f"\nTEMPLATE TO FOLLOW:\n{template_hint}\n"
        if examples_block:
            prompt_system += examples_block
        prompt_system += "\nOutput ONLY the prompt text, nothing else."

        try:
            image_prompt = _call_claude(
                messages=[{"role": "user", "content": user_query}],
                system=prompt_system,
                max_tokens=300,
                temperature=0.7,
            )
        except Exception as e:
            logger.error("Claude prompt generation error: %s", e)
            image_prompt = user_query

        # Append style tokens
        if matched_preset and matched_preset.style_tokens:
            image_prompt += f", {matched_preset.style_tokens}"

        final_image_prompt = image_prompt
        logger.info("[AI Image] Final prompt: %s", image_prompt)

        negative = matched_preset.negative_prompt if matched_preset else (
            "blurry, low quality, realistic photo, watermark, text overlay"
        )
        guidance = matched_preset.guidance_scale if matched_preset else 7.5

        image_url, gen_error = _generate_image_from_gemini(
            prompt=image_prompt,
            negative_prompt=negative,
            guidance_scale=guidance,
        )
        return image_url, final_image_prompt, matched_preset, gen_error

    # ── /analyse handler ─────────────────────────────────────────────
    def _handle_analyse(self, user_query: str, images: list) -> dict:
        """
        Use Claude AI vision with structured output + extended thinking to analyse
        an uploaded image (floor plan, BOQ, site photo) and return structured
        BOQ / measurement data via Pydantic schema.

        If an active BOQTemplate exists, its category ordering, extraction rules,
        example items, and optional columns are injected into the system prompt so
        the AI mirrors the admin's preferred format.
        """
        # Strip the command prefix from the query
        analyse_text = user_query.strip()
        for kw in _ANALYSE_KEYWORDS:
            if analyse_text.lower().startswith(kw):
                analyse_text = analyse_text[len(kw):].strip()
                break

        # ── Base system prompt ────────────────────────────────────────
        analyse_system = (
            "You are a professional Quantity Surveyor and Construction Analyst AI for the DzeNhare "
            "Smart Quality Builder platform.\n\n"
            "You are required to create a detailed Bill of Quantities (BoQ) based on the provided drawing. "
            "The BoQ should accurately represent all items, including their dimensions, quantities, and any "
            "relevant specifications visible or inferable from the drawing.\n\n"
            "Follow these steps:\n"
            "1. Examine the drawing meticulously to identify ALL distinct components — structural elements, "
            "finishes, openings, services, and external works.\n"
            "2. For each component, note its type, dimensions (length, width, height, depth as applicable), "
            "and calculate the quantity required. Show the measurement formula where possible.\n"
            "3. Organize the information systematically by category (e.g. Substructure, Superstructure, "
            "Finishes, Windows & Doors, Plumbing, Electrical, External Works).\n"
            "4. Provide clear labels and SI units for all measurements "
            "(m², m³, m, nr, item, kg as appropriate).\n"
            "5. Apply standard Zimbabwean construction rates (USD) to each item. If the rate cannot be "
            "determined, provide a reasonable estimate and append '(est.)' to the description.\n"
            "6. Check for SI-56 compliance issues and note them in compliance_notes.\n\n"
            "If no image is attached, set summary to explain that you need an image and leave items empty."
        )

        # ── Overlay active BOQ template (if any) ─────────────────────
        template = BOQTemplate.objects.filter(is_active=True).order_by('-updated_at').first()
        if template:
            parts = ["\n\n--- BOQ TEMPLATE INSTRUCTIONS (follow exactly) ---"]

            if template.category_order:
                parts.append(
                    f"\n**Category Order** – output items grouped in this sequence:\n{template.category_order}"
                )

            if template.extraction_rules:
                parts.append(
                    f"\n**Extraction Rules** – follow these rules when measuring and pricing:\n{template.extraction_rules}"
                )

            example_items = template.get_example_items()
            if example_items:
                parts.append(
                    "\n**Example Items (mimic this naming, detail level and categorisation):**\n"
                    + json.dumps(example_items, indent=2)
                )

            if template.include_labour_rate:
                parts.append(
                    "\nIMPORTANT: For every item, also include a `labour_rate` (labour cost per unit). "
                    "Estimate if not known."
                )

            if template.include_measurement_formula:
                parts.append(
                    "\nIMPORTANT: For every item, include a `measurement_formula` string showing how "
                    "the quantity was calculated, e.g. '2×(12.5+8.0)×2.7 = 110.7 m²'."
                )

            if template.header_text:
                parts.append(f"\nBOQ Header (include verbatim at the start of the summary):\n{template.header_text}")

            if template.footer_text:
                parts.append(f"\nBOQ Footer (include verbatim at the end of the summary):\n{template.footer_text}")

            analyse_system += "\n".join(parts)

        user_content = analyse_text if analyse_text else "Please analyse this image."

        try:
            # Use structured output with Pydantic schema
            llm = _get_claude_llm(temperature=0.3, max_tokens=8192)
            structured_llm = llm.with_structured_output(BOQAnalysis)

            lc_messages = _build_lc_messages(
                messages=[{"role": "user", "content": user_content}],
                system=analyse_system,
                images=images if images else None,
            )

            result: BOQAnalysis = structured_llm.invoke(lc_messages)
            return result.model_dump()

        except Exception as e:
            logger.error("Structured analyse error: %s", e, exc_info=True)
            # Fall back to raw Claude call + JSON parse
            try:
                fallback_system = analyse_system + (
                    "\n\nRESPOND WITH a JSON OBJECT with keys: summary (str), "
                    "items (list of {category, item_name, description, unit, quantity, rate, total_amount, "
                    "labour_rate (optional float), measurement_formula (optional str)}), "
                    "compliance_notes (list of str), recommendations (list of str). "
                    "Output ONLY valid JSON, no markdown fences."
                )
                raw = _call_claude(
                    messages=[{"role": "user", "content": user_content}],
                    system=fallback_system,
                    max_tokens=4096,
                    temperature=0.3,
                    images=images if images else None,
                )
                cleaned = raw.strip()
                if cleaned.startswith('```'):
                    cleaned = cleaned.split('\n', 1)[1] if '\n' in cleaned else cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                return json.loads(cleaned.strip())
            except Exception as e2:
                logger.error("Fallback analyse error: %s", e2, exc_info=True)
                return {
                    "summary": f"Analysis failed: {str(e)}",
                    "items": [],
                    "compliance_notes": [],
                    "recommendations": [],
                }


class ImageGenerationView(APIView):
    """Standalone endpoint for direct image generation requests via Gemini."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai_generate'

    def post(self, request):
        prompt = request.data.get('prompt', '')
        if not prompt:
            return Response({'error': 'No prompt provided'}, status=400)

        preset = _match_style_preset(prompt)
        negative = preset.negative_prompt if preset else ""
        guidance = preset.guidance_scale if preset else 7.5

        image_url, gen_error = _generate_image_from_gemini(prompt, negative, guidance)
        if image_url:
            return Response({'image_url': image_url, 'prompt': prompt})
        else:
            return Response(
                {'error': gen_error or 'Failed to generate image. The model may be loading — try again in a moment.'},
                status=503
            )


# ── PDF vision helper ────────────────────────────────────────────────

def _extract_pdf_pages_as_images(pdf_base64: str, max_pages: int = 5) -> list[str]:
    """
    Convert a base64-encoded PDF into a list of base64 PNG data-URLs
    (one per page, capped at *max_pages*).  Uses pdf2image if available,
    falls back to PyPDF text extraction.
    """
    try:
        import pdf2image
        pdf_bytes = base64.b64decode(pdf_base64)
        images = pdf2image.convert_from_bytes(pdf_bytes, first_page=1, last_page=max_pages, dpi=200)
        data_urls = []
        for img in images:
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode()
            data_urls.append(f"data:image/png;base64,{b64}")
        return data_urls
    except ImportError:
        logger.warning("pdf2image not installed — falling back to text extraction for PDFs")
        return []
    except Exception as e:
        logger.error("PDF-to-image conversion error: %s", e)
        return []


# ── Streaming SSE endpoint ───────────────────────────────────────────

class ChatStreamView(APIView):
    """
    SSE streaming chat endpoint.
    Streams Claude's response token-by-token, with tool-use support.
    Falls back to non-streaming endpoints for /draw, /plans, /analyse.
    
    POST /ai/chat/stream/
    Same payload as /ai/chat/ — returns text/event-stream.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai_chat'

    def post(self, request):
        messages = request.data.get('messages', [])
        session_id = request.data.get('session_id')
        user_image_data = request.data.get('image')
        user_pdf_data = request.data.get('pdf')  # base64 PDF
        user = request.user

        if not messages:
            return Response({'error': 'No messages provided.'}, status=400)

        user_query = messages[-1]['content'] if messages else ""

        # For /draw, /plans, /analyse — redirect to the sync endpoint
        if (_is_drawing_request(user_query) or _is_floor_plan_search(user_query)
                or _is_analyse_request(user_query)):
            # Delegate to ChatCompletionView
            view = ChatCompletionView()
            view.request = request
            return view.post(request)

        # ── Session handling ──
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Chat session not found.'}, status=404)
        else:
            first_msg = messages[0]['content'] if len(messages) > 0 else "New Chat"
            title = first_msg[:50] + "..." if len(first_msg) > 50 else first_msg
            session = ChatSession.objects.create(user=user, title=title)

        # Save user message
        if messages:
            latest_user_msg = messages[-1]
            if isinstance(latest_user_msg, dict) and latest_user_msg.get('role') == 'user':
                ChatMessage.objects.create(
                    session=session,
                    role='user',
                    content=latest_user_msg.get('content', '')
                )

        # Collect vision images
        vision_images = []
        if user_image_data:
            if not user_image_data.startswith('data:image/'):
                user_image_data = f"data:image/png;base64,{user_image_data}"
            vision_images.append(user_image_data)

        # PDF → page images for Claude vision
        if user_pdf_data:
            pdf_images = _extract_pdf_pages_as_images(user_pdf_data, max_pages=5)
            vision_images.extend(pdf_images)

        # ── RAG context ──
        context_text = ""
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_chroma import Chroma
            chroma_dir = os.path.join(settings.BASE_DIR, 'chroma_db')
            if os.path.exists(chroma_dir) and user_query:
                embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                vectorstore = Chroma(persist_directory=chroma_dir, embedding_function=embeddings)
                docs = vectorstore.similarity_search(user_query, k=3)
                if docs:
                    context_text = "\n\nRelevant Custom Knowledge Base Data:\n"
                    for d in docs:
                        context_text += f"---\n{d.page_content}\n"
        except Exception as e:
            logger.error("RAG Retrieval error: %s", e)

        # ── System prompt ──
        instruction_obj = AIInstruction.objects.filter(is_active=True).first()
        base_instruction = instruction_obj.instruction_text if instruction_obj else (
            "You are the DzeNhare Architecture AI, a helpful, professional AI assistant "
            "built into the builder dashboard. You specialize in construction, compliance "
            "regulations (like SI-56), and architectural guidance. Keep answers concise, "
            "helpful, and professional."
        )
        system_content = base_instruction
        if context_text:
            system_content += (
                f"\n\nCRITICAL KNOWLEDGE BASE INSTRUCTION: You must base your response STRICTLY and ENTIRELY on the following "
                f"extracted custom Knowledge Base Data. Do not extrapolate, summarize, or invent outside information that "
                f"is not explicitly supported by this text. If the answer is not contained in this data, clearly state that "
                f"the information is not available in the provided documents.\n"
                f"{context_text}"
            )

        llm_messages = [{"role": msg['role'], "content": msg['content']} for msg in messages]

        # Generator that also saves the final message to DB
        session_id_value = session.id

        def event_stream():
            collected = []
            try:
                for chunk in _stream_claude_with_tools(
                    messages=llm_messages,
                    system=system_content,
                    images=vision_images if vision_images else None,
                ):
                    yield chunk
                    # Collect text tokens for DB save
                    try:
                        if chunk.startswith('data: ') and '[DONE]' not in chunk:
                            payload = json.loads(chunk[6:].strip())
                            if payload.get('type') == 'token':
                                collected.append(payload.get('content', ''))
                    except Exception:
                        pass

                # Send session_id as a final metadata event
                yield f"data: {json.dumps({'type': 'meta', 'session_id': session_id_value})}\n\n"
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.exception("ChatStreamView SSE error")
                yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
                yield "data: [DONE]\n\n"
            finally:
                # Persist assistant message
                full_text = "".join(collected)
                if full_text:
                    ChatMessage.objects.create(
                        session_id=session_id_value,
                        role='assistant',
                        content=full_text,
                    )

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


# ── Knowledge Base / Instructions ────────────────────────────────────

class KnowledgeDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def check_permissions(self, request):
        super().check_permissions(request)
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            if not request.user.is_staff:
                self.permission_denied(request, message="Admin access required.")

    def get(self, request, pk=None):
        if pk:
            # Return individual document with its text content
            try:
                doc = KnowledgeDocument.objects.get(pk=pk)
                content = self._extract_text(doc)
                return Response({
                    'id': doc.id,
                    'title': doc.title,
                    'file': doc.file.url if doc.file else None,
                    'is_embedded': doc.is_embedded,
                    'created_at': doc.created_at,
                    'content': content,
                })
            except KnowledgeDocument.DoesNotExist:
                return Response({'error': 'Document not found'}, status=404)

        docs = KnowledgeDocument.objects.all()
        return Response([{
            'id': d.id,
            'title': d.title,
            'file': d.file.url if d.file else None,
            'is_embedded': d.is_embedded,
            'created_at': d.created_at
        } for d in docs])

    def _extract_text(self, doc):
        """Extract readable text content from a knowledge document."""
        try:
            file_path = doc.file.path
            if file_path.endswith('.pdf'):
                try:
                    from langchain_community.document_loaders import PyPDFLoader
                    loader = PyPDFLoader(file_path)
                    pages = loader.load()
                    return '\n\n'.join(page.page_content for page in pages)
                except Exception:
                    return "[Could not extract PDF content]"
            else:
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    return f.read()
        except Exception as e:
            return f"[Error reading file: {e}]"

    def post(self, request):
        import hashlib

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=400)

        # ── Compute content hash for deduplication ──
        file_bytes = file_obj.read()
        content_hash = hashlib.sha256(file_bytes).hexdigest()
        file_obj.seek(0)  # reset for saving

        existing = KnowledgeDocument.objects.filter(content_hash=content_hash).first()
        if existing:
            return Response({
                'error': f'Duplicate document — already uploaded as "{existing.title}".',
                'existing_id': existing.id,
            }, status=409)

        title = request.data.get('title', file_obj.name)

        doc = KnowledgeDocument.objects.create(
            title=title,
            file=file_obj,
            content_hash=content_hash,
            uploaded_by=request.user
        )

        # Process embedding synchronously for demonstration
        success = self.embed_document(doc)
        doc.is_embedded = success
        doc.save()

        return Response({'success': success, 'id': doc.id})

    def embed_document(self, doc):
        try:
            from langchain_community.document_loaders import PyPDFLoader, TextLoader
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_huggingface import HuggingFaceEmbeddings
            from langchain_chroma import Chroma

            file_path = doc.file.path

            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            else:
                loader = TextLoader(file_path)

            documents = loader.load()

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = text_splitter.split_documents(documents)

            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

            chroma_dir = os.path.join(settings.BASE_DIR, 'chroma_db')
            os.makedirs(chroma_dir, exist_ok=True)

            Chroma.from_documents(
                documents=chunks,
                embedding=embeddings,
                persist_directory=chroma_dir
            )
            return True
        except Exception as e:
            logger.error("Error embedding document %s: %s", doc.title, e, exc_info=True)
            return False

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'No document ID provided'}, status=400)

        try:
            doc = KnowledgeDocument.objects.get(pk=pk)
            try:
                from langchain_huggingface import HuggingFaceEmbeddings
                from langchain_chroma import Chroma

                chroma_dir = os.path.join(settings.BASE_DIR, 'chroma_db')
                if os.path.exists(chroma_dir):
                    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                    vectorstore = Chroma(persist_directory=chroma_dir, embedding_function=embeddings)
                    collection = vectorstore._collection
                    results = collection.get(where={"source": doc.file.path})
                    if results and results['ids']:
                        collection.delete(ids=results['ids'])
            except Exception as e:
                logger.warning("Could not clean ChromaDB vectors for %s: %s", doc.title, e)

            doc.delete()
            return Response({'success': True})
        except KnowledgeDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=404)


class AIInstructionView(APIView):
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            if not request.user.is_staff:
                self.permission_denied(request, message="Admin access required.")

    def get(self, request):
        obj = AIInstruction.objects.filter(is_active=True).first()
        if not obj:
            obj = AIInstruction.objects.create()
        return Response({
            'instruction_text': obj.instruction_text
        })

    def post(self, request):
        text = request.data.get('instruction_text')
        if not text:
            return Response({'error': 'Instruction text is required.'}, status=400)

        obj = AIInstruction.objects.filter(is_active=True).first()
        if not obj:
            obj = AIInstruction.objects.create(instruction_text=text)
        else:
            obj.instruction_text = text
            obj.save()

        return Response({'success': True, 'instruction_text': obj.instruction_text})


# ── Chat Sessions ────────────────────────────────────────────────────

class ChatSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        data = [{
            'id': s.id,
            'title': s.title,
            'updated_at': s.updated_at
        } for s in sessions]
        return Response(data)

class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)

        messages = session.messages.all()
        msg_data = [{
            'id': m.id,
            'role': m.role,
            'content': m.content,
            'image_url': m.image_url,
            'created_at': m.created_at
        } for m in messages]

        return Response({
            'id': session.id,
            'title': session.title,
            'messages': msg_data
        })

    def delete(self, request, pk):
        try:
            session = ChatSession.objects.get(pk=pk, user=request.user)
            session.delete()
            return Response({'success': True})
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=404)


# ── Image Feedback ───────────────────────────────────────────────────

class ImageFeedbackView(APIView):
    """Submit or update feedback on an AI-generated image."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message_id = request.data.get('message_id')
        rating = request.data.get('rating')
        original_prompt = request.data.get('original_prompt', '')
        preset_id = request.data.get('preset_id')
        feedback_text = request.data.get('feedback_text', '')

        if not message_id or rating is None:
            return Response({'error': 'message_id and rating are required.'}, status=400)

        try:
            message = ChatMessage.objects.get(pk=message_id)
        except ChatMessage.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=404)

        preset = None
        if preset_id:
            try:
                preset = DrawingStylePreset.objects.get(pk=preset_id)
            except DrawingStylePreset.DoesNotExist:
                pass

        feedback, created = ImageFeedback.objects.update_or_create(
            message=message,
            user=request.user,
            defaults={
                'rating': int(rating),
                'original_prompt': original_prompt,
                'preset_used': preset,
                'feedback_text': feedback_text,
            }
        )

        return Response({
            'success': True,
            'created': created,
            'rating': feedback.rating,
        })


# ── Drawing Style Presets (Admin CRUD) ───────────────────────────────

class DrawingStylePresetView(APIView):
    """Admin-only CRUD for drawing style presets."""
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            if not request.user.is_staff:
                self.permission_denied(request, message="Admin access required.")

    def get(self, request):
        presets = DrawingStylePreset.objects.all()
        data = [{
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'category_display': p.get_category_display(),
            'keywords': p.keywords,
            'prompt_template': p.prompt_template,
            'negative_prompt': p.negative_prompt,
            'style_tokens': p.style_tokens,
            'guidance_scale': p.guidance_scale,
            'is_active': p.is_active,
            'priority': p.priority,
            'avg_rating': ImageFeedback.objects.filter(
                preset_used=p, rating__gte=1
            ).aggregate(avg=Avg('rating'))['avg'],
        } for p in presets]
        return Response(data)

    def post(self, request):
        preset = DrawingStylePreset.objects.create(
            name=request.data.get('name', 'New Preset'),
            category=request.data.get('category', 'OTHER'),
            keywords=request.data.get('keywords', ''),
            prompt_template=request.data.get('prompt_template', ''),
            negative_prompt=request.data.get('negative_prompt', ''),
            style_tokens=request.data.get('style_tokens', ''),
            guidance_scale=float(request.data.get('guidance_scale', 7.5)),
            is_active=request.data.get('is_active', True),
            priority=int(request.data.get('priority', 0)),
        )
        return Response({'success': True, 'id': preset.id})

    def patch(self, request, pk=None):
        if not pk:
            return Response({'error': 'Preset ID required'}, status=400)
        try:
            preset = DrawingStylePreset.objects.get(pk=pk)
            for field in ['name', 'category', 'keywords', 'prompt_template',
                          'negative_prompt', 'style_tokens', 'is_active', 'priority']:
                if field in request.data:
                    setattr(preset, field, request.data[field])
            if 'guidance_scale' in request.data:
                preset.guidance_scale = float(request.data['guidance_scale'])
            preset.save()
            return Response({'success': True})
        except DrawingStylePreset.DoesNotExist:
            return Response({'error': 'Preset not found'}, status=404)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'Preset ID required'}, status=400)
        try:
            DrawingStylePreset.objects.get(pk=pk).delete()
            return Response({'success': True})
        except DrawingStylePreset.DoesNotExist:
            return Response({'error': 'Preset not found'}, status=404)


# ── BOQ Template CRUD (Admin) ────────────────────────────────────────

class BOQTemplateView(APIView):
    """Admin-only CRUD for BOQ format templates."""
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            if not request.user.is_staff:
                self.permission_denied(request, message="Admin access required.")

    def get(self, request, pk=None):
        if pk:
            try:
                t = BOQTemplate.objects.get(pk=pk)
                return Response(self._serialize(t))
            except BOQTemplate.DoesNotExist:
                return Response({'error': 'Template not found'}, status=404)
        templates = BOQTemplate.objects.all()
        return Response([self._serialize(t) for t in templates])

    def post(self, request):
        t = BOQTemplate.objects.create(
            name=request.data.get('name', 'New BOQ Template'),
            is_active=request.data.get('is_active', True),
            category_order=request.data.get('category_order', ''),
            extraction_rules=request.data.get('extraction_rules', ''),
            example_items_json=request.data.get('example_items_json', '[]'),
            include_labour_rate=request.data.get('include_labour_rate', False),
            include_measurement_formula=request.data.get('include_measurement_formula', False),
            header_text=request.data.get('header_text', ''),
            footer_text=request.data.get('footer_text', ''),
        )
        return Response({'success': True, 'id': t.id}, status=201)

    def patch(self, request, pk=None):
        if not pk:
            return Response({'error': 'Template ID required'}, status=400)
        try:
            t = BOQTemplate.objects.get(pk=pk)
            for field in ['name', 'is_active', 'category_order', 'extraction_rules',
                          'example_items_json', 'include_labour_rate',
                          'include_measurement_formula', 'header_text', 'footer_text']:
                if field in request.data:
                    setattr(t, field, request.data[field])
            t.save()
            return Response({'success': True})
        except BOQTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=404)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'Template ID required'}, status=400)
        try:
            BOQTemplate.objects.get(pk=pk).delete()
            return Response({'success': True})
        except BOQTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=404)

    @staticmethod
    def _serialize(t):
        return {
            'id': t.id,
            'name': t.name,
            'is_active': t.is_active,
            'category_order': t.category_order,
            'extraction_rules': t.extraction_rules,
            'example_items_json': t.example_items_json,
            'example_items': t.get_example_items(),
            'include_labour_rate': t.include_labour_rate,
            'include_measurement_formula': t.include_measurement_formula,
            'header_text': t.header_text,
            'footer_text': t.footer_text,
            'updated_at': t.updated_at.isoformat() if t.updated_at else None,
            'created_at': t.created_at.isoformat() if t.created_at else None,
        }


# ── Material Prices CRUD (Admin) ─────────────────────────────────────

class MaterialPriceView(APIView):
    """Admin-only CRUD for material pricing database used by AI tools."""
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if getattr(request.user, 'profile', None) and request.user.profile.role != 'ADMIN':
            if not request.user.is_staff:
                self.permission_denied(request, message="Admin access required.")

    def get(self, request, pk=None):
        if pk:
            try:
                mp = MaterialPrice.objects.get(pk=pk)
                return Response(self._serialize(mp))
            except MaterialPrice.DoesNotExist:
                return Response({'error': 'Price not found'}, status=404)
        prices = MaterialPrice.objects.all()
        # Optional filters
        material = request.query_params.get('material')
        region = request.query_params.get('region')
        if material:
            prices = prices.filter(material__icontains=material)
        if region:
            prices = prices.filter(region__icontains=region)
        return Response([self._serialize(mp) for mp in prices[:200]])

    def post(self, request):
        mp = MaterialPrice.objects.create(
            material=request.data.get('material', ''),
            unit=request.data.get('unit', ''),
            price=request.data.get('price', 0),
            currency=request.data.get('currency', 'USD'),
            region=request.data.get('region', 'Zimbabwe'),
            supplier_name=request.data.get('supplier_name', ''),
            notes=request.data.get('notes', ''),
        )
        return Response({'success': True, 'id': mp.id}, status=201)

    def patch(self, request, pk=None):
        if not pk:
            return Response({'error': 'Price ID required'}, status=400)
        try:
            mp = MaterialPrice.objects.get(pk=pk)
            for field in ['material', 'unit', 'price', 'currency', 'region', 'supplier_name', 'notes']:
                if field in request.data:
                    setattr(mp, field, request.data[field])
            mp.save()
            return Response({'success': True})
        except MaterialPrice.DoesNotExist:
            return Response({'error': 'Price not found'}, status=404)

    def delete(self, request, pk=None):
        if not pk:
            return Response({'error': 'Price ID required'}, status=400)
        try:
            MaterialPrice.objects.get(pk=pk).delete()
            return Response({'success': True})
        except MaterialPrice.DoesNotExist:
            return Response({'error': 'Price not found'}, status=404)

    @staticmethod
    def _serialize(mp):
        return {
            'id': mp.id,
            'material': mp.material,
            'unit': mp.unit,
            'price': str(mp.price),
            'currency': mp.currency,
            'region': mp.region,
            'supplier_name': mp.supplier_name,
            'notes': mp.notes,
            'updated_at': mp.updated_at.isoformat() if mp.updated_at else None,
        }


import logging
import asyncio
import json
from django.conf import settings
from django.core.cache import cache
from mcp import ClientSession
from mcp.client.sse import sse_client

logger = logging.getLogger(__name__)

class MCPManager:
    """
    Manages connections to multiple remote MCP servers via SSE.
    Discovers tools and routes execution calls.
    """
    def __init__(self, server_urls: list[str]):
        self.server_urls = server_urls
        self._server_tool_map = {} # tool_name -> server_url

    async def _fetch_tools_for_server(self, url: str):
        """Connect to a single SSE MCP server and list its tools."""
        try:
            # Note: sse_client returns a context manager for (read_stream, write_stream)
            async with sse_client(url) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    tools_result = await session.list_tools()
                    server_tools = []
                    for t in tools_result.tools:
                        tool_def = {
                            "name": t.name,
                            "description": t.description or "",
                            "input_schema": t.inputSchema,
                        }
                        server_tools.append(tool_def)
                        self._server_tool_map[t.name] = url
                    return server_tools
        except Exception as e:
            logger.error(f"Failed to fetch tools from MCP server {url}: {e}")
            return []

    async def get_all_tools(self):
        """Parallel fetch tools from all configured servers."""
        if not self.server_urls:
            return []
        tasks = [self._fetch_tools_for_server(url) for url in self.server_urls]
        results = await asyncio.gather(*tasks)
        # Flatten results
        return [item for sublist in results for item in sublist]

    async def execute_tool(self, tool_name: str, arguments: dict):
        """Route tool call to the correct remote server."""
        # Find which server has this tool
        # In a real app, we'd cache this map across requests
        if not self._server_tool_map:
            await self.get_all_tools()

        url = self._server_tool_map.get(tool_name)
        if not url:
            return {"error": f"Tool {tool_name} not found on any configured MCP server."}

        try:
            async with sse_client(url) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    result = await session.call_tool(tool_name, arguments)
                    # MCP content is a list of resource objects (Text, Image, etc.)
                    return [c.model_dump() for c in result.content]
        except Exception as e:
            logger.error(f"Failed to execute MCP tool {tool_name} on {url}: {e}")
            return {"error": str(e)}


# ── Sync Helpers for Django Views ─────────────────────────────────────

def sync_get_mcp_tools():
    """Sync wrapper to discover tools with caching."""
    urls = getattr(settings, 'MCP_SERVERS', [])
    if not urls:
        return []
        
    cache_key = f"mcp_tools_{hash(tuple(urls))}"
    cached_tools = cache.get(cache_key)
    if cached_tools:
        return cached_tools

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        manager = MCPManager(urls)
        tools = loop.run_until_complete(manager.get_all_tools())
        loop.close()
        
        if tools:
            cache.set(cache_key, tools, 3600) # Cache for 1 hour
        return tools
    except Exception as e:
        logger.error(f"Sync MCP tool discovery failed: {e}")
        return []

def sync_execute_mcp_tool(tool_name, arguments):
    """Sync wrapper to execute a tool."""
    urls = getattr(settings, 'MCP_SERVERS', [])
    if not urls:
        return {"error": "No MCP servers configured."}
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        manager = MCPManager(urls)
        result = loop.run_until_complete(manager.execute_tool(tool_name, arguments))
        loop.close()
        return result
    except Exception as e:
        logger.error(f"Sync MCP execution failed: {e}")
        return {"error": str(e)}

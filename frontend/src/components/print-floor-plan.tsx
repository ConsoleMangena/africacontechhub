import { useRef, useEffect, useCallback } from "react";
import polygonClipping from "polygon-clipping";

// ─── Types (mirrored from architectural-studio) ──────────
type DrawingElement =
  | { id: string; type: "line"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "circle"; x: number; y: number; radius: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "text"; x: number; y: number; text: string; color: string; lineWidth: number; layer: string }
  | { id: string; type: "dimension"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "polyline"; points: { x: number; y: number }[]; color: string; lineWidth: number; layer: string }
  | { id: string; type: "block"; x: number; y: number; width: number; height: number; symbolName: string; rotation: number; color: string; lineWidth: number; layer: string; flipX?: boolean; flipY?: boolean };

type LayerData = {
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  lineType?: "solid" | "dashed" | "center" | "hidden";
};

interface FloorPlanSettings {
  projectName: string;
  unit: string;
  precision: number;
  gridSize: number;
  majorGrid: number;
  annoScale: number;
  mergeWalls: boolean;
  hatchRooms: boolean;
  roomLabels: boolean;
  wallThickness: number;
  floorToFloorHeight: number;
  ceilingHeight: number;
  foundationDepth: number;
  foundationType: string;
  numStoreys: number;
  wallMaterial: string;
  roofMaterial: string;
  plotWidth: number;
  plotDepth: number;
}

// ─── Symbol library stub (SVG images loaded in main module) ──
// We re-use the same symbol images that are cached globally by the main studio
const SYMBOL_LIBRARY: Record<string, { src: string; label: string; defaultWidth: number; defaultHeight: number; anchorX?: number; anchorY?: number }> = {};
const symbolImageCache: Record<string, HTMLImageElement> = {};
const OFFICIAL_LOGO_SRC = "/images/logo.png";
let officialLogoImage: HTMLImageElement | null = null;

function getSymbolDefinition(name: string) {
  const globalLibrary = (window as any).__archStudioSymbolLibrary as typeof SYMBOL_LIBRARY | undefined;
  return (globalLibrary && globalLibrary[name]) || SYMBOL_LIBRARY[name];
}

function getSymbolImage(name: string): HTMLImageElement | null {
  if (symbolImageCache[name]) return symbolImageCache[name];
  // Try to borrow from the global cache created by architectural-studio
  const globalCache = (window as any).__archStudioSymbolCache;
  if (globalCache && globalCache[name]) {
    symbolImageCache[name] = globalCache[name];
    return globalCache[name];
  }
  return null;
}

function getOfficialLogoImage(): HTMLImageElement {
  if (officialLogoImage) return officialLogoImage;
  const img = new Image();
  img.src = OFFICIAL_LOGO_SRC;
  officialLogoImage = img;
  return img;
}

function drawWindowSymbol(
  ctx: CanvasRenderingContext2D,
  bwPx: number,
  bhPx: number,
  color: string,
) {
  const span = Math.max(bwPx, bhPx);
  const depth = Math.max(4, Math.min(Math.min(bwPx, bhPx), span * 0.22));
  const halfW = bwPx / 2;
  const halfH = bhPx / 2;
  const isHorizontal = bwPx >= bhPx;
  const lineA = isHorizontal ? -depth * 0.28 : -depth * 0.28;
  const lineB = isHorizontal ? depth * 0.28 : depth * 0.28;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, depth * 0.12);
  ctx.setLineDash([]);

  if (isHorizontal) {
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH);
    ctx.lineTo(-halfW, halfH);
    ctx.moveTo(halfW, -halfH);
    ctx.lineTo(halfW, halfH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-halfW, lineA);
    ctx.lineTo(halfW, lineA);
    ctx.moveTo(-halfW, lineB);
    ctx.lineTo(halfW, lineB);
    ctx.stroke();

    ctx.lineWidth = Math.max(0.8, depth * 0.08);
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.7, 0);
    ctx.lineTo(halfW * 0.7, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH);
    ctx.lineTo(halfW, -halfH);
    ctx.moveTo(-halfW, halfH);
    ctx.lineTo(halfW, halfH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(lineA, -halfH);
    ctx.lineTo(lineA, halfH);
    ctx.moveTo(lineB, -halfH);
    ctx.lineTo(lineB, halfH);
    ctx.stroke();

    ctx.lineWidth = Math.max(0.8, depth * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -halfH * 0.7);
    ctx.lineTo(0, halfH * 0.7);
    ctx.stroke();
  }
}

function drawDoorSwingSymbol(
  ctx: CanvasRenderingContext2D,
  width: number,
  wallDepth: number,
  color: string,
  swing: "left" | "right",
) {
  const opening = Math.abs(width);
  const halfDepth = wallDepth / 2;
  const sign = swing === "left" ? 1 : -1;

  ctx.strokeStyle = color;
  ctx.setLineDash([]);

  ctx.lineWidth = Math.max(1, wallDepth * 0.12);
  ctx.beginPath();
  ctx.moveTo(0, -halfDepth);
  ctx.lineTo(0, halfDepth);
  ctx.moveTo(sign * opening, -halfDepth);
  ctx.lineTo(sign * opening, halfDepth);
  ctx.stroke();

  ctx.lineWidth = Math.max(1.2, wallDepth * 0.14);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -opening);
  ctx.stroke();

  ctx.lineWidth = Math.max(1, wallDepth * 0.08);
  ctx.setLineDash([Math.max(3, wallDepth * 0.3), Math.max(2, wallDepth * 0.22)]);
  ctx.beginPath();
  if (swing === "left") {
    ctx.arc(0, 0, opening, 0, -Math.PI / 2, true);
  } else {
    ctx.arc(0, 0, opening, Math.PI, -Math.PI / 2, false);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

// ─── Helpers ─────────────────────────────────────────────
function formatUnit(val: number, unit: string, precision: number): string {
  let v = val;
  if (unit === "cm") v = val / 10;
  else if (unit === "m") v = val / 1000;
  else if (unit === "in") v = val / 25.4;
  else if (unit === "ft") v = val / 304.8;
  return `${v.toFixed(precision)} ${unit}`;
}

function getLineDash(lineType: string, lw: number): number[] {
  switch (lineType) {
    case "dashed": return [12 + lw * 0.4, 6 + lw * 0.2];
    case "center": return [18 + lw * 0.5, 6 + lw * 0.2, 4 + lw * 0.15, 6 + lw * 0.2];
    case "hidden": return [6 + lw * 0.25, 6 + lw * 0.25];
    default: return [];
  }
}

function computeBounds(elements: DrawingElement[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let found = false;
  for (const el of elements) {
    found = true;
    if (el.type === "line" || el.type === "dimension") {
      minX = Math.min(minX, el.x, el.x2); maxX = Math.max(maxX, el.x, el.x2);
      minY = Math.min(minY, el.y, el.y2); maxY = Math.max(maxY, el.y, el.y2);
    } else if (el.type === "rect") {
      minX = Math.min(minX, el.x, el.x + el.width); maxX = Math.max(maxX, el.x, el.x + el.width);
      minY = Math.min(minY, el.y, el.y + el.height); maxY = Math.max(maxY, el.y, el.y + el.height);
    } else if (el.type === "circle") {
      minX = Math.min(minX, el.x - el.radius); maxX = Math.max(maxX, el.x + el.radius);
      minY = Math.min(minY, el.y - el.radius); maxY = Math.max(maxY, el.y + el.radius);
    } else if (el.type === "polyline") {
      for (const p of el.points) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    } else if (el.type === "block") {
      const symDef = getSymbolDefinition(el.symbolName);
      const ax = symDef?.anchorX ?? 0.5;
      const ay = symDef?.anchorY ?? 0.5;
      const rot = ((el.rotation || 0) * Math.PI) / 180;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const flipX = el.flipX ? -1 : 1;
      const flipY = el.flipY ? -1 : 1;
      const corners = [
        { x: -el.width * ax, y: -el.height * ay },
        { x: el.width * (1 - ax), y: -el.height * ay },
        { x: el.width * (1 - ax), y: el.height * (1 - ay) },
        { x: -el.width * ax, y: el.height * (1 - ay) },
      ];
      for (const corner of corners) {
        const lx = corner.x * flipX;
        const ly = corner.y * flipY;
        const wx = el.x + lx * cosR - ly * sinR;
        const wy = el.y + lx * sinR + ly * cosR;
        minX = Math.min(minX, wx); maxX = Math.max(maxX, wx);
        minY = Math.min(minY, wy); maxY = Math.max(maxY, wy);
      }
    } else if (el.type === "text") {
      minX = Math.min(minX, el.x); maxX = Math.max(maxX, el.x + 500);
      minY = Math.min(minY, el.y - 200); maxY = Math.max(maxY, el.y);
    }
  }
  if (!found) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function thickenLine(x1: number, y1: number, x2: number, y2: number, width: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const h = width / 2;
  return [[
    [x1 + nx * h, y1 + ny * h],
    [x1 - nx * h, y1 - ny * h],
    [x2 - nx * h, y2 - ny * h],
    [x2 + nx * h, y2 + ny * h],
    [x1 + nx * h, y1 + ny * h],
  ]];
}

// ─── Sheet constants (A3 landscape, mm) ──────────────────
const SHEET_W = 420;
const SHEET_H = 297;
const MARGIN = 10;
const BORDER = 5;
const TITLE_BLOCK_H = 30;

// 300 DPI canvas dimensions (matches print-elevations and print-section)
const DPI = 300;
const CW = Math.round((SHEET_W / 25.4) * DPI); // 4961 px
const CH = Math.round((SHEET_H / 25.4) * DPI);  // 3508 px

// Print colors (dark on white)
function normalizeHex(color: string): string | null {
  const lower = color.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(lower)) return lower;
  return null;
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function linearizeChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function contrastAgainstWhite(r: number, g: number, b: number): number {
  const luminance = 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
  return 1.05 / (luminance + 0.05);
}

function toPrintColor(c: string): string {
  const normalized = normalizeHex(c);
  if (!normalized) return "#333333";

  const base = hexToRgb(normalized);
  if (contrastAgainstWhite(base.r, base.g, base.b) >= 2.5) return normalized;

  for (let factor = 0.92; factor >= 0.2; factor -= 0.08) {
    const r = base.r * factor;
    const g = base.g * factor;
    const b = base.b * factor;
    if (contrastAgainstWhite(r, g, b) >= 2.5) {
      return rgbToHex(r, g, b);
    }
  }

  return rgbToHex(base.r * 0.2, base.g * 0.2, base.b * 0.2);
}

function drawOfficialLogo(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
): boolean {
  const img = getOfficialLogoImage();
  if (!img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return false;
  const pxPerMm = canvasW / SHEET_W;
  const boxW = widthMm * pxPerMm;
  const boxH = heightMm * pxPerMm;
  const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
  const renderW = img.naturalWidth * scale;
  const renderH = img.naturalHeight * scale;
  const dx = xMm * pxPerMm + (boxW - renderW) / 2;
  const dy = yMm * pxPerMm + (boxH - renderH) / 2;
  ctx.drawImage(img, dx, dy, renderW, renderH);
  return true;
}

// ─── Compute drawing scale ───────────────────────────────
function computeScale(bw: number, bh: number): number {
  const availW = (SHEET_W - MARGIN * 2 - BORDER * 2) * 0.88;
  const availH = (SHEET_H - MARGIN * 2 - BORDER * 2 - TITLE_BLOCK_H) * 0.88;
  const scaleX = availW / bw;
  const scaleY = availH / bh;
  const raw = Math.min(scaleX, scaleY);
  const standards = [1/5, 1/10, 1/20, 1/25, 1/50, 1/75, 1/100, 1/150, 1/200, 1/250, 1/500, 1/1000];
  for (const s of standards) {
    if (raw >= s) return s;
  }
  return 1/1000;
}

// ─── Main drawing ────────────────────────────────────────
function drawFloorPlanSheet(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  elements: DrawingElement[],
  layers: LayerData[],
  settings: FloorPlanSettings,
) {
  const PX = canvasW / SHEET_W;
  const toX = (mm: number) => mm * PX;
  const toY = (mm: number) => mm * PX;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const hiddenLayers = new Set(layers.filter(l => !l.visible).map(l => l.name));
  const visibleEls = elements.filter(el => !hiddenLayers.has(el.layer));

  const bounds = computeBounds(visibleEls);
  if (!bounds) {
    ctx.fillStyle = "#333";
    ctx.font = `${toX(5)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("No elements to print — draw a floor plan first", canvasW / 2, canvasH / 2);
    return;
  }

  const bw = bounds.width;
  const bh = bounds.height;
  const scale = computeScale(bw, bh);
  const scaleLabel = `1:${Math.round(1 / scale)}`;

  // Drawing area
  const drawL = MARGIN + BORDER;
  const drawT = MARGIN + BORDER;
  const drawW = SHEET_W - (MARGIN + BORDER) * 2;
  const drawH = SHEET_H - (MARGIN + BORDER) * 2 - TITLE_BLOCK_H;

  // Center the plan in drawing area
  const planW = bw * scale;
  const planH = bh * scale;
  const ox = drawL + (drawW - planW) / 2; // sheet mm left of plan
  const oy = drawT + (drawH - planH) / 2; // sheet mm top of plan

  // Transform: plan coords → canvas px
  const px = (planMm: number) => toX(ox + (planMm - bounds.minX) * scale);
  const py = (planMm: number) => toY(oy + (planMm - bounds.minY) * scale);
  const ps = (mm: number) => mm * scale * PX; // scale a distance

  // ── Sheet border ──
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.5);
  ctx.strokeRect(toX(MARGIN), toY(MARGIN), toX(SHEET_W - MARGIN * 2), toY(SHEET_H - MARGIN * 2));
  ctx.lineWidth = toX(0.3);
  ctx.strokeRect(toX(drawL), toY(drawT), toX(drawW), toY(drawH + TITLE_BLOCK_H));

  // ── Title block ──
  const tbY = SHEET_H - MARGIN - BORDER - TITLE_BLOCK_H;
  ctx.lineWidth = toX(0.4);
  ctx.strokeRect(toX(drawL), toY(tbY), toX(drawW), toY(TITLE_BLOCK_H));

  const tbCols = [0, 0.35, 0.55, 0.7, 0.85, 1.0];
  for (let i = 1; i < tbCols.length - 1; i++) {
    const x = drawL + drawW * tbCols[i];
    ctx.beginPath(); ctx.moveTo(toX(x), toY(tbY)); ctx.lineTo(toX(x), toY(tbY + TITLE_BLOCK_H)); ctx.stroke();
  }
  const tbMidY = tbY + TITLE_BLOCK_H * 0.5;
  ctx.beginPath(); ctx.moveTo(toX(drawL + drawW * 0.35), toY(tbMidY)); ctx.lineTo(toX(drawL + drawW), toY(tbMidY)); ctx.stroke();

  const tbFont = (size: number) => `${toX(size)}px 'Arial', sans-serif`;
  const tbBold = (size: number) => `bold ${toX(size)}px 'Arial', sans-serif`;
  const logoX = drawL + 2;
  const logoY = tbY + 2;
  const textX = drawL + 20;
  ctx.fillStyle = "#000";
  ctx.textAlign = "left";

  drawOfficialLogo(ctx, canvasW, logoX, logoY, 16, 16);
  ctx.font = tbBold(5.5);
  ctx.fillText(settings.projectName || "UNTITLED PROJECT", toX(textX), toY(tbY + 8));
  ctx.font = tbFont(3.5);
  ctx.fillText("FLOOR PLAN", toX(textX), toY(tbY + 14));
  ctx.fillText(
    `${settings.wallMaterial.toUpperCase()} WALLS | ${settings.roofMaterial.toUpperCase()} ROOF`,
    toX(textX), toY(tbY + 19)
  );
  ctx.fillText(
    `${settings.numStoreys} STOREY${settings.numStoreys > 1 ? "S" : ""} | CEILING ${settings.ceilingHeight}mm | ${settings.foundationType.toUpperCase()} FDN`,
    toX(textX), toY(tbY + 24)
  );

  const colX = (i: number) => drawL + drawW * tbCols[i] + 1.5;
  ctx.font = tbBold(2.8);
  ctx.fillText("SCALE", toX(colX(1)), toY(tbY + 5));
  ctx.fillText("DATE", toX(colX(2)), toY(tbY + 5));
  ctx.fillText("DRAWN", toX(colX(3)), toY(tbY + 5));
  ctx.fillText("DWG NO.", toX(colX(4)), toY(tbY + 5));

  ctx.font = tbFont(3.2);
  ctx.fillText(scaleLabel, toX(colX(1)), toY(tbY + 11));
  ctx.fillText(new Date().toLocaleDateString("en-GB"), toX(colX(2)), toY(tbY + 11));
  ctx.fillText("ACH STUDIO", toX(colX(3)), toY(tbY + 11));
  ctx.fillText("FP-001", toX(colX(4)), toY(tbY + 11));

  ctx.font = tbBold(2.8);
  ctx.fillText("SHEET SIZE", toX(colX(1)), toY(tbMidY + 5));
  ctx.fillText("REV", toX(colX(2)), toY(tbMidY + 5));
  ctx.fillText("CHECKED", toX(colX(3)), toY(tbMidY + 5));
  ctx.fillText("STATUS", toX(colX(4)), toY(tbMidY + 5));

  ctx.font = tbFont(3.2);
  ctx.fillText("A3", toX(colX(1)), toY(tbMidY + 11));
  ctx.fillText("A", toX(colX(2)), toY(tbMidY + 11));
  ctx.fillText("—", toX(colX(3)), toY(tbMidY + 11));
  ctx.fillText("FOR CONSTRUCTION", toX(colX(4)), toY(tbMidY + 11));

  // ── Clip to drawing area ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(toX(drawL), toY(drawT), toX(drawW), toY(drawH));
  ctx.clip();

  // ── Draw elements ──
  const layerByName = new Map(layers.map(l => [l.name, l]));

  // Build merged wall geometries
  let mergedGeometries: { color: string; unioned: number[][][][] }[] = [];
  const successfullyMergedLayers = new Set<string>();

  if (settings.mergeWalls) {
    const holeBlocks = elements.filter(el => el.type === "block" && /door|window/i.test((el as any).symbolName));
    const groups: Record<string, any[]> = {};
    const layerColors: Record<string, string> = {};

    const getLinePolysWithHoles = (x1: number, y1: number, x2: number, y2: number, lineWidth: number) => {
      let splitSpans: [number, number][] = [];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 1) return [];

      for (const b of holeBlocks) {
        if (b.type !== "block") continue;
        const symDef = getSymbolDefinition(b.symbolName);
        const ax = symDef?.anchorX ?? 0.5;
        const flipX = b.flipX ? -1 : 1;
        const localX1 = -b.width * ax;
        const localX2 = b.width * (1 - ax);
        const rotRad = ((b.rotation || 0) * Math.PI) / 180;
        const p1x = b.x + (localX1 * flipX) * Math.cos(rotRad);
        const p1y = b.y + (localX1 * flipX) * Math.sin(rotRad);
        const p2x = b.x + (localX2 * flipX) * Math.cos(rotRad);
        const p2y = b.y + (localX2 * flipX) * Math.sin(rotRad);
        const t1 = ((p1x - x1) * (x2 - x1) + (p1y - y1) * (y2 - y1)) / (len * len);
        const t2 = ((p2x - x1) * (x2 - x1) + (p2y - y1) * (y2 - y1)) / (len * len);
        const centerT = ((b.x - x1) * (x2 - x1) + (b.y - y1) * (y2 - y1)) / (len * len);
        const ppx = x1 + centerT * (x2 - x1);
        const ppy = y1 + centerT * (y2 - y1);
        const dist = Math.hypot(b.x - ppx, b.y - ppy);
        if (dist < 300) {
          splitSpans.push([Math.max(0, Math.min(t1, t2)), Math.min(1, Math.max(t1, t2))]);
        }
      }

      if (splitSpans.length === 0) return [thickenLine(x1, y1, x2, y2, lineWidth)];

      splitSpans.sort((a, b) => a[0] - b[0]);
      let merged: [number, number][] = [];
      for (const sp of splitSpans) {
        if (!merged.length) merged.push(sp);
        else {
          const last = merged[merged.length - 1];
          if (sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
          else merged.push(sp);
        }
      }
      const outPolys = [];
      let tCurr = 0;
      for (const sp of merged) {
        if (sp[0] > tCurr) {
          outPolys.push(thickenLine(
            x1 + (x2 - x1) * tCurr, y1 + (y2 - y1) * tCurr,
            x1 + (x2 - x1) * sp[0], y1 + (y2 - y1) * sp[0],
            lineWidth
          ));
        }
        tCurr = Math.max(tCurr, sp[1]);
      }
      if (tCurr < 1) {
        outPolys.push(thickenLine(
          x1 + (x2 - x1) * tCurr, y1 + (y2 - y1) * tCurr,
          x2, y2, lineWidth
        ));
      }
      return outPolys;
    };

    for (const el of visibleEls) {
      if ((el.type === "line" || el.type === "polyline") && el.lineWidth >= settings.wallThickness) {
        const key = el.layer;
        if (!groups[key]) groups[key] = [];
        layerColors[key] = el.color;
        if (el.type === "line") {
          groups[key].push(...getLinePolysWithHoles(el.x, el.y, el.x2, el.y2, el.lineWidth));
        } else if (el.type === "polyline") {
          for (let i = 0; i < el.points.length - 1; i++) {
            groups[key].push(...getLinePolysWithHoles(
              el.points[i].x, el.points[i].y,
              el.points[i + 1].x, el.points[i + 1].y,
              el.lineWidth
            ));
          }
        }
      }
    }

    for (const key in groups) {
      if (groups[key].length === 0) continue;
      try {
        // @ts-ignore
        const unioned = polygonClipping.union(...groups[key]);
        mergedGeometries.push({ color: layerColors[key], unioned });
        successfullyMergedLayers.add(key);
      } catch (e) {
        console.warn(`Clipping failed for print on layer ${key}`, e);
      }
    }
  }

  // Collect block info for wall splitting
  const allBlocks: { x: number; y: number; width: number; height: number; rot: number; sym: string }[] = [];
  for (const el of elements) {
    if (el.type === "block") {
      allBlocks.push({ x: el.x, y: el.y, width: el.width, height: el.height, rot: el.rotation ?? 0, sym: el.symbolName || "" });
    }
  }

  // Draw merged wall polygons first so openings/symbols can render cleanly on top
  if (settings.mergeWalls && mergedGeometries.length > 0) {
    for (const res of mergedGeometries) {
      const printColor = toPrintColor(res.color);
      ctx.fillStyle = printColor + "33";
      ctx.strokeStyle = printColor;
      ctx.lineWidth = toX(0.2);
      ctx.setLineDash([]);
      ctx.beginPath();
      for (const multiPoly of res.unioned) {
        for (const poly of multiPoly) {
          for (let i = 0; i < poly.length; i++) {
            const ppx = px(poly[i][0]);
            const ppy = py(poly[i][1]);
            if (i === 0) ctx.moveTo(ppx, ppy);
            else ctx.lineTo(ppx, ppy);
          }
        }
      }
      ctx.fill();
      ctx.stroke();
    }
  }

  // Draw individual elements
  for (const el of visibleEls) {
    if (settings.mergeWalls && (el.type === "line" || el.type === "polyline") && el.lineWidth >= settings.wallThickness) {
      // Only skip if this layer successfully merged. Otherwise fallback to drawing it normally.
      if (successfullyMergedLayers.has(el.layer)) {
        continue;
      }
    }

    const layer = layerByName.get(el.layer);
    const lineType = layer?.lineType ?? "solid";
    const printColor = toPrintColor(el.color);

    ctx.save();
    ctx.strokeStyle = printColor;
    ctx.fillStyle = "transparent";
    ctx.lineWidth = Math.max(toX(0.15), ps(el.lineWidth));
    ctx.setLineDash(getLineDash(lineType, el.lineWidth).map(d => d * scale * PX));

    if (el.type === "line") {
      ctx.beginPath();
      ctx.moveTo(px(el.x), py(el.y));
      ctx.lineTo(px(el.x2), py(el.y2));
      ctx.stroke();
    } else if (el.type === "dimension") {
      ctx.beginPath();
      ctx.moveTo(px(el.x), py(el.y));
      ctx.lineTo(px(el.x2), py(el.y2));
      ctx.stroke();
      // Tick marks
      const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
      const tickLen = toX(1.5);
      ctx.beginPath();
      ctx.moveTo(px(el.x) - tickLen * Math.cos(angle + Math.PI / 4), py(el.y) - tickLen * Math.sin(angle + Math.PI / 4));
      ctx.lineTo(px(el.x) + tickLen * Math.cos(angle + Math.PI / 4), py(el.y) + tickLen * Math.sin(angle + Math.PI / 4));
      ctx.moveTo(px(el.x2) - tickLen * Math.cos(angle + Math.PI / 4), py(el.y2) - tickLen * Math.sin(angle + Math.PI / 4));
      ctx.lineTo(px(el.x2) + tickLen * Math.cos(angle + Math.PI / 4), py(el.y2) + tickLen * Math.sin(angle + Math.PI / 4));
      ctx.stroke();
      // Dimension text
      const dist = Math.hypot(el.x2 - el.x, el.y2 - el.y);
      const fontSize = Math.max(toX(1.5), ps(100 * (settings.annoScale / 100)));
      ctx.font = `${fontSize}px 'Arial', monospace`;
      ctx.fillStyle = printColor;
      ctx.textAlign = "center";
      const textOffset = toX(1);
      const nx = Math.cos(angle - Math.PI / 2);
      const ny = Math.sin(angle - Math.PI / 2);
      ctx.save();
      ctx.translate(
        (px(el.x) + px(el.x2)) / 2 + nx * textOffset,
        (py(el.y) + py(el.y2)) / 2 + ny * textOffset
      );
      let textRot = angle;
      if (textRot > Math.PI / 2 || textRot < -Math.PI / 2) textRot += Math.PI;
      ctx.rotate(textRot);
      ctx.fillText(formatUnit(dist, settings.unit, settings.precision), 0, 0);
      ctx.restore();
    } else if (el.type === "rect") {
      // Room hatch
      if (settings.hatchRooms && el.layer.toLowerCase() === "rooms") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px(el.x), py(el.y), ps(el.width), ps(el.height));
        ctx.clip();
        ctx.strokeStyle = printColor + "44";
        ctx.lineWidth = toX(0.08);
        ctx.setLineDash([]);
        const spacing = toX(1.5);
        const left = px(Math.min(el.x, el.x + el.width));
        const right = px(Math.max(el.x, el.x + el.width));
        const top = py(Math.min(el.y, el.y + el.height));
        const bottom = py(Math.max(el.y, el.y + el.height));
        for (let d = top - (right - left); d < bottom + (right - left); d += spacing) {
          ctx.beginPath(); ctx.moveTo(left, d); ctx.lineTo(right, d + (right - left)); ctx.stroke();
        }
        ctx.restore();
      }
      ctx.beginPath();
      ctx.rect(px(el.x), py(el.y), ps(el.width), ps(el.height));
      ctx.stroke();
    } else if (el.type === "circle") {
      ctx.beginPath();
      ctx.arc(px(el.x), py(el.y), ps(el.radius), 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === "text") {
      const fontSize = Math.max(toX(1.5), ps(150 * (settings.annoScale / 100)));
      ctx.font = `${fontSize}px 'Arial', monospace`;
      ctx.fillStyle = printColor;
      ctx.fillText(el.text ?? "", px(el.x), py(el.y));
    } else if (el.type === "polyline") {
      ctx.beginPath();
      for (let i = 0; i < el.points.length; i++) {
        if (i === 0) ctx.moveTo(px(el.points[i].x), py(el.points[i].y));
        else ctx.lineTo(px(el.points[i].x), py(el.points[i].y));
      }
      ctx.stroke();
    } else if (el.type === "block") {
      const img = getSymbolImage(el.symbolName);
      const bx = px(el.x);
      const by = py(el.y);
      const bwPx = ps(el.width);
      const bhPx = ps(el.height);
      const rot = ((el.rotation || 0) * Math.PI) / 180;
      const symDef = getSymbolDefinition(el.symbolName);
      const anchorX = symDef?.anchorX ?? 0.5;
      const anchorY = symDef?.anchorY ?? 0.5;
      const drawBx = -bwPx * anchorX;
      const drawBy = -bhPx * anchorY;
      const flipX = el.flipX ? -1 : 1;
      const flipY = el.flipY ? -1 : 1;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(rot);
      ctx.scale(flipX, flipY);
      if (/door_swing_left/i.test(el.symbolName) || /door_swing_right/i.test(el.symbolName)) {
        const wallDepth = Math.max(6, Math.abs(bhPx));
        drawDoorSwingSymbol(
          ctx,
          bwPx,
          wallDepth,
          printColor,
          /left/i.test(el.symbolName) ? "left" : "right",
        );
      } else if (/window/i.test(el.symbolName)) {
        drawWindowSymbol(ctx, bwPx, bhPx, printColor);
      } else if (img && img.complete && img.naturalWidth > 0) {
        // Tint to print color
        const tw = Math.max(1, Math.round(bwPx));
        const th = Math.max(1, Math.round(bhPx));
        const tintCnv = document.createElement("canvas");
        tintCnv.width = tw;
        tintCnv.height = th;
        const tCtx = tintCnv.getContext("2d");
        if (tCtx) {
          tCtx.drawImage(img, 0, 0, tw, th);
          tCtx.globalCompositeOperation = "source-in";
          tCtx.fillStyle = printColor;
          tCtx.fillRect(0, 0, tw, th);
          ctx.drawImage(tintCnv, drawBx, drawBy, bwPx, bhPx);
        }
      } else {
        // Placeholder
        ctx.strokeStyle = printColor;
        ctx.lineWidth = toX(0.15);
        ctx.setLineDash([toX(0.5), toX(0.5)]);
        ctx.strokeRect(drawBx, drawBy, bwPx, bhPx);
        ctx.setLineDash([]);
        ctx.fillStyle = printColor;
        ctx.font = `${Math.min(bwPx, bhPx) * 0.2}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.symbolName, 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.restore(); // remove clip

  // ── Scale bar (below drawing, above title block) ──
  const sbY = tbY - 6;
  const sbX = drawL + 5;
  const barLenMm = 5000;
  const barLenSheet = barLenMm * scale;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.3);
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(toX(sbX), toY(sbY));
  ctx.lineTo(toX(sbX + barLenSheet), toY(sbY));
  ctx.stroke();
  for (let i = 0; i <= 5; i++) {
    const tx = sbX + (barLenSheet / 5) * i;
    ctx.beginPath();
    ctx.moveTo(toX(tx), toY(sbY - 1));
    ctx.lineTo(toX(tx), toY(sbY + 1));
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const x1 = sbX + (barLenSheet / 5) * i;
    const x2 = sbX + (barLenSheet / 5) * (i + 1);
    ctx.fillStyle = i % 2 === 0 ? "#000" : "#fff";
    ctx.fillRect(toX(x1), toY(sbY - 0.5), toX(x2 - x1), toY(1));
  }
  ctx.fillStyle = "#000";
  ctx.font = tbFont(2.2);
  ctx.textAlign = "center";
  ctx.fillText("0", toX(sbX), toY(sbY + 3));
  ctx.fillText("5 m", toX(sbX + barLenSheet), toY(sbY + 3));
  ctx.fillText(`SCALE ${scaleLabel}`, toX(sbX + barLenSheet / 2), toY(sbY + 3));

  // ── North arrow ──
  const naX = drawL + drawW - 15;
  const naY = tbY - 8;
  const naSize = 5;
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.3);
  ctx.beginPath();
  ctx.moveTo(toX(naX), toY(naY - naSize));
  ctx.lineTo(toX(naX - naSize * 0.3), toY(naY));
  ctx.lineTo(toX(naX), toY(naY - naSize * 0.3));
  ctx.lineTo(toX(naX + naSize * 0.3), toY(naY));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.font = tbBold(3.5);
  ctx.textAlign = "center";
  ctx.fillText("N", toX(naX), toY(naY - naSize - 1.5));

  // ── Overall dimensions outside the plan ──
  ctx.strokeStyle = "#333";
  ctx.fillStyle = "#333";
  ctx.lineWidth = toX(0.15);
  ctx.setLineDash([]);
  ctx.font = tbFont(2.2);
  ctx.textAlign = "center";

  // Bottom dimension (width)
  const dimBotY = py(bounds.maxY) + toY(5);
  ctx.beginPath();
  ctx.moveTo(px(bounds.minX), dimBotY);
  ctx.lineTo(px(bounds.maxX), dimBotY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px(bounds.minX), dimBotY - toY(1));
  ctx.lineTo(px(bounds.minX), dimBotY + toY(1));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px(bounds.maxX), dimBotY - toY(1));
  ctx.lineTo(px(bounds.maxX), dimBotY + toY(1));
  ctx.stroke();
  ctx.fillText(
    formatUnit(bw, settings.unit, settings.precision),
    (px(bounds.minX) + px(bounds.maxX)) / 2,
    dimBotY - toY(1.5)
  );

  // Right dimension (depth)
  const dimRightX = px(bounds.maxX) + toX(5);
  ctx.beginPath();
  ctx.moveTo(dimRightX, py(bounds.minY));
  ctx.lineTo(dimRightX, py(bounds.maxY));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dimRightX - toX(1), py(bounds.minY));
  ctx.lineTo(dimRightX + toX(1), py(bounds.minY));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dimRightX - toX(1), py(bounds.maxY));
  ctx.lineTo(dimRightX + toX(1), py(bounds.maxY));
  ctx.stroke();
  ctx.save();
  ctx.translate(dimRightX + toX(2.5), (py(bounds.minY) + py(bounds.maxY)) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(formatUnit(bh, settings.unit, settings.precision), 0, 0);
  ctx.restore();
}

// ─── Component ───────────────────────────────────────────
interface PrintFloorPlanProps {
  elements: DrawingElement[];
  layers: LayerData[];
  settings: FloorPlanSettings;
  onClose: () => void;
}

export function PrintFloorPlan({ elements, layers, settings, onClose }: PrintFloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CW;
    canvas.height = CH;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawFloorPlanSheet(ctx, CW, CH, elements, layers, settings);
  }, [elements, layers, settings]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const img = getOfficialLogoImage();
    if (img.complete && img.naturalWidth > 0) return;
    const handleLoad = () => draw();
    img.addEventListener("load", handleLoad);
    return () => img.removeEventListener("load", handleLoad);
  }, [draw]);

  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${settings.projectName || "Floor Plan"} — Floor Plan</title>
  <style>
    @page { size: A3 landscape; margin: 0; }
    * { margin: 0; padding: 0; }
    html, body {
      width: 420mm;
      height: 297mm;
      overflow: hidden;
      background: #e5e7eb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    img {
      width: 420mm;
      height: 297mm;
      display: block;
      object-fit: contain;
    }
    @media print {
      html, body { background: #fff; }
      img { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <img src="${dataUrl}" />
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 300); };
  </script>
</body>
</html>`);
    win.document.close();
  }, [settings.projectName]);

  const handleDownloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${settings.projectName || "floor-plan"}-floor-plan.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [settings.projectName]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column", alignItems: "center",
      overflow: "auto", padding: "20px",
    }}>
      <div style={{
        display: "flex", gap: 12, marginBottom: 16,
        background: "#1a1d27", padding: "10px 24px", borderRadius: 8,
        border: "1px solid #2a2d3e",
      }}>
        <button
          onClick={handlePrint}
          style={{
            background: "#00bcd4", color: "#fff", border: "none", borderRadius: 4,
            padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}
        >
          Print A3
        </button>
        <button
          onClick={handleDownloadPNG}
          style={{
            background: "#333", color: "#e8eaf0", border: "1px solid #555", borderRadius: 4,
            padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}
        >
          Download PNG
        </button>
        <button
          onClick={onClose}
          style={{
            background: "#333", color: "#f87171", border: "1px solid #555", borderRadius: 4,
            padding: "8px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}
        >
          Close
        </button>
      </div>
      <div style={{
        background: "#fff", boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
        maxWidth: "95vw", overflow: "auto",
      }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          style={{ width: "100%", height: "auto", display: "block", imageRendering: "auto" }}
        />
      </div>
    </div>
  );
}

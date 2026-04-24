import { useRef, useEffect, useCallback } from "react";

/* ── types ── */
type DrawingElement =
  | { id: string; type: "line"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "circle"; x: number; y: number; radius: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "text"; x: number; y: number; text: string; color: string; lineWidth: number; layer: string }
  | { id: string; type: "dimension"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "polyline"; points: { x: number; y: number }[]; color: string; lineWidth: number; layer: string }
  | { id: string; type: "block"; x: number; y: number; width: number; height: number; symbolName: string; rotation: number; color: string; lineWidth: number; layer: string; flipX?: boolean; flipY?: boolean };

type RoofType = "none" | "flat" | "gable" | "hip" | "shed" | "mansard" | "pyramid";

export interface SectionSettings {
  projectName: string;
  wallThickness: number;
  floorToFloorHeight: number;
  ceilingHeight: number;
  foundationDepth: number;
  foundationType: string;
  slabThickness: number;
  numStoreys: number;
  roofType: RoofType;
  roofMaterial: string;
  wallMaterial: string;
  plotWidth: number;
  plotDepth: number;
}

interface PrintSectionProps {
  elements: DrawingElement[];
  settings: SectionSettings;
  onClose: () => void;
}

type WallSeg = { x1: number; y1: number; x2: number; y2: number; t: number };

/* ── constants ── */
const SHEET_W = 420;
const SHEET_H = 297;
const MARGIN = 10;
const BORDER = 5;
const TITLE_BLOCK_H = 30;
const DPI = 300;
const PX_W = Math.round((SHEET_W / 25.4) * DPI);
const PX_H = Math.round((SHEET_H / 25.4) * DPI);
const PLINTH_H = 150;
const LOGO_SRC = "/images/logo.png";
const FND_EXTRA = 100; // foundation extends beyond wall each side (mm)

let logoImg: HTMLImageElement | null = null;
function getLogo(): HTMLImageElement {
  if (logoImg) return logoImg;
  const img = new Image();
  img.src = LOGO_SRC;
  logoImg = img;
  return img;
}

/* ── helpers ── */
function isWallLayer(l: string) {
  const lo = l.toLowerCase();
  return lo === "walls" || lo === "wall" || lo === "layer 0";
}

function extractWallSegments(elements: DrawingElement[], wt: number): WallSeg[] {
  const segs: WallSeg[] = [];
  for (const el of elements) {
    if (!isWallLayer(el.layer)) continue;
    if (el.type === "line") {
      segs.push({ x1: el.x, y1: el.y, x2: el.x2, y2: el.y2, t: wt });
    } else if (el.type === "rect") {
      const rx = el.x, ry = el.y, rw = el.width, rh = el.height;
      if (Math.abs(rw) > Math.abs(rh)) {
        const cy = ry + rh / 2;
        segs.push({ x1: rx, y1: cy, x2: rx + rw, y2: cy, t: Math.abs(rh) || wt });
      } else {
        const cx = rx + rw / 2;
        segs.push({ x1: cx, y1: ry, x2: cx, y2: ry + rh, t: Math.abs(rw) || wt });
      }
    } else if (el.type === "polyline" && el.points.length >= 2) {
      for (let i = 0; i < el.points.length - 1; i++) {
        segs.push({ x1: el.points[i].x, y1: el.points[i].y, x2: el.points[i + 1].x, y2: el.points[i + 1].y, t: wt });
      }
    }
  }
  return segs;
}

function wallBounds(segs: WallSeg[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of segs) {
    const half = (s.t / 2) + FND_EXTRA;
    minX = Math.min(minX, s.x1 - half, s.x2 - half);
    minY = Math.min(minY, s.y1 - half, s.y2 - half);
    maxX = Math.max(maxX, s.x1 + half, s.x2 + half);
    maxY = Math.max(maxY, s.y1 + half, s.y2 + half);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/* ── hatch helpers ── */
function hatchRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, spacing: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const maxD = Math.abs(w) + Math.abs(h);
  for (let d = -maxD; d < maxD; d += spacing) {
    ctx.moveTo(x + d, y);
    ctx.lineTo(x + d + Math.abs(h), y + Math.abs(h));
  }
  ctx.stroke();
  ctx.restore();
}

function hatchPoly(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], spacing: number) {
  if (pts.length < 3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.clip();
  let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity;
  for (const p of pts) { bMinX = Math.min(bMinX, p.x); bMinY = Math.min(bMinY, p.y); bMaxX = Math.max(bMaxX, p.x); bMaxY = Math.max(bMaxY, p.y); }
  const maxD = (bMaxX - bMinX) + (bMaxY - bMinY);
  for (let d = -maxD; d < maxD; d += spacing) {
    ctx.moveTo(bMinX + d, bMinY);
    ctx.lineTo(bMinX + d + (bMaxY - bMinY), bMaxY);
  }
  ctx.stroke();
  ctx.restore();
}

/* ── roof profile for section cut detail ── */
function roofProfile(rt: RoofType, w: number, d: number, wallH: number): { x: number; y: number }[] {
  const o = 300;
  if (rt === "none") return [];
  if (rt === "flat") return [{ x: -o, y: wallH + 140 }, { x: w + o, y: wallH + 140 }];
  if (rt === "shed") {
    const rise = Math.min(w, d) * 0.35;
    return [{ x: -o, y: wallH + rise }, { x: w + o, y: wallH }];
  }
  if (rt === "gable") {
    const rise = d * 0.25;
    return [{ x: -o, y: wallH }, { x: w / 2, y: wallH + rise }, { x: w + o, y: wallH }];
  }
  if (rt === "hip" || rt === "pyramid") {
    const rise = Math.min(w, d) * 0.3;
    return [{ x: -o, y: wallH }, { x: w / 2, y: wallH + rise }, { x: w + o, y: wallH }];
  }
  if (rt === "mansard") {
    const inset = w * 0.2;
    const lr = d * 0.18; const ur = d * 0.28;
    return [{ x: -o, y: wallH }, { x: inset, y: wallH + lr }, { x: w / 2, y: wallH + ur }, { x: w - inset, y: wallH + lr }, { x: w + o, y: wallH }];
  }
  return [];
}

/* ══════════════════════════════════════════════════════════════
   DRAW FOUNDATION SETTING OUT PLAN  (top-down, left 60% of sheet)
   ══════════════════════════════════════════════════════════════ */
function drawFoundationPlan(
  ctx: CanvasRenderingContext2D,
  segs: WallSeg[],
  s: SectionSettings,
  ox: number, oy: number, cellW: number, cellH: number,
) {
  const ppm = PX_W / SHEET_W;
  const toX = (mm: number) => mm * ppm;
  const toY = (mm: number) => mm * ppm;
  const font = (sz: number, bold = false) => `${bold ? "bold " : ""}${toX(sz)}px 'Arial', sans-serif`;

  if (segs.length === 0) {
    ctx.font = font(4);
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("No wall elements found", toX(ox + cellW / 2), toY(oy + cellH / 2));
    return;
  }

  const b = wallBounds(segs);
  const padMm = 12;
  const drawW = cellW - padMm * 2;
  const drawH = cellH - padMm * 2 - 8;
  const sc = Math.min(drawW / b.w, drawH / b.h);

  const cxSheet = ox + cellW / 2;
  const cySheet = oy + padMm + 4 + drawH / 2;
  const cxModel = (b.minX + b.maxX) / 2;
  const cyModel = (b.minY + b.maxY) / 2;

  const mx = (v: number) => toX(cxSheet + (v - cxModel) * sc);
  const my = (v: number) => toY(cySheet + (v - cyModel) * sc);

  ctx.save();

  // ── title ──
  ctx.fillStyle = "#000";
  ctx.font = font(4.5, true);
  ctx.textAlign = "center";
  ctx.fillText("FOUNDATION SETTING OUT PLAN", toX(ox + cellW / 2), toY(oy + 5));
  ctx.font = font(2.5);
  ctx.fillText(`Scale approx 1:${Math.round(1 / sc)}  |  Foundation: ${s.foundationType.toUpperCase()}`, toX(ox + cellW / 2), toY(oy + 10));

  // ── draw foundation strips (hatched, wider than walls) ──
  for (const seg of segs) {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) continue;
    const nx = -dy / len;
    const ny = dx / len;
    const halfF = (seg.t / 2) + FND_EXTRA;

    const pts = [
      { x: mx(seg.x1 + nx * halfF), y: my(seg.y1 + ny * halfF) },
      { x: mx(seg.x2 + nx * halfF), y: my(seg.y2 + ny * halfF) },
      { x: mx(seg.x2 - nx * halfF), y: my(seg.y2 - ny * halfF) },
      { x: mx(seg.x1 - nx * halfF), y: my(seg.y1 - ny * halfF) },
    ];

    // fill foundation
    ctx.fillStyle = "#e0ddd5";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    // hatch foundation
    ctx.strokeStyle = "#888";
    ctx.lineWidth = toX(0.08);
    hatchPoly(ctx, pts, toX(1.0));

    // outline foundation
    ctx.strokeStyle = "#000";
    ctx.lineWidth = toX(0.2);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  // ── draw wall centerlines (dashed) ──
  ctx.setLineDash([toX(1.0), toX(0.5)]);
  ctx.strokeStyle = "#d00";
  ctx.lineWidth = toX(0.12);
  for (const seg of segs) {
    ctx.beginPath();
    ctx.moveTo(mx(seg.x1), my(seg.y1));
    ctx.lineTo(mx(seg.x2), my(seg.y2));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // ── draw walls (solid, thinner overlay) ──
  for (const seg of segs) {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) continue;
    const nx = -dy / len;
    const ny = dx / len;
    const halfW = seg.t / 2;

    ctx.fillStyle = "rgba(180,160,140,0.45)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = toX(0.15);
    ctx.beginPath();
    ctx.moveTo(mx(seg.x1 + nx * halfW), my(seg.y1 + ny * halfW));
    ctx.lineTo(mx(seg.x2 + nx * halfW), my(seg.y2 + ny * halfW));
    ctx.lineTo(mx(seg.x2 - nx * halfW), my(seg.y2 - ny * halfW));
    ctx.lineTo(mx(seg.x1 - nx * halfW), my(seg.y1 - ny * halfW));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ── dimension annotations on outer edges ──
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = toX(0.12);
  ctx.font = font(2.5);
  ctx.textAlign = "center";

  // overall width dimension (bottom)
  const dimOffY = toY(cySheet + (b.h / 2) * sc + 6);
  const leftPx = mx(b.minX + FND_EXTRA);
  const rightPx = mx(b.maxX - FND_EXTRA);
  ctx.beginPath();
  ctx.moveTo(leftPx, dimOffY); ctx.lineTo(rightPx, dimOffY);
  ctx.moveTo(leftPx, dimOffY - toX(1)); ctx.lineTo(leftPx, dimOffY + toX(1));
  ctx.moveTo(rightPx, dimOffY - toX(1)); ctx.lineTo(rightPx, dimOffY + toX(1));
  ctx.stroke();
  const overallW = Math.round(b.w - FND_EXTRA * 2);
  ctx.fillText(`${overallW} mm`, (leftPx + rightPx) / 2, dimOffY + toX(3));

  // overall depth dimension (right)
  const dimOffX = mx(b.maxX) + toX(6);
  const topPx = my(b.minY + FND_EXTRA);
  const botPx = my(b.maxY - FND_EXTRA);
  ctx.beginPath();
  ctx.moveTo(dimOffX, topPx); ctx.lineTo(dimOffX, botPx);
  ctx.moveTo(dimOffX - toX(1), topPx); ctx.lineTo(dimOffX + toX(1), topPx);
  ctx.moveTo(dimOffX - toX(1), botPx); ctx.lineTo(dimOffX + toX(1), botPx);
  ctx.stroke();
  const overallD = Math.round(b.h - FND_EXTRA * 2);
  ctx.save();
  ctx.translate(dimOffX + toX(3), (topPx + botPx) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${overallD} mm`, 0, 0);
  ctx.restore();

  // ── section cut line A-A ──
  const cutY = (b.minY + b.maxY) / 2;
  ctx.strokeStyle = "#0066cc";
  ctx.lineWidth = toX(0.18);
  ctx.setLineDash([toX(2), toX(0.8), toX(0.4), toX(0.8)]);
  ctx.beginPath();
  ctx.moveTo(mx(b.minX - 200), my(cutY));
  ctx.lineTo(mx(b.maxX + 200), my(cutY));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#0066cc";
  ctx.font = font(3.5, true);
  ctx.textAlign = "center";
  ctx.fillText("A", mx(b.minX - 400), my(cutY) + toX(1.2));
  ctx.fillText("A", mx(b.maxX + 400), my(cutY) + toX(1.2));

  // ── legend ──
  ctx.fillStyle = "#000";
  ctx.font = font(2.2);
  ctx.textAlign = "left";
  const legX = toX(ox + 3);
  const legY = toY(oy + cellH - 8);
  // foundation swatch
  ctx.fillStyle = "#e0ddd5";
  ctx.fillRect(legX, legY, toX(4), toX(3));
  ctx.strokeStyle = "#000"; ctx.lineWidth = toX(0.1);
  ctx.strokeRect(legX, legY, toX(4), toX(3));
  ctx.fillStyle = "#000";
  ctx.fillText("Foundation strip", legX + toX(5), legY + toX(2.2));
  // wall swatch
  ctx.fillStyle = "rgba(180,160,140,0.6)";
  ctx.fillRect(legX + toX(40), legY, toX(4), toX(3));
  ctx.strokeRect(legX + toX(40), legY, toX(4), toX(3));
  ctx.fillStyle = "#000";
  ctx.fillText("Wall above", legX + toX(45), legY + toX(2.2));
  // centerline
  ctx.strokeStyle = "#d00"; ctx.lineWidth = toX(0.12);
  ctx.setLineDash([toX(1), toX(0.5)]);
  ctx.beginPath(); ctx.moveTo(legX + toX(78), legY + toX(1.5)); ctx.lineTo(legX + toX(84), legY + toX(1.5)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#000";
  ctx.fillText("Wall centreline", legX + toX(85), legY + toX(2.2));

  ctx.restore();
}

/* ══════════════════════════════════════════════════════════════
   DRAW VERTICAL SECTION DETAIL  (right 40% of sheet)
   ══════════════════════════════════════════════════════════════ */
function drawSectionDetail(
  ctx: CanvasRenderingContext2D,
  buildingW: number,
  buildingD: number,
  s: SectionSettings,
  ox: number, oy: number, cellW: number, cellH: number,
) {
  const ppm = PX_W / SHEET_W;
  const toX = (mm: number) => mm * ppm;
  const toY = (mm: number) => mm * ppm;
  const font = (sz: number, bold = false) => `${bold ? "bold " : ""}${toX(sz)}px 'Arial', sans-serif`;

  const wt = s.wallThickness;
  const fh = s.foundationDepth;
  const slb = s.slabThickness;
  const wallH = s.floorToFloorHeight * s.numStoreys;
  const rbH = 200;
  const totalH = fh + slb + PLINTH_H + wallH + rbH + buildingD * 0.35;
  const totalW = buildingW + 1200;
  const scaleX = (cellW * 0.70) / totalW;
  const scaleY = (cellH * 0.60) / totalH;
  const sc = Math.min(scaleX, scaleY);

  const groundY = oy + cellH * 0.72;
  const leftX = ox + (cellW - buildingW * sc) / 2;
  const mx = (v: number) => toX(leftX + v * sc);
  const my = (v: number) => toY(groundY - v * sc);

  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = toX(0.15);

  // title
  ctx.font = font(3.5, true);
  ctx.textAlign = "center";
  ctx.fillText("SECTION A-A", toX(ox + cellW / 2), toY(oy + 5));

  // ground line
  ctx.setLineDash([toX(0.8), toX(0.4)]);
  ctx.beginPath();
  ctx.moveTo(mx(-500), my(0));
  ctx.lineTo(mx(buildingW + 500), my(0));
  ctx.stroke();
  ctx.setLineDash([]);

  // ground hatch (earth)
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = toX(0.06);
  for (let i = 0; i < 6; i++) {
    const gy = my(-(i + 1) * 60);
    ctx.beginPath();
    ctx.moveTo(mx(-300), gy); ctx.lineTo(mx(buildingW + 300), gy);
    ctx.stroke();
  }
  ctx.strokeStyle = "#000"; ctx.lineWidth = toX(0.15);

  // foundation strips
  const fW = wt + FND_EXTRA * 2;
  const fOff = FND_EXTRA;
  const drawFooting = (wx: number) => {
    const fx = mx(wx - fOff);
    const fy = my(0);
    const fw = mx(fW) - mx(0);
    const fhPx = my(-fh) - my(0);
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(fx, fy, fw, fhPx);
    ctx.strokeStyle = "#888"; ctx.lineWidth = toX(0.08);
    hatchRect(ctx, fx, fy, fw, fhPx, toX(1.0));
    ctx.strokeStyle = "#000"; ctx.lineWidth = toX(0.25);
    ctx.strokeRect(fx, fy, fw, fhPx);
    ctx.lineWidth = toX(0.15);
  };
  drawFooting(0);
  drawFooting(buildingW - wt);

  // floor slab
  ctx.fillStyle = "#c8c8c8";
  ctx.fillRect(mx(0), my(slb), mx(buildingW) - mx(0), my(0) - my(slb));
  ctx.strokeRect(mx(0), my(slb), mx(buildingW) - mx(0), my(0) - my(slb));
  // slab dots
  ctx.save();
  ctx.beginPath(); ctx.rect(mx(0), my(slb), mx(buildingW) - mx(0), my(0) - my(slb)); ctx.clip();
  ctx.fillStyle = "#000";
  const dotSp = toX(1.5);
  for (let dx = mx(0); dx < mx(buildingW); dx += dotSp) {
    for (let dy = my(slb); dy < my(0); dy += dotSp) {
      ctx.beginPath(); ctx.arc(dx, dy, toX(0.12), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // plinth walls
  ctx.fillStyle = "#e0d8c8";
  const wallBase = slb + PLINTH_H;
  ctx.fillRect(mx(0), my(wallBase), mx(wt) - mx(0), my(slb) - my(wallBase));
  ctx.strokeRect(mx(0), my(wallBase), mx(wt) - mx(0), my(slb) - my(wallBase));
  ctx.fillRect(mx(buildingW - wt), my(wallBase), mx(wt) - mx(0), my(slb) - my(wallBase));
  ctx.strokeRect(mx(buildingW - wt), my(wallBase), mx(wt) - mx(0), my(slb) - my(wallBase));

  // main walls
  ctx.fillStyle = "#f0ece4";
  ctx.fillRect(mx(0), my(wallBase + wallH), mx(wt) - mx(0), my(wallBase) - my(wallBase + wallH));
  ctx.strokeRect(mx(0), my(wallBase + wallH), mx(wt) - mx(0), my(wallBase) - my(wallBase + wallH));
  ctx.fillRect(mx(buildingW - wt), my(wallBase + wallH), mx(wt) - mx(0), my(wallBase) - my(wallBase + wallH));
  ctx.strokeRect(mx(buildingW - wt), my(wallBase + wallH), mx(wt) - mx(0), my(wallBase) - my(wallBase + wallH));

  // ring beam
  ctx.fillStyle = "#b0b0b0";
  ctx.fillRect(mx(0), my(wallBase + wallH + rbH), mx(wt) - mx(0), my(wallBase + wallH) - my(wallBase + wallH + rbH));
  ctx.strokeRect(mx(0), my(wallBase + wallH + rbH), mx(wt) - mx(0), my(wallBase + wallH) - my(wallBase + wallH + rbH));
  ctx.fillRect(mx(buildingW - wt), my(wallBase + wallH + rbH), mx(wt) - mx(0), my(wallBase + wallH) - my(wallBase + wallH + rbH));
  ctx.strokeRect(mx(buildingW - wt), my(wallBase + wallH + rbH), mx(wt) - mx(0), my(wallBase + wallH) - my(wallBase + wallH + rbH));
  ctx.fillStyle = "#000";

  // roof profile
  const roofPts = roofProfile(s.roofType, buildingW, buildingD, wallBase + wallH + rbH);
  if (roofPts.length > 1) {
    ctx.lineWidth = toX(0.3);
    ctx.beginPath();
    ctx.moveTo(mx(roofPts[0].x), my(roofPts[0].y));
    for (let i = 1; i < roofPts.length; i++) ctx.lineTo(mx(roofPts[i].x), my(roofPts[i].y));
    ctx.stroke();
    ctx.save();
    ctx.fillStyle = "#d9c8a8";
    ctx.beginPath();
    ctx.moveTo(mx(roofPts[0].x), my(roofPts[0].y));
    for (let i = 1; i < roofPts.length; i++) ctx.lineTo(mx(roofPts[i].x), my(roofPts[i].y));
    for (let i = roofPts.length - 1; i >= 0; i--) ctx.lineTo(mx(roofPts[i].x), my(roofPts[i].y + 80));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.lineWidth = toX(0.15);
  }

  // ceiling line
  const ceilY = wallBase + s.ceilingHeight;
  ctx.setLineDash([toX(0.6), toX(0.3)]);
  ctx.beginPath(); ctx.moveTo(mx(wt), my(ceilY)); ctx.lineTo(mx(buildingW - wt), my(ceilY)); ctx.stroke();
  ctx.setLineDash([]);

  // dimension lines
  ctx.font = font(2.4);
  ctx.textAlign = "center";
  ctx.fillStyle = "#000";
  const dimOff = 6;
  const vx = leftX - dimOff;
  const drawVDim = (y1: number, y2: number, txt: string) => {
    const py1 = my(y1), py2 = my(y2);
    ctx.beginPath();
    ctx.moveTo(toX(vx), py1); ctx.lineTo(toX(vx), py2);
    ctx.moveTo(toX(vx - 0.8), py1); ctx.lineTo(toX(vx + 0.8), py1);
    ctx.moveTo(toX(vx - 0.8), py2); ctx.lineTo(toX(vx + 0.8), py2);
    ctx.stroke();
    ctx.save();
    ctx.translate(toX(vx - 2), (py1 + py2) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  };
  drawVDim(-fh, 0, `${fh} FND`);
  drawVDim(0, slb, `${slb} SLAB`);
  drawVDim(slb, wallBase, `${PLINTH_H} PLINTH`);
  drawVDim(wallBase, wallBase + wallH, `${wallH} WALL`);

  // labels
  ctx.font = font(2);
  ctx.textAlign = "left";
  const lblX = leftX + buildingW * sc + 5;
  const lbl = [
    { t: `${s.foundationType} foundation`, y: -fh / 2 },
    { t: `${slb} mm slab`, y: slb / 2 },
    { t: `${s.wallMaterial} wall`, y: wallBase + wallH / 2 },
    { t: `${s.roofMaterial} roof`, y: wallBase + wallH + rbH + 200 },
  ];
  for (const l of lbl) ctx.fillText(l.t, toX(lblX), my(l.y));

  ctx.restore();
}

/* ── title block (matches floor-plan / elevation style) ── */
function drawTitleBlock(ctx: CanvasRenderingContext2D, s: SectionSettings, scaleLabel: string) {
  const ppm = PX_W / SHEET_W;
  const toX = (mm: number) => mm * ppm;
  const toY = (mm: number) => mm * ppm;
  const tbFont = (sz: number) => `${toX(sz)}px 'Arial', sans-serif`;
  const tbBold = (sz: number) => `bold ${toX(sz)}px 'Arial', sans-serif`;

  const drawL = MARGIN + BORDER;
  const drawW = SHEET_W - 2 * (MARGIN + BORDER);
  const tbY = SHEET_H - MARGIN - BORDER - TITLE_BLOCK_H;

  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.4);
  ctx.strokeRect(toX(drawL), toY(tbY), toX(drawW), toY(TITLE_BLOCK_H));

  const tbCols = [0, 0.35, 0.55, 0.7, 0.85, 1.0];
  for (let i = 1; i < tbCols.length - 1; i++) {
    const x = drawL + drawW * tbCols[i];
    ctx.beginPath();
    ctx.moveTo(toX(x), toY(tbY));
    ctx.lineTo(toX(x), toY(tbY + TITLE_BLOCK_H));
    ctx.stroke();
  }
  const tbMidY = tbY + TITLE_BLOCK_H * 0.5;
  ctx.beginPath();
  ctx.moveTo(toX(drawL + drawW * 0.35), toY(tbMidY));
  ctx.lineTo(toX(drawL + drawW), toY(tbMidY));
  ctx.stroke();

  const logoX = drawL + 2;
  const logoY = tbY + 2;
  const img = getLogo();
  if (img.complete && img.naturalWidth > 0) {
    const boxW = 16 * ppm;
    const boxH = 16 * ppm;
    const sc = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const rW = img.naturalWidth * sc;
    const rH = img.naturalHeight * sc;
    ctx.drawImage(img, toX(logoX) + (boxW - rW) / 2, toY(logoY) + (boxH - rH) / 2, rW, rH);
  }

  const textX = drawL + 20;
  const colX = (i: number) => drawL + drawW * tbCols[i] + 1.5;
  ctx.fillStyle = "#000";
  ctx.textAlign = "left";

  ctx.font = tbBold(5.5);
  ctx.fillText(s.projectName || "UNTITLED PROJECT", toX(textX), toY(tbY + 8));
  ctx.font = tbFont(3.5);
  ctx.fillText("FOUNDATION SETTING OUT PLAN / SECTION", toX(textX), toY(tbY + 14));
  ctx.fillText(
    `${s.wallMaterial.toUpperCase()} WALLS | ${s.roofMaterial.toUpperCase()} ROOF`,
    toX(textX), toY(tbY + 19),
  );
  ctx.fillText(
    `${s.numStoreys} STOREY${s.numStoreys > 1 ? "S" : ""} | ${s.foundationType.toUpperCase()} FDN ${s.foundationDepth}mm | SLAB ${s.slabThickness}mm`,
    toX(textX), toY(tbY + 24),
  );

  ctx.font = tbBold(2.8);
  ctx.fillText("SCALE", toX(colX(1)), toY(tbY + 5));
  ctx.fillText("DATE", toX(colX(2)), toY(tbY + 5));
  ctx.fillText("DRAWN", toX(colX(3)), toY(tbY + 5));
  ctx.fillText("DWG NO.", toX(colX(4)), toY(tbY + 5));
  ctx.font = tbFont(3.2);
  ctx.fillText(scaleLabel, toX(colX(1)), toY(tbY + 11));
  ctx.fillText(new Date().toLocaleDateString("en-GB"), toX(colX(2)), toY(tbY + 11));
  ctx.fillText("ACH STUDIO", toX(colX(3)), toY(tbY + 11));
  ctx.fillText("SEC-001", toX(colX(4)), toY(tbY + 11));

  ctx.font = tbBold(2.8);
  ctx.fillText("SHEET SIZE", toX(colX(1)), toY(tbMidY + 5));
  ctx.fillText("REV", toX(colX(2)), toY(tbMidY + 5));
  ctx.fillText("CHECKED", toX(colX(3)), toY(tbMidY + 5));
  ctx.fillText("STATUS", toX(colX(4)), toY(tbMidY + 5));
  ctx.font = tbFont(3.2);
  ctx.fillText("A3", toX(colX(1)), toY(tbMidY + 11));
  ctx.fillText("A", toX(colX(2)), toY(tbMidY + 11));
  ctx.fillText("\u2014", toX(colX(3)), toY(tbMidY + 11));
  ctx.fillText("FOR CONSTRUCTION", toX(colX(4)), toY(tbMidY + 11));
}

/* ── main render ── */
function renderSheet(canvas: HTMLCanvasElement, elements: DrawingElement[], settings: SectionSettings) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = PX_W;
  canvas.height = PX_H;
  const ppm = PX_W / SHEET_W;
  const toX = (mm: number) => mm * ppm;
  const toY = (mm: number) => mm * ppm;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, PX_W, PX_H);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.4);
  ctx.strokeRect(toX(MARGIN), toY(MARGIN), toX(SHEET_W - 2 * MARGIN), toY(SHEET_H - 2 * MARGIN));
  ctx.lineWidth = toX(0.2);
  ctx.strokeRect(toX(MARGIN + BORDER), toY(MARGIN + BORDER), toX(SHEET_W - 2 * (MARGIN + BORDER)), toY(SHEET_H - 2 * (MARGIN + BORDER)));

  const segs = extractWallSegments(elements, settings.wallThickness);
  const b = segs.length > 0 ? wallBounds(segs) : null;
  const bw = b ? b.w : settings.plotWidth;
  const bd = b ? b.h : settings.plotDepth;

  const innerX = MARGIN + BORDER;
  const innerY = MARGIN + BORDER;
  const innerW = SHEET_W - 2 * (MARGIN + BORDER);
  const innerH = SHEET_H - 2 * (MARGIN + BORDER) - TITLE_BLOCK_H;

  // divider line
  const splitX = innerX + innerW * 0.58;
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = toX(0.1);
  ctx.beginPath();
  ctx.moveTo(toX(splitX), toY(innerY));
  ctx.lineTo(toX(splitX), toY(innerY + innerH));
  ctx.stroke();

  // left: foundation plan (58%)
  drawFoundationPlan(ctx, segs, settings, innerX, innerY, innerW * 0.58, innerH);
  // right: section detail (42%)
  drawSectionDetail(ctx, bw, bd, settings, splitX, innerY, innerW * 0.42, innerH);

  // compute approximate scale label from foundation plan fit
  let scaleLabel = "NTS";
  if (b) {
    const padMm = 12;
    const planW = innerW * 0.58 - padMm * 2;
    const planH = innerH - padMm * 2 - 8;
    const sc = Math.min(planW / b.w, planH / b.h);
    scaleLabel = `1:${Math.round(1 / sc)}`;
  }
  drawTitleBlock(ctx, settings, scaleLabel);
}

/* ── React component ── */
export default function PrintSection({ elements, settings, onClose }: PrintSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    if (canvasRef.current) renderSheet(canvasRef.current, elements, settings);
  }, [elements, settings]);

  useEffect(() => {
    const img = getLogo();
    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
    return () => { img.onload = null; };
  }, [draw]);

  const handlePrint = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const url = c.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Section Print</title><style>@page{size:A3 landscape;margin:0}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{width:100%;height:auto}</style></head><body><img src="${url}" onload="window.print();window.close()"/></body></html>`);
    win.document.close();
  }, []);

  const handleDownload = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = `section-${(settings.projectName || "plan").replace(/\s+/g, "_")}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
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
          onClick={handleDownload}
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
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block", imageRendering: "auto" }} />
      </div>
    </div>
  );
}

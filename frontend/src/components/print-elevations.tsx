import { useRef, useEffect, useCallback } from "react";

// ─── Types (mirrored from architectural-studio) ──────────
type DrawingElement =
  | { id: string; type: "line"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "circle"; x: number; y: number; radius: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "text"; x: number; y: number; text: string; color: string; lineWidth: number; layer: string }
  | { id: string; type: "dimension"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "polyline"; points: { x: number; y: number }[]; color: string; lineWidth: number; layer: string }
  | { id: string; type: "block"; x: number; y: number; width: number; height: number; symbolName: string; rotation: number; color: string; lineWidth: number; layer: string; flipX?: boolean; flipY?: boolean };

type RoofType = "none" | "flat" | "gable" | "hip" | "shed" | "mansard" | "pyramid";

interface ElevationSettings {
  projectName: string;
  wallThickness: number;      // mm
  floorToFloorHeight: number;  // mm
  ceilingHeight: number;       // mm
  foundationDepth: number;     // mm
  foundationType: string;
  slabThickness: number;       // mm
  numStoreys: number;
  doorWidth: number;
  doorHeight: number;
  windowWidth: number;
  windowHeight: number;
  windowSillHeight: number;
  roofType: RoofType;
  roofMaterial: string;
  wallMaterial: string;
  plotWidth: number;
  plotDepth: number;
}

// ─── Helper: detect wall-layer elements ──────────────────
function isWallLayer(layer: string): boolean {
  const l = layer.toLowerCase();
  return l === "walls" || l === "wall" || l === "layer 0";
}

function isDoorLayer(layer: string): boolean {
  return layer.toLowerCase() === "doors";
}

function isWindowLayer(layer: string): boolean {
  return layer.toLowerCase() === "windows";
}

const OFFICIAL_LOGO_SRC = "/images/logo.png";
let officialLogoImage: HTMLImageElement | null = null;

function getSymbolDefinition(name: string) {
  const globalLibrary = (window as any).__archStudioSymbolLibrary as Record<string, { anchorX?: number; anchorY?: number }> | undefined;
  return globalLibrary?.[name];
}

function getOfficialLogoImage(): HTMLImageElement {
  if (officialLogoImage) return officialLogoImage;
  const img = new Image();
  img.src = OFFICIAL_LOGO_SRC;
  officialLogoImage = img;
  return img;
}

function getBlockPlanBounds(el: Extract<DrawingElement, { type: "block" }>) {
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

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const corner of corners) {
    const lx = corner.x * flipX;
    const ly = corner.y * flipY;
    const wx = el.x + lx * cosR - ly * sinR;
    const wy = el.y + lx * sinR + ly * cosR;
    minX = Math.min(minX, wx); maxX = Math.max(maxX, wx);
    minY = Math.min(minY, wy); maxY = Math.max(maxY, wy);
  }

  return { minX, minY, maxX, maxY };
}

// ─── Compute bounding box of walls ───────────────────────
function computeBounds(elements: DrawingElement[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let found = false;
  for (const el of elements) {
    if (!isWallLayer(el.layer)) continue;
    found = true;
    if (el.type === "line" || el.type === "dimension") {
      minX = Math.min(minX, el.x, el.x2); maxX = Math.max(maxX, el.x, el.x2);
      minY = Math.min(minY, el.y, el.y2); maxY = Math.max(maxY, el.y, el.y2);
    } else if (el.type === "rect") {
      minX = Math.min(minX, el.x, el.x + el.width); maxX = Math.max(maxX, el.x, el.x + el.width);
      minY = Math.min(minY, el.y, el.y + el.height); maxY = Math.max(maxY, el.y, el.y + el.height);
    } else if (el.type === "polyline") {
      for (const p of el.points) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    }
  }
  if (!found) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// ─── Find openings (doors/windows) on each face ─────────
interface Opening {
  posAlongWall: number;  // mm from left of that face
  width: number;         // mm
  sillHeight: number;    // mm from ground (0 for doors)
  topHeight: number;     // mm from ground
  type: "door" | "window";
}

function findOpeningsOnFace(
  elements: DrawingElement[],
  face: "front" | "rear" | "left" | "right",
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  settings: ElevationSettings,
): Opening[] {
  const openings: Opening[] = [];
  const wt = settings.wallThickness;
  const tol = wt * 1.5; // tolerance to detect if block is on a wall face

  for (const el of elements) {
    if (el.type !== "block") continue;
    const isDoor = isDoorLayer(el.layer) || el.symbolName?.toLowerCase().includes("door");
    const isWindow = isWindowLayer(el.layer) || el.symbolName?.toLowerCase().includes("window");
    if (!isDoor && !isWindow) continue;

    let onFace: "front" | "rear" | "left" | "right" | null = null;
    let spanStart = 0;
    let spanEnd = 0;
    const openingBounds = getBlockPlanBounds(el);

    // Check which wall face this opening is on
    if (Math.abs(el.y - bounds.minY) < tol) { onFace = "front"; spanStart = openingBounds.minX; spanEnd = openingBounds.maxX; }
    else if (Math.abs(el.y - bounds.maxY) < tol) { onFace = "rear"; spanStart = openingBounds.minX; spanEnd = openingBounds.maxX; }
    else if (Math.abs(el.x - bounds.minX) < tol) { onFace = "left"; spanStart = openingBounds.minY; spanEnd = openingBounds.maxY; }
    else if (Math.abs(el.x - bounds.maxX) < tol) { onFace = "right"; spanStart = openingBounds.minY; spanEnd = openingBounds.maxY; }

    if (onFace === face) {
      const openingCenter = (spanStart + spanEnd) / 2;
      // Rear and right faces are viewed from outside so positions mirror
      const posAlong = face === "front"
        ? openingCenter - bounds.minX
        : face === "rear"
          ? bounds.maxX - openingCenter
          : face === "left"
            ? openingCenter - bounds.minY
            : /* right */ bounds.maxY - openingCenter;
      const openingWidth = Math.max(1, spanEnd - spanStart);
      if (isDoor) {
        openings.push({
          posAlongWall: posAlong,
          width: openingWidth,
          sillHeight: 0,
          topHeight: settings.doorHeight,
          type: "door",
        });
      } else {
        openings.push({
          posAlongWall: posAlong,
          width: openingWidth,
          sillHeight: settings.windowSillHeight,
          topHeight: settings.windowSillHeight + settings.windowHeight,
          type: "window",
        });
      }
    }
  }
  return openings;
}

// ─── Roof profile for an elevation face ──────────────────
type RoofPoint = { x: number; y: number }; // in mm, relative to face left=0, ground=0

function getRoofProfile(roofType: RoofType, face: "front" | "rear" | "left" | "right", faceWidth: number, faceDepth: number, wallHeight: number, buildingDepth?: number): RoofPoint[] {
  if (roofType === "none") return [];
  if (roofType === "flat") return getFlatRoofProfile(faceWidth, wallHeight);
  if (roofType === "shed") {
    const overhang = 300;
    // Shed slopes front-to-rear along building depth; rise must be consistent
    const shedDepth = buildingDepth ?? ((face === "front" || face === "rear") ? faceDepth : faceWidth);
    const rise = shedDepth * 0.35;
    if (face === "front") return [
      { x: -overhang, y: wallHeight + rise },
      { x: faceWidth + overhang, y: wallHeight + rise },
    ];
    if (face === "rear") return [
      { x: -overhang, y: wallHeight },
      { x: faceWidth + overhang, y: wallHeight },
    ];
    if (face === "left") return [
      { x: -overhang, y: wallHeight + rise },
      { x: faceWidth + overhang, y: wallHeight },
    ];
    return [
      { x: -overhang, y: wallHeight },
      { x: faceWidth + overhang, y: wallHeight + rise },
    ];
  }

  const overhang = 300;

  if (roofType === "gable") {
    const rise = faceDepth * 0.25;
    if (face === "front" || face === "rear") {
      return [
        { x: -overhang, y: wallHeight },
        { x: faceWidth / 2, y: wallHeight + rise },
        { x: faceWidth + overhang, y: wallHeight },
      ];
    }
    return [
      { x: -overhang, y: wallHeight + rise },
      { x: faceWidth + overhang, y: wallHeight + rise },
    ];
  }

  if (roofType === "hip") {
    const rise = faceDepth * 0.25;
    // All four sides see a slope
    return [
      { x: -overhang, y: wallHeight },
      { x: faceWidth / 2, y: wallHeight + rise },
      { x: faceWidth + overhang, y: wallHeight },
    ];
  }

  if (roofType === "pyramid") {
    const rise = Math.min(faceWidth, faceDepth) * 0.35;
    return [
      { x: -overhang, y: wallHeight },
      { x: faceWidth / 2, y: wallHeight + rise },
      { x: faceWidth + overhang, y: wallHeight },
    ];
  }

  if (roofType === "mansard") {
    const inset = faceWidth * 0.25;
    const lowerRise = faceDepth * 0.18;
    return [
      { x: -overhang, y: wallHeight },
      { x: inset, y: wallHeight + lowerRise },
      { x: faceWidth - inset, y: wallHeight + lowerRise },
      { x: faceWidth + overhang, y: wallHeight },
    ];
  }

  // Fallback: triangular
  const ridge = wallHeight + faceDepth * 0.25;
  return [
    { x: -overhang, y: wallHeight },
    { x: faceWidth / 2, y: ridge },
    { x: faceWidth + overhang, y: wallHeight },
  ];
}

function getFlatRoofProfile(faceWidth: number, wallHeight: number): RoofPoint[] {
  const overhang = 200;
  return [
    { x: -overhang, y: wallHeight },
    { x: faceWidth + overhang, y: wallHeight },
  ];
}

// ─── A3 landscape sheet dimensions (mm at 1:1 print) ─────
const SHEET_W = 420; // A3 landscape width mm
const SHEET_H = 297; // A3 landscape height mm
const MARGIN = 10;
const TITLE_BLOCK_H = 30;
const BORDER = 5;

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

// ─── Drawing scale calculation ───────────────────────────
function computeDrawingScale(
  buildingWidth: number,
  buildingDepth: number,
  wallHeight: number,
): number {
  // We need to fit 4 elevations in 2x2 grid
  // Available area after margins and title block
  const availW = (SHEET_W - MARGIN * 2 - BORDER * 2) * 0.95;
  const availH = (SHEET_H - MARGIN * 2 - BORDER * 2 - TITLE_BLOCK_H) * 0.95;
  const cellW = availW / 2;
  const cellH = availH / 2;

  // Each elevation needs to fit in a cell (with some padding)
  const padCell = 0.7; // use 70% of cell
  const maxFaceW = Math.max(buildingWidth, buildingDepth);
  const maxFaceH = wallHeight * 1.5; // include roof + foundation

  const scaleX = (cellW * padCell) / maxFaceW;
  const scaleY = (cellH * padCell) / maxFaceH;
  const rawScale = Math.min(scaleX, scaleY);

  // Round to standard scales
  const standards = [1/5, 1/10, 1/20, 1/25, 1/50, 1/75, 1/100, 1/150, 1/200, 1/250, 1/500];
  for (const s of standards) {
    if (rawScale >= s) return s;
  }
  return 1/500;
}

// ─── Main drawing function ───────────────────────────────

function drawElevationSheet(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  elements: DrawingElement[],
  settings: ElevationSettings,
) {
  const PX_PER_MM = canvasW / SHEET_W; // pixels per sheet-mm
  const toX = (mm: number) => mm * PX_PER_MM;
  const toY = (mm: number) => mm * PX_PER_MM;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const bounds = computeBounds(elements);
  if (!bounds) {
    ctx.fillStyle = "#333";
    ctx.font = `${toX(5)}px 'Arial'`;
    ctx.textAlign = "center";
    ctx.fillText("No wall elements found — draw walls first", canvasW / 2, canvasH / 2);
    return;
  }

  const bw = bounds.width;   // building width (plan X) in mm
  const bd = bounds.height;  // building depth (plan Y) in mm
  const wallH = settings.floorToFloorHeight * settings.numStoreys;
  const roofRise = settings.roofType === "flat" || settings.roofType === "none" ? 0 : bd * 0.25;
  const totalH = wallH + settings.foundationDepth + 150 + roofRise;

  const scale = computeDrawingScale(bw, bd, totalH);
  const scaleLabel = `1:${Math.round(1/scale)}`;

  // Drawing area
  const drawL = MARGIN + BORDER;
  const drawT = MARGIN + BORDER;
  const drawW = SHEET_W - (MARGIN + BORDER) * 2;
  const drawH = SHEET_H - (MARGIN + BORDER) * 2 - TITLE_BLOCK_H;

  // ── Sheet border ──
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.5);
  ctx.strokeRect(toX(MARGIN), toY(MARGIN), toX(SHEET_W - MARGIN * 2), toY(SHEET_H - MARGIN * 2));
  ctx.lineWidth = toX(0.3);
  ctx.strokeRect(toX(MARGIN + BORDER), toY(MARGIN + BORDER), toX(drawW), toY(drawH + TITLE_BLOCK_H));

  // ── Title block ──
  const tbY = SHEET_H - MARGIN - BORDER - TITLE_BLOCK_H;
  ctx.lineWidth = toX(0.4);
  ctx.strokeRect(toX(drawL), toY(tbY), toX(drawW), toY(TITLE_BLOCK_H));

  // Title block internal divisions
  const tbCols = [0, 0.35, 0.55, 0.7, 0.85, 1.0]; // fractional column positions
  for (let i = 1; i < tbCols.length - 1; i++) {
    const x = drawL + drawW * tbCols[i];
    ctx.beginPath(); ctx.moveTo(toX(x), toY(tbY)); ctx.lineTo(toX(x), toY(tbY + TITLE_BLOCK_H)); ctx.stroke();
  }
  // Horizontal divider in title block
  const tbMidY = tbY + TITLE_BLOCK_H * 0.5;
  ctx.beginPath(); ctx.moveTo(toX(drawL + drawW * 0.35), toY(tbMidY)); ctx.lineTo(toX(drawL + drawW), toY(tbMidY)); ctx.stroke();

  // Title block text
  const tbFont = (size: number) => `${toX(size)}px 'Arial', sans-serif`;
  const tbBold = (size: number) => `bold ${toX(size)}px 'Arial', sans-serif`;
  const logoX = drawL + 2;
  const logoY = tbY + 2;
  const textX = drawL + 20;
  ctx.fillStyle = "#000";
  ctx.textAlign = "left";

  // Project name (large)
  drawOfficialLogo(ctx, canvasW, logoX, logoY, 16, 16);
  ctx.font = tbBold(5.5);
  ctx.fillText(
    settings.projectName || "UNTITLED PROJECT",
    toX(textX), toY(tbY + 8)
  );
  ctx.font = tbFont(3.5);
  ctx.fillText("ELEVATIONS", toX(textX), toY(tbY + 14));
  ctx.fillText(
    `${settings.wallMaterial.toUpperCase()} WALLS | ${settings.roofMaterial.toUpperCase()} ROOF`,
    toX(textX), toY(tbY + 19)
  );
  ctx.fillText(
    `${settings.numStoreys} STOREY${settings.numStoreys > 1 ? "S" : ""} | ${settings.foundationType.toUpperCase()} FOUNDATION`,
    toX(textX), toY(tbY + 24)
  );

  // Column headers (top row)
  const colX = (i: number) => drawL + drawW * tbCols[i] + 1.5;
  ctx.font = tbBold(2.8);
  ctx.fillText("SCALE", toX(colX(1)), toY(tbY + 5));
  ctx.fillText("DATE", toX(colX(2)), toY(tbY + 5));
  ctx.fillText("DRAWN", toX(colX(3)), toY(tbY + 5));
  ctx.fillText("DWG NO.", toX(colX(4)), toY(tbY + 5));

  // Column values (top row)
  ctx.font = tbFont(3.2);
  ctx.fillText(scaleLabel, toX(colX(1)), toY(tbY + 11));
  ctx.fillText(new Date().toLocaleDateString("en-GB"), toX(colX(2)), toY(tbY + 11));
  ctx.fillText("ACH STUDIO", toX(colX(3)), toY(tbY + 11));
  ctx.fillText("ELEV-001", toX(colX(4)), toY(tbY + 11));

  // Bottom row
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

  // ── 2x2 elevation grid ──
  const cellW = drawW / 2;
  const cellH = drawH / 2;

  const faces: { label: string; face: "front" | "rear" | "left" | "right"; col: number; row: number }[] = [
    { label: "FRONT ELEVATION", face: "front", col: 0, row: 0 },
    { label: "RIGHT SIDE ELEVATION", face: "right", col: 1, row: 0 },
    { label: "LEFT SIDE ELEVATION", face: "left", col: 0, row: 1 },
    { label: "REAR ELEVATION", face: "rear", col: 1, row: 1 },
  ];

  for (const { label, face, col, row } of faces) {
    const cellLeft = drawL + col * cellW;
    const cellTop = drawT + row * cellH;

    // Cell border (light)
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = toX(0.15);
    ctx.strokeRect(toX(cellLeft), toY(cellTop), toX(cellW), toY(cellH));

    // Elevation label
    ctx.fillStyle = "#000";
    ctx.font = tbBold(3.5);
    ctx.textAlign = "center";
    ctx.fillText(label, toX(cellLeft + cellW / 2), toY(cellTop + 5));

    // Determine face dimensions
    const faceW = (face === "front" || face === "rear") ? bw : bd;
    const faceD = (face === "front" || face === "rear") ? bd : bw;

    // Scale and center the elevation in the cell
    const elevPadding = 10; // mm padding inside cell
    const availCellW = cellW - elevPadding * 2;
    const availCellH = cellH - elevPadding * 2 - 5; // subtract label space
    // Compute roof rise for this specific face using the profile
    const roofProfile = getRoofProfile(settings.roofType, face, faceW, faceD, wallH, bd);
    const faceRoofRise = roofProfile.length > 0
      ? Math.max(...roofProfile.map(p => p.y)) - wallH
      : 0;
    const roofPeak = wallH + faceRoofRise;
    const totalElevH = roofPeak + settings.foundationDepth + 150; // foundation + plinth

    const elevScaleX = availCellW / (faceW * scale + 20); // 20mm for dimension space
    const elevScaleY = availCellH / (totalElevH * scale + 10);
    const elevFit = Math.min(elevScaleX, elevScaleY, 1); // don't exceed 1

    const s = scale * elevFit; // combined scale: mm-to-sheet-mm
    const drawFaceW = faceW * s;
    const drawTotalH = totalElevH * s;

    // Origin: center-bottom of elevation in cell
    const ox = cellLeft + cellW / 2 - drawFaceW / 2;
    const groundY = cellTop + cellH - elevPadding - settings.foundationDepth * s - 150 * s;

    // Helper: mm building coords → sheet coords
    const ex = (mmX: number) => toX(ox + mmX * s);
    const ey = (mmY: number) => toY(groundY - mmY * s); // Y flipped (up is negative)

    // ── Ground line ──
    ctx.strokeStyle = "#000";
    ctx.lineWidth = toX(0.3);
    ctx.setLineDash([toX(1), toX(1)]);
    ctx.beginPath();
    ctx.moveTo(ex(-500), ey(0));
    ctx.lineTo(ex(faceW + 500), ey(0));
    ctx.stroke();
    ctx.setLineDash([]);

    // Ground line label
    ctx.fillStyle = "#666";
    ctx.font = tbFont(2.2);
    ctx.textAlign = "left";
    ctx.fillText("G.L.", ex(faceW + 200), ey(0) + toY(0.5));

    // ── Foundation (below ground) ──
    ctx.strokeStyle = "#888";
    ctx.lineWidth = toX(0.2);
    ctx.setLineDash([toX(0.8), toX(0.8)]);

    const fdepth = settings.foundationDepth;
    const plinthH = 150; // mm

    if (settings.foundationType === "strip" || settings.foundationType === "stepped") {
      // Strip footing under wall outline
      const fw = settings.wallThickness + 200; // footing wider than wall
      // Left footing
      ctx.strokeRect(ex(-fw / 2), ey(-plinthH), toX(fw * s), toY((fdepth + plinthH) * s));
      // Right footing
      ctx.strokeRect(ex(faceW - fw / 2), ey(-plinthH), toX(fw * s), toY((fdepth + plinthH) * s));
    }
    if (settings.foundationType === "raft") {
      ctx.strokeRect(ex(-100), ey(-plinthH), toX((faceW + 200) * s), toY((fdepth + plinthH) * s));
    }
    if (settings.foundationType === "pad") {
      const padW = 900;
      ctx.strokeRect(ex(-padW / 2 + settings.wallThickness / 2), ey(-plinthH), toX(padW * s), toY((fdepth + plinthH) * s));
      ctx.strokeRect(ex(faceW - padW / 2 - settings.wallThickness / 2), ey(-plinthH), toX(padW * s), toY((fdepth + plinthH) * s));
    }
    if (settings.foundationType === "stepped") {
      // Draw step notches
      const stepH = fdepth / 3;
      for (let side = 0; side < 2; side++) {
        const baseX = side === 0 ? -100 : faceW - 100;
        for (let i = 0; i < 3; i++) {
          const w = 200 + (2 - i) * 75;
          ctx.strokeRect(
            ex(baseX + settings.wallThickness / 2 - w / 2),
            ey(-plinthH - stepH * i),
            toX(w * s), toY(stepH * s)
          );
        }
      }
    }
    ctx.setLineDash([]);

    // ── Plinth (above foundation, below ground level) ──
    ctx.fillStyle = "#d4d0c8";
    ctx.strokeStyle = "#555";
    ctx.lineWidth = toX(0.25);
    ctx.fillRect(ex(0), ey(plinthH), toX(faceW * s), toY(plinthH * s));
    ctx.strokeRect(ex(0), ey(plinthH), toX(faceW * s), toY(plinthH * s));

    // DPC line
    ctx.strokeStyle = "#333";
    ctx.lineWidth = toX(0.4);
    ctx.beginPath();
    ctx.moveTo(ex(-50), ey(plinthH));
    ctx.lineTo(ex(faceW + 50), ey(plinthH));
    ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = tbFont(2);
    ctx.textAlign = "left";
    ctx.fillText("DPC", ex(faceW + 80), ey(plinthH) + toY(0.5));

    // ── Walls ──
    ctx.fillStyle = "#f0ece4";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = toX(0.35);
    ctx.fillRect(ex(0), ey(wallH), toX(faceW * s), toY((wallH - plinthH) * s));
    ctx.strokeRect(ex(0), ey(wallH), toX(faceW * s), toY((wallH - plinthH) * s));

    // Wall hatch (light diagonal lines for masonry)
    ctx.save();
    ctx.beginPath();
    ctx.rect(ex(0), ey(wallH), toX(faceW * s), toY((wallH - plinthH) * s));
    ctx.clip();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = toX(0.1);
    const hatchSpacing = toX(2);
    const hatchL = ex(0);
    const hatchR = ex(faceW);
    const hatchT = ey(wallH);
    const hatchB = ey(plinthH);
    for (let d = hatchT - (hatchR - hatchL); d < hatchB + (hatchR - hatchL); d += hatchSpacing) {
      ctx.beginPath();
      ctx.moveTo(hatchL, d);
      ctx.lineTo(hatchR, d + (hatchR - hatchL));
      ctx.stroke();
    }
    ctx.restore();

    // ── Openings ──
    const openings = findOpeningsOnFace(elements, face, bounds, settings);
    for (const op of openings) {
      const opL = op.posAlongWall - op.width / 2;
      const opW = op.width;

      // Clear the opening area
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ex(opL), ey(op.topHeight), toX(opW * s), toY((op.topHeight - op.sillHeight) * s));

      // Opening outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = toX(0.3);
      ctx.strokeRect(ex(opL), ey(op.topHeight), toX(opW * s), toY((op.topHeight - op.sillHeight) * s));

      if (op.type === "window") {
        // Window cross / mullion
        const midX = ex(opL + opW / 2);
        const midY = ey((op.sillHeight + op.topHeight) / 2);
        ctx.beginPath();
        ctx.moveTo(midX, ey(op.topHeight));
        ctx.lineTo(midX, ey(op.sillHeight));
        ctx.moveTo(ex(opL), midY);
        ctx.lineTo(ex(opL + opW), midY);
        ctx.stroke();

        // Window sill
        ctx.lineWidth = toX(0.4);
        ctx.beginPath();
        ctx.moveTo(ex(opL - 50), ey(op.sillHeight));
        ctx.lineTo(ex(opL + opW + 50), ey(op.sillHeight));
        ctx.stroke();
      } else {
        // Door threshold line
        ctx.lineWidth = toX(0.4);
        ctx.beginPath();
        ctx.moveTo(ex(opL), ey(0));
        ctx.lineTo(ex(opL + opW), ey(0));
        ctx.stroke();

        // Door panel lines (single panel for simplicity)
        ctx.lineWidth = toX(0.15);
        ctx.beginPath();
        ctx.moveTo(ex(opL + opW * 0.1), ey(op.topHeight * 0.05));
        ctx.lineTo(ex(opL + opW * 0.1), ey(op.topHeight * 0.95));
        ctx.lineTo(ex(opL + opW * 0.9), ey(op.topHeight * 0.95));
        ctx.lineTo(ex(opL + opW * 0.9), ey(op.topHeight * 0.05));
        ctx.closePath();
        ctx.stroke();
      }
    }

    // ── Roof profile ──
    ctx.strokeStyle = "#000";
    ctx.lineWidth = toX(0.4);
    const roofPts = getRoofProfile(settings.roofType, face, faceW, faceD, wallH, bd);
    if (roofPts.length > 0) {
      ctx.beginPath();
      for (let i = 0; i < roofPts.length; i++) {
        const px = ex(roofPts[i].x);
        const py = ey(roofPts[i].y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = "#e8e0d4";
      ctx.beginPath();
      ctx.moveTo(ex(0), ey(wallH));
      for (const pt of roofPts) ctx.lineTo(ex(pt.x), ey(pt.y));
      ctx.lineTo(ex(faceW), ey(wallH));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = toX(0.4);
      ctx.beginPath();
      for (let i = 0; i < roofPts.length; i++) {
        if (i === 0) ctx.moveTo(ex(roofPts[i].x), ey(roofPts[i].y));
        else ctx.lineTo(ex(roofPts[i].x), ey(roofPts[i].y));
      }
      ctx.stroke();
    }

    // ── Dimension lines ──
    ctx.strokeStyle = "#333";
    ctx.fillStyle = "#333";
    ctx.lineWidth = toX(0.15);
    ctx.font = tbFont(2.2);
    ctx.textAlign = "center";

    // Overall width dimension (below foundation)
    const dimY = ey(-fdepth - plinthH - 300);
    ctx.beginPath();
    ctx.moveTo(ex(0), dimY); ctx.lineTo(ex(faceW), dimY); ctx.stroke();
    // Ticks
    ctx.beginPath();
    ctx.moveTo(ex(0), dimY - toY(1)); ctx.lineTo(ex(0), dimY + toY(1)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex(faceW), dimY - toY(1)); ctx.lineTo(ex(faceW), dimY + toY(1)); ctx.stroke();
    ctx.fillText(`${Math.round(faceW)} mm`, (ex(0) + ex(faceW)) / 2, dimY - toY(1.5));

    // Overall height dimension (right side)
    const dimX = ex(faceW + 500);
    ctx.beginPath();
    ctx.moveTo(dimX, ey(0)); ctx.lineTo(dimX, ey(wallH)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dimX - toX(1), ey(0)); ctx.lineTo(dimX + toX(1), ey(0)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dimX - toX(1), ey(wallH)); ctx.lineTo(dimX + toX(1), ey(wallH)); ctx.stroke();

    ctx.save();
    ctx.translate(dimX + toX(2.5), (ey(0) + ey(wallH)) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.round(wallH)} mm`, 0, 0);
    ctx.restore();

    // Floor-to-floor height marker for multi-storey
    if (settings.numStoreys > 1) {
      ctx.strokeStyle = "#999";
      ctx.lineWidth = toX(0.1);
      ctx.setLineDash([toX(0.5), toX(0.5)]);
      for (let i = 1; i < settings.numStoreys; i++) {
        const flY = settings.floorToFloorHeight * i;
        ctx.beginPath();
        ctx.moveTo(ex(-200), ey(flY));
        ctx.lineTo(ex(faceW + 200), ey(flY));
        ctx.stroke();
        ctx.fillStyle = "#999";
        ctx.font = tbFont(2);
        ctx.textAlign = "left";
        ctx.fillText(`F.F.L. +${i}`, ex(faceW + 150), ey(flY) - toY(0.5));
      }
      ctx.setLineDash([]);
    }

    // Scale label for this elevation
    ctx.fillStyle = "#666";
    ctx.font = tbFont(2.2);
    ctx.textAlign = "center";
    ctx.fillText(`Scale ${scaleLabel}`, toX(cellLeft + cellW / 2), toY(cellTop + cellH - 2));
  }

  // ── Scale bar (bottom left of drawing area) ──
  const sbY = tbY - 6;
  const sbX = drawL + 5;
  const barLenMm = 5000; // 5m
  const barLenSheet = barLenMm * scale;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.3);
  ctx.beginPath();
  ctx.moveTo(toX(sbX), toY(sbY));
  ctx.lineTo(toX(sbX + barLenSheet), toY(sbY));
  ctx.stroke();
  // Ticks
  for (let i = 0; i <= 5; i++) {
    const tx = sbX + (barLenSheet / 5) * i;
    ctx.beginPath();
    ctx.moveTo(toX(tx), toY(sbY - 1));
    ctx.lineTo(toX(tx), toY(sbY + 1));
    ctx.stroke();
  }
  // Alternating fills
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

  // ── North arrow (bottom right) ──
  const naX = drawL + drawW - 15;
  const naY = tbY - 8;
  const naSize = 5;
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = toX(0.3);
  // Arrow
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
}

// ─── Component ───────────────────────────────────────────

interface PrintElevationsProps {
  elements: DrawingElement[];
  settings: ElevationSettings;
  onClose: () => void;
}

export function PrintElevations({ elements, settings, onClose }: PrintElevationsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CW = 4961;
  const CH = 3508;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CW;
    canvas.height = CH;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawElevationSheet(ctx, CW, CH, elements, settings);
  }, [elements, settings]);

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
  <title>${settings.projectName || "Elevations"} — Elevation Drawing</title>
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
    link.download = `${settings.projectName || "elevations"}-elevations.png`;
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
      {/* Toolbar */}
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
      {/* Canvas preview */}
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

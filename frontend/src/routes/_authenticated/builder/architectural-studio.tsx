import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  lazy,
  Suspense,
} from "react";
import {
  RobotOutlined,
  UndoOutlined,
  RedoOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  CloseOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import polygonClipping from "polygon-clipping";
import {
  ConfigProvider,
  theme,
  Modal,
  Select,
  InputNumber,
  Checkbox,
  Button,
  Dropdown,
  Tooltip,
  message,
} from "antd";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { aiApi, builderApi } from "@/services/api";
import type { RoofType } from "@/components/three-cad-viewport";
import { PrintElevations } from "@/components/print-elevations";
import { PrintFloorPlan } from "@/components/print-floor-plan";
import PrintSection from "@/components/print-section";

const ThreeCADViewport = lazy(() =>
  import("@/components/three-cad-viewport").then((m) => ({ default: m.ThreeCADViewport }))
);

// ─── Types ─────────────────────────────────────────────────
type Tool =
  | "select"
  | "pan"
  | "eraser"
  | "agent"
  | "wall"
  | "door"
  | "window"
  | "stairs"
  | "furniture"
  | "column"
  | "sliding_door"
  // Internal-only (used by AI agent / existing elements, not shown in toolbar)
  | "line"
  | "polyline"
  | "rect"
  | "circle"
  | "text"
  | "dimension"
  | "offset"
  | "move"
  | "copy"
  | "rotate"
  | "trim"
  | "extend"
  | "mirror"
  | "fillet";
type LayerData = {
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  lineType?: "solid" | "dashed" | "center" | "hidden";
};

type StudioPage = {
  id: string;
  name: string;
  elements: DrawingElement[];
};

type SavedStudioState = {
  pages?: StudioPage[];
  activePageId?: string;
  // Backward compatibility for older single-page saves
  elements?: DrawingElement[];
  layers: LayerData[];
  activeLayer: string;
};

type DrawingElement =
  | {
    id: string;
    type: "line";
    x: number;
    y: number;
    x2: number;
    y2: number;
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "circle";
    x: number;
    y: number;
    radius: number;
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "text";
    x: number;
    y: number;
    text: string;
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "dimension";
    x: number;
    y: number;
    x2: number;
    y2: number;
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "polyline";
    points: { x: number; y: number }[];
    color: string;
    lineWidth: number;
    layer: string;
  }
  | {
    id: string;
    type: "block";
    x: number;
    y: number;
    width: number;
    height: number;
    symbolName: string;
    rotation: number;
    color: string;
    lineWidth: number;
    layer: string;
    flipX?: boolean;
    flipY?: boolean;
  };

// ─── Parametric Plan Types (OO model — walls never split) ─────────────────
/** A wall is always a continuous unbroken centerline. */
type ParametricWall = {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  thickness: "exterior" | "interior";
};

/** A door attaches to a wall by wallId. position 0.0=start‑end, 1.0=end‑end. */
type ParametricDoor = {
  id: string;
  wallId: string;
  position: number;           // 0..1 — center of door along wall
  width: number;
  swing: "left" | "right";
  direction: "up" | "down" | "left" | "right";
  type?: "garage" | "sliding";
};

/** A window attaches to a wall by wallId at centerPosition 0..1. */
type ParametricWindow = {
  id: string;
  wallId: string;
  centerPosition: number;     // 0..1 — center of window along wall
  width: number;
};

/** Site element (veranda, pool, driveway, etc.) */
type SiteElement = {
  type: string;
  [key: string]: unknown;
};

/** Top-level parametric floor plan returned by the new AI prompt. */
type ParametricPlan = {
  walls: ParametricWall[];
  doors: ParametricDoor[];
  windows: ParametricWindow[];
  labels?: { x: number; y: number; text: string }[];
  furniture?: { name: string; x: number; y: number; width?: number; height?: number; rotation?: number }[];
  dimensions?: { x: number; y: number; x2: number; y2: number }[];
  site?: SiteElement[];
  summary?: string;
};

// ─── Symbol Library ────────────────────────────────────────
const SYMBOL_LIBRARY: Record<
  string,
  {
    src: string;
    label: string;
    defaultWidth: number;
    defaultHeight: number;
    anchorX?: number;
    anchorY?: number;
  }
> = {
  door_swing_right: {
    src: "/symbols/door_swing_right.svg",
    label: "Door (Right Swing)",
    defaultWidth: 900,
    defaultHeight: 900,
    anchorX: 1,
    anchorY: 1,
  },
  door_swing_left: {
    src: "/symbols/door_swing_left.svg",
    label: "Door (Left Swing)",
    defaultWidth: 900,
    defaultHeight: 900,
    anchorX: 0,
    anchorY: 1,
  },
  window: {
    src: "/symbols/window.svg",
    label: "Window",
    defaultWidth: 1200,
    defaultHeight: 200,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  toilet: {
    src: "/symbols/toilet.svg",
    label: "Toilet",
    defaultWidth: 400,
    defaultHeight: 500,
    anchorX: 0,
    anchorY: 0,
  },
  basin: {
    src: "/symbols/basin.svg",
    label: "Wash Basin",
    defaultWidth: 400,
    defaultHeight: 400,
    anchorX: 0,
    anchorY: 0,
  },
  bathtub: {
    src: "/symbols/bathtub.svg",
    label: "Bathtub",
    defaultWidth: 700,
    defaultHeight: 1600,
    anchorX: 0,
    anchorY: 0,
  },
  shower: {
    src: "/symbols/shower.svg",
    label: "Shower Tray",
    defaultWidth: 900,
    defaultHeight: 900,
    anchorX: 0,
    anchorY: 0,
  },
  stove: {
    src: "/symbols/stove.svg",
    label: "Stove/Cooktop",
    defaultWidth: 600,
    defaultHeight: 600,
    anchorX: 0,
    anchorY: 0,
  },
  sink: {
    src: "/symbols/sink.svg",
    label: "Kitchen Sink",
    defaultWidth: 600,
    defaultHeight: 450,
    anchorX: 0,
    anchorY: 0,
  },
  bed_single: {
    src: "/symbols/bed_single.svg",
    label: "Single Bed",
    defaultWidth: 1000,
    defaultHeight: 2000,
    anchorX: 0,
    anchorY: 0,
  },
  bed_double: {
    src: "/symbols/bed_double.svg",
    label: "Double Bed",
    defaultWidth: 1400,
    defaultHeight: 2000,
    anchorX: 0,
    anchorY: 0,
  },
  sofa: {
    src: "/symbols/sofa.svg",
    label: "Sofa",
    defaultWidth: 2000,
    defaultHeight: 800,
    anchorX: 0,
    anchorY: 0,
  },
  dining_table: {
    src: "/symbols/dining_table.svg",
    label: "Dining Table",
    defaultWidth: 1600,
    defaultHeight: 900,
    anchorX: 0,
    anchorY: 0,
  },
  kitchen_counter: {
    src: "/symbols/kitchen_counter.svg",
    label: "Kitchen Counter",
    defaultWidth: 2400,
    defaultHeight: 600,
    anchorX: 0,
    anchorY: 0,
  },
  tv_unit: {
    src: "/symbols/tv_unit.svg",
    label: "TV Unit",
    defaultWidth: 1500,
    defaultHeight: 500,
    anchorX: 0,
    anchorY: 0,
  },
  fridge: {
    src: "/symbols/fridge.svg",
    label: "Fridge",
    defaultWidth: 600,
    defaultHeight: 700,
    anchorX: 0,
    anchorY: 0,
  },
  garage: {
    src: "/symbols/garage.svg",
    label: "Garage (Car Space)",
    defaultWidth: 3000,
    defaultHeight: 6000,
    anchorX: 0,
    anchorY: 0,
  },
  // ── New door/opening variants ──
  sliding_door: {
    src: "/symbols/sliding_door.svg",
    label: "Sliding Door",
    defaultWidth: 1800,
    defaultHeight: 200,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  garage_door: {
    src: "/symbols/garage_door.svg",
    label: "Garage Door",
    defaultWidth: 2400,
    defaultHeight: 200,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  // ── Structural ──
  stairs: {
    src: "/symbols/stairs.svg",
    label: "Stairs",
    defaultWidth: 1000,
    defaultHeight: 2400,
    anchorX: 0,
    anchorY: 0,
  },
  column: {
    src: "/symbols/column.svg",
    label: "Column",
    defaultWidth: 300,
    defaultHeight: 300,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  elevator: {
    src: "/symbols/elevator.svg",
    label: "Elevator",
    defaultWidth: 1500,
    defaultHeight: 1500,
    anchorX: 0,
    anchorY: 0,
  },
  escalator: {
    src: "/symbols/escalator.svg",
    label: "Escalator",
    defaultWidth: 1000,
    defaultHeight: 3000,
    anchorX: 0,
    anchorY: 0,
  },
  // ── Site plan ──
  pool: {
    src: "/symbols/pool.svg",
    label: "Swimming Pool",
    defaultWidth: 4000,
    defaultHeight: 8000,
    anchorX: 0,
    anchorY: 0,
  },
  septic_tank: {
    src: "/symbols/septic_tank.svg",
    label: "Septic Tank",
    defaultWidth: 2000,
    defaultHeight: 1200,
    anchorX: 0,
    anchorY: 0,
  },
  parking: {
    src: "/symbols/parking.svg",
    label: "Parking Bay",
    defaultWidth: 2500,
    defaultHeight: 5000,
    anchorX: 0,
    anchorY: 0,
  },
  driveway: {
    src: "/symbols/driveway.svg",
    label: "Driveway",
    defaultWidth: 3000,
    defaultHeight: 6000,
    anchorX: 0,
    anchorY: 0,
  },
  veranda: {
    src: "/symbols/veranda.svg",
    label: "Veranda / Patio",
    defaultWidth: 4000,
    defaultHeight: 3000,
    anchorX: 0,
    anchorY: 0,
  },
  paved_area: {
    src: "/symbols/paved_area.svg",
    label: "Paved Area",
    defaultWidth: 3000,
    defaultHeight: 3000,
    anchorX: 0,
    anchorY: 0,
  },
  // ── Trees & Vegetation ──
  tree_deciduous: {
    src: "/symbols/tree_deciduous.svg",
    label: "Deciduous Tree",
    defaultWidth: 3000,
    defaultHeight: 3000,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  tree_palm: {
    src: "/symbols/tree_palm.svg",
    label: "Palm Tree",
    defaultWidth: 2400,
    defaultHeight: 2400,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  tree_conifer: {
    src: "/symbols/tree_conifer.svg",
    label: "Conifer / Pine",
    defaultWidth: 2000,
    defaultHeight: 2000,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  shrub: {
    src: "/symbols/shrub.svg",
    label: "Shrub",
    defaultWidth: 1500,
    defaultHeight: 1200,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  hedge: {
    src: "/symbols/hedge.svg",
    label: "Hedge Row",
    defaultWidth: 4000,
    defaultHeight: 800,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  flower_bed: {
    src: "/symbols/flower_bed.svg",
    label: "Flower Bed",
    defaultWidth: 2000,
    defaultHeight: 2000,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  garden_bed: {
    src: "/symbols/garden_bed.svg",
    label: "Garden Bed",
    defaultWidth: 3000,
    defaultHeight: 3000,
    anchorX: 0,
    anchorY: 0,
  },
  lawn: {
    src: "/symbols/lawn.svg",
    label: "Lawn Area",
    defaultWidth: 5000,
    defaultHeight: 5000,
    anchorX: 0,
    anchorY: 0,
  },
  // ── Property & Boundaries ──
  boundary_fence: {
    src: "/symbols/boundary_fence.svg",
    label: "Boundary Fence",
    defaultWidth: 6000,
    defaultHeight: 400,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  boundary_wall: {
    src: "/symbols/boundary_wall.svg",
    label: "Boundary Wall",
    defaultWidth: 6000,
    defaultHeight: 500,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  gate: {
    src: "/symbols/gate.svg",
    label: "Gate",
    defaultWidth: 3000,
    defaultHeight: 1500,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  // ── Utilities & Services ──
  water_tank: {
    src: "/symbols/water_tank.svg",
    label: "Water Tank",
    defaultWidth: 2000,
    defaultHeight: 2000,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  borehole: {
    src: "/symbols/borehole.svg",
    label: "Borehole",
    defaultWidth: 1500,
    defaultHeight: 1500,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  // ── Outdoor Features ──
  fire_pit: {
    src: "/symbols/fire_pit.svg",
    label: "Fire Pit",
    defaultWidth: 1800,
    defaultHeight: 1800,
    anchorX: 0.5,
    anchorY: 0.5,
  },
  clothesline: {
    src: "/symbols/clothesline.svg",
    label: "Clothesline",
    defaultWidth: 2400,
    defaultHeight: 2400,
    anchorX: 0.5,
    anchorY: 0.5,
  },
};

// Image cache for symbols
const symbolImageCache: Record<string, HTMLImageElement> = {};
function getSymbolImage(name: string): HTMLImageElement | null {
  if (symbolImageCache[name]) return symbolImageCache[name];
  const def = SYMBOL_LIBRARY[name];
  if (!def) return null;
  const img = new Image();
  img.src = def.src;
  symbolImageCache[name] = img;
  return img;
}
// Preload all symbols
Object.keys(SYMBOL_LIBRARY).forEach((k) => getSymbolImage(k));
// Expose cache globally for print components
(window as any).__archStudioSymbolLibrary = SYMBOL_LIBRARY;
(window as any).__archStudioSymbolCache = symbolImageCache;

const DEFAULT_LAYERS: LayerData[] = [
  { name: "Layer 0", visible: true, locked: false, color: "#e8eaf0", lineType: "solid" },
  { name: "Walls", visible: true, locked: false, color: "#00bcd4", lineType: "solid" },
  { name: "Rooms", visible: true, locked: false, color: "#26a69a", lineType: "solid" },
  { name: "Doors", visible: true, locked: false, color: "#4caf50", lineType: "solid" },
  { name: "Windows", visible: true, locked: false, color: "#ffeb3b", lineType: "solid" },
  { name: "Furniture", visible: true, locked: false, color: "#ab47bc", lineType: "solid" },
  { name: "Structure", visible: true, locked: false, color: "#ff7043", lineType: "solid" },
  { name: "Site", visible: true, locked: false, color: "#8d6e63", lineType: "dashed" },
  { name: "Annotations", visible: true, locked: false, color: "#e91e63", lineType: "solid" },
];

const LAYER_LINE_TYPES: Array<"solid" | "dashed" | "center" | "hidden"> = [
  "solid",
  "dashed",
  "center",
  "hidden",
];

function getLineDashForLayerLineType(
  lineType: "solid" | "dashed" | "center" | "hidden" | undefined,
  lineWidth: number,
): number[] {
  switch (lineType ?? "solid") {
    case "dashed":
      return [12 + lineWidth * 0.4, 6 + lineWidth * 0.2];
    case "center":
      return [18 + lineWidth * 0.5, 6 + lineWidth * 0.2, 4 + lineWidth * 0.15, 6 + lineWidth * 0.2];
    case "hidden":
      return [6 + lineWidth * 0.25, 6 + lineWidth * 0.25];
    case "solid":
    default:
      return [];
  }
}

export const Route = createFileRoute(
  "/_authenticated/builder/architectural-studio",
)({
  component: ArchitecturalStudioCanvas,
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: (search.projectId as string) || undefined,
  }),
});

const COLORS = {
  bg: "#141414",
  grid: "#1e2430",
  gridMajor: "#252d3a",
  white: "#e8eaf0",
  cyan: "#00bcd4",
  green: "#4caf50",
  yellow: "#ffeb3b",
  red: "#f44336",
  magenta: "#e91e63",
  accent: "#5c6bc0",
  toolbar: "#1a1d27",
  toolbarBorder: "#2a2d3e",
  muted: "#6e7a94",
  highlight: "#3d4260",
};

export type UnitSystem = "mm" | "cm" | "m" | "in" | "ft";
export type BuildingType = "residential" | "commercial" | "industrial" | "institutional" | "mixed-use";
export type WallMaterial = "brick" | "concrete-block" | "timber-frame" | "steel-frame" | "stone" | "precast";
export type RoofMaterial = "concrete-tile" | "clay-tile" | "metal-sheet" | "slate" | "thatch" | "membrane";
export type FoundationType = "strip" | "stepped" | "pad" | "raft";

export interface DrawingSettings {
  // Drawing
  unit: UnitSystem;
  precision: number;
  gridSize: number;
  majorGrid: number;
  annoScale: number;
  mergeWalls: boolean;
  hatchRooms: boolean;
  roomLabels: boolean;
  // Building info
  projectName: string;
  buildingType: BuildingType;
  numStoreys: number;
  // Structural dimensions (mm)
  floorToFloorHeight: number;
  ceilingHeight: number;
  slabThickness: number;
  foundationDepth: number;
  foundationType: FoundationType;
  // Materials
  wallMaterial: WallMaterial;
  roofMaterial: RoofMaterial;
  // Site
  plotWidth: number;
  plotDepth: number;
  setbackFront: number;
  setbackRear: number;
  setbackLeft: number;
  setbackRight: number;
  // Architectural tool defaults
  wallThickness: number;
  doorWidth: number;
  doorHeight: number;
  windowWidth: number;
  windowHeight: number;
  windowSillHeight: number;
  stairWidth: number;
  stairDepth: number;
}

export const DEFAULT_SETTINGS: DrawingSettings = {
  // Drawing
  unit: "mm",
  precision: 1,
  gridSize: 20,
  majorGrid: 5,
  annoScale: 100,
  mergeWalls: true,
  hatchRooms: true,
  roomLabels: true,
  // Building info
  projectName: "",
  buildingType: "residential",
  numStoreys: 1,
  // Structural dimensions (mm)
  floorToFloorHeight: 3000,
  ceilingHeight: 2700,
  slabThickness: 170,
  foundationDepth: 600,
  foundationType: "strip",
  // Materials
  wallMaterial: "brick",
  roofMaterial: "concrete-tile",
  // Site
  plotWidth: 20000,
  plotDepth: 30000,
  setbackFront: 3000,
  setbackRear: 3000,
  setbackLeft: 1500,
  setbackRight: 1500,
  // Architectural tool defaults
  wallThickness: 200,
  doorWidth: 900,
  doorHeight: 2100,
  windowWidth: 1200,
  windowHeight: 1200,
  windowSillHeight: 900,
  stairWidth: 900,
  stairDepth: 1800,
};

function formatDMS(decimalDeg: number): string {
  const d = Math.floor(decimalDeg);
  const mFloat = (decimalDeg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}°${m}'${s}"`;
}

function formatUnit(val: number, s: DrawingSettings): string {
  let v = val;
  if (s.unit === "cm") v = val / 10;
  else if (s.unit === "m") v = val / 1000;
  else if (s.unit === "in") v = val / 25.4;
  else if (s.unit === "ft") v = val / 304.8;
  return `${v.toFixed(s.precision)} ${s.unit}`;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  pan: { x: number; y: number },
  zoom: number,
  w: number,
  h: number,
  s: DrawingSettings,
) {
  const step = s.gridSize * zoom;
  const offsetX = ((pan.x % step) + step) % step;
  const offsetY = ((pan.y % step) + step) % step;

  ctx.lineWidth = 0.5;
  for (let x = offsetX; x < w; x += step) {
    const gx = Math.round((x - pan.x) / step);
    ctx.strokeStyle = gx % s.majorGrid === 0 ? COLORS.gridMajor : COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = offsetY; y < h; y += step) {
    const gy = Math.round((y - pan.y) / step);
    ctx.strokeStyle = gy % s.majorGrid === 0 ? COLORS.gridMajor : COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    // Origin crosshair
    ctx.strokeStyle = COLORS.cyan + "44";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pan.x, 0);
    ctx.lineTo(pan.x, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pan.y);
    ctx.lineTo(w, pan.y);
    ctx.stroke();
  }

}

function drawWindowSymbol2D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
) {
  const span = Math.max(Math.abs(width), Math.abs(height));
  const depth = Math.max(6, Math.min(Math.min(Math.abs(width), Math.abs(height)), span * 0.22));
  const halfW = width / 2;
  const halfH = height / 2;
  const isHorizontal = Math.abs(width) >= Math.abs(height);
  const lineA = -depth * 0.28;
  const lineB = depth * 0.28;

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

    ctx.lineWidth = Math.max(1, depth * 0.08);
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

    ctx.lineWidth = Math.max(1, depth * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -halfH * 0.7);
    ctx.lineTo(0, halfH * 0.7);
    ctx.stroke();
  }
}

function drawDoorSwingSymbol2D(
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
  ctx.setLineDash([Math.max(4, wallDepth * 0.3), Math.max(3, wallDepth * 0.22)]);
  ctx.beginPath();
  if (swing === "left") {
    ctx.arc(0, 0, opening, 0, -Math.PI / 2, true);
  } else {
    ctx.arc(0, 0, opening, Math.PI, -Math.PI / 2, false);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

type BlockInfo = { x: number; y: number; width: number; height: number; rot: number; sym: string };

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: DrawingElement,
  pan: { x: number; y: number },
  zoom: number,
  selected: boolean,
  s: DrawingSettings,
  layerLineType?: "solid" | "dashed" | "center" | "hidden",
  allBlocks?: BlockInfo[]
) {
  ctx.save();
  ctx.strokeStyle = selected ? COLORS.yellow : el.color;
  ctx.fillStyle = selected ? COLORS.yellow + "22" : "transparent";
  ctx.lineWidth = Math.max(1, el.lineWidth * zoom);
  ctx.setLineDash(getLineDashForLayerLineType(layerLineType, el.lineWidth));
  if ((el.type === "line" || el.type === "polyline") && el.layer === "Walls") {
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.miterLimit = 8;
  }


  const drawRoomHatch = (x: number, y: number, w: number, h: number) => {
    if (!s.hatchRooms) return;
    const rx = x * zoom + pan.x;
    const ry = y * zoom + pan.y;
    const rw = w * zoom;
    const rh = h * zoom;
    if (Math.abs(rw) < 6 || Math.abs(rh) < 6) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.clip();
    const spacing = Math.max(10, Math.min(26, Math.abs((el.lineWidth || 1) * 3 + 12)));
    ctx.strokeStyle = `${el.color}44`;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const left = Math.min(rx, rx + rw);
    const right = Math.max(rx, rx + rw);
    const top = Math.min(ry, ry + rh);
    const bottom = Math.max(ry, ry + rh);
    for (let x0 = left - (bottom - top); x0 < right + (bottom - top); x0 += spacing) {
      ctx.beginPath();
      ctx.moveTo(x0, bottom);
      ctx.lineTo(x0 + (bottom - top), top);
      ctx.stroke();
    }
    ctx.restore();
  };

  if (el.type === "line") {
    // ── Check if we need to split line for walls overlapping doors/windows
    let splitSpans: [number, number][] = [];
    if (allBlocks && (/wall|Layer 0|0/.test(el.layer))) {
      const len = Math.hypot(el.x2 - el.x, el.y2 - el.y);
      const lx = el.x, ly = el.y;

      for (const b of allBlocks) {
        if (!/door|window/i.test(b.sym)) continue;

        const symDef = SYMBOL_LIBRARY[b.sym];
        if (!symDef) continue;
        const ax = symDef.anchorX ?? 0.5;
        // flip multiplier — wait, drawElement uses `allBlocks` which currently only holds `rot`, `sym`, `x`, `y`, `width`.
        // Let's assume standard door mapping for legacy since `flipX` isn't pushed to `allBlocks`.
        const localX1 = -b.width * ax;
        const localX2 = b.width * (1 - ax);
        const rotRad = ((b.rot || 0) * Math.PI) / 180;

        const p1x = b.x + localX1 * Math.cos(rotRad);
        const p1y = b.y + localX1 * Math.sin(rotRad);
        const p2x = b.x + localX2 * Math.cos(rotRad);
        const p2y = b.y + localX2 * Math.sin(rotRad);

        const t1 = ((p1x - lx) * (el.x2! - lx) + (p1y - ly) * (el.y2! - ly)) / (len * len);
        const t2 = ((p2x - lx) * (el.x2! - lx) + (p2y - ly) * (el.y2! - ly)) / (len * len);

        const centerT = ((b.x - lx) * (el.x2! - lx) + (b.y - ly) * (el.y2! - ly)) / (len * len);
        const px = lx + centerT * (el.x2! - lx);
        const py = ly + centerT * (el.y2! - ly);
        const dist = Math.hypot(b.x - px, b.y - py);

        if (dist < 300) {
          splitSpans.push([Math.max(0, Math.min(t1, t2)), Math.min(1, Math.max(t1, t2))]);
        }
      }
    }

    const sx = el.x * zoom + pan.x;
    const sy = el.y * zoom + pan.y;
    const ex = el.x2 * zoom + pan.x;
    const ey = el.y2 * zoom + pan.y;

    if (splitSpans.length > 0) {
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

      let t_curr = 0;
      for (const sp of merged) {
        if (sp[0] > t_curr) {
          ctx.beginPath();
          ctx.moveTo(sx + (ex - sx) * t_curr, sy + (ey - sy) * t_curr);
          ctx.lineTo(sx + (ex - sx) * sp[0], sy + (ey - sy) * sp[0]);
          ctx.stroke();
        }
        t_curr = Math.max(t_curr, sp[1]);
      }
      if (t_curr < 1) {
        ctx.beginPath();
        ctx.moveTo(sx + (ex - sx) * t_curr, sy + (ey - sy) * t_curr);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    if (selected) {
      ctx.fillStyle = COLORS.yellow;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (el.type === "dimension") {
    const sx = el.x * zoom + pan.x;
    const sy = el.y * zoom + pan.y;
    const ex = el.x2 * zoom + pan.x;
    const ey = el.y2 * zoom + pan.y;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // Tick marks
    const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
    const tickLen = 6;
    ctx.beginPath();
    ctx.moveTo(
      sx - tickLen * Math.cos(angle + Math.PI / 4),
      sy - tickLen * Math.sin(angle + Math.PI / 4),
    );
    ctx.lineTo(
      sx + tickLen * Math.cos(angle + Math.PI / 4),
      sy + tickLen * Math.sin(angle + Math.PI / 4),
    );
    ctx.moveTo(
      ex - tickLen * Math.cos(angle + Math.PI / 4),
      ey - tickLen * Math.sin(angle + Math.PI / 4),
    );
    ctx.lineTo(
      ex + tickLen * Math.cos(angle + Math.PI / 4),
      ey + tickLen * Math.sin(angle + Math.PI / 4),
    );
    ctx.stroke();
    // Text
    const dist = Math.hypot(el.x2 - el.x, el.y2 - el.y);
    // Base font size is 100mm for dimensions
    const scaledFontSize = 100 * (s.annoScale / 100) * zoom;
    ctx.font = `${scaledFontSize}px 'Roboto Mono', monospace`;
    ctx.fillStyle = el.color;
    ctx.textAlign = "center";
    // Offset text slightly above the line
    const textOffset = 40 * (s.annoScale / 100) * zoom;
    const nx = Math.cos(angle - Math.PI / 2);
    const ny = Math.sin(angle - Math.PI / 2);
    ctx.translate(
      (sx + ex) / 2 + nx * textOffset,
      (sy + ey) / 2 + ny * textOffset,
    );
    // Rotate text to match line, keep it upright
    let textRot = angle;
    if (textRot > Math.PI / 2 || textRot < -Math.PI / 2) {
      textRot += Math.PI;
    }
    ctx.rotate(textRot);
    ctx.fillText(formatUnit(dist, s), 0, 0);
    ctx.resetTransform();
  } else if (el.type === "rect") {
    if (!selected) {
      drawRoomHatch(el.x, el.y, el.width, el.height);
    }

    // ── Check if rect has overlapping doors/windows
    let splitSpansBottom: [number, number][] = [];
    let splitSpansTop: [number, number][] = [];
    let splitSpansLeft: [number, number][] = [];
    let splitSpansRight: [number, number][] = [];

    if (allBlocks && (/wall|0/.test(el.layer))) {
      const rx1 = el.x, ry1 = el.y;
      const rx2 = el.x + el.width, ry2 = el.y + el.height;
      const rMinX = Math.min(rx1, rx2);
      const rMaxX = Math.max(rx1, rx2);
      const rMinY = Math.min(ry1, ry2);
      const rMaxY = Math.max(ry1, ry2);
      const width = Math.abs(el.width);
      const height = Math.abs(el.height);
      const dTol = 300;

      for (const b of allBlocks) {
        if (!/door|window/i.test(b.sym)) continue;
        const hw = b.width / 2;

        // bottom edge (y=rMaxY)
        if (Math.abs(b.y - rMaxY) < dTol && b.x >= rMinX - hw && b.x <= rMaxX + hw) {
          let t1 = (b.x - hw - rMinX) / width;
          let t2 = (b.x + hw - rMinX) / width;
          splitSpansBottom.push([Math.max(0, t1), Math.min(1, t2)]);
        }
        // top edge (y=rMinY)
        if (Math.abs(b.y - rMinY) < dTol && b.x >= rMinX - hw && b.x <= rMaxX + hw) {
          let t1 = (b.x - hw - rMinX) / width;
          let t2 = (b.x + hw - rMinX) / width;
          splitSpansTop.push([Math.max(0, t1), Math.min(1, t2)]);
        }
        // left edge (x=rMinX)
        if (Math.abs(b.x - rMinX) < dTol && b.y >= rMinY - hw && b.y <= rMaxY + hw) {
          let t1 = (b.y - hw - rMinY) / height;
          let t2 = (b.y + hw - rMinY) / height;
          splitSpansLeft.push([Math.max(0, t1), Math.min(1, t2)]);
        }
        // right edge (x=rMaxX)
        if (Math.abs(b.x - rMaxX) < dTol && b.y >= rMinY - hw && b.y <= rMaxY + hw) {
          let t1 = (b.y - hw - rMinY) / height;
          let t2 = (b.y + hw - rMinY) / height;
          splitSpansRight.push([Math.max(0, t1), Math.min(1, t2)]);
        }
      }
    }

    const drawLineWithHoles = (x1: number, y1: number, x2: number, y2: number, spans: [number, number][]) => {
      spans.sort((a, b) => a[0] - b[0]);
      let merged: [number, number][] = [];
      for (const sp of spans) {
        if (!merged.length) merged.push(sp);
        else {
          const last = merged[merged.length - 1];
          if (sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
          else merged.push(sp);
        }
      }

      let t_curr = 0;
      for (const sp of merged) {
        if (sp[0] > t_curr) {
          ctx.beginPath();
          ctx.moveTo(x1 + (x2 - x1) * t_curr, y1 + (y2 - y1) * t_curr);
          ctx.lineTo(x1 + (x2 - x1) * sp[0], y1 + (y2 - y1) * sp[0]);
          ctx.stroke();
        }
        t_curr = Math.max(t_curr, sp[1]);
      }
      if (t_curr < 1) {
        ctx.beginPath();
        ctx.moveTo(x1 + (x2 - x1) * t_curr, y1 + (y2 - y1) * t_curr);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const ex = el.x * zoom + pan.x;
    const ey = el.y * zoom + pan.y;
    const ew = el.width * zoom;
    const eh = el.height * zoom;
    const hx1 = Math.min(ex, ex + ew);
    const hx2 = Math.max(ex, ex + ew);
    const hy1 = Math.min(ey, ey + eh);
    const hy2 = Math.max(ey, ey + eh);

    if (splitSpansTop.length || splitSpansBottom.length || splitSpansLeft.length || splitSpansRight.length) {
      drawLineWithHoles(hx1, hy1, hx2, hy1, splitSpansTop);
      drawLineWithHoles(hx1, hy2, hx2, hy2, splitSpansBottom);
      drawLineWithHoles(hx1, hy1, hx1, hy2, splitSpansLeft);
      drawLineWithHoles(hx2, hy1, hx2, hy2, splitSpansRight);
      if (selected) ctx.fillRect(hx1, hy1, Math.abs(ew), Math.abs(eh));
    } else {
      ctx.beginPath();
      ctx.rect(ex, ey, ew, eh);
      ctx.stroke();
      if (selected) ctx.fill();
    }
  } else if (el.type === "circle") {
    const cx = el.x * zoom + pan.x;
    const cy = el.y * zoom + pan.y;
    const r = (el.radius ?? 0) * zoom;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    if (selected) ctx.fill();
  } else if (el.type === "text") {
    const tx = el.x * zoom + pan.x;
    const ty = el.y * zoom + pan.y;
    ctx.fillStyle = selected ? COLORS.yellow : el.color;
    // Base font size is 150mm for general text
    const scaledFontSize = 150 * (s.annoScale / 100) * zoom;
    ctx.font = `${scaledFontSize}px 'Roboto Mono', monospace`;
    ctx.fillText(el.text ?? "", tx, ty);
  } else if (el.type === "polyline") {
    ctx.beginPath();
    for (let i = 0; i < el.points.length; i++) {
      const px = el.points[i].x * zoom + pan.x;
      const py = el.points[i].y * zoom + pan.y;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (selected) {
      ctx.fillStyle = COLORS.yellow;
      for (const pt of el.points) {
        ctx.beginPath();
        ctx.arc(pt.x * zoom + pan.x, pt.y * zoom + pan.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (el.type === "block") {
    const img = getSymbolImage(el.symbolName);
    const bx = el.x * zoom + pan.x;
    const by = el.y * zoom + pan.y;
    const bw = el.width * zoom;
    const bh = el.height * zoom;
    const rot = ((el.rotation || 0) * Math.PI) / 180;
    const symDef = SYMBOL_LIBRARY[el.symbolName];
    const anchorX = symDef?.anchorX ?? 0.5;
    const anchorY = symDef?.anchorY ?? 0.5;
    const drawX = -bw * anchorX;
    const drawY = -bh * anchorY;
    const flipX = el.flipX ? -1 : 1;
    const flipY = el.flipY ? -1 : 1;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);
    ctx.scale(flipX, flipY);
    if (/door_swing_left/i.test(el.symbolName) || /door_swing_right/i.test(el.symbolName)) {
      const wallDepth = Math.max(8, Math.min(Math.abs(bh), s.wallThickness * zoom));
      drawDoorSwingSymbol2D(
        ctx,
        bw,
        wallDepth,
        selected ? COLORS.yellow : el.color,
        /left/i.test(el.symbolName) ? "left" : "right",
      );
    } else if (/window/i.test(el.symbolName)) {
      drawWindowSymbol2D(ctx, bw, bh, selected ? COLORS.yellow : el.color);
    } else if (img && img.complete && img.naturalWidth > 0) {
      if (el.color === "#ffffff") {
        // Fast path for white color (commonly used in dark mode)
        ctx.filter = "invert(1)";
        ctx.drawImage(img, drawX, drawY, bw, bh);
        ctx.filter = "none";
      } else {
        // Dynamic tinting for other colors (Cyan, Green, etc. according to Layer)
        const tw = Math.max(1, Math.round(bw));
        const th = Math.max(1, Math.round(bh));
        const tintCnv = document.createElement("canvas");
        tintCnv.width = tw;
        tintCnv.height = th;
        const tCtx = tintCnv.getContext("2d");
        if (tCtx) {
          tCtx.drawImage(img, 0, 0, tw, th);
          tCtx.globalCompositeOperation = "source-in";
          tCtx.fillStyle = el.color;
          tCtx.fillRect(0, 0, tw, th);
          ctx.drawImage(tintCnv, drawX, drawY, bw, bh);
        } else {
          ctx.drawImage(img, drawX, drawY, bw, bh);
        }
      }
    } else {
      // Fallback: draw a placeholder rect with name
      ctx.strokeStyle = el.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(drawX, drawY, bw, bh);
      ctx.setLineDash([]);
      ctx.fillStyle = el.color;
      ctx.font = `${Math.min(bw, bh) * 0.2}px 'Roboto Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.symbolName, 0, 0);
      // Retry load
      if (img) img.onload = () => { }; // trigger re-render on next redraw
    }
    if (selected) {
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(drawX, drawY, bw, bh);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  ctx.restore();
}

function thickenLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  extendStart = false,
  extendEnd = false,
) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  const nx = -dy / len,
    ny = dx / len;
  const h = width / 2;
  const sx = x1 - (extendStart ? ux * h : 0);
  const sy = y1 - (extendStart ? uy * h : 0);
  const ex = x2 + (extendEnd ? ux * h : 0);
  const ey = y2 + (extendEnd ? uy * h : 0);
  return [
    [
      [sx + nx * h, sy + ny * h],
      [sx - nx * h, sy - ny * h],
      [ex - nx * h, ey - ny * h],
      [ex + nx * h, ey + ny * h],
      [sx + nx * h, sy + ny * h],
    ],
  ];
}

type HistoryState<T> = { past: T[]; present: T; future: T[] };
type HistoryAction<T> =
  | { type: "SET"; payload: T | ((prev: T) => T) }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; payload: T }
  | { type: "RESTORE"; payload: HistoryState<T> };

function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
): HistoryState<T> {
  switch (action.type) {
    case "UNDO":
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    case "REDO":
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };
    case "SET":
      const newPresent =
        typeof action.payload === "function"
          ? (action.payload as any)(state.present)
          : action.payload;
      if (newPresent === state.present) return state;
      return {
        past: [...state.past, state.present],
        present: newPresent,
        future: [],
      };
    case "RESET":
      return {
        past: [],
        present: action.payload,
        future: [],
      };
    case "RESTORE":
      return action.payload;
    default:
      return state;
  }
}

const STORAGE_KEY = "arch-studio-drawing";

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function useHistory<T>(initialState: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialState,
    future: [],
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const setState = useCallback(
    (payload: T | ((prev: T) => T)) => dispatch({ type: "SET", payload }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const resetState = useCallback(
    (payload: T) => dispatch({ type: "RESET", payload }),
    [],
  );
  const getSnapshot = useCallback((): HistoryState<T> => stateRef.current, []);
  const restoreSnapshot = useCallback(
    (snapshot: HistoryState<T>) => dispatch({ type: "RESTORE", payload: snapshot }),
    [],
  );
  return {
    state: state.present,
    setState,
    resetState,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    getSnapshot,
    restoreSnapshot,
  };
}

// AutoCAD-style command definitions
type CommandDef = {
  alias: string;
  name: string;
  description: string;
  action: Tool | "undo" | "redo" | "clear" | "ortho";
};

const COMMANDS: CommandDef[] = [
  { alias: "W", name: "WALL", description: "Draw wall segments", action: "wall" },
  { alias: "D", name: "DOOR", description: "Place a door on a wall", action: "door" },
  { alias: "WIN", name: "WINDOW", description: "Place a window on a wall", action: "window" },
  { alias: "R", name: "RECT", description: "Draw a rectangle", action: "rect" },
  { alias: "ST", name: "STAIRS", description: "Place a staircase", action: "stairs" },
  { alias: "FUR", name: "FURNITURE", description: "Open furniture palette to place items", action: "furniture" },
  { alias: "S", name: "SELECT", description: "Select and inspect elements", action: "select" },
  { alias: "P", name: "PAN", description: "Pan the viewport", action: "pan" },
  { alias: "E", name: "ERASE", description: "Delete an element", action: "eraser" },
  { alias: "U", name: "UNDO", description: "Undo last action", action: "undo" },
  { alias: "REDO", name: "REDO", description: "Redo last undone action", action: "redo" },
  { alias: "AI", name: "AGENT", description: "AI draws from your description", action: "agent" },
  { alias: "CLS", name: "CLEAR", description: "Clear command history", action: "clear" },
  { alias: "ORTHO", name: "ORTHO", description: "Toggle Ortho mode (F8)", action: "ortho" },
];

// Build a lookup map from all aliases and names
const COMMAND_MAP: Record<string, Tool | "undo" | "redo" | "clear" | "ortho"> = {};
for (const cmd of COMMANDS) {
  COMMAND_MAP[cmd.alias.toLowerCase()] = cmd.action;
  COMMAND_MAP[cmd.name.toLowerCase()] = cmd.action;
}

function getCommandSuggestions(input: string): CommandDef[] {
  if (!input) return [];
  const lower = input.toLowerCase();
  return COMMANDS.filter(
    (cmd) =>
      cmd.alias.toLowerCase().startsWith(lower) ||
      cmd.name.toLowerCase().startsWith(lower),
  );
}

export default function ArchitecturalStudioCanvas() {
  const { projectId } = Route.useSearch();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const cmdHistoryRef = useRef<HTMLDivElement>(null);
  const zoomIn3DRef = useRef<(() => void) | null>(null);
  const zoomOut3DRef = useRef<(() => void) | null>(null);
  const resetView3DRef = useRef<(() => void) | null>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [aiMode, setAiMode] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [roofType, setRoofType] = useState<RoofType>("flat");
  const [showPrintElevations, setShowPrintElevations] = useState(false);
  const [showPrintFloorPlan, setShowPrintFloorPlan] = useState(false);
  const [showPrintSection, setShowPrintSection] = useState(false);
  const [floorPlanPrintSnapshot, setFloorPlanPrintSnapshot] = useState<string | null>(null);
  const [color] = useState(COLORS.white);
  const lineWidth = 1;

  const createPrintableFloorPlanSnapshot = useCallback(() => {
    const source = canvasRef.current;
    if (!source) return null;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = source.width;
    exportCanvas.height = source.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return source.toDataURL("image/png");

    exportCtx.drawImage(source, 0, 0);
    const image = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
    const data = image.data;

    const hexToRgb = (hex: string) => {
      const clean = hex.replace("#", "");
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
      };
    };

    const bg = hexToRgb(COLORS.bg);
    const grid = hexToRgb(COLORS.grid);
    const gridMajor = hexToRgb(COLORS.gridMajor);
    const whiteInk = hexToRgb(COLORS.white);

    const isNear = (r: number, g: number, b: number, target: { r: number; g: number; b: number }, tol: number) => (
      Math.abs(r - target.r) <= tol &&
      Math.abs(g - target.g) <= tol &&
      Math.abs(b - target.b) <= tol
    );

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;

      if (isNear(r, g, b, bg, 10)) {
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
      } else if (isNear(r, g, b, grid, 12)) {
        data[i] = 236; data[i + 1] = 240; data[i + 2] = 244;
      } else if (isNear(r, g, b, gridMajor, 12)) {
        data[i] = 220; data[i + 1] = 226; data[i + 2] = 232;
      } else if (isNear(r, g, b, whiteInk, 18)) {
        data[i] = 34; data[i + 1] = 34; data[i + 2] = 34;
      }
    }

    exportCtx.putImageData(image, 0, 0);
    return exportCanvas.toDataURL("image/png");
  }, []);

  // ── Project-specific state ──
  const [projectName, setProjectName] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(!!projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showOpenProject, setShowOpenProject] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  const projectIdNum = projectId ? Number(projectId) : null;
  const storageKey = projectId ? `arch-studio-drawing-${projectId}` : STORAGE_KEY;

  // Load all projects for Open Project dialog
  useEffect(() => {
    if (showOpenProject && allProjects.length === 0) {
      builderApi.getProjects()
        .then((res: any) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
          setAllProjects(data);
        })
        .catch(() => message.error("Failed to load projects"));
    }
  }, [showOpenProject, allProjects.length]);

  const DEFAULT_STATE: SavedStudioState = {
    pages: [{ id: "page-1", name: "Page 1", elements: [] }],
    activePageId: "page-1",
    layers: DEFAULT_LAYERS,
    activeLayer: "Layer 0",
  };

  const saved = useRef(
    loadSaved<SavedStudioState>(storageKey, DEFAULT_STATE),
  );

  const initialPages = useMemo<StudioPage[]>(() => {
    const persistedPages = saved.current.pages?.filter(
      (p): p is StudioPage =>
        !!p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        Array.isArray(p.elements),
    );

    if (persistedPages && persistedPages.length > 0) {
      return persistedPages;
    }

    return [
      {
        id: "page-1",
        name: "Page 1",
        elements: saved.current.elements ?? [],
      },
    ];
  }, []);

  const initialActivePageId = useMemo(() => {
    const persistedActiveId = saved.current.activePageId;
    if (persistedActiveId && initialPages.some((p) => p.id === persistedActiveId)) {
      return persistedActiveId;
    }
    return initialPages[0]?.id ?? "page-1";
  }, [initialPages]);

  const [pages, setPages] = useState<StudioPage[]>(initialPages);
  const [activePageId, setActivePageId] = useState(initialActivePageId);
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [pages, activePageId],
  );

  const {
    state: elements,
    setState: setElements,
    resetState: resetElements,
    undo,
    redo,
    canUndo,
    canRedo,
    getSnapshot,
    restoreSnapshot,
  } = useHistory<DrawingElement[]>(activePage?.elements ?? []);
  const pageHistoryMap = useRef<Map<string, HistoryState<DrawingElement[]>>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<DrawingElement[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [previewEl, setPreviewEl] = useState<DrawingElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [snapPoint, setSnapPoint] = useState<{
    x: number;
    y: number;
    type: "endpoint" | "midpoint" | "center" | "intersection" | "perpendicular" | "nearest" | "quadrant";
  } | null>(null);
  const [orthoMode, setOrthoMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState(saved.current.activeLayer);
  const [layers, setLayers] = useState<LayerData[]>(saved.current.layers);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([
    "Welcome to Architectural Studio. Type a command or press a key shortcut.",
  ]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const panOrigin = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [offsetDist, setOffsetDist] = useState<number | null>(null);
  const [offsetSourceId, setOffsetSourceId] = useState<string | null>(null);
  // Move/Copy base point
  const [moveBasePoint, setMoveBasePoint] = useState<{ x: number; y: number } | null>(null);
  // Rotate base point + angle
  const [rotateBasePoint, setRotateBasePoint] = useState<{ x: number; y: number } | null>(null);
  const [rotateRefAngle, setRotateRefAngle] = useState<number | null>(null);
  // Mirror line
  const [mirrorP1, setMirrorP1] = useState<{ x: number; y: number } | null>(null);
  // Fillet radius
  const [filletRadius, setFilletRadius] = useState<number>(0);
  const [filletFirstLineId, setFilletFirstLineId] = useState<string | null>(null);
  // Architectural tool state
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
  const [doorSwing, setDoorSwing] = useState<"right" | "left">("right");
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [elementsSidebarOpen, setElementsSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Doors & Windows"]));
  const dragMoveStart = useRef<{ wx: number; wy: number } | null>(null);
  const isDragging = useRef(false);

  // ── Refs that always hold the latest state (for save-on-exit) ──
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const activePageIdRef = useRef(activePageId);
  activePageIdRef.current = activePageId;
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const activeLayerRef = useRef(activeLayer);
  activeLayerRef.current = activeLayer;
  const getSnapshotRef = useRef(getSnapshot);
  getSnapshotRef.current = getSnapshot;

  // Build the payload object from refs (always up-to-date).
  const buildPayload = useCallback(() => {
    const snapshot = getSnapshotRef.current();
    const latestPages = pagesRef.current.map((p) =>
      p.id === activePageIdRef.current
        ? { ...p, elements: snapshot.present }
        : p,
    );
    return {
      pages: latestPages,
      activePageId: activePageIdRef.current,
      layers: layersRef.current,
      activeLayer: activeLayerRef.current,
    };
  }, []);

  // Save to API
  const saveToApi = useCallback(async (manual = false) => {
    if (!projectIdNum) return;
    try {
      if (manual) setIsSaving(true);
      const payload = buildPayload();
      await builderApi.saveProjectDrawing(projectIdNum, payload);
      setLastSavedAt(new Date());
      if (manual) message.success("Drawing saved to project.");
    } catch {
      if (manual) message.error("Failed to save drawing.");
    } finally {
      if (manual) setIsSaving(false);
    }
  }, [projectIdNum, buildPayload]);

  // Synchronously flush to localStorage only (safe for beforeunload).
  const persistToStorage = useCallback(() => {
    try {
      const payload = buildPayload();
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      /* storage full – nothing we can do */
    }
  }, [storageKey, buildPayload]);

  // Save on tab close / refresh, page visibility change, and component unmount.
  // beforeunload: localStorage only (sync, reliable, no auth side-effects).
  // visibilitychange + unmount: localStorage + API.
  useEffect(() => {
    const onBeforeUnload = () => persistToStorage();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistToStorage();
        saveToApi();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      // Component unmount – final save
      persistToStorage();
      saveToApi();
    };
  }, [persistToStorage, saveToApi]);

  // ── Load project info and drawing from API on mount ──
  useEffect(() => {
    if (!projectIdNum) return;
    let cancelled = false;

    (async () => {
      try {
        const [projRes, drawRes] = await Promise.all([
          builderApi.getProject(projectIdNum),
          builderApi.getProjectDrawing(projectIdNum),
        ]);
        if (cancelled) return;

        setProjectName(projRes.data.title);

        setSettings((s) => ({
          ...s,
          projectName: projRes.data.title || s.projectName,
        }));

        const apiData = drawRes.data?.data;
        if (apiData && apiData.pages && apiData.pages.length > 0) {
          const validPages = (apiData.pages as StudioPage[]).filter(
            (p): p is StudioPage =>
              !!p && typeof p.id === "string" && typeof p.name === "string" && Array.isArray(p.elements),
          );
          if (validPages.length > 0) {
            setPages(validPages);
            const nextActiveId =
              apiData.activePageId && validPages.some((p) => p.id === apiData.activePageId)
                ? apiData.activePageId
                : validPages[0].id;
            setActivePageId(nextActiveId);
            const targetPage = validPages.find((p) => p.id === nextActiveId) ?? validPages[0];
            resetElements(targetPage.elements);
            if (apiData.layers) setLayers(apiData.layers);
            if (apiData.activeLayer) setActiveLayer(apiData.activeLayer);
          }
        }
      } catch {
        /* API unavailable — keep localStorage fallback */
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectIdNum]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced auto-save to API (every 10s of inactivity after a change) ──
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!projectIdNum) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveToApi();
    }, 10_000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [pages, activePageId, layers, activeLayer, projectIdNum, saveToApi]);

  const cmdLog = useCallback((msg: string) => {
    setCmdHistory((prev) => [...prev.slice(-50), msg]);
  }, []);

  const clearTransientDrawingState = useCallback(() => {
    setSelected(null);
    setSelectedIds(new Set());
    setDrawing(false);
    setPreviewEl(null);
    setOffsetDist(null);
    setOffsetSourceId(null);
    setMoveBasePoint(null);
    setRotateBasePoint(null);
    setRotateRefAngle(null);
    setMirrorP1(null);
    setFilletFirstLineId(null);
    setPendingSymbol(null);
  }, []);

  const flushCurrentPage = useCallback(() => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === activePageId);
      if (idx === -1) return prev;
      const snapshot = getSnapshot();
      if (prev[idx].elements === snapshot.present) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], elements: snapshot.present };
      return next;
    });
  }, [activePageId, getSnapshot]);

  const switchPage = useCallback(
    (pageId: string) => {
      if (pageId === activePageId) return;
      const targetPage = pages.find((p) => p.id === pageId);
      if (!targetPage) return;
      // Save current page's history snapshot
      flushCurrentPage();
      pageHistoryMap.current.set(activePageId, getSnapshot());
      // Switch
      setActivePageId(pageId);
      // Restore target page's history or reset with its elements
      const savedHistory = pageHistoryMap.current.get(pageId);
      if (savedHistory) {
        restoreSnapshot(savedHistory);
      } else {
        resetElements(targetPage.elements);
      }
      clearTransientDrawingState();
      cmdLog(`Switched to ${targetPage.name}`);
    },
    [pages, activePageId, flushCurrentPage, getSnapshot, restoreSnapshot, resetElements, clearTransientDrawingState, cmdLog],
  );

  const addPage = useCallback(() => {
    // Determine next unique page number
    const existingNums = pages
      .map((p) => {
        const m = p.name.match(/^Page\s+(\d+)$/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(Boolean);
    const nextPageNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : pages.length + 1;
    const newPage: StudioPage = {
      id: crypto.randomUUID(),
      name: `Page ${nextPageNum}`,
      elements: [],
    };
    // Save current page's history before switching
    flushCurrentPage();
    pageHistoryMap.current.set(activePageId, getSnapshot());
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    resetElements([]);
    clearTransientDrawingState();
    cmdLog(`Created ${newPage.name}`);
  }, [pages, activePageId, flushCurrentPage, getSnapshot, resetElements, clearTransientDrawingState, cmdLog]);

  const renameActivePage = useCallback(() => {
    if (!activePage) return;
    const nextName = prompt("Rename page:", activePage.name)?.trim();
    if (!nextName) return;
    setPages((prev) =>
      prev.map((page) =>
        page.id === activePage.id ? { ...page, name: nextName } : page,
      ),
    );
    cmdLog(`Renamed page to ${nextName}`);
  }, [activePage, cmdLog]);

  const duplicateActivePage = useCallback(() => {
    if (!activePage) return;
    flushCurrentPage();
    const existingNums = pages
      .map((p) => {
        const m = p.name.match(/^Page\s+(\d+)$/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(Boolean);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : pages.length + 1;
    const duped: StudioPage = {
      id: crypto.randomUUID(),
      name: `Page ${nextNum}`,
      elements: activePage.elements.map((el) => ({ ...el, id: crypto.randomUUID() })),
    };
    pageHistoryMap.current.set(activePageId, getSnapshot());
    setPages((prev) => [...prev, duped]);
    setActivePageId(duped.id);
    resetElements(duped.elements);
    clearTransientDrawingState();
    cmdLog(`Duplicated as ${duped.name}`);
  }, [activePage, pages, activePageId, flushCurrentPage, getSnapshot, resetElements, clearTransientDrawingState, cmdLog]);

  const deleteActivePage = useCallback(() => {
    if (!activePage) return;
    if (pages.length === 1) {
      cmdLog("At least one page is required");
      return;
    }
    if (!confirm(`Delete ${activePage.name}?`)) return;

    // Clean up history for deleted page
    pageHistoryMap.current.delete(activePage.id);
    const remainingPages = pages.filter((page) => page.id !== activePage.id);
    const fallbackPage = remainingPages[0];
    setPages(remainingPages);
    if (fallbackPage) {
      setActivePageId(fallbackPage.id);
      const savedHistory = pageHistoryMap.current.get(fallbackPage.id);
      if (savedHistory) {
        restoreSnapshot(savedHistory);
      } else {
        resetElements(fallbackPage.elements);
      }
      clearTransientDrawingState();
      cmdLog(`Deleted ${activePage.name}`);
    }
  }, [activePage, pages, restoreSnapshot, resetElements, clearTransientDrawingState, cmdLog]);

  useEffect(() => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === activePageId);
      if (idx === -1 || prev[idx].elements === elements) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], elements };
      return next;
    });
  }, [elements, activePageId]);

  // Get the base point for the current drawing operation
  const getBasePoint = useCallback(() => {
    if ((tool === "polyline" || tool === "wall") && previewEl?.type === "polyline") {
      const pts = previewEl.points;
      return pts[pts.length - 2];
    }
    return startPos;
  }, [tool, previewEl, startPos]);

  // Get the current angle from base point to cursor (for distance-only input)
  const getCursorAngle = useCallback(() => {
    const base = getBasePoint();
    const dx = cursor.x - base.x;
    const dy = cursor.y - base.y;
    return Math.atan2(dy, dx);
  }, [getBasePoint, cursor]);

  // Apply a computed point to the current drawing tool
  const applyDrawPoint = useCallback(
    (wx: number, wy: number, logMsg: string) => {
      if ((tool === "polyline" || tool === "wall") && previewEl && previewEl.type === "polyline") {
        const pts = previewEl.points;
        setPreviewEl({
          ...previewEl,
          points: [
            ...pts.slice(0, pts.length - 1),
            { x: wx, y: wy },
            { x: wx, y: wy },
          ],
        });
        cmdLog(logMsg);
      } else if (tool === "line") {
        const id = crypto.randomUUID();
        setElements((prev) => [
          ...prev,
          {
            id,
            type: "line",
            x: startPos.x,
            y: startPos.y,
            x2: wx,
            y2: wy,
            color,
            lineWidth,
            layer: activeLayer,
          },
        ]);
        setStartPos({ x: wx, y: wy });
        setPreviewEl({
          id: "__preview__",
          type: "line",
          x: wx,
          y: wy,
          x2: wx,
          y2: wy,
          color,
          lineWidth,
          layer: activeLayer,
        });
        cmdLog(logMsg);
      } else if (tool === "rect") {
        const id = crypto.randomUUID();
        setElements((prev) => [
          ...prev,
          {
            id,
            type: "rect",
            x: startPos.x,
            y: startPos.y,
            width: wx - startPos.x,
            height: wy - startPos.y,
            color,
            lineWidth,
            layer: activeLayer,
          },
        ]);
        setDrawing(false);
        setPreviewEl(null);
        cmdLog(logMsg);
      } else if (tool === "circle") {
        const r = Math.hypot(wx - startPos.x, wy - startPos.y);
        const id = crypto.randomUUID();
        setElements((prev) => [
          ...prev,
          {
            id,
            type: "circle",
            x: startPos.x,
            y: startPos.y,
            radius: r,
            color,
            lineWidth,
            layer: activeLayer,
          },
        ]);
        setDrawing(false);
        setPreviewEl(null);
        cmdLog(`Circle radius: ${formatUnit(r, settings)}`);
      } else if (tool === "dimension") {
        const id = crypto.randomUUID();
        setElements((prev) => [
          ...prev,
          {
            id,
            type: "dimension",
            x: startPos.x,
            y: startPos.y,
            x2: wx,
            y2: wy,
            color: COLORS.magenta,
            lineWidth,
            layer: activeLayer,
          },
        ]);
        setDrawing(false);
        setPreviewEl(null);
        cmdLog(logMsg);
      }
    },
    [
      tool,
      previewEl,
      startPos,
      color,
      lineWidth,
      activeLayer,
      setElements,
      cmdLog,
    ],
  );

  const zoomToFit = useCallback((els: DrawingElement[]) => {
    if (els.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    const expand = (x: number, y: number) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };
    for (const el of els) {
      if (el.type === "line" || el.type === "dimension") {
        expand(el.x, el.y);
        expand(el.x2, el.y2);
      } else if (el.type === "rect") {
        expand(el.x, el.y);
        expand(el.x + el.width, el.y + el.height);
      } else if (el.type === "circle") {
        expand(el.x - el.radius, el.y - el.radius);
        expand(el.x + el.radius, el.y + el.radius);
      } else if (el.type === "text") {
        expand(el.x, el.y);
        expand(el.x + 100, el.y + 20);
      } else if (el.type === "polyline") {
        for (const p of el.points) expand(p.x, p.y);
      }
    }
    if (!isFinite(minX)) return;
    const padding = 60;
    const cw = canvas.offsetWidth - padding * 2;
    const ch = canvas.offsetHeight - padding * 2;
    const dw = maxX - minX || 1;
    const dh = maxY - minY || 1;
    const newZoom = Math.min(cw / dw, ch / dh, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setZoom(newZoom);
    setPan({
      x: canvas.offsetWidth / 2 - cx * newZoom,
      y: canvas.offsetHeight / 2 - cy * newZoom,
    });
  }, []);

  // Merge collinear/overlapping wall LINE segments produced by the AI agent.
  // Walls on the same axis (horizontal or vertical) at the same coordinate are
  // consolidated into the fewest continuous segments, preserving door gaps.
  function mergeCollinearWalls(els: DrawingElement[]): DrawingElement[] {
    const walls: (DrawingElement & { type: "line" })[] = [];
    const others: DrawingElement[] = [];
    for (const el of els) {
      if (el.type === "line" && el.layer === "Walls") {
        walls.push(el as DrawingElement & { type: "line" });
      } else {
        others.push(el);
      }
    }
    if (walls.length === 0) return els;

    // Group walls by orientation + fixed coordinate
    type WallSeg = { min: number; max: number; src: DrawingElement & { type: "line" } };
    const hGroups = new Map<number, WallSeg[]>(); // horizontal: keyed by y
    const vGroups = new Map<number, WallSeg[]>(); // vertical: keyed by x
    const ungrouped: (DrawingElement & { type: "line" })[] = [];

    for (const w of walls) {
      if (w.y === w.y2) {
        // horizontal
        const key = w.y;
        const seg: WallSeg = { min: Math.min(w.x, w.x2), max: Math.max(w.x, w.x2), src: w };
        if (!hGroups.has(key)) hGroups.set(key, []);
        hGroups.get(key)!.push(seg);
      } else if (w.x === w.x2) {
        // vertical
        const key = w.x;
        const seg: WallSeg = { min: Math.min(w.y, w.y2), max: Math.max(w.y, w.y2), src: w };
        if (!vGroups.has(key)) vGroups.set(key, []);
        vGroups.get(key)!.push(seg);
      } else {
        ungrouped.push(w);
      }
    }

    function mergeSegments(segs: WallSeg[]): WallSeg[] {
      if (segs.length <= 1) return segs;
      segs.sort((a, b) => a.min - b.min);
      const merged: WallSeg[] = [{ ...segs[0] }];
      for (let i = 1; i < segs.length; i++) {
        const last = merged[merged.length - 1];
        const cur = segs[i];
        // Merge if overlapping or touching (within 1mm tolerance)
        if (cur.min <= last.max + 1) {
          last.max = Math.max(last.max, cur.max);
        } else {
          merged.push({ ...cur });
        }
      }
      return merged;
    }

    const result: DrawingElement[] = [...others, ...ungrouped];

    for (const [y, segs] of hGroups) {
      const ref = segs[0].src;
      for (const seg of mergeSegments(segs)) {
        result.push({
          id: crypto.randomUUID(),
          type: "line",
          x: seg.min,
          y,
          x2: seg.max,
          y2: y,
          color: ref.color,
          lineWidth: ref.lineWidth,
          layer: ref.layer,
        });
      }
    }
    for (const [x, segs] of vGroups) {
      const ref = segs[0].src;
      for (const seg of mergeSegments(segs)) {
        result.push({
          id: crypto.randomUUID(),
          type: "line",
          x,
          y: seg.min,
          x2: x,
          y2: seg.max,
          color: ref.color,
          lineWidth: ref.lineWidth,
          layer: ref.layer,
        });
      }
    }
    return result;
  }

  const executeAgentDraw = useCallback(
    async (prompt: string) => {
      setAgentLoading(true);
      cmdLog("AI Agent thinking...");
      try {
        const { data } = await aiApi.drawAgent(prompt, elements);

        // ─────────────────────────────────────────────────────────────────────
        // Helper: resolve layer color
        const layerColor = (name: string) =>
          layers.find((l) => l.name === name)?.color ?? color;

        const wallColor = layerColor("Walls");
        const doorColor = layerColor("Doors");
        const windowColor = layerColor("Windows");
        const annoColor = layerColor("Annotations");
        const furnitureColor = layerColor("Layer 0");
        const structColor = layerColor("Structure");
        const siteColor = layerColor("Site");

        // ─────────────────────────────────────────────────────────────────────
        // BRANCH A: NEW PARAMETRIC FORMAT  { walls, doors, windows, ... }
        // ─────────────────────────────────────────────────────────────────────
        if (Array.isArray(data.walls)) {
          const plan = data as ParametricPlan;
          const newElements: DrawingElement[] = [];

          // ── Walls ── Each wall is a continuous full-length thick line
          for (const wall of plan.walls) {
            const thickness = wall.thickness === "interior" ? 150 : settings.wallThickness;
            newElements.push({
              id: wall.id ?? crypto.randomUUID(),
              type: "line",
              x: wall.x1, y: wall.y1,
              x2: wall.x2, y2: wall.y2,
              color: wallColor,
              lineWidth: thickness,
              layer: "Walls",
            });
          }

          // Helper: given a ParametricWall and a 0..1 t-value, return the (x,y) point
          function wallPoint(w: ParametricWall, t: number) {
            return {
              x: w.x1 + t * (w.x2 - w.x1),
              y: w.y1 + t * (w.y2 - w.y1),
            };
          }

          // Helper: determine if a wall is more vertical than horizontal
          function isWallVertical(w: ParametricWall) {
            return Math.abs(w.y2 - w.y1) > Math.abs(w.x2 - w.x1);
          }

          // ── Doors ── Compute hinge from wallId + position
          for (const door of plan.doors ?? []) {
            const wall = plan.walls.find((w) => w.id === door.wallId);
            if (!wall) continue;

            const doorW = door.width ?? settings.doorWidth;
            const isVert = isWallVertical(wall);
            const doorDepth = wall.thickness === "interior" ? 150 : settings.wallThickness;

            // Door hinge at position along wall
            const pt = wallPoint(wall, door.position);

            // Symbol: garage_door or sliding_door or swing
            let symbolName = door.swing === "left" ? "door_swing_left" : "door_swing_right";
            if (door.type === "garage") symbolName = "garage_door";
            else if (door.type === "sliding") symbolName = "sliding_door";

            let rotation = 0;
            let flipX = false;
            let flipY = false;
            if (door.type === "garage" || door.type === "sliding") {
              rotation = isVert ? 90 : 0;
            } else {
              // Base image lies on the X axis, pointing UP (negative Y).
              if (!isVert) { // Horizontal wall
                // Naturally points UP
                const dir = door.direction ?? "up";
                if (dir === "down") flipY = true;
              } else { // Vertical wall
                // Rotating 90 degrees clockwise makes UP point RIGHT
                rotation = 90;
                const dir = door.direction ?? "right";
                if (dir === "left") flipY = true;
              }
            }

            newElements.push({
              id: door.id ?? crypto.randomUUID(),
              type: "block",
              x: pt.x, y: pt.y,
              width: doorW, height: doorDepth,
              symbolName,
              rotation,
              color: doorColor,
              lineWidth: 1,
              layer: "Doors",
              flipX,
              flipY,
            });
          }

          // ── Windows ── Compute center from wallId + centerPosition
          for (const win of plan.windows ?? []) {
            const wall = plan.walls.find((w) => w.id === win.wallId);
            if (!wall) continue;

            const winW = win.width ?? settings.windowWidth;
            const isVert = isWallVertical(wall);
            const pt = wallPoint(wall, win.centerPosition);

            newElements.push({
              id: win.id ?? crypto.randomUUID(),
              type: "block",
              // Center the window block on the wall point
              x: isVert ? pt.x : pt.x - winW / 2,
              y: isVert ? pt.y - winW / 2 : pt.y,
              width: winW, height: settings.windowHeight,
              symbolName: "window",
              rotation: isVert ? 90 : 0,
              color: windowColor,
              lineWidth: 1,
              layer: "Windows",
            });
          }

          // ── Labels ──
          for (const lbl of plan.labels ?? []) {
            newElements.push({
              id: crypto.randomUUID(),
              type: "text",
              x: lbl.x, y: lbl.y,
              text: lbl.text,
              color: annoColor,
              lineWidth: 1,
              layer: "Annotations",
            });
          }

          // ── Furniture ──
          for (const furn of plan.furniture ?? []) {
            const symDef = SYMBOL_LIBRARY[furn.name];
            newElements.push({
              id: crypto.randomUUID(),
              type: "block",
              x: furn.x, y: furn.y,
              width: furn.width ?? symDef?.defaultWidth ?? 600,
              height: furn.height ?? symDef?.defaultHeight ?? 600,
              symbolName: furn.name,
              rotation: furn.rotation ?? 0,
              color: furnitureColor,
              lineWidth: 1,
              layer: "Layer 0",
            });
          }

          // ── Dimensions ──
          for (const dim of plan.dimensions ?? []) {
            newElements.push({
              id: crypto.randomUUID(),
              type: "dimension",
              x: dim.x, y: dim.y,
              x2: dim.x2, y2: dim.y2,
              color: "#00ffff",
              lineWidth: 1,
              layer: "Annotations",
            });
          }

          // ── Site elements ──
          for (const site of plan.site ?? []) {
            const sp = site as Record<string, number | string | unknown>;
            const sx = sp.x as number ?? 0;
            const sy = sp.y as number ?? 0;
            const sw = sp.width as number ?? 3500;
            const sh = (sp.height ?? sp.depth) as number ?? 4000;
            if (site.type === "DRIVEWAY" || site.type === "GARDEN") {
              newElements.push({
                id: crypto.randomUUID(),
                type: "rect",
                x: sx, y: sy, width: sw, height: sh,
                color: site.type === "GARDEN" ? "#66bb6a" : "#9e9e9e",
                lineWidth: 2, layer: "Site",
              });
              newElements.push({
                id: crypto.randomUUID(),
                type: "text",
                x: sx + sw / 2, y: sy + sh / 2,
                text: site.type === "GARDEN" ? ((sp.name as string) || "Garden") : "Driveway",
                color: annoColor, lineWidth: 1, layer: "Annotations",
              });
            } else if (["VERANDA", "CARPORT", "BALCONY"].includes(site.type)) {
              const depth = (sp.depth ?? sp.height) as number ?? 2500;
              newElements.push({
                id: crypto.randomUUID(),
                type: "rect",
                x: sx, y: sy, width: sw, height: depth,
                color: structColor, lineWidth: 2, layer: "Structure",
              });
              const colSz = 300;
              for (const [cx, cy] of [[sx, sy], [sx + sw, sy], [sx, sy + depth], [sx + sw, sy + depth]]) {
                newElements.push({
                  id: crypto.randomUUID(), type: "block",
                  x: cx as number, y: cy as number, width: colSz, height: colSz,
                  symbolName: "column", rotation: 0,
                  color: structColor, lineWidth: 1, layer: "Structure",
                });
              }
              newElements.push({
                id: crypto.randomUUID(), type: "text",
                x: sx + sw / 2, y: sy + depth / 2,
                text: site.type.charAt(0) + site.type.slice(1).toLowerCase(),
                color: annoColor, lineWidth: 1, layer: "Annotations",
              });
            } else if (site.type === "POOL") {
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sw, height: sh,
                symbolName: "pool", rotation: 0,
                color: "#42a5f5", lineWidth: 1, layer: "Site",
              });
            } else if (site.type === "PARKING") {
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sw, height: sh,
                symbolName: "parking", rotation: (sp.rotation as number) ?? 0,
                color: siteColor, lineWidth: 1, layer: "Site",
              });
            } else if (site.type === "STAIRS") {
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sw, height: (sp.depth as number) ?? 2400,
                symbolName: "stairs", rotation: (sp.rotation as number) ?? 0,
                color: structColor, lineWidth: 1, layer: "Structure",
              });
            } else if (site.type === "COLUMN") {
              const sz = (sp.size as number) ?? 300;
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sz, height: sz,
                symbolName: "column", rotation: 0,
                color: structColor, lineWidth: 1, layer: "Structure",
              });
            } else if (site.type === "SEPTIC_TANK") {
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sw || 2000, height: sh || 1200,
                symbolName: "septic_tank", rotation: 0,
                color: siteColor, lineWidth: 1, layer: "Site",
              });
            } else if (site.type === "ELEVATOR") {
              newElements.push({
                id: crypto.randomUUID(), type: "block",
                x: sx, y: sy, width: sw || 1500, height: sh || 1500,
                symbolName: "elevator", rotation: 0,
                color: structColor, lineWidth: 1, layer: "Structure",
              });
            } else if (site.type === "SLAB") {
              newElements.push({
                id: crypto.randomUUID(), type: "rect",
                x: sx, y: sy, width: sw, height: sh,
                color: structColor, lineWidth: 1, layer: "Structure",
              });
            } else if (site.type === "BOUNDARY" && Array.isArray((sp as any).points) && ((sp as any).points as any[]).length >= 2) {
              newElements.push({
                id: crypto.randomUUID(), type: "polyline",
                points: (sp as any).points,
                color: siteColor, lineWidth: 3, layer: "Site",
              });
            }
          }

          const combined = [...elements, ...newElements];
          const merged = mergeCollinearWalls(combined);
          setElements(merged);
          setTimeout(() => zoomToFit(merged), 100);
          cmdLog(`AI Agent (parametric): ${plan.summary ?? `${newElements.length} elements drawn`}`);

          // ─────────────────────────────────────────────────────────────────────
          // BRANCH B: LEGACY COMMANDS FORMAT  { commands: [...] }
          // ─────────────────────────────────────────────────────────────────────
        } else {
          const cmds = data.commands ?? [];
          if (cmds.length === 0) {
            cmdLog("AI Agent returned no drawing commands");
            setAgentLoading(false);
            return;
          }
          cmdLog(`AI Agent generating ${cmds.length} elements...`);
          const newElements: DrawingElement[] = [];

          // Helper: find closest wall to a point and determine orientation
          function findNearestWall(px: number, py: number, els: DrawingElement[]) {
            const TOL = 1500;
            let bestDist = TOL;
            let isVert = false;
            let snapX = px;
            let snapY = py;
            for (const el of els) {
              if (el.type !== "line" || el.layer !== "Walls") continue;
              const dx = el.x2 - el.x;
              const dy = el.y2 - el.y;
              const lenSq = dx * dx + dy * dy;
              if (lenSq < 1) continue;
              const t = Math.max(0, Math.min(1, ((px - el.x) * dx + (py - el.y) * dy) / lenSq));
              const cx = el.x + t * dx;
              const cy = el.y + t * dy;
              const dist = Math.hypot(px - cx, py - cy);
              if (dist < bestDist) {
                bestDist = dist;
                const horiz = Math.abs(dy) < Math.abs(dx);
                isVert = !horiz;
                snapX = horiz ? px : el.x;
                snapY = horiz ? el.y : py;
              }
            }
            return { isVertical: isVert, x: snapX, y: snapY, found: bestDist < TOL };
          }

          for (const cmd of cmds) {
            const p = cmd.params ?? {};
            if (cmd.type === "WALL" && p.x != null && p.y != null && p.x2 != null && p.y2 != null) {
              const thickness = p.thickness === "interior" ? 150 : settings.wallThickness;
              newElements.push({ id: crypto.randomUUID(), type: "line", x: p.x, y: p.y, x2: p.x2, y2: p.y2, color: wallColor, lineWidth: thickness, layer: "Walls" });
            } else if (cmd.type === "DOOR" && p.x != null && p.y != null) {
              const doorW = p.width ?? settings.doorWidth;
              const swing = p.swing ?? "right";
              const dir = p.direction ?? "down";
              const symbolName = swing === "left" ? "door_swing_left" : "door_swing_right";
              let rotation = 0; let flipX = false; let flipY = false;
              if (dir === "down") { flipY = true; } else if (dir === "right") { rotation = 90; flipY = true; } else if (dir === "left") { rotation = 90; }
              const wall = findNearestWall(p.x, p.y, [...elements, ...newElements]);
              newElements.push({ id: crypto.randomUUID(), type: "block", x: wall.isVertical ? wall.x : p.x, y: wall.isVertical ? p.y : wall.y, width: doorW, height: doorW, symbolName, rotation, color: doorColor, lineWidth: 1, layer: "Doors", flipX, flipY });
            } else if (cmd.type === "WINDOW" && p.x != null && p.y != null) {
              const winW = p.width ?? settings.windowWidth;
              const wall = findNearestWall(p.x, p.y, [...elements, ...newElements]);
              newElements.push({ id: crypto.randomUUID(), type: "block", x: wall.isVertical ? wall.x : p.x, y: wall.isVertical ? p.y : wall.y, width: winW, height: settings.windowHeight, symbolName: "window", rotation: wall.isVertical ? 90 : 0, color: windowColor, lineWidth: 1, layer: "Windows" });
            } else if (cmd.type === "FURNITURE" && p.name && p.x != null && p.y != null) {
              const symDef = SYMBOL_LIBRARY[p.name];
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? symDef?.defaultWidth ?? 600, height: p.height ?? symDef?.defaultHeight ?? 600, symbolName: p.name, rotation: p.rotation ?? 0, color: furnitureColor, lineWidth: 1, layer: "Layer 0" });
            } else if (cmd.type === "LABEL" && p.x != null && p.y != null && p.text) {
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x, y: p.y, text: p.text, color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "DIMENSION" && p.x != null && p.y != null && p.x2 != null && p.y2 != null) {
              newElements.push({ id: crypto.randomUUID(), type: "dimension", x: p.x, y: p.y, x2: p.x2, y2: p.y2, color: "#00ffff", lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "COLUMN" && p.x != null && p.y != null) {
              const size = p.size ?? 300;
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: size, height: size, symbolName: "column", rotation: 0, color: structColor, lineWidth: 1, layer: "Structure" });
            } else if (cmd.type === "SLAB" && p.x != null && p.width != null && p.height != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.height, color: structColor, lineWidth: 1, layer: "Structure" });
              if (p.name) newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.height / 2, text: p.name, color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "STAIRS" && p.x != null) {
              const symDef = SYMBOL_LIBRARY["stairs"];
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? symDef.defaultWidth, height: p.depth ?? symDef.defaultHeight, symbolName: "stairs", rotation: p.rotation ?? 0, color: structColor, lineWidth: 1, layer: "Structure" });
            } else if (cmd.type === "SLIDING_DOOR" && p.x != null) {
              const w = p.width ?? 1800;
              const wall = findNearestWall(p.x, p.y, [...elements, ...newElements]);
              newElements.push({ id: crypto.randomUUID(), type: "block", x: wall.x, y: wall.y, width: w, height: 200, symbolName: "sliding_door", rotation: wall.isVertical ? 90 : 0, color: doorColor, lineWidth: 1, layer: "Doors" });
            } else if (cmd.type === "GARAGE_DOOR" && p.x != null) {
              const w = p.width ?? 2400;
              const wall = findNearestWall(p.x, p.y, [...elements, ...newElements]);
              newElements.push({ id: crypto.randomUUID(), type: "block", x: wall.x, y: wall.y, width: w, height: 200, symbolName: "garage_door", rotation: wall.isVertical ? 90 : 0, color: doorColor, lineWidth: 1, layer: "Doors" });
            } else if (cmd.type === "DRIVEWAY" && p.x != null && p.width != null && p.height != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.height, color: "#9e9e9e", lineWidth: 2, layer: "Site" });
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.height / 2, text: "Driveway", color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "POOL" && p.x != null) {
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? 4000, height: p.height ?? 8000, symbolName: "pool", rotation: 0, color: "#42a5f5", lineWidth: 1, layer: "Site" });
            } else if (cmd.type === "GARDEN" && p.x != null && p.width != null && p.height != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.height, color: "#66bb6a", lineWidth: 2, layer: "Site" });
              if (p.name) newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.height / 2, text: p.name, color: "#2e7d32", lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "PARKING" && p.x != null) {
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? 2500, height: p.height ?? 5000, symbolName: "parking", rotation: p.rotation ?? 0, color: siteColor, lineWidth: 1, layer: "Site" });
            } else if (cmd.type === "SEPTIC_TANK" && p.x != null) {
              const symDef = SYMBOL_LIBRARY["septic_tank"];
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? symDef.defaultWidth, height: p.height ?? symDef.defaultHeight, symbolName: "septic_tank", rotation: 0, color: siteColor, lineWidth: 1, layer: "Site" });
            } else if (cmd.type === "VERANDA" && p.x != null && p.width != null && p.depth != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.depth, color: structColor, lineWidth: 2, layer: "Structure" });
              const colSize = 300;
              for (const [cx, cy] of [[p.x, p.y], [p.x + p.width, p.y], [p.x, p.y + p.depth], [p.x + p.width, p.y + p.depth]]) {
                newElements.push({ id: crypto.randomUUID(), type: "block", x: cx as number, y: cy as number, width: colSize, height: colSize, symbolName: "column", rotation: 0, color: structColor, lineWidth: 1, layer: "Structure" });
              }
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.depth / 2, text: "Veranda", color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "CARPORT" && p.x != null && p.width != null && p.depth != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.depth, color: structColor, lineWidth: 2, layer: "Structure" });
              const colSize = 300;
              for (const [cx, cy] of [[p.x, p.y], [p.x + p.width, p.y], [p.x, p.y + p.depth], [p.x + p.width, p.y + p.depth]]) {
                newElements.push({ id: crypto.randomUUID(), type: "block", x: cx as number, y: cy as number, width: colSize, height: colSize, symbolName: "column", rotation: 0, color: structColor, lineWidth: 1, layer: "Structure" });
              }
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.depth / 2, text: "Carport", color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "BALCONY" && p.x != null && p.width != null && p.depth != null) {
              newElements.push({ id: crypto.randomUUID(), type: "rect", x: p.x, y: p.y, width: p.width, height: p.depth, color: structColor, lineWidth: 2, layer: "Structure" });
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x + p.width / 2, y: p.y + p.depth / 2, text: `Balcony${p.floor ? ` (Floor ${p.floor})` : ""}`, color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "ELEVATOR" && p.x != null) {
              const symDef = SYMBOL_LIBRARY["elevator"];
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? symDef.defaultWidth, height: p.height ?? symDef.defaultHeight, symbolName: "elevator", rotation: 0, color: structColor, lineWidth: 1, layer: "Structure" });
            } else if (cmd.type === "ESCALATOR" && p.x != null) {
              const symDef = SYMBOL_LIBRARY["escalator"];
              newElements.push({ id: crypto.randomUUID(), type: "block", x: p.x, y: p.y, width: p.width ?? symDef.defaultWidth, height: p.length ?? p.height ?? symDef.defaultHeight, symbolName: "escalator", rotation: p.rotation ?? 0, color: structColor, lineWidth: 1, layer: "Structure" });
            } else if (cmd.type === "OPENING" && p.x != null) {
              newElements.push({ id: crypto.randomUUID(), type: "text", x: p.x, y: p.y, text: "OPENING", color: annoColor, lineWidth: 1, layer: "Annotations" });
            } else if (cmd.type === "BOUNDARY" && Array.isArray(p.points) && p.points.length >= 2) {
              newElements.push({ id: crypto.randomUUID(), type: "polyline", points: p.points, color: siteColor, lineWidth: 3, layer: "Site" });
            }
          }

          const combinedElements = [...elements, ...newElements];
          const mergedElements = mergeCollinearWalls(combinedElements);
          setElements(mergedElements);
          setTimeout(() => zoomToFit(mergedElements), 100);
          cmdLog(`AI Agent: ${data.summary ?? `${mergedElements.length} elements drawn`}`);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.error || err?.message || "Unknown error";
        cmdLog(`AI Agent error: ${msg}`);
      }
      setAgentLoading(false);
    },
    [
      elements,
      color,
      layers,
      settings,
      setElements,
      cmdLog,
      zoomToFit,
    ],
  );







  const processCommand = useCallback(
    (input: string) => {
      const raw = input.trim();
      if (!raw) return;
      cmdLog(`> ${raw}`);
      setPastCommands((prev) => [...prev, raw]);
      setCmdHistoryIdx(-1);

      const lower = raw.toLowerCase();

      // ── While actively drawing ──────────────────────────
      if (drawing) {
        const base = getBasePoint();

        // Distance only (e.g. "100") — uses current cursor direction
        const distOnly = raw.match(/^(-?\d+(?:\.\d+)?)$/);
        if (distOnly) {
          const dist = parseFloat(distOnly[1]);
          const angle = getCursorAngle();
          const wx = base.x + dist * Math.cos(angle);
          const wy = base.y + dist * Math.sin(angle);
          const angleDeg = (angle * 180) / Math.PI;
          applyDrawPoint(
            wx,
            wy,
            `${formatUnit(dist, settings)} at ${formatDMS(angleDeg < 0 ? angleDeg + 360 : angleDeg)} → ${wx.toFixed(1)}, ${wy.toFixed(1)}`,
          );
          return;
        }

        // Distance<Angle (e.g. "100<45") — polar input without @
        const polarDirect = raw.match(
          /^(-?\d+(?:\.\d+)?)\s*<\s*(-?\d+(?:\.\d+)?)$/,
        );
        if (polarDirect) {
          const dist = parseFloat(polarDirect[1]);
          const angleDeg = parseFloat(polarDirect[2]);
          const angleRad = (angleDeg * Math.PI) / 180;
          const wx = base.x + dist * Math.cos(angleRad);
          const wy = base.y + dist * Math.sin(angleRad);
          applyDrawPoint(
            wx,
            wy,
            `${formatUnit(dist, settings)} < ${formatDMS(angleDeg)} → ${wx.toFixed(1)}, ${wy.toFixed(1)}`,
          );
          return;
        }

        // @distance<angle — polar with explicit @ prefix
        const polarAt = raw.match(
          /^@(-?\d+(?:\.\d+)?)\s*<\s*(-?\d+(?:\.\d+)?)$/,
        );
        if (polarAt) {
          const dist = parseFloat(polarAt[1]);
          const angleDeg = parseFloat(polarAt[2]);
          const angleRad = (angleDeg * Math.PI) / 180;
          const wx = base.x + dist * Math.cos(angleRad);
          const wy = base.y + dist * Math.sin(angleRad);
          applyDrawPoint(
            wx,
            wy,
            `@${dist}<${angleDeg}° → ${wx.toFixed(1)}, ${wy.toFixed(1)}`,
          );
          return;
        }

        // @dx,dy — relative coordinates
        const relMatch = raw.match(
          /^@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
        );
        if (relMatch) {
          const dx = parseFloat(relMatch[1]);
          const dy = parseFloat(relMatch[2]);
          const wx = base.x + dx;
          const wy = base.y + dy;
          applyDrawPoint(
            wx,
            wy,
            `@${dx},${dy} → ${wx.toFixed(1)}, ${wy.toFixed(1)}`,
          );
          return;
        }

        // x,y — absolute coordinates while drawing
        const coordMatch = raw.match(
          /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
        );
        if (coordMatch) {
          const wx = parseFloat(coordMatch[1]);
          const wy = parseFloat(coordMatch[2]);
          applyDrawPoint(wx, wy, `Point: ${wx}, ${wy}`);
          return;
        }

        // Radius for circle (just a number when circle tool is active)
        if (tool === "circle" && distOnly) {
          // already handled above
        }
      }

      // ── Offset distance input ────────────────────────────
      if (tool === "offset" && offsetDist === null) {
        const dist = parseFloat(raw);
        if (!isNaN(dist) && dist > 0) {
          setOffsetDist(dist);
          cmdLog(
            `Offset distance: ${formatUnit(dist, settings)} — Click a line or polyline to offset`,
          );
        } else {
          cmdLog("Invalid distance. Enter a positive number.");
        }
        return;
      }

      // FILLET command options while fillet is active: R,<value>
      if (tool === "fillet") {
        const rm = raw.match(/^r\s*,\s*([0-9]+(?:\.[0-9]+)?)$/i);
        if (rm) {
          const r = Number(rm[1]);
          if (Number.isFinite(r) && r >= 0) {
            setFilletRadius(r);
            cmdLog(`Fillet radius set to ${r.toFixed(0)} mm`);
            return;
          }
        }
      }

      // ── Not drawing — start drawing at coordinate ──────
      const coordMatch = raw.match(
        /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
      );
      if (coordMatch && !drawing) {
        const wx = parseFloat(coordMatch[1]);
        const wy = parseFloat(coordMatch[2]);
        if (tool === "polyline") {
          setDrawing(true);
          setStartPos({ x: wx, y: wy });
          setPreviewEl({
            id: "__preview__",
            type: "polyline",
            points: [
              { x: wx, y: wy },
              { x: wx, y: wy },
            ],
            color,
            lineWidth,
            layer: activeLayer,
          });
          cmdLog(
            `Polyline start: ${wx}, ${wy} — specify next point or enter length`,
          );
        } else if (
          tool === "line" ||
          tool === "rect" ||
          tool === "circle" ||
          tool === "dimension"
        ) {
          setDrawing(true);
          setStartPos({ x: wx, y: wy });
          cmdLog(
            `Start point: ${wx}, ${wy} — specify next point, length, or length<angle`,
          );
        } else if (tool === "text") {
          const text = prompt("Enter text:");
          if (text) {
            setElements((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                type: "text",
                x: wx,
                y: wy,
                color,
                lineWidth,
                text,
                layer: activeLayer,
              },
            ]);
            cmdLog(`Text placed at ${wx}, ${wy}`);
          }
        }
        return;
      }

      // ── Command lookup ──────────────────────────────────
      const cmd = COMMAND_MAP[lower];
      if (cmd === "undo") {
        undo();
        cmdLog("Undo");
        return;
      }
      if (cmd === "redo") {
        redo();
        cmdLog("Redo");
        return;
      }
      if (cmd === "clear") {
        setCmdHistory([]);
        return;
      }
      if (cmd === "ortho") {
        setOrthoMode((v) => {
          cmdLog(v ? "Ortho OFF" : "Ortho ON");
          return !v;
        });
        return;
      }
      if (cmd) {
        if (drawing) {
          setDrawing(false);
          setPreviewEl(null);
        }
        if (cmd === "door") {
          setTool("door");
          setPendingSymbol(doorSwing === "left" ? "door_swing_left" : "door_swing_right");
          cmdLog("DOOR — Click on a wall to place a door");
        } else if (cmd === "window") {
          setTool("window");
          setPendingSymbol("window");
          cmdLog("WINDOW — Click on a wall to place a window");
        } else if (cmd === "stairs") {
          setTool("stairs");
          cmdLog("STAIRS — Click to place a staircase");
        } else if (cmd === "furniture") {
          setTool("furniture");
          cmdLog("FURNITURE — Select an item from the palette, then click to place");
        } else {
          setTool(cmd as Tool);
          cmdLog(
            `Command: ${(cmd as string).toUpperCase()} — ${getToolPrompt(cmd as Tool)}`,
          );
        }
        return;
      }

      // If in agent mode, treat unrecognized input as an AI drawing prompt
      if (tool === "agent") {
        if (agentLoading) {
          cmdLog("AI Agent is still working, please wait...");
          return;
        }
        executeAgentDraw(raw);
        return;
      }

      cmdLog(
        `Unknown command: "${raw}" — type W, D, WIN, R, ST, FUR, S, P, E, AI, or enter length / length<angle / x,y`,
      );
    },
    [
      drawing,
      tool,
      previewEl,
      startPos,
      cursor,
      color,
      lineWidth,
      activeLayer,
      undo,
      redo,
      setElements,
      cmdLog,
      getBasePoint,
      getCursorAngle,
      applyDrawPoint,
      agentLoading,
      executeAgentDraw,
      filletRadius,
    ],
  );

  const executeCommand = useCallback(
    (cmd: CommandDef) => {
      cmdLog(`> ${cmd.alias}`);
      setPastCommands((prev) => [...prev, cmd.alias]);
      setCmdHistoryIdx(-1);
      if (cmd.action === "undo") {
        undo();
        cmdLog("Undo");
        return;
      }
      if (cmd.action === "redo") {
        redo();
        cmdLog("Redo");
        return;
      }
      if (cmd.action === "clear") {
        setCmdHistory([]);
        return;
      }
      if (cmd.action === "ortho") {
        setOrthoMode((v) => {
          cmdLog(v ? "Ortho OFF" : "Ortho ON");
          return !v;
        });
        return;
      }
      if (drawing) {
        setDrawing(false);
        setPreviewEl(null);
      }
      setTool(cmd.action as Tool);
      cmdLog(`Command: ${cmd.name} — ${getToolPrompt(cmd.action as Tool)}`);
    },
    [drawing, undo, redo, cmdLog],
  );

  function getToolPrompt(t: Tool): string {
    switch (t) {
      case "wall":
        return "Click to start wall. Click points to continue. Enter/dbl-click to finish";
      case "line":
        return "Specify first point (click or x,y)";
      case "polyline":
        return "Specify start point (click or x,y). Enter to finish";
      case "rect":
        return "Specify first corner (click or x,y)";
      case "circle":
        return "Specify center point (click or x,y)";
      case "text":
        return "Click to place text or enter x,y";
      case "dimension":
        return "Specify first point (click or x,y)";
      case "eraser":
        return "Click element to erase";
      case "select":
        return "Click element to select";
      case "pan":
        return "Drag to pan view";
      case "agent":
        return 'Describe what to draw (e.g. "3 bedroom house floor plan")';
      case "offset":
        return offsetDist === null
          ? "Enter offset distance:"
          : offsetSourceId
            ? "Click side to offset to"
            : "Click a line or polyline to offset";
      case "move":
        return moveBasePoint ? "Specify destination point" : "Specify base point";
      case "copy":
        return moveBasePoint ? "Specify destination point for copy" : "Specify base point";
      case "rotate":
        return rotateBasePoint ? "Specify rotation angle" : "Specify base point";
      case "trim":
        return "Click segment to remove between intersections";
      case "extend":
        return "Click near endpoint to extend to nearest boundary";
      case "mirror":
        return mirrorP1 ? "Specify second point of mirror line" : "Specify first point of mirror line";
      case "fillet":
        return filletFirstLineId
          ? "Select second line for fillet"
          : `Select first line (radius ${filletRadius.toFixed(0)} mm; use R,<value>)`;
      case "door":
        return "Click on a wall to place a door";
      case "window":
        return "Click on a wall to place a window";
      case "stairs":
        return "Click to place a staircase";
      case "furniture":
        return pendingSymbol
          ? `Click to place ${SYMBOL_LIBRARY[pendingSymbol]?.label ?? pendingSymbol}`
          : "Select an item from the furniture palette";
      default:
        return "";
    }
  }

  // ── Offset geometry helpers ──────────────────────────
  function offsetLineElement(
    el: DrawingElement & { type: "line" },
    dist: number,
    sideX: number,
    sideY: number,
  ): DrawingElement {
    const dx = el.x2 - el.x,
      dy = el.y2 - el.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return { ...el, id: crypto.randomUUID() };
    // Unit normal (perpendicular, pointing "left" of the line direction)
    const nx = -dy / len,
      ny = dx / len;
    // Find closest point on original line to side click point
    const t = Math.max(
      0,
      Math.min(1, ((sideX - el.x) * dx + (sideY - el.y) * dy) / (len * len)),
    );
    const closestX = el.x + t * dx,
      closestY = el.y + t * dy;
    // Vector from closest point on line to click point
    const toClickX = sideX - closestX,
      toClickY = sideY - closestY;
    // Dot with normal to determine side
    const dot = nx * toClickX + ny * toClickY;
    const sign = dot >= 0 ? 1 : -1;
    const ox = nx * dist * sign,
      oy = ny * dist * sign;
    return {
      id: crypto.randomUUID(),
      type: "line",
      x: el.x + ox,
      y: el.y + oy,
      x2: el.x2 + ox,
      y2: el.y2 + oy,
      color: el.color,
      lineWidth: el.lineWidth,
      layer: el.layer,
    };
  }

  function offsetPolylineElement(
    el: DrawingElement & { type: "polyline" },
    dist: number,
    sideX: number,
    sideY: number,
  ): DrawingElement {
    const pts = el.points;
    if (pts.length < 2) return { ...el, id: crypto.randomUUID() };

    // Compute per-segment unit normals
    const normals: { nx: number; ny: number }[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x,
        dy = pts[i + 1].y - pts[i].y;
      const len = Math.hypot(dx, dy) || 1;
      normals.push({ nx: -dy / len, ny: dx / len });
    }

    // Determine side: find closest segment to click point, use that segment's normal
    let bestDist = Infinity,
      bestSeg = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const sdx = pts[i + 1].x - pts[i].x,
        sdy = pts[i + 1].y - pts[i].y;
      const slen2 = sdx * sdx + sdy * sdy;
      const t =
        slen2 === 0
          ? 0
          : Math.max(
            0,
            Math.min(
              1,
              ((sideX - pts[i].x) * sdx + (sideY - pts[i].y) * sdy) / slen2,
            ),
          );
      const cx = pts[i].x + t * sdx,
        cy = pts[i].y + t * sdy;
      const d = Math.hypot(sideX - cx, sideY - cy);
      if (d < bestDist) {
        bestDist = d;
        bestSeg = i;
      }
    }
    const refN = normals[bestSeg];
    const refPt = pts[bestSeg];
    const dot = refN.nx * (sideX - refPt.x) + refN.ny * (sideY - refPt.y);
    const sign = dot >= 0 ? 1 : -1;

    // Compute offset points with miter joints
    const newPts: { x: number; y: number }[] = [];
    for (let i = 0; i < pts.length; i++) {
      let offNx: number, offNy: number;
      if (i === 0) {
        offNx = normals[0].nx;
        offNy = normals[0].ny;
      } else if (i === pts.length - 1) {
        offNx = normals[normals.length - 1].nx;
        offNy = normals[normals.length - 1].ny;
      } else {
        // Miter: bisect the two adjacent normals
        const bx = normals[i - 1].nx + normals[i].nx;
        const by = normals[i - 1].ny + normals[i].ny;
        const blen = Math.hypot(bx, by);
        if (blen < 0.01) {
          offNx = normals[i].nx;
          offNy = normals[i].ny;
        } else {
          offNx = bx / blen;
          offNy = by / blen;
          // Scale for miter: d / cos(half_angle)
          const cosHalf = offNx * normals[i].nx + offNy * normals[i].ny;
          if (Math.abs(cosHalf) > 0.1) {
            offNx /= cosHalf;
            offNy /= cosHalf;
          }
        }
      }
      newPts.push({
        x: pts[i].x + offNx * dist * sign,
        y: pts[i].y + offNy * dist * sign,
      });
    }
    return {
      id: crypto.randomUUID(),
      type: "polyline",
      points: newPts,
      color: el.color,
      lineWidth: el.lineWidth,
      layer: el.layer,
    };
  }

  function getDrawingPrompt(): string {
    if (!drawing) return "";
    if (tool === "circle") return "Specify radius: number, or click";
    return "Next point: length, length<angle, @dx,dy, x,y, or click";
  }

  const toWorld = (sx: number, sy: number) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
  });

  const snapToGrid = (v: number) =>
    Math.round(v / settings.gridSize) * settings.gridSize;

  // ── Wall Merging Logic ──────────────────────────────────────────
  const mergedGeometries = useMemo(() => {
    if (!settings.mergeWalls) return [];
    const activeHidden = new Set(
      layers.filter((l) => !l.visible).map((l) => l.name),
    );

    // Find all doors and windows to cut gaps for
    const holeBlocks = elements.filter(el => el.type === "block" && /door|window/i.test(el.symbolName));

    const groups: Record<string, any[]> = {}; // key: layer
    const layerColors: Record<string, string> = {};

    const getLinePolysWithHoles = (x1: number, y1: number, x2: number, y2: number, lineWidth: number) => {
      let splitSpans: [number, number][] = [];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 1) return [];

      for (const b of holeBlocks) {
        const symDef = SYMBOL_LIBRARY[b.symbolName];
        if (!symDef) continue;
        const ax = symDef.anchorX ?? 0.5;
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
        const px = x1 + centerT * (x2 - x1);
        const py = y1 + centerT * (y2 - y1);
        const dist = Math.hypot(b.x - px, b.y - py);

        if (dist < 300) {
          splitSpans.push([Math.max(0, Math.min(t1, t2)), Math.min(1, Math.max(t1, t2))]);
        }
      }

      if (splitSpans.length === 0) {
        return [thickenLine(x1, y1, x2, y2, lineWidth, true, true)];
      }

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
            lineWidth,
            tCurr <= 0,
            false,
          ));
        }
        tCurr = Math.max(tCurr, sp[1]);
      }
      if (tCurr < 1) {
        outPolys.push(thickenLine(
          x1 + (x2 - x1) * tCurr, y1 + (y2 - y1) * tCurr,
          x2, y2, lineWidth, false, true
        ));
      }
      return outPolys;
    };

    for (const el of elements) {
      if (activeHidden.has(el.layer)) continue;
      if (
        (el.type === "line" || el.type === "polyline") &&
        el.lineWidth >= settings.wallThickness
      ) {
        const key = el.layer;
        if (!groups[key]) groups[key] = [];
        layerColors[key] = el.color;

        if (el.type === "line") {
          groups[key].push(...getLinePolysWithHoles(el.x, el.y, el.x2!, el.y2!, el.lineWidth));
        } else if (el.type === "polyline") {
          for (let i = 0; i < el.points.length - 1; i++) {
            groups[key].push(
              ...getLinePolysWithHoles(
                el.points[i].x, el.points[i].y,
                el.points[i + 1].x, el.points[i + 1].y,
                el.lineWidth
              )
            );
          }
        }
      }
    }

    const results = [];
    for (const key in groups) {
      if (groups[key].length === 0) continue;
      try {
        // @ts-ignore
        const unioned = polygonClipping.union(...groups[key]);
        results.push({ color: layerColors[key], unioned });
      } catch (e) {
        console.warn("Clipping failed", e);
      }
    }
    return results;
  }, [elements, layers, settings.mergeWalls, settings.wallThickness]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, pan, zoom, canvas.width, canvas.height, settings);
    const hiddenLayers = new Set(
      layers.filter((l) => !l.visible).map((l) => l.name),
    );
    const layerByName = new Map(layers.map((l) => [l.name, l]));

    // Draw standard elements
    const allBlocks: BlockInfo[] = [];
    for (const el of elements) {
      if (el.type === "block") {
        allBlocks.push({
          x: el.x, y: el.y, width: el.width, height: el.height, rot: el.rotation ?? 0, sym: el.symbolName || ""
        });
      }
    }

    for (const el of elements) {
      if (hiddenLayers.has(el.layer)) continue;
      // If we are merging walls, skip standard drawing for thick lines (they will be drawn in the union pass)
      if (
        settings.mergeWalls &&
        (el.type === "line" || el.type === "polyline") &&
        el.lineWidth >= settings.wallThickness
      ) {
        continue;
      }

      const isSelected = el.id === selected || selectedIds.has(el.id);
      drawElement(
        ctx,
        el,
        pan,
        zoom,
        isSelected,
        settings,
        layerByName.get(el.layer)?.lineType ?? "solid",
        allBlocks
      );
    }

    // Draw merged wall polygons
    if (settings.mergeWalls) {
      for (const res of mergedGeometries) {
        ctx.fillStyle = res.color + "44"; // slight transparency for fills
        ctx.strokeStyle = res.color;
        ctx.lineWidth = 1; // Outline thickness
        ctx.beginPath();
        for (const multiPoly of res.unioned) {
          for (const poly of multiPoly) {
            for (let i = 0; i < poly.length; i++) {
              const px = poly[i][0] * zoom + pan.x;
              const py = poly[i][1] * zoom + pan.y;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
          }
        }
        ctx.fill();
        ctx.stroke();
      }
    }

    if (previewEl) {
      drawElement(
        ctx,
        previewEl,
        pan,
        zoom,
        false,
        settings,
        layerByName.get(previewEl.layer)?.lineType ?? "solid",
        allBlocks
      );

      ctx.fillStyle = COLORS.cyan;
      ctx.font = "12px Courier New";

      if (previewEl.type === "line") {
        const dx = previewEl.x2! - previewEl.x;
        const dy = previewEl.y2! - previewEl.y;
        const dist = Math.hypot(dx, dy);
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        const midX = ((previewEl.x + previewEl.x2!) / 2) * zoom + pan.x;
        const midY = ((previewEl.y + previewEl.y2!) / 2) * zoom + pan.y;
        ctx.fillText(
          `L: ${formatUnit(dist, settings)}  A: ${formatDMS(angle)}`,
          midX + 10,
          midY - 10,
        );
      } else if (previewEl.type === "polyline") {
        const pts = previewEl.points;
        if (pts.length >= 2) {
          const p1 = pts[pts.length - 2];
          const p2 = pts[pts.length - 1];
          const dx = p2.x - p1.x,
            dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (angle < 0) angle += 360;
          const midX = ((p1.x + p2.x) / 2) * zoom + pan.x;
          const midY = ((p1.y + p2.y) / 2) * zoom + pan.y;
          ctx.fillText(
            `L: ${formatUnit(dist, settings)}  A: ${formatDMS(angle)}`,
            midX + 10,
            midY - 10,
          );
        }
      } else if (previewEl.type === "rect") {
        const w = formatUnit(Math.abs(previewEl.width!), settings);
        const h = formatUnit(Math.abs(previewEl.height!), settings);
        const p2x = (previewEl.x + previewEl.width!) * zoom + pan.x;
        const p2y = (previewEl.y + previewEl.height!) * zoom + pan.y;
        ctx.fillText(`W: ${w}  H: ${h}`, p2x + 10, p2y + 10);
      } else if (previewEl.type === "circle") {
        const px = previewEl.x * zoom + pan.x;
        const py = previewEl.y * zoom + pan.y;
        ctx.fillText(
          `R: ${formatUnit(previewEl.radius!, settings)}`,
          px + previewEl.radius! * zoom + 10,
          py - 5,
        );
      }
    }

    // ── Draw OSNAP indicator per snap type ─────────────────
    if (snapPoint) {
      const spx = snapPoint.x * zoom + pan.x;
      const spy = snapPoint.y * zoom + pan.y;
      const sz = 6;
      ctx.lineWidth = 2;

      switch (snapPoint.type) {
        case "endpoint": // Square
          ctx.strokeStyle = "#4caf50";
          ctx.strokeRect(spx - sz, spy - sz, sz * 2, sz * 2);
          break;
        case "midpoint": // Triangle
          ctx.strokeStyle = "#00bcd4";
          ctx.beginPath();
          ctx.moveTo(spx, spy - sz);
          ctx.lineTo(spx + sz, spy + sz);
          ctx.lineTo(spx - sz, spy + sz);
          ctx.closePath();
          ctx.stroke();
          break;
        case "center": // Circle
          ctx.strokeStyle = "#ffeb3b";
          ctx.beginPath();
          ctx.arc(spx, spy, sz, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "intersection": // X cross
          ctx.strokeStyle = "#f44336";
          ctx.beginPath();
          ctx.moveTo(spx - sz, spy - sz);
          ctx.lineTo(spx + sz, spy + sz);
          ctx.moveTo(spx + sz, spy - sz);
          ctx.lineTo(spx - sz, spy + sz);
          ctx.stroke();
          break;
        case "perpendicular": // ⊥ symbol
          ctx.strokeStyle = "#e91e63";
          ctx.beginPath();
          ctx.moveTo(spx - sz, spy + sz);
          ctx.lineTo(spx + sz, spy + sz);
          ctx.moveTo(spx, spy - sz);
          ctx.lineTo(spx, spy + sz);
          ctx.stroke();
          break;
        case "quadrant": // Diamond
          ctx.strokeStyle = "#ff9800";
          ctx.beginPath();
          ctx.moveTo(spx, spy - sz);
          ctx.lineTo(spx + sz, spy);
          ctx.lineTo(spx, spy + sz);
          ctx.lineTo(spx - sz, spy);
          ctx.closePath();
          ctx.stroke();
          break;
        case "nearest": // Hourglass
          ctx.strokeStyle = "#9c27b0";
          ctx.beginPath();
          ctx.moveTo(spx - sz, spy - sz);
          ctx.lineTo(spx + sz, spy + sz);
          ctx.lineTo(spx - sz, spy + sz);
          ctx.lineTo(spx + sz, spy - sz);
          ctx.closePath();
          ctx.stroke();
          break;
      }

      // Snap type label
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = "bold 9px 'Roboto Mono', monospace";
      ctx.fillText(snapPoint.type.toUpperCase(), spx + sz + 4, spy - 2);
    }

    // ── Ortho tracking line ──────────────────────────────────
    if (orthoMode && drawing) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = COLORS.cyan + "66";
      ctx.lineWidth = 1;
      const sx = startPos.x * zoom + pan.x;
      const sy = startPos.y * zoom + pan.y;
      // Horizontal guide
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(canvas.width, sy);
      ctx.stroke();
      // Vertical guide
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Coordinates readout + ORTHO/OSNAP status
    ctx.fillStyle = COLORS.muted;
    ctx.font = "11px 'Roboto Mono', monospace";
    const statusFlags = [
      orthoMode ? "ORTHO" : null,
      "OSNAP",
    ].filter(Boolean).join(" | ");
    ctx.fillText(
      `X: ${snapToGrid(cursor.x).toFixed(0)} mm  Y: ${snapToGrid(cursor.y).toFixed(0)} mm  Zoom: ${(zoom * 100).toFixed(0)}%  [${statusFlags}]`,
      12,
      canvas.height - 10,
    );
  }, [elements, pan, zoom, selected, previewEl, cursor, layers, snapPoint, orthoMode, drawing, startPos]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPan((p) => ({
      x: mx - (mx - p.x) * factor,
      y: my - (my - p.y) * factor,
    }));
    setZoom((z) => Math.min(10, Math.max(0.1, z * factor)));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  type SnapType = "endpoint" | "midpoint" | "center" | "intersection" | "perpendicular" | "nearest" | "quadrant";
  type SnapResult = { x: number; y: number; type: SnapType } | null;

  // ── Geometry helpers for advanced snaps ──────────────────
  const lineSegments = useCallback((): { x1: number; y1: number; x2: number; y2: number }[] => {
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const hiddenLayers = new Set(layers.filter((l) => !l.visible).map((l) => l.name));
    for (const el of elements) {
      if (hiddenLayers.has(el.layer)) continue;
      if (el.type === "line" || el.type === "dimension") {
        segs.push({ x1: el.x, y1: el.y, x2: el.x2, y2: el.y2 });
      } else if (el.type === "polyline") {
        for (let i = 0; i < el.points.length - 1; i++) {
          segs.push({ x1: el.points[i].x, y1: el.points[i].y, x2: el.points[i + 1].x, y2: el.points[i + 1].y });
        }
      } else if (el.type === "rect") {
        const corners = [
          { x: el.x, y: el.y },
          { x: el.x + el.width, y: el.y },
          { x: el.x + el.width, y: el.y + el.height },
          { x: el.x, y: el.y + el.height },
        ];
        for (let i = 0; i < 4; i++) {
          segs.push({ x1: corners[i].x, y1: corners[i].y, x2: corners[(i + 1) % 4].x, y2: corners[(i + 1) % 4].y });
        }
      }
    }
    return segs;
  }, [elements, layers]);

  const segIntersection = (
    ax1: number, ay1: number, ax2: number, ay2: number,
    bx1: number, by1: number, bx2: number, by2: number,
  ): { x: number; y: number } | null => {
    const dx1 = ax2 - ax1, dy1 = ay2 - ay1;
    const dx2 = bx2 - bx1, dy2 = by2 - by1;
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < 1e-10) return null;
    const t = ((bx1 - ax1) * dy2 - (by1 - ay1) * dx2) / denom;
    const u = ((bx1 - ax1) * dy1 - (by1 - ay1) * dx1) / denom;
    if (t >= -0.001 && t <= 1.001 && u >= -0.001 && u <= 1.001) {
      return { x: ax1 + t * dx1, y: ay1 + t * dy1 };
    }
    return null;
  };

  const nearestOnSeg = (
    px: number, py: number,
    ax: number, ay: number, bx: number, by: number,
  ) => {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-10) return { x: ax, y: ay };
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    return { x: ax + t * dx, y: ay + t * dy };
  };

  const getSnapPoint = (wx: number, wy: number): SnapResult => {
    if (tool === "select" || tool === "eraser" || tool === "pan" || tool === "text") return null;

    const threshold = 15 / zoom;
    let bestDist = threshold;
    let bestSnap: SnapResult = null;

    const trySnap = (x: number, y: number, type: SnapType, priority = 0) => {
      const d = Math.hypot(x - wx, y - wy);
      // Higher priority snaps (endpoint > midpoint > intersection > perpendicular > nearest)
      const effectiveDist = d - priority * 0.01;
      if (d < threshold && effectiveDist < bestDist) {
        bestDist = effectiveDist;
        bestSnap = { x, y, type };
      }
    };

    const hiddenLayers = new Set(layers.filter((l) => !l.visible).map((l) => l.name));

    // ── Pass 1: Endpoints, midpoints, centers, quadrants ──
    for (const el of elements) {
      if (hiddenLayers.has(el.layer)) continue;

      if (el.type === "line" || el.type === "dimension") {
        trySnap(el.x, el.y, "endpoint", 3);
        trySnap(el.x2, el.y2, "endpoint", 3);
        trySnap((el.x + el.x2) / 2, (el.y + el.y2) / 2, "midpoint", 2);
      } else if (el.type === "rect") {
        // 4 corners as endpoints
        trySnap(el.x, el.y, "endpoint", 3);
        trySnap(el.x + el.width, el.y, "endpoint", 3);
        trySnap(el.x, el.y + el.height, "endpoint", 3);
        trySnap(el.x + el.width, el.y + el.height, "endpoint", 3);
        // 4 edge midpoints
        trySnap(el.x + el.width / 2, el.y, "midpoint", 2);
        trySnap(el.x + el.width / 2, el.y + el.height, "midpoint", 2);
        trySnap(el.x, el.y + el.height / 2, "midpoint", 2);
        trySnap(el.x + el.width, el.y + el.height / 2, "midpoint", 2);
        // Center
        trySnap(el.x + el.width / 2, el.y + el.height / 2, "center", 2);
      } else if (el.type === "circle") {
        // Center
        trySnap(el.x, el.y, "center", 3);
        // Quadrant points (N, S, E, W)
        trySnap(el.x + el.radius, el.y, "quadrant", 2);
        trySnap(el.x - el.radius, el.y, "quadrant", 2);
        trySnap(el.x, el.y + el.radius, "quadrant", 2);
        trySnap(el.x, el.y - el.radius, "quadrant", 2);
      } else if (el.type === "polyline") {
        for (let i = 0; i < el.points.length; i++) {
          trySnap(el.points[i].x, el.points[i].y, "endpoint", 3);
          if (i < el.points.length - 1) {
            trySnap(
              (el.points[i].x + el.points[i + 1].x) / 2,
              (el.points[i].y + el.points[i + 1].y) / 2,
              "midpoint", 2,
            );
          }
        }
      } else if (el.type === "block") {
        trySnap(el.x, el.y, "endpoint", 3);
        trySnap(el.x + el.width, el.y + el.height, "endpoint", 3);
        trySnap(el.x + el.width / 2, el.y + el.height / 2, "center", 2);
      }
    }

    // ── Pass 2: Intersections ──────────────────────────────
    const segs = lineSegments();
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const pt = segIntersection(
          segs[i].x1, segs[i].y1, segs[i].x2, segs[i].y2,
          segs[j].x1, segs[j].y1, segs[j].x2, segs[j].y2,
        );
        if (pt) trySnap(pt.x, pt.y, "intersection", 2.5);
      }
    }

    // ── Pass 3: Perpendicular (if currently drawing) ──────
    if (drawing && (tool === "line" || tool === "wall" || tool === "polyline" || tool === "dimension")) {
      for (const seg of segs) {
        const perp = nearestOnSeg(wx, wy, seg.x1, seg.y1, seg.x2, seg.y2);
        // Only snap perpendicular if it's actually perpendicular (not an endpoint)
        const dToEnd1 = Math.hypot(perp.x - seg.x1, perp.y - seg.y1);
        const dToEnd2 = Math.hypot(perp.x - seg.x2, perp.y - seg.y2);
        const segLen = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
        if (dToEnd1 > segLen * 0.05 && dToEnd2 > segLen * 0.05) {
          trySnap(perp.x, perp.y, "perpendicular", 1);
        }
      }
    }

    // ── Pass 4: Nearest on line (lowest priority) ─────────
    if (!bestSnap) {
      for (const seg of segs) {
        const near = nearestOnSeg(wx, wy, seg.x1, seg.y1, seg.x2, seg.y2);
        trySnap(near.x, near.y, "nearest", 0);
      }
    }

    return bestSnap;
  };

  const getPos = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = toWorld(sx, sy);

    let finalX = snapToGrid(w.x);
    let finalY = snapToGrid(w.y);

    // Ortho mode: constrain to 0°/90° from the start position when drawing
    if (orthoMode && drawing) {
      const base = getBasePoint();
      const dx = finalX - base.x;
      const dy = finalY - base.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        finalY = base.y; // horizontal lock
      } else {
        finalX = base.x; // vertical lock
      }
    }

    const snapPt = getSnapPoint(finalX, finalY);
    if (snapPt) {
      finalX = snapPt.x;
      finalY = snapPt.y;
    }
    return { sx, sy, wx: finalX, wy: finalY, snapPt, rawX: w.x, rawY: w.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { sx, sy, wx, wy, rawX, rawY } = getPos(e);
    if (tool === "pan" || e.button === 1) {
      panStart.current = { x: sx, y: sy };
      panOrigin.current = { ...pan };
      return;
    }
    // ── OFFSET click handling ──────────────────────────
    if (tool === "offset") {
      if (offsetDist === null) {
        cmdLog("Enter offset distance first in command line.");
        return;
      }
      if (!offsetSourceId) {
        // Step 2: Click a line or polyline to select it
        const hiddenLayers = new Set(
          layers.filter((l) => !l.visible).map((l) => l.name),
        );
        for (let i = elements.length - 1; i >= 0; i--) {
          const el = elements[i];
          if (hiddenLayers.has(el.layer)) continue;
          if (
            (el.type === "line" || el.type === "polyline") &&
            hitTest(el, wx, wy)
          ) {
            setOffsetSourceId(el.id);
            setSelected(el.id);
            cmdLog(`Selected ${el.type} — Click the side to offset to`);
            return;
          }
        }
        cmdLog("No line or polyline found at that location. Click on one.");
        return;
      } else {
        // Step 3: Click side to create parallel copy
        const sourceEl = elements.find((el) => el.id === offsetSourceId);
        if (sourceEl) {
          let newEl: DrawingElement | null = null;
          if (sourceEl.type === "line") {
            newEl = offsetLineElement(sourceEl, offsetDist, rawX, rawY);
          } else if (sourceEl.type === "polyline") {
            newEl = offsetPolylineElement(sourceEl, offsetDist, rawX, rawY);
          }
          if (newEl) {
            setElements((prev) => [...prev, newEl!]);
            cmdLog(
              `Offset created at ${formatUnit(offsetDist, settings)} — Click another line or press Escape`,
            );
          }
        }
        setOffsetSourceId(null);
        setSelected(null);
        return;
      }
    }
    // ── MOVE tool ───────────────────────────────────────────
    if (tool === "move") {
      if (selectedIds.size === 0) {
        cmdLog("Select elements first, then use MOVE");
        setTool("select");
        return;
      }
      if (!moveBasePoint) {
        setMoveBasePoint({ x: wx, y: wy });
        cmdLog("Base point set — click destination point");
        return;
      }
      // Apply displacement
      const dx = wx - moveBasePoint.x;
      const dy = wy - moveBasePoint.y;
      setElements((prev) =>
        prev.map((el) => {
          if (!selectedIds.has(el.id)) return el;
          if (el.type === "line" || el.type === "dimension") return { ...el, x: el.x + dx, y: el.y + dy, x2: el.x2 + dx, y2: el.y2 + dy };
          if (el.type === "polyline") return { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
          return { ...el, x: el.x + dx, y: el.y + dy };
        }),
      );
      cmdLog(`Moved ${selectedIds.size} element(s) by (${dx.toFixed(0)}, ${dy.toFixed(0)})`);
      setMoveBasePoint(null);
      setTool("select");
      return;
    }

    // ── COPY tool ─────────────────────────────────────────
    if (tool === "copy") {
      if (selectedIds.size === 0) {
        cmdLog("Select elements first, then use COPY");
        setTool("select");
        return;
      }
      if (!moveBasePoint) {
        setMoveBasePoint({ x: wx, y: wy });
        cmdLog("Base point set — click destination for copy");
        return;
      }
      const dx = wx - moveBasePoint.x;
      const dy = wy - moveBasePoint.y;
      const copies = elements
        .filter((el) => selectedIds.has(el.id))
        .map((el) => {
          const newId = crypto.randomUUID();
          if (el.type === "line" || el.type === "dimension") return { ...el, id: newId, x: el.x + dx, y: el.y + dy, x2: el.x2 + dx, y2: el.y2 + dy };
          if (el.type === "polyline") return { ...el, id: newId, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
          return { ...el, id: newId, x: el.x + dx, y: el.y + dy };
        });
      setElements((prev) => [...prev, ...copies]);
      cmdLog(`Copied ${copies.length} element(s) — click another destination or Escape`);
      // Keep base point so user can place multiple copies
      return;
    }

    // ── ROTATE tool ───────────────────────────────────────
    if (tool === "rotate") {
      if (selectedIds.size === 0) {
        cmdLog("Select elements first, then use ROTATE");
        setTool("select");
        return;
      }
      if (!rotateBasePoint) {
        setRotateBasePoint({ x: wx, y: wy });
        cmdLog("Base point set — click to set rotation angle");
        return;
      }
      // Compute angle from base point to click
      const angle = Math.atan2(wy - rotateBasePoint.y, wx - rotateBasePoint.x);
      const refAngle = rotateRefAngle ?? 0;
      const deltaAngle = angle - refAngle;
      const cosA = Math.cos(deltaAngle);
      const sinA = Math.sin(deltaAngle);
      const bp = rotateBasePoint;
      const rotPt = (px: number, py: number) => ({
        x: bp.x + (px - bp.x) * cosA - (py - bp.y) * sinA,
        y: bp.y + (px - bp.x) * sinA + (py - bp.y) * cosA,
      });
      setElements((prev) =>
        prev.map((el) => {
          if (!selectedIds.has(el.id)) return el;
          if (el.type === "line" || el.type === "dimension") {
            const p1 = rotPt(el.x, el.y);
            const p2 = rotPt(el.x2, el.y2);
            return { ...el, x: p1.x, y: p1.y, x2: p2.x, y2: p2.y };
          }
          if (el.type === "polyline") {
            return { ...el, points: el.points.map((p) => rotPt(p.x, p.y)) };
          }
          if (el.type === "block") {
            const rp = rotPt(el.x, el.y);
            return { ...el, x: rp.x, y: rp.y, rotation: (el.rotation || 0) + (deltaAngle * 180) / Math.PI };
          }
          const rp = rotPt(el.x, el.y);
          return { ...el, x: rp.x, y: rp.y };
        }),
      );
      cmdLog(`Rotated ${selectedIds.size} element(s) by ${((deltaAngle * 180) / Math.PI).toFixed(1)}°`);
      setRotateBasePoint(null);
      setRotateRefAngle(null);
      setTool("select");
      return;
    }

    // ── MIRROR tool ───────────────────────────────────────
    if (tool === "mirror") {
      if (selectedIds.size === 0) {
        cmdLog("Select elements first, then use MIRROR");
        setTool("select");
        return;
      }
      if (!mirrorP1) {
        setMirrorP1({ x: wx, y: wy });
        cmdLog("First point of mirror line — click second point");
        return;
      }
      // Mirror across the line from mirrorP1 to (wx, wy)
      const mx1 = mirrorP1.x, my1 = mirrorP1.y;
      const mx2 = wx, my2 = wy;
      const mdx = mx2 - mx1, mdy = my2 - my1;
      const mlen2 = mdx * mdx + mdy * mdy;
      if (mlen2 < 1) { cmdLog("Mirror line too short"); return; }
      const mirPt = (px: number, py: number) => {
        const t = ((px - mx1) * mdx + (py - my1) * mdy) / mlen2;
        const projX = mx1 + t * mdx;
        const projY = my1 + t * mdy;
        return { x: 2 * projX - px, y: 2 * projY - py };
      };
      const copies = elements
        .filter((el) => selectedIds.has(el.id))
        .map((el) => {
          const newId = crypto.randomUUID();
          if (el.type === "line" || el.type === "dimension") {
            const p1 = mirPt(el.x, el.y);
            const p2 = mirPt(el.x2, el.y2);
            return { ...el, id: newId, x: p1.x, y: p1.y, x2: p2.x, y2: p2.y };
          }
          if (el.type === "polyline") {
            return { ...el, id: newId, points: el.points.map((p) => mirPt(p.x, p.y)) };
          }
          const rp = mirPt(el.x, el.y);
          return { ...el, id: newId, x: rp.x, y: rp.y };
        });
      setElements((prev) => [...prev, ...copies]);
      cmdLog(`Mirrored ${copies.length} element(s)`);
      setMirrorP1(null);
      setTool("select");
      return;
    }

    // ── TRIM tool ─────────────────────────────────────────
    if (tool === "trim") {
      // Click on a line segment to trim it at the nearest intersection
      const hiddenLayers = new Set(layers.filter((l) => !l.visible).map((l) => l.name));
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (hiddenLayers.has(el.layer)) continue;
        if ((el.type === "line") && hitTest(el, wx, wy)) {
          // Find all intersection points with other lines
          const ints: { x: number; y: number; t: number }[] = [];
          for (const other of elements) {
            if (other.id === el.id || hiddenLayers.has(other.layer)) continue;
            const otherSegs: { x1: number; y1: number; x2: number; y2: number }[] = [];
            if (other.type === "line" || other.type === "dimension") otherSegs.push({ x1: other.x, y1: other.y, x2: other.x2, y2: other.y2 });
            else if (other.type === "polyline") {
              for (let j = 0; j < other.points.length - 1; j++) otherSegs.push({ x1: other.points[j].x, y1: other.points[j].y, x2: other.points[j + 1].x, y2: other.points[j + 1].y });
            } else if (other.type === "rect") {
              const c = [{ x: other.x, y: other.y }, { x: other.x + other.width, y: other.y }, { x: other.x + other.width, y: other.y + other.height }, { x: other.x, y: other.y + other.height }];
              for (let j = 0; j < 4; j++) otherSegs.push({ x1: c[j].x, y1: c[j].y, x2: c[(j + 1) % 4].x, y2: c[(j + 1) % 4].y });
            }
            for (const seg of otherSegs) {
              const pt = segIntersection(el.x, el.y, el.x2, el.y2, seg.x1, seg.y1, seg.x2, seg.y2);
              if (pt) {
                const dx = el.x2 - el.x, dy = el.y2 - el.y;
                const t = Math.abs(dx) > Math.abs(dy) ? (pt.x - el.x) / dx : (pt.y - el.y) / dy;
                ints.push({ ...pt, t });
              }
            }
          }
          if (ints.length === 0) { cmdLog("No intersections found on this line"); return; }
          ints.sort((a, b) => a.t - b.t);
          // Find where the click is on the line (t parameter)
          const ldx = el.x2 - el.x, ldy = el.y2 - el.y;
          const clickT = Math.abs(ldx) > Math.abs(ldy) ? (wx - el.x) / ldx : (wy - el.y) / ldy;
          // Find the two bounding intersections around the click
          let lo = 0, hi = 1;
          for (const ip of ints) {
            if (ip.t < clickT && ip.t > lo) lo = ip.t;
            if (ip.t > clickT && ip.t < hi) hi = ip.t;
          }
          // Remove the segment between lo and hi (trim the clicked portion)
          const newEls: DrawingElement[] = [];
          if (lo > 0.001) {
            newEls.push({ ...el, id: crypto.randomUUID(), x2: el.x + ldx * lo, y2: el.y + ldy * lo });
          }
          if (hi < 0.999) {
            newEls.push({ ...el, id: crypto.randomUUID(), x: el.x + ldx * hi, y: el.y + ldy * hi });
          }
          setElements((prev) => [...prev.filter((e) => e.id !== el.id), ...newEls]);
          cmdLog("Trimmed — click another line or Escape");
          return;
        }
      }
      cmdLog("No line found. Click on a line to trim it.");
      return;
    }

    // ── EXTEND tool ───────────────────────────────────────
    if (tool === "extend") {
      const hiddenLayers = new Set(layers.filter((l) => !l.visible).map((l) => l.name));
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (hiddenLayers.has(el.layer)) continue;
        if (el.type === "line" && hitTest(el, wx, wy)) {
          // Determine which endpoint is closer to click — extend that end
          const d1 = Math.hypot(wx - el.x, wy - el.y);
          const d2 = Math.hypot(wx - el.x2, wy - el.y2);
          const extendStart = d1 < d2;
          // Find nearest intersection along the line's direction with all other segments
          const segs = lineSegments().filter((s) => {
            const isSelf = s.x1 === el.x && s.y1 === el.y && s.x2 === el.x2 && s.y2 === el.y2;
            return !isSelf;
          });
          let bestDist = Infinity;
          let bestPt: { x: number; y: number } | null = null;
          const ldx = el.x2 - el.x, ldy = el.y2 - el.y;
          for (const seg of segs) {
            // Extend the line to infinity in the direction from the extending end
            const bigT = 100;
            let ax: number, ay: number, bx: number, by: number;
            if (extendStart) {
              ax = el.x - ldx * bigT; ay = el.y - ldy * bigT; bx = el.x; by = el.y;
            } else {
              ax = el.x2; ay = el.y2; bx = el.x2 + ldx * bigT; by = el.y2 + ldy * bigT;
            }
            const pt = segIntersection(ax, ay, bx, by, seg.x1, seg.y1, seg.x2, seg.y2);
            if (pt) {
              const d = extendStart ? Math.hypot(pt.x - el.x, pt.y - el.y) : Math.hypot(pt.x - el.x2, pt.y - el.y2);
              if (d < bestDist) { bestDist = d; bestPt = pt; }
            }
          }
          if (bestPt) {
            setElements((prev) =>
              prev.map((e) => {
                if (e.id !== el.id) return e;
                if (extendStart) return { ...e, x: bestPt!.x, y: bestPt!.y };
                return { ...e, x2: bestPt!.x, y2: bestPt!.y };
              }),
            );
            cmdLog("Extended — click another line or Escape");
          } else {
            cmdLog("No boundary found to extend to");
          }
          return;
        }
      }
      cmdLog("No line found. Click on a line to extend it.");
      return;
    }

    // ── FILLET tool (line-line) ──────────────────────────
    if (tool === "fillet") {
      const hiddenLayers = new Set(layers.filter((l) => !l.visible).map((l) => l.name));
      const clickedLine = (() => {
        for (let i = elements.length - 1; i >= 0; i--) {
          const el = elements[i];
          if (hiddenLayers.has(el.layer)) continue;
          if (el.type === "line" && hitTest(el, wx, wy)) return el;
        }
        return null;
      })();

      if (!clickedLine) {
        cmdLog("FILLET: click on a line");
        return;
      }

      if (!filletFirstLineId) {
        setFilletFirstLineId(clickedLine.id);
        cmdLog("FILLET: first line selected, now click second line");
        return;
      }

      if (clickedLine.id === filletFirstLineId) {
        cmdLog("FILLET: choose a different second line");
        return;
      }

      const lineA = elements.find((e) => e.id === filletFirstLineId && e.type === "line") as (DrawingElement & { type: "line" }) | undefined;
      const lineB = clickedLine as DrawingElement & { type: "line" };
      if (!lineA) {
        setFilletFirstLineId(null);
        cmdLog("FILLET: first line no longer exists");
        return;
      }

      const ip = segIntersection(lineA.x, lineA.y, lineA.x2, lineA.y2, lineB.x, lineB.y, lineB.x2, lineB.y2);
      if (!ip) {
        setFilletFirstLineId(null);
        cmdLog("FILLET: lines do not intersect");
        return;
      }

      const radius = Math.max(0, filletRadius);
      const uxA = lineA.x2 - lineA.x;
      const uyA = lineA.y2 - lineA.y;
      const lenA = Math.hypot(uxA, uyA) || 1;
      const ax = uxA / lenA;
      const ay = uyA / lenA;

      const uxB = lineB.x2 - lineB.x;
      const uyB = lineB.y2 - lineB.y;
      const lenB = Math.hypot(uxB, uyB) || 1;
      const bx = uxB / lenB;
      const by = uyB / lenB;

      const nearestEnd = (el: DrawingElement & { type: "line" }, p: { x: number; y: number }) => {
        const d1 = Math.hypot(el.x - p.x, el.y - p.y);
        const d2 = Math.hypot(el.x2 - p.x, el.y2 - p.y);
        return d1 < d2 ? "start" : "end";
      };

      const aSide = nearestEnd(lineA, ip);
      const bSide = nearestEnd(lineB, ip);

      const aTrim = {
        x: ip.x + (aSide === "start" ? ax : -ax) * radius,
        y: ip.y + (aSide === "start" ? ay : -ay) * radius,
      };
      const bTrim = {
        x: ip.x + (bSide === "start" ? bx : -bx) * radius,
        y: ip.y + (bSide === "start" ? by : -by) * radius,
      };

      const arcPts: { x: number; y: number }[] = [];
      const a0 = Math.atan2(aTrim.y - ip.y, aTrim.x - ip.x);
      const a1 = Math.atan2(bTrim.y - ip.y, bTrim.x - ip.x);
      let da = a1 - a0;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      const steps = Math.max(4, Math.min(18, Math.round(Math.abs(da) * 8)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = a0 + da * t;
        arcPts.push({ x: ip.x + Math.cos(a) * radius, y: ip.y + Math.sin(a) * radius });
      }

      const next: DrawingElement[] = [];
      for (const el of elements) {
        if (el.id === lineA.id) {
          next.push(
            aSide === "start"
              ? { ...el, x: aTrim.x, y: aTrim.y }
              : { ...el, x2: aTrim.x, y2: aTrim.y },
          );
        } else if (el.id === lineB.id) {
          next.push(
            bSide === "start"
              ? { ...el, x: bTrim.x, y: bTrim.y }
              : { ...el, x2: bTrim.x, y2: bTrim.y },
          );
        } else {
          next.push(el);
        }
      }
      if (radius > 0) {
        next.push({
          id: crypto.randomUUID(),
          type: "polyline",
          points: arcPts,
          color: lineA.color,
          lineWidth: lineA.lineWidth,
          layer: lineA.layer,
        });
      }

      setElements(next);
      setFilletFirstLineId(null);
      cmdLog("FILLET applied");
      return;
    }

    if (tool === "select") {
      const hiddenLayers = new Set(
        layers.filter((l) => !l.visible).map((l) => l.name),
      );
      const lockedLayers = new Set(
        layers.filter((l) => l.locked).map((l) => l.name),
      );
      let found: string | null = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (hiddenLayers.has(el.layer) || lockedLayers.has(el.layer)) continue;
        if (hitTest(el, rawX, rawY)) {
          found = el.id;
          break;
        }
      }
      // Shift+click for multi-select
      if (e.shiftKey && found) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(found!)) next.delete(found!);
          else next.add(found!);
          return next;
        });
        setSelected(found);
        cmdLog(`Multi-select: ${selectedIds.size + 1} elements`);
      } else {
        setSelected(found);
        setSelectedIds(found ? new Set([found]) : new Set());
      }
      if (found) {
        dragMoveStart.current = { wx, wy };
        isDragging.current = false;
        if (!e.shiftKey) {
          const foundEl = elements.find((e) => e.id === found);
          cmdLog(
            `Selected ${foundEl?.type} on '${foundEl?.layer}' \u2014 drag to move, Del to erase`,
          );
        }
      } else {
        dragMoveStart.current = null;
      }
      return;
    }
    if (tool === "eraser") {
      for (let i = elements.length - 1; i >= 0; i--) {
        if (hitTest(elements[i], rawX, rawY)) {
          setElements((prev) => prev.filter((_, idx) => idx !== i));
          return;
        }
      }
      return;
    }
    if (tool === "text") {
      const text = prompt("Enter text:");
      if (!text) return;
      const el: DrawingElement = {
        id: crypto.randomUUID(),
        type: "text",
        x: wx,
        y: wy,
        color,
        lineWidth,
        text,
        layer: activeLayer,
      };
      setElements((prev) => [...prev, el]);
      return;
    }
    if (tool === "polyline") {
      if (!drawing) {
        setDrawing(true);
        setStartPos({ x: wx, y: wy });
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        setPreviewEl({
          id: "__preview__",
          type: "polyline",
          points: [
            { x: wx, y: wy },
            { x: wx, y: wy },
          ],
          color,
          lineWidth,
          layer: activeLayer,
        });
        cmdLog(
          `Start: ${wx.toFixed(0)}, ${wy.toFixed(0)} — enter length, length<angle, or click next point`,
        );
      } else {
        if (previewEl && previewEl.type === "polyline") {
          const pts = previewEl.points;
          const lastPt = pts[pts.length - 2];
          if (Math.hypot(wx - lastPt.x, wy - lastPt.y) < 2) {
            const finalPts = pts.slice(0, pts.length - 1);
            if (finalPts.length > 1) {
              setElements((prev) => [
                ...prev,
                { ...previewEl, id: crypto.randomUUID(), points: finalPts },
              ]);
            }
            setDrawing(false);
            setPreviewEl(null);
            return;
          }
          setPreviewEl({
            ...previewEl,
            points: [
              ...pts.slice(0, pts.length - 1),
              { x: wx, y: wy },
              { x: wx, y: wy },
            ],
          });
        }
      }
      return;
    }

    // ── Door tool ─────────────────────────────────────────────
    if (tool === "door") {
      const symName = doorSwing === "left" ? "door_swing_left" : "door_swing_right";
      const snap = autoSnapBlock(wx, wy, symName, elements);
      if (snap) {
        const scaleFactor = Math.max(settings.annoScale, 1);
        const doorWidth = settings.doorWidth / scaleFactor;
        const doorDepth = settings.wallThickness / scaleFactor;
        setElements(prev => [...prev, {
          id: crypto.randomUUID(),
          type: "block",
          x: snap.x, y: snap.y,
          width: doorWidth,
          height: doorDepth,
          symbolName: symName,
          rotation: snap.rotation,
          color, lineWidth, layer: "Doors",
        }]);
        cmdLog(`Placed ${doorSwing} swing door on wall`);
      } else {
        cmdLog("No wall found nearby — click closer to a wall");
      }
      return;
    }

    // ── Window tool ───────────────────────────────────────────
    if (tool === "window") {
      const snap = autoSnapBlock(wx, wy, "window", elements);
      if (snap) {
        const scaleFactor = Math.max(settings.annoScale, 1);
        const windowWidth = settings.windowWidth / scaleFactor;
        const windowHeight = settings.windowHeight / scaleFactor;
        setElements(prev => [...prev, {
          id: crypto.randomUUID(),
          type: "block",
          x: snap.x, y: snap.y,
          width: windowWidth,
          height: windowHeight,
          symbolName: "window",
          rotation: snap.rotation,
          color, lineWidth, layer: "Windows",
        }]);
        cmdLog("Placed window on wall");
      } else {
        cmdLog("No wall found nearby — click closer to a wall");
      }
      return;
    }

    // ── Stairs tool ───────────────────────────────────────────
    if (tool === "stairs") {
      const scaleFactor = Math.max(settings.annoScale, 1);
      const stairW = settings.stairWidth / scaleFactor;
      const stairH = settings.stairDepth / scaleFactor;
      setElements(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "rect",
        x: wx - stairW / 2,
        y: wy - stairH / 2,
        width: stairW,
        height: stairH,
        color: layers.find(l => l.name === "Furniture")?.color ?? "#6b7280",
        lineWidth: 2, layer: "Furniture",
        text: "STAIRS",
      }]);
      cmdLog("Placed staircase");
      return;
    }

    // ── Furniture tool ────────────────────────────────────────
    if (tool === "furniture") {
      if (!pendingSymbol) {
        cmdLog("Select a furniture item from the palette first");
        return;
      }
      const symDef = SYMBOL_LIBRARY[pendingSymbol];
      if (!symDef) {
        cmdLog(`Unknown symbol: ${pendingSymbol}`);
        return;
      }
      const scaleFactor = Math.max(settings.annoScale, 1);
      setElements(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "block",
        x: wx, y: wy,
        width: symDef.defaultWidth / scaleFactor,
        height: symDef.defaultHeight / scaleFactor,
        symbolName: pendingSymbol,
        rotation: 0,
        color, lineWidth, layer: "Furniture",
      }]);
      cmdLog(`Placed ${symDef.label}`);
      return;
    }

    // ── Column tool ──────────────────────────────────────────
    if (tool === "column") {
      const colDef = SYMBOL_LIBRARY["column"];
      const structLayerColor = layers.find(l => l.name === "Structure")?.color ?? color;
      setElements(prev => [...prev, {
        id: crypto.randomUUID(),
        type: "block",
        x: wx, y: wy,
        width: colDef.defaultWidth,
        height: colDef.defaultHeight,
        symbolName: "column",
        rotation: 0,
        color: structLayerColor,
        lineWidth: 1,
        layer: "Structure",
      }]);
      cmdLog("Placed column");
      return;
    }

    // ── Sliding Door tool ────────────────────────────────────
    if (tool === "sliding_door") {
      const snap = autoSnapBlock(wx, wy, "sliding_door", elements);
      if (snap) {
        const sdDef = SYMBOL_LIBRARY["sliding_door"];
        const doorLayerColor = layers.find(l => l.name === "Doors")?.color ?? color;
        setElements(prev => [...prev, {
          id: crypto.randomUUID(),
          type: "block",
          x: snap.x, y: snap.y,
          width: sdDef.defaultWidth,
          height: sdDef.defaultHeight,
          symbolName: "sliding_door",
          rotation: snap.rotation,
          color: doorLayerColor,
          lineWidth: 1,
          layer: "Doors",
        }]);
        cmdLog("Placed sliding door");
      } else {
        cmdLog("Click near a wall to place sliding door");
      }
      return;
    }

    // ── Wall tool (continuous polyline-style) ────────────────
    if (tool === "wall") {
      const wallColor = layers.find(l => l.name === "Walls")?.color ?? color;
      const wallLW = settings.wallThickness;
      if (!drawing) {
        setDrawing(true);
        setStartPos({ x: wx, y: wy });
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        setPreviewEl({
          id: "__preview__",
          type: "polyline",
          points: [{ x: wx, y: wy }, { x: wx, y: wy }],
          color: wallColor,
          lineWidth: wallLW,
          layer: "Walls",
        });
        cmdLog(`Wall start: ${wx.toFixed(0)}, ${wy.toFixed(0)} — click next points, Enter/dbl-click to finish`);
      } else {
        if (previewEl && previewEl.type === "polyline") {
          const pts = previewEl.points;
          const firstPt = pts[0];
          const lastPt = pts[pts.length - 2];
          // Close/finish if clicking near previous point (double-click) or near start (close loop)
          const nearStart = pts.length > 3 && Math.hypot(wx - firstPt.x, wy - firstPt.y) < 20 / zoom;
          const nearLast = Math.hypot(wx - lastPt.x, wy - lastPt.y) < 2;
          if (nearLast || nearStart) {
            const finalPts = nearStart
              ? [...pts.slice(0, pts.length - 1), { x: firstPt.x, y: firstPt.y }]
              : pts.slice(0, pts.length - 1);
            finishWallPolyline(finalPts);
            return;
          }
          setPreviewEl({
            ...previewEl,
            points: [
              ...pts.slice(0, pts.length - 1),
              { x: wx, y: wy },
              { x: wx, y: wy },
            ],
          });
        }
      }
      return;
    }

    if (!drawing) {
      setDrawing(true);
      setStartPos({ x: wx, y: wy });
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      cmdLog(
        `Start: ${wx.toFixed(0)}, ${wy.toFixed(0)} — enter length, length<angle, or click next point`,
      );
    } else {
      finishDrawing(wx, wy);
    }
  };

  const finishWallPolyline = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) {
      setDrawing(false);
      setPreviewEl(null);
      return;
    }
    const wallColor = layers.find(l => l.name === "Walls")?.color ?? color;
    const wallLW = settings.wallThickness;
    const newEls: DrawingElement[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      if (Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y) < 1) continue;
      newEls.push({
        id: crypto.randomUUID(),
        type: "line",
        x: pts[i].x, y: pts[i].y,
        x2: pts[i + 1].x, y2: pts[i + 1].y,
        color: wallColor, lineWidth: wallLW, layer: "Walls",
      });
    }
    setElements(prev => mergeCollinearWalls([...prev, ...newEls]));
    setDrawing(false);
    setPreviewEl(null);
    cmdLog(`Wall completed: ${newEls.length} segment${newEls.length > 1 ? "s" : ""}`);
  };

  const finishDrawing = (wx: number, wy: number) => {
    const { x: sx0, y: sy0 } = startPos;
    if (Math.abs(wx - sx0) < 2 && Math.abs(wy - sy0) < 2) {
      setDrawing(false);
      setPreviewEl(null);
      return;
    }
    const id = crypto.randomUUID();
    let el: DrawingElement | null = null;
    if (tool === "line")
      el = {
        id,
        type: "line",
        x: sx0,
        y: sy0,
        x2: wx,
        y2: wy,
        color,
        lineWidth,
        layer: activeLayer,
      };
    else if (tool === "dimension")
      el = {
        id,
        type: "dimension",
        x: sx0,
        y: sy0,
        x2: wx,
        y2: wy,
        color: COLORS.magenta,
        lineWidth,
        layer: activeLayer,
      };
    else if (tool === "rect")
      el = {
        id,
        type: "rect",
        x: sx0,
        y: sy0,
        width: wx - sx0,
        height: wy - sy0,
        color,
        lineWidth,
        layer: activeLayer,
      };
    else if (tool === "circle") {
      const r = Math.sqrt(Math.pow(wx - sx0, 2) + Math.pow(wy - sy0, 2));
      el = {
        id,
        type: "circle",
        x: sx0,
        y: sy0,
        radius: r,
        color,
        lineWidth,
        layer: activeLayer,
      };
    }
    if (el) setElements((prev) => [...prev, el!]);

    if (tool === "line") {
      setStartPos({ x: wx, y: wy });
      setPreviewEl({
        id: "__preview__",
        type: "line",
        x: wx,
        y: wy,
        x2: wx,
        y2: wy,
        color,
        lineWidth,
        layer: activeLayer,
      });
    } else {
      setDrawing(false);
      setPreviewEl(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { sx, sy, wx, wy, snapPt } = getPos(e);
    setCursor({ x: wx, y: wy });
    setSnapPoint(snapPt);
    if (panStart.current) {
      setPan({
        x: panOrigin.current.x + sx - panStart.current.x,
        y: panOrigin.current.y + sy - panStart.current.y,
      });
      return;
    }
    // Drag-to-move selected elements (supports multi-select)
    if (tool === "select" && selectedIds.size > 0 && dragMoveStart.current) {
      let dx = wx - dragMoveStart.current.wx;
      let dy = wy - dragMoveStart.current.wy;
      // Snap-to-grid while dragging
      if (settings.gridSize > 0) {
        dx = Math.round(dx / settings.gridSize) * settings.gridSize;
        dy = Math.round(dy / settings.gridSize) * settings.gridSize;
      }
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        isDragging.current = true;
        const ids = selectedIds;
        setElements((prev) =>
          prev.map((el) => {
            if (!ids.has(el.id)) return el;
            if (el.type === "line" || el.type === "dimension") {
              return {
                ...el,
                x: el.x + dx,
                y: el.y + dy,
                x2: (el.x2 ?? 0) + dx,
                y2: (el.y2 ?? 0) + dy,
              };
            } else if (el.type === "polyline") {
              return {
                ...el,
                points: el.points.map((p) => ({
                  x: p.x + dx,
                  y: p.y + dy,
                })),
              };
            } else {
              return { ...el, x: el.x + dx, y: el.y + dy };
            }
          }),
        );
        dragMoveStart.current = { wx: dragMoveStart.current.wx + dx, wy: dragMoveStart.current.wy + dy };
      }
      return;
    }
    if (!drawing) return;
    if (previewEl && previewEl.type === "polyline") {
      const pts = previewEl.points;
      setPreviewEl({
        ...previewEl,
        points: [...pts.slice(0, pts.length - 1), { x: wx, y: wy }],
      });
      return;
    }
    const { x: sx0, y: sy0 } = startPos;
    const previewBase = {
      id: "__preview__",
      x: sx0,
      y: sy0,
      color,
      lineWidth,
      layer: activeLayer,
    };
    if (tool === "line" || tool === "dimension") {
      setPreviewEl({
        ...previewBase,
        type: tool === "dimension" ? "dimension" : "line",
        x2: wx,
        y2: wy,
      });
    } else if (tool === "rect") {
      setPreviewEl({
        ...previewBase,
        type: "rect",
        width: wx - sx0,
        height: wy - sy0,
      });
    } else if (tool === "circle") {
      const r = Math.sqrt(Math.pow(wx - sx0, 2) + Math.pow(wy - sy0, 2));
      setPreviewEl({ ...previewBase, type: "circle", radius: r });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // End drag-to-move
    if (tool === "select" && dragMoveStart.current) {
      dragMoveStart.current = null;
      if (isDragging.current) {
        isDragging.current = false;

        // Auto-snap single block drops (doors/windows into walls)
        if (selectedIds.size === 1) {
          const id = Array.from(selectedIds)[0];
          const el = elements.find(e => e.id === id);
          if (el && el.type === "block") {
            const snap = autoSnapBlock(el.x, el.y, el.symbolName, elements.filter(e => e.id !== id));
            if (snap) {
              setElements(prev => prev.map(p => p.id === id ? { ...p, x: snap.x, y: snap.y, rotation: snap.rotation } : p));
              cmdLog(`Auto-snapped ${el.symbolName} to wall.`);
              return;
            }
          }
        }

        cmdLog("Element moved");
      }
      return;
    }
    if (panStart.current) {
      panStart.current = null;
      return;
    }
    if (!drawing) return;
    if (tool === "polyline" || tool === "wall") return; // Click-based tools

    const dist = Math.hypot(
      e.clientX - dragStartPos.current.x,
      e.clientY - dragStartPos.current.y,
    );
    if (dist > 5) {
      const { wx, wy } = getPos(e);
      finishDrawing(wx, wy);
    }
  };

  function hitTest(el: DrawingElement, wx: number, wy: number): boolean {
    const tol = 8 / zoom;
    if (el.type === "line" || el.type === "dimension") {
      return distToSeg(wx, wy, el.x, el.y, el.x2 ?? el.x, el.y2 ?? el.y) < tol;
    } else if (el.type === "rect") {
      const r = { x: el.x, y: el.y, w: el.width ?? 0, h: el.height ?? 0 };
      return (
        wx >= r.x - tol &&
        wx <= r.x + r.w + tol &&
        wy >= r.y - tol &&
        wy <= r.y + r.h + tol
      );
    } else if (el.type === "circle") {
      const d = Math.sqrt(Math.pow(wx - el.x, 2) + Math.pow(wy - el.y, 2));
      return Math.abs(d - (el.radius ?? 0)) < tol;
    } else if (el.type === "polyline") {
      for (let i = 0; i < el.points.length - 1; i++) {
        if (
          distToSeg(
            wx,
            wy,
            el.points[i].x,
            el.points[i].y,
            el.points[i + 1].x,
            el.points[i + 1].y,
          ) < tol
        )
          return true;
      }
      return false;
    } else if (el.type === "text") {
      return Math.abs(wx - el.x) < 30 && Math.abs(wy - el.y) < 12;
    } else if (el.type === "block") {
      const symDef = SYMBOL_LIBRARY[el.symbolName];
      const ax = symDef?.anchorX ?? 0.5;
      const ay = symDef?.anchorY ?? 0.5;

      const rot = ((el.rotation || 0) * Math.PI) / 180;
      const flipX = el.flipX ? -1 : 1;
      const flipY = el.flipY ? -1 : 1;

      // 1. Inverse Translate
      const dx = wx - el.x;
      const dy = wy - el.y;

      // 2. Inverse Rotate
      const cosR = Math.cos(-rot);
      const sinR = Math.sin(-rot);
      const rx = dx * cosR - dy * sinR;
      const ry = dx * sinR + dy * cosR;

      // 3. Inverse Scale (flip)
      // Since scaling is just 1 or -1, multiplying is the same as dividing.
      const lx = rx * flipX;
      const ly = ry * flipY;

      // Local Bounding Box (at origin)
      const minX = -el.width * ax;
      const minY = -el.height * ay;

      return (
        lx >= minX - tol &&
        lx <= minX + el.width + tol &&
        ly >= minY - tol &&
        ly <= minY + el.height + tol
      );
    }
    return false;
  }

  function distToSeg(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
  ) {
    const dx = bx - ax,
      dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 === 0
        ? 0
        : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    return Math.sqrt(
      Math.pow(px - (ax + t * dx), 2) + Math.pow(py - (ay + t * dy), 2),
    );
  }

  function autoSnapBlock(wx: number, wy: number, symbolName: string, elements: DrawingElement[]) {
    // Only auto-snap wall-mounted elements
    const wallMounted = ["door_swing_right", "door_swing_left", "window", "garage", "sliding_door", "garage_door"];
    if (!wallMounted.includes(symbolName)) return null;

    // Large snap radius so user doesn't have to be pixel-perfect
    const SNAP_DIST = 800;
    let bestWall: (DrawingElement & { type: "line" }) | null = null;
    let minDist = SNAP_DIST;
    let projX = wx;
    let projY = wy;
    let wallDx = 0;
    let wallDy = 0;

    // Only consider wall lines (thick lines on the Walls layer)
    for (const el of elements) {
      if (el.type !== "line") continue;
      if (el.layer !== "Walls") continue;

      const dx = el.x2 - el.x;
      const dy = el.y2 - el.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq < 1) continue;

      // Project click point onto the wall segment, clamped to [0,1]
      const t = Math.max(0, Math.min(1, ((wx - el.x) * dx + (wy - el.y) * dy) / lenSq));
      const cx = el.x + t * dx;
      const cy = el.y + t * dy;

      const dist = Math.hypot(wx - cx, wy - cy);
      if (dist < minDist) {
        minDist = dist;
        bestWall = el as DrawingElement & { type: "line" };
        projX = cx;
        projY = cy;
        wallDx = dx;
        wallDy = dy;
      }
    }

    if (!bestWall) return null;

    // Determine if wall is horizontal or vertical
    const isHoriz = Math.abs(wallDy) < Math.abs(wallDx);
    // For horizontal walls: block is placed with 0° rotation (width along X)
    // For vertical walls: block is placed with 90° rotation (width along Y)
    const rotDeg = isHoriz ? 0 : 90;

    // Snap the projected point to exactly the wall's fixed coordinate
    // so the element sits precisely on the wall centerline
    if (isHoriz) {
      // Lock Y to the wall's Y (constant Y for horizontal wall)
      projY = bestWall.y;
    } else {
      // Lock X to the wall's X (constant X for vertical wall)
      projX = bestWall.x;
    }

    return { x: projX, y: projY, rotation: rotDeg, isHorizontalWall: isHoriz };
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Always allow Ctrl+Z/Y regardless of focus
      if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
        return;
      }
      if (e.key.toLowerCase() === "y" && (e.ctrlKey || e.metaKey)) {
        redo();
        e.preventDefault();
        return;
      }

      // F8 = Ortho toggle (always works, like AutoCAD)
      if (e.key === "F8") {
        setOrthoMode((v) => {
          cmdLog(v ? "Ortho OFF" : "Ortho ON");
          return !v;
        });
        e.preventDefault();
        return;
      }

      // If command input is focused, let it handle its own keys
      if (e.target === cmdInputRef.current) return;

      if (
        e.key === "Enter" &&
        (tool === "polyline" || tool === "wall") &&
        previewEl &&
        previewEl.type === "polyline"
      ) {
        const pts = previewEl.points;
        const finalPts = pts.slice(0, pts.length - 1);
        if (finalPts.length > 1) {
          if (tool === "wall") {
            finishWallPolyline(finalPts);
          } else {
            setElements((prev) => [
              ...prev,
              { ...previewEl, id: crypto.randomUUID(), points: finalPts },
            ]);
            cmdLog("Polyline completed");
            setDrawing(false);
            setPreviewEl(null);
          }
        } else {
          setDrawing(false);
          setPreviewEl(null);
        }
        return;
      }

      // Copy (Ctrl+C)
      if (e.key.toLowerCase() === "c" && (e.ctrlKey || e.metaKey)) {
        if (selectedIds.size > 0) {
          const copied = elements.filter(el => selectedIds.has(el.id));
          setClipboard(copied);
          cmdLog(`Copied ${copied.length} elements to clipboard`);
        }
        e.preventDefault();
        return;
      }

      // Paste (Ctrl+V)
      if (e.key.toLowerCase() === "v" && (e.ctrlKey || e.metaKey)) {
        if (clipboard.length > 0) {
          // Offset pasted elements slightly so they don't exactly overlap
          const pasted = clipboard.map(el => {
            const newEl = { ...el, id: crypto.randomUUID() };
            if (newEl.type === "line" || newEl.type === "dimension") {
              newEl.x += 200; newEl.y += 200;
              newEl.x2 = (newEl.x2 ?? 0) + 200; newEl.y2 = (newEl.y2 ?? 0) + 200;
            } else if (newEl.type === "polyline") {
              newEl.points = newEl.points.map(p => ({ x: p.x + 200, y: p.y + 200 }));
            } else {
              newEl.x += 200; newEl.y += 200;
            }
            return newEl;
          });
          setElements(prev => [...prev, ...pasted]);
          // Select newly pasted elements
          setSelectedIds(new Set(pasted.map(el => el.id)));
          setSelected(pasted[0]?.id || null);
          cmdLog(`Pasted ${pasted.length} elements`);
        }
        e.preventDefault();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size > 0) {
          setElements((prev) => prev.filter((el) => !selectedIds.has(el.id)));
          cmdLog(`Deleted ${selectedIds.size} elements`);
        } else if (selected) {
          setElements((prev) => prev.filter((el) => el.id !== selected));
          cmdLog("Element deleted");
        }
        setSelected(null);
        setSelectedIds(new Set());
      }
      if (e.key === "Escape") {
        if (drawing) cmdLog("Cancelled");
        if (tool === "offset") {
          setOffsetDist(null);
          setOffsetSourceId(null);
          cmdLog("Offset cancelled");
        }
        setSelected(null);
        setSelectedIds(new Set());
        setDrawing(false);
        setPreviewEl(null);
      }

      // Focus command line on any letter/number key press
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        cmdInputRef.current?.focus();
        setCmdInput(e.key);
        e.preventDefault();
      }
    },
    [selected, selectedIds, elements, clipboard, undo, redo, tool, previewEl, drawing, cmdLog, orthoMode],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Persist drawing to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ pages, activePageId, layers, activeLayer }),
      );
    } catch {
      /* storage full, ignore */
    }
  }, [pages, activePageId, layers, activeLayer]);

  // Auto-scroll command history
  useEffect(() => {
    if (cmdHistoryRef.current) {
      cmdHistoryRef.current.scrollTop = cmdHistoryRef.current.scrollHeight;
    }
  }, [cmdHistory]);

  const exportSVG = () => {
    const lines = elements
      .map((el) => {
        if (el.type === "line")
          return `<line x1="${el.x}" y1="${el.y}" x2="${el.x2}" y2="${el.y2}" stroke="${el.color}" stroke-width="${el.lineWidth}"/>`;
        if (el.type === "polyline")
          return `<polyline points="${el.points.map((p) => `${p.x},${p.y}`).join(" ")}" stroke="${el.color}" stroke-width="${el.lineWidth}" fill="none"/>`;
        if (el.type === "rect")
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" stroke="${el.color}" stroke-width="${el.lineWidth}" fill="none"/>`;
        if (el.type === "circle")
          return `<circle cx="${el.x}" cy="${el.y}" r="${el.radius}" stroke="${el.color}" stroke-width="${el.lineWidth}" fill="none"/>`;
        if (el.type === "text")
          return `<text x="${el.x}" y="${el.y}" fill="${el.color}" font-size="12">${el.text}</text>`;
        return "";
      })
      .join("\n");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000" style="background:#141414">\n${lines}\n</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "architectural-drawing.svg";
    a.click();
  };

  // ── CAD-style SVG icons ───────────────────────────────────
  const cadIcon = (d: string, vb = "0 0 24 24") => (
    <svg width="16" height="16" viewBox={vb} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );

  const toolDefs: {
    id: Tool;
    icon: React.ReactNode;
    label: string;
    key: string;
  }[] = [
      {
        id: "wall",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="4" x2="12" y2="12" />
            <line x1="8" y1="12" x2="8" y2="20" />
            <line x1="16" y1="12" x2="16" y2="20" />
          </svg>
        ),
        label: "Wall (W)",
        key: "W",
      },
      {
        id: "door",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <circle cx="16" cy="12" r="1.2" fill="currentColor" />
            <path d="M5 21 Q5 10 16 3" strokeDasharray="2 2" />
          </svg>
        ),
        label: "Door (D)",
        key: "D",
      },
      {
        id: "window",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="12" rx="1" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        ),
        label: "Window (WIN)",
        key: "WIN",
      },
      {
        id: "stairs",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,20 4,16 8,16 8,12 12,12 12,8 16,8 16,4 20,4" />
          </svg>
        ),
        label: "Stairs (ST)",
        key: "ST",
      },
      {
        id: "furniture",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="8" width="16" height="8" rx="2" />
            <rect x="6" y="6" width="12" height="2" rx="1" />
            <line x1="6" y1="16" x2="6" y2="19" />
            <line x1="18" y1="16" x2="18" y2="19" />
          </svg>
        ),
        label: "Furniture (FUR)",
        key: "FUR",
      },
      {
        id: "column",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="1" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="1" />
          </svg>
        ),
        label: "Column (COL)",
        key: "COL",
      },
      {
        id: "sliding_door",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="8" height="12" />
            <rect x="13" y="6" width="8" height="12" />
            <line x1="7" y1="12" x2="10" y2="12" strokeWidth="1" strokeDasharray="2 1" />
            <line x1="17" y1="12" x2="14" y2="12" strokeWidth="1" strokeDasharray="2 1" />
          </svg>
        ),
        label: "Sliding Door (SD)",
        key: "SD",
      },
    ];

  const getCursorStyle = () => {
    if (tool === "pan") return "grab";
    if (tool === "select") return "default";
    if (tool === "eraser") return "cell";
    return "crosshair";
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#141414",
          colorPrimary: "#00e5ff",
          borderRadius: 2,
        },
      }}
    >
      <div
        id="arch-studio-root"
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none"
        style={{
          background: COLORS.bg,
          fontFamily: "'Roboto Mono', monospace",
        }}
      >
        {/* ── Loading overlay while fetching project data ── */}
        {apiLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: COLORS.bg }}>
            <div className="flex flex-col items-center gap-3">
              <LoadingOutlined style={{ fontSize: 32, color: COLORS.accent }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>
                Loading project…
              </span>
            </div>
          </div>
        )}

        {/* ── Top Menu Bar ──────────────────────────────── */}
        <div
          className="flex items-center gap-0 px-2 h-12 shrink-0"
          style={{
            background: COLORS.toolbar,
            borderBottom: `1px solid ${COLORS.toolbarBorder}`,
          }}
        >
          <Link
            to={projectId ? `/builder/project/$projectId` as any : "/builder"}
            params={projectId ? { projectId } : undefined}
            className="flex flex-col items-center justify-center gap-0.5 mr-4 px-2 py-1 rounded transition-all hover:bg-white/10"
            title="Exit Studio"
            style={{ color: COLORS.muted }}
          >
            <ArrowLeftOutlined style={{ fontSize: 16 }} />
            <span className="text-[8px] uppercase tracking-wider">Back</span>
          </Link>
          {projectName && (
            <div
              className="flex items-center gap-2 mr-4 px-3 py-1 rounded"
              style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)" }}
            >
              <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: COLORS.accent }}>
                {projectName}
              </span>
            </div>
          )}
          {projectId && (
            <div className="mr-4 flex items-center gap-2 px-2 py-0.5 rounded-full bg-black/20 border border-white/5">
              {isSaving ? (
                <>
                  <LoadingOutlined className="text-[10px]" style={{ color: COLORS.cyan }} />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Saving...</span>
                </>
              ) : lastSavedAt ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Saved</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest">Unsaved</span>
                </>
              )}
            </div>
          )}
          <div
            className="w-px h-6 mr-4"
            style={{ background: COLORS.toolbarBorder }}
          />
          <div className="flex items-center">
            {[
              {
                label: "File",
                items: [
                  {
                    label: "New Drawing",
                    action: () => {
                      if (confirm("Clear all?")) {
                        const freshPage: StudioPage = {
                          id: "page-1",
                          name: "Page 1",
                          elements: [],
                        };
                        setPages([freshPage]);
                        setActivePageId(freshPage.id);
                        resetElements([]);
                        setLayers(DEFAULT_LAYERS);
                        setActiveLayer("Layer 0");
                        clearTransientDrawingState();
                        pageHistoryMap.current.clear();
                        localStorage.removeItem(STORAGE_KEY);
                        cmdLog("Started a new drawing");
                      }
                    },
                  },
                  {
                    label: "Open Project...",
                    action: () => setShowOpenProject(true),
                  },
                  ...(projectIdNum ? [{
                    label: "Save Drawing",
                    action: () => saveToApi(true),
                  }] : []),
                  { label: "Export SVG", action: exportSVG },
                  {
                    label: "Print...",
                    action: () => cmdLog("Print: Use browser print (Ctrl+P)"),
                  },
                ],
              },
              {
                label: "Edit",
                items: [
                  { label: "Undo (Ctrl+Z)", action: undo },
                  { label: "Redo (Ctrl+Y)", action: redo },
                  {
                    label: "Delete Selected",
                    action: () => {
                      if (selected) {
                        setElements((p) => p.filter((e) => e.id !== selected));
                        setSelected(null);
                        cmdLog("Deleted");
                      }
                    },
                  },
                ],
              },
              {
                label: "View",
                items: [
                  {
                    label: "Zoom Extents (Z, E)",
                    action: () => zoomToFit(elements),
                  },
                  {
                    label: "Zoom 100%",
                    action: () => {
                      setPan({ x: 0, y: 0 });
                      setZoom(1);
                    },
                  },
                  { label: "Pan Hand", action: () => setTool("pan") },
                  {
                    label: viewMode === "2d" ? "Switch to 3D View" : "Switch to 2D View",
                    action: () => setViewMode(viewMode === "2d" ? "3d" : "2d"),
                  },
                ],
              },
              {
                label: "Format",
                items: [
                  {
                    label: "Layer Properties...",
                    action: () => cmdLog("Use the Layers panel on the right"),
                  },
                  {
                    label: "Drawing Settings...",
                    action: () => setShowSettings(true),
                  },
                ],
              },
              {
                label: "Draw",
                items: [
                  { label: "Line", action: () => processCommand("l") },
                  { label: "Polyline", action: () => processCommand("pl") },
                  { label: "Wall", action: () => processCommand("w") },
                  { label: "Rectangle", action: () => processCommand("rec") },
                  { label: "Circle", action: () => processCommand("c") },
                  { label: "Text", action: () => processCommand("t") },
                ],
              },
              {
                label: "Dimension",
                items: [
                  { label: "Linear", action: () => processCommand("dim") },
                ],
              },
              {
                label: "Modify",
                items: [
                  { label: "Erase", action: () => setTool("eraser") },
                  { label: "Offset", action: () => processCommand("o") },
                  { label: "Move / Select", action: () => setTool("select") },
                ],
              },
              {
                label: "Help",
                items: [
                  { label: "AI Draw Agent", action: () => setTool("agent") },
                  {
                    label: "Command Reference",
                    action: () =>
                      cmdLog(
                        "Type a command (L, PL, REC, C, DIM, O, AI) or press Help",
                      ),
                  },
                ],
              },
            ].map((menu, menuIdx) => (
              <Dropdown
                key={menu.label}
                menu={{
                  items: menu.items.map((it, i) => ({
                    key: `${menuIdx}-${i}`,
                    label: it.label,
                    onClick: it.action,
                  })),
                }}
                trigger={["click", "hover"]}
                getPopupContainer={(trigger) =>
                  trigger.parentNode as HTMLElement
                }
              >
                <button
                  className="text-xs px-3 py-1 h-8 hover:bg-white/10 transition-colors"
                  style={{ color: COLORS.white }}
                >
                  {menu.label}
                </button>
              </Dropdown>
            ))}
          </div>
          <div
            className="ml-3 flex items-center gap-1"
            style={{
              borderLeft: `1px solid ${COLORS.toolbarBorder}`,
              paddingLeft: 8,
            }}
          >
            {/* Compact page selector dropdown */}
            <Dropdown
              menu={{
                items: [
                  ...pages.map((page, idx) => ({
                    key: page.id,
                    label: (
                      <span style={{
                        fontWeight: activePageId === page.id ? 700 : 400,
                        color: activePageId === page.id ? COLORS.cyan : COLORS.white,
                      }}>
                        {idx + 1}. {page.name}
                      </span>
                    ),
                    onClick: () => switchPage(page.id),
                  })),
                  { type: "divider" as const, key: "div" },
                  {
                    key: "add",
                    label: <span style={{ color: COLORS.cyan }}>+ New Page</span>,
                    onClick: addPage,
                  },
                ],
              }}
              trigger={["click"]}
              getPopupContainer={(trigger) =>
                trigger.parentNode as HTMLElement
              }
            >
              <button
                className="text-[10px] px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors hover:bg-white/10"
                style={{
                  color: COLORS.white,
                  background: COLORS.highlight,
                  border: `1px solid ${COLORS.accent}`,
                  maxWidth: 180,
                }}
                title="Switch page"
              >
                <span className="truncate">{activePage?.name || "Page 1"}</span>
                <span style={{ fontSize: 8, opacity: 0.6 }}>▼</span>
                <span
                  className="ml-0.5 px-1 rounded"
                  style={{
                    background: COLORS.accent + "44",
                    color: COLORS.cyan,
                    fontSize: 9,
                  }}
                >
                  {pages.length}
                </span>
              </button>
            </Dropdown>

            {/* Page actions menu */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "add",
                    label: "+ Add Page",
                    onClick: addPage,
                  },
                  {
                    key: "dup",
                    label: "⧉ Duplicate",
                    onClick: duplicateActivePage,
                  },
                  {
                    key: "rename",
                    label: "✎ Rename",
                    onClick: renameActivePage,
                  },
                  { type: "divider" as const, key: "div2" },
                  {
                    key: "del",
                    label: <span style={{ color: COLORS.red }}>✕ Delete Page</span>,
                    onClick: deleteActivePage,
                  },
                ],
              }}
              trigger={["click"]}
              getPopupContainer={(trigger) =>
                trigger.parentNode as HTMLElement
              }
            >
              <button
                className="text-[10px] px-1.5 py-1 rounded hover:bg-white/10 transition-colors"
                style={{
                  color: COLORS.muted,
                  border: `1px solid ${COLORS.toolbarBorder}`,
                }}
                title="Page actions"
              >
                ⋯
              </button>
            </Dropdown>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px]" style={{ color: COLORS.muted }}>
              {elements.length} object{elements.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
              className="text-[10px] px-2.5 py-0.5 rounded font-bold tracking-wider uppercase transition-all duration-200"
              style={{
                color: viewMode === "3d" ? "#22d3ee" : COLORS.muted,
                background: viewMode === "3d" ? "#22d3ee18" : "transparent",
                border: viewMode === "3d" ? "1px solid #22d3ee55" : `1px solid ${COLORS.toolbarBorder}`,
              }}
              title="Toggle 2D / 3D view"
            >
              {viewMode === "2d" ? "3D" : "2D"}
            </button>
            <button
              onClick={() => {
                if (viewMode === "3d") { zoomIn3DRef.current?.(); return; }
                const canvas = canvasRef.current;
                if (!canvas) return;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const newZoom = zoom * 1.3;
                setPan({ x: cx - (cx - pan.x) * (newZoom / zoom), y: cy - (cy - pan.y) * (newZoom / zoom) });
                setZoom(newZoom);
              }}
              className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
              style={{ color: COLORS.cyan, border: `1px solid ${COLORS.cyan}44` }}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => {
                if (viewMode === "3d") { zoomOut3DRef.current?.(); return; }
                const canvas = canvasRef.current;
                if (!canvas) return;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const newZoom = zoom / 1.3;
                setPan({ x: cx - (cx - pan.x) * (newZoom / zoom), y: cy - (cy - pan.y) * (newZoom / zoom) });
                setZoom(newZoom);
              }}
              className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
              style={{ color: COLORS.cyan, border: `1px solid ${COLORS.cyan}44` }}
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={() => {
                if (viewMode === "3d") { resetView3DRef.current?.(); return; }
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
              style={{
                color: COLORS.cyan,
                border: `1px solid ${COLORS.cyan}44`,
              }}
              title="Reset View"
            >
              Reset View
            </button>
            {elements.length > 0 && (
              <button
                onClick={() => {
                  if (viewMode === "3d") return;
                  zoomToFit(elements);
                }}
                className={`text-[10px] px-2 py-0.5 rounded ${viewMode === "3d" ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
                style={{
                  color: COLORS.cyan,
                  border: `1px solid ${COLORS.cyan}44`,
                }}
                title={viewMode === "3d" ? "3D view cannot be auto-fit here" : "Zoom to Fit"}
              >
                Zoom to Fit
              </button>
            )}

            {/* Print Drawings */}
            {elements.length > 0 && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "floor-plan",
                      label: "🏠 Floor Plan",
                      onClick: () => {
                        setShowPrintFloorPlan(true);
                      },
                    },
                    { key: "elevations", label: "🏗 Elevations", onClick: () => setShowPrintElevations(true) },
                    { key: "section", label: "📐 Cross-Section", onClick: () => setShowPrintSection(true) },
                  ],
                }}
                trigger={["click"]}
                getPopupContainer={() => document.getElementById("arch-studio-root")!}
              >
                <button
                  className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
                  style={{
                    color: "#4caf50",
                    border: "1px solid #4caf5044",
                  }}
                  title="Print architectural drawings (A3)"
                >
                  🖨 Print ▾
                </button>
              </Dropdown>
            )}

            {/* Proper App Links */}
            <div
              className="flex items-center gap-2 pl-3 ml-2 border-l"
              style={{ borderColor: COLORS.toolbarBorder }}
            >
              <ProfileDropdown />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Toolbar ─────────────────────────────── */}
          <div
            className="flex flex-col gap-1.5 p-1 w-12 shrink-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden items-center"
            style={{
              background: COLORS.toolbar,
              borderRight: `1px solid ${COLORS.toolbarBorder}`,
              scrollbarWidth: "none",
            }}
          >
            <Tooltip
              placement="right"
              title="Undo (Ctrl+Z)"
              getPopupContainer={() =>
                document.getElementById("arch-studio-root")!
              }
            >
              <Button
                type="text"
                onClick={undo}
                disabled={!canUndo}
                icon={<UndoOutlined />}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
              />
            </Tooltip>
            <Tooltip
              placement="right"
              title="Redo (Ctrl+Y)"
              getPopupContainer={() =>
                document.getElementById("arch-studio-root")!
              }
            >
              <Button
                type="text"
                onClick={redo}
                disabled={!canRedo}
                icon={<RedoOutlined />}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white mb-1"
              />
            </Tooltip>
            <div
              className="w-full h-px mb-1 mx-2 shrink-0"
              style={{ background: COLORS.toolbarBorder }}
            />

            {toolDefs.map((t) => (
              <Tooltip
                key={t.id}
                placement="right"
                title={`${t.label} (${t.key})`}
                getPopupContainer={() =>
                  document.getElementById("arch-studio-root")!
                }
              >
                <Button
                  type="text"
                  onClick={() => {
                    if (drawing) {
                      setDrawing(false);
                      setPreviewEl(null);
                    }
                    setTool(t.id);
                    cmdLog(
                      `Command: ${t.id.toUpperCase()} — ${getToolPrompt(t.id)}`,
                    );
                  }}
                  className="w-8 h-8 flex items-center justify-center transition-all"
                  icon={t.icon}
                  style={{
                    color: tool === t.id ? COLORS.cyan : "#9E9E9E",
                    background:
                      tool === t.id ? COLORS.highlight : "transparent",
                    border:
                      tool === t.id
                        ? `1px solid ${COLORS.accent}`
                        : "1px solid transparent",
                  }}
                />
              </Tooltip>
            ))}
          </div>

          {/* ── Canva-style Elements Sidebar ─────────────── */}
          {elementsSidebarOpen && (
            <div
              className="flex flex-col shrink-0 overflow-hidden"
              style={{
                width: 220,
                background: COLORS.toolbar,
                borderRight: `1px solid ${COLORS.toolbarBorder}`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: COLORS.toolbarBorder }}>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.white }}>Elements</span>
                <button
                  onClick={() => setElementsSidebarOpen(false)}
                  className="text-[14px] w-5 h-5 flex items-center justify-center rounded hover:bg-white/10"
                  style={{ color: COLORS.muted }}
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="px-2 py-1.5 border-b" style={{ borderColor: COLORS.toolbarBorder }}>
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search elements..."
                  className="w-full px-2 py-1 rounded text-[11px] outline-none"
                  style={{
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.toolbarBorder}`,
                    color: COLORS.white,
                  }}
                />
              </div>

              {/* Categories */}
              <div className="flex-1 overflow-y-auto px-1 py-1" style={{ scrollbarWidth: "thin" }}>
                {[
                  { category: "Doors & Windows", icon: "🚪", items: ["door_swing_right", "door_swing_left", "sliding_door", "garage_door", "window"] },
                  { category: "Bathroom", icon: "🚿", items: ["toilet", "basin", "bathtub", "shower"] },
                  { category: "Kitchen", icon: "🍳", items: ["stove", "sink", "fridge", "kitchen_counter"] },
                  { category: "Bedroom", icon: "🛏", items: ["bed_single", "bed_double"] },
                  { category: "Living Room", icon: "🛋", items: ["sofa", "dining_table", "tv_unit"] },
                  { category: "Structure", icon: "🏗", items: ["stairs", "column", "elevator", "escalator", "garage"] },
                  { category: "Trees & Vegetation", icon: "🌳", items: ["tree_deciduous", "tree_palm", "tree_conifer", "shrub", "hedge", "flower_bed", "garden_bed", "lawn"] },
                  { category: "Property & Boundaries", icon: "🧱", items: ["boundary_fence", "boundary_wall", "gate"] },
                  { category: "Site & Outdoor", icon: "🏊", items: ["pool", "septic_tank", "parking", "driveway", "veranda", "paved_area"] },
                  { category: "Utilities", icon: "🔧", items: ["water_tank", "borehole", "fire_pit", "clothesline"] },
                ].map(group => {
                  const searchLower = sidebarSearch.toLowerCase();
                  const filteredItems = searchLower
                    ? group.items.filter(sym => {
                        const def = SYMBOL_LIBRARY[sym];
                        return def && (def.label.toLowerCase().includes(searchLower) || sym.toLowerCase().includes(searchLower));
                      })
                    : group.items;

                  if (searchLower && filteredItems.length === 0) return null;

                  const isExpanded = expandedCategories.has(group.category) || !!searchLower;

                  return (
                    <div key={group.category} className="mb-0.5">
                      {/* Category header — collapsible */}
                      <button
                        onClick={() => {
                          setExpandedCategories(prev => {
                            const next = new Set(prev);
                            if (next.has(group.category)) next.delete(group.category);
                            else next.add(group.category);
                            return next;
                          });
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-[12px]">{group.icon}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider flex-1" style={{ color: COLORS.white }}>
                          {group.category}
                        </span>
                        <span className="text-[10px]" style={{ color: COLORS.muted, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                          ▶
                        </span>
                      </button>

                      {/* Items grid */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 gap-1 px-1 pb-1.5">
                          {(searchLower ? filteredItems : group.items).map(sym => {
                            const def = SYMBOL_LIBRARY[sym];
                            if (!def) return null;
                            const isActive = pendingSymbol === sym;
                            return (
                              <button
                                key={sym}
                                onClick={() => {
                                  setPendingSymbol(sym);
                                  setTool("furniture");
                                  cmdLog(`Selected: ${def.label} — Click to place`);
                                }}
                                className="flex flex-col items-center gap-0.5 p-1.5 rounded transition-all border"
                                title={def.label}
                                style={{
                                  background: isActive ? COLORS.highlight : COLORS.bg,
                                  borderColor: isActive ? COLORS.cyan : COLORS.toolbarBorder,
                                }}
                              >
                                {/* SVG thumbnail */}
                                <div className="w-10 h-10 flex items-center justify-center rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                                  <img
                                    src={def.src}
                                    alt={def.label}
                                    className="max-w-full max-h-full object-contain"
                                    style={{ filter: isActive ? "brightness(1.3)" : "brightness(0.85)" }}
                                    draggable={false}
                                  />
                                </div>
                                <span
                                  className="text-[8px] leading-tight text-center truncate w-full"
                                  style={{ color: isActive ? COLORS.cyan : COLORS.muted }}
                                >
                                  {def.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sidebar toggle tab (when closed) */}
          {!elementsSidebarOpen && (
            <button
              onClick={() => setElementsSidebarOpen(true)}
              className="shrink-0 flex flex-col items-center justify-center gap-1 px-1 py-3 hover:bg-white/5 transition-colors"
              style={{
                background: COLORS.toolbar,
                borderRight: `1px solid ${COLORS.toolbarBorder}`,
                writingMode: "vertical-lr",
              }}
              title="Open Elements Panel"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.cyan }}>
                Elements ▶
              </span>
            </button>
          )}

          {/* ── Canvas / 3D Viewport ─────────────────────── */}
          {viewMode === "2d" ? (
            <canvas
              ref={canvasRef}
              className="flex-1 block"
              style={{ cursor: getCursorStyle() }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                panStart.current = null;
                setDrawing(false);
                setPreviewEl(null);
              }}
            />
          ) : (
            <div className="flex-1 relative">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full" style={{ background: "#0a0a0a" }}>
                    <LoadingOutlined style={{ fontSize: 32, color: "#00e5ff" }} />
                  </div>
                }
              >
                <ThreeCADViewport
                  elements={elements}
                  layers={layers}
                  pan={pan}
                  zoom={zoom}
                  gridSize={settings.gridSize}
                  majorGrid={settings.majorGrid}
                  canvasWidth={canvasRef.current?.width ?? window.innerWidth}
                  canvasHeight={canvasRef.current?.height ?? window.innerHeight}
                  roofType={roofType}
                  foundationType={settings.foundationType}
                  foundationDepth={settings.foundationDepth}
                  onRoofTypeChange={setRoofType}
                  onZoomIn3D={(fn) => { zoomIn3DRef.current = fn; }}
                  onZoomOut3D={(fn) => { zoomOut3DRef.current = fn; }}
                  onResetView3D={(fn) => { resetView3DRef.current = fn; }}
                />
              </Suspense>
            </div>
          )}

          {/* ── Right Properties Panel ───────────────────── */}
          <div
            className="min-w-[160px] max-w-[200px] shrink-0 flex flex-col overflow-y-auto"
            style={{
              background: COLORS.toolbar,
              borderLeft: `1px solid ${COLORS.toolbarBorder}`,
            }}
          >
            {/* Layers */}
            <div
              className="p-2 border-b"
              style={{ borderColor: COLORS.toolbarBorder }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: COLORS.muted }}
              >
                Layers
              </p>

              <div className="space-y-0.5 mb-2">
                {layers.map((l) => (
                  <div
                    key={l.name}
                    onClick={() => setActiveLayer(l.name)}
                    className="flex items-center gap-1 py-1 px-1 rounded cursor-pointer group transition-colors"
                    style={{
                      background:
                        activeLayer === l.name
                          ? COLORS.highlight
                          : "transparent",
                    }}
                  >
                    {/* Visibility */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((la) =>
                            la.name === l.name
                              ? { ...la, visible: !la.visible }
                              : la,
                          ),
                        );
                      }}
                      className="shrink-0 transition-colors"
                      title={l.visible ? "Hide" : "Show"}
                      style={{
                        color: l.visible ? COLORS.cyan : COLORS.muted + "44",
                      }}
                    >
                      {l.visible ? (
                        <EyeOutlined style={{ fontSize: 13 }} />
                      ) : (
                        <EyeInvisibleOutlined style={{ fontSize: 13 }} />
                      )}
                    </button>
                    {/* Lock */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((la) =>
                            la.name === l.name
                              ? { ...la, locked: !la.locked }
                              : la,
                          ),
                        );
                      }}
                      className="shrink-0 transition-colors"
                      title={l.locked ? "Unlock" : "Lock"}
                      style={{
                        color: l.locked ? COLORS.yellow : COLORS.muted + "44",
                      }}
                    >
                      {l.locked ? (
                        <LockOutlined style={{ fontSize: 13 }} />
                      ) : (
                        <UnlockOutlined style={{ fontSize: 13 }} />
                      )}
                    </button>
                    {/* Color dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: l.color }}
                    />
                    {/* Line type */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((la) => {
                            if (la.name !== l.name) return la;
                            const current = la.lineType ?? "solid";
                            const idx = LAYER_LINE_TYPES.indexOf(current);
                            const next = LAYER_LINE_TYPES[(idx + 1) % LAYER_LINE_TYPES.length];
                            return { ...la, lineType: next };
                          }),
                        );
                      }}
                      className="px-1 rounded text-[8px] uppercase tracking-wider shrink-0"
                      title={`Line type: ${(l.lineType ?? "solid").toUpperCase()}`}
                      style={{
                        color: activeLayer === l.name ? COLORS.cyan : COLORS.muted,
                        border: `1px solid ${COLORS.toolbarBorder}`,
                        background: "transparent",
                      }}
                    >
                      {(l.lineType ?? "solid") === "solid"
                        ? "SOL"
                        : (l.lineType ?? "solid") === "dashed"
                          ? "DAS"
                          : (l.lineType ?? "solid") === "center"
                            ? "CEN"
                            : "HID"}
                    </button>
                    {/* Name */}
                    <span
                      className="text-[10px] truncate flex-1"
                      style={{
                        color:
                          activeLayer === l.name ? COLORS.white : COLORS.muted,
                      }}
                    >
                      {l.name}
                    </span>
                    {/* Delete on hover */}
                    {l.name !== "Layer 0" && (
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (
                            !confirm(
                              `Delete "${l.name}"? Elements move to Layer 0.`,
                            )
                          )
                            return;
                          setElements((prev) =>
                            prev.map((el) =>
                              el.layer === l.name
                                ? { ...el, layer: "Layer 0" }
                                : el,
                            ),
                          );
                          setLayers((prev) =>
                            prev.filter((la) => la.name !== l.name),
                          );
                          if (activeLayer === l.name) setActiveLayer("Layer 0");
                        }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: COLORS.red }}
                        title="Delete layer"
                      >
                        <CloseOutlined style={{ fontSize: 12 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add layer — full-width button */}
              <button
                onClick={() => {
                  const name = prompt("New layer name:");
                  if (!name || layers.some((l) => l.name === name)) return;
                  setLayers((prev) => [
                    ...prev,
                    {
                      name,
                      visible: true,
                      locked: false,
                      color: COLORS.white,
                      lineType: "solid",
                    },
                  ]);
                }}
                className="w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] hover:bg-white/10 transition-colors"
                style={{
                  color: COLORS.cyan,
                  border: `1px dashed ${COLORS.cyan}55`,
                }}
              >
                <PlusOutlined style={{ fontSize: 13 }} />
                Add Layer
              </button>

              <p
                className="text-[8px] mt-1.5 text-center"
                style={{ color: COLORS.muted + "88" }}
              >
                {elements.filter((e) => e.layer === activeLayer).length} objects
                on active layer
              </p>
            </div>

            {/* Door swing toggle */}
            {tool === "door" && (
              <div className="px-2 pt-1.5 pb-1.5 border-b" style={{ borderColor: COLORS.toolbarBorder }}>
                <p className="text-[9px] font-bold uppercase mb-1.5 tracking-widest" style={{ color: COLORS.muted }}>Door Type</p>
                <div className="flex gap-1">
                  {(["right", "left"] as const).map(swing => (
                    <button
                      key={swing}
                      onClick={() => {
                        setDoorSwing(swing);
                        setPendingSymbol(swing === "left" ? "door_swing_left" : "door_swing_right");
                      }}
                      className="flex-1 py-1 rounded text-[10px] capitalize transition-colors border"
                      style={{
                        background: doorSwing === swing ? COLORS.highlight : COLORS.bg,
                        borderColor: doorSwing === swing ? COLORS.cyan : COLORS.toolbarBorder,
                        color: doorSwing === swing ? COLORS.cyan : COLORS.muted,
                      }}
                    >
                      {swing} Swing
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Furniture palette */}
            {tool === "furniture" && (
              <div className="px-2 pt-1.5 pb-1.5 border-b" style={{ borderColor: COLORS.toolbarBorder }}>
                <p className="text-[9px] font-bold uppercase mb-1.5 tracking-widest" style={{ color: COLORS.muted }}>Furniture</p>
                {[
                  { category: "Bathroom", items: ["toilet", "basin", "bathtub", "shower"] },
                  { category: "Kitchen", items: ["stove", "sink", "fridge", "kitchen_counter"] },
                  { category: "Bedroom", items: ["bed_single", "bed_double"] },
                  { category: "Living", items: ["sofa", "dining_table", "tv_unit"] },
                  { category: "Other", items: ["garage"] },
                  { category: "Structure", items: ["stairs", "column", "elevator", "escalator"] },
                  { category: "Trees & Vegetation", items: ["tree_deciduous", "tree_palm", "tree_conifer", "shrub", "hedge", "flower_bed", "garden_bed", "lawn"] },
                  { category: "Property & Boundaries", items: ["boundary_fence", "boundary_wall", "gate"] },
                  { category: "Site & Outdoor", items: ["pool", "septic_tank", "parking", "driveway", "veranda", "paved_area"] },
                  { category: "Utilities", items: ["water_tank", "borehole", "fire_pit", "clothesline"] },
                ].map(group => (
                  <div key={group.category} className="mb-1.5">
                    <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: COLORS.muted }}>{group.category}</p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {group.items.map(sym => {
                        const def = SYMBOL_LIBRARY[sym];
                        if (!def) return null;
                        return (
                          <button
                            key={sym}
                            onClick={() => setPendingSymbol(sym)}
                            className="py-1 px-1 rounded text-[9px] text-left truncate transition-colors border"
                            title={def.label}
                            style={{
                              background: pendingSymbol === sym ? COLORS.highlight : COLORS.bg,
                              borderColor: pendingSymbol === sym ? COLORS.cyan : COLORS.toolbarBorder,
                              color: pendingSymbol === sym ? COLORS.cyan : COLORS.white,
                            }}
                          >
                            {def.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selection info */}
            {selectedIds.size > 0 && (
              <div className="px-2 pt-1.5 pb-1.5 border-b" style={{ borderColor: COLORS.toolbarBorder }}>
                <p className="text-[9px] font-bold uppercase mb-1 tracking-widest flex justify-between items-center" style={{ color: COLORS.muted }}>
                  <span>Properties</span>
                  <span className="bg-blue-500/20 text-blue-400 px-1 rounded">{selectedIds.size}</span>
                </p>
                <div className="space-y-0.5 text-[10px]" style={{ color: COLORS.white }}>
                  {selectedIds.size > 1 ? (
                    <p className="text-center py-2" style={{ color: COLORS.muted }}>Multiple items selected</p>
                  ) : (
                    (() => {
                      const el = elements.find((e) => e.id === Array.from(selectedIds)[0]);
                      if (!el) return null;
                      return (
                        <>
                          <p>Type: <span style={{ color: COLORS.cyan }}>{el.type}</span></p>
                          {"x" in el && (
                            <p>Pos: <span style={{ color: COLORS.cyan }}>{el.x.toFixed(0)}, {el.y.toFixed(0)}</span></p>
                          )}
                          {el.type === "polyline" && (
                            <p>Points: <span style={{ color: COLORS.cyan }}>{el.points.length}</span></p>
                          )}
                          {el.type === "circle" && (
                            <p>R: <span style={{ color: COLORS.cyan }}>{formatUnit(el.radius ?? 0, settings)}</span></p>
                          )}
                          {(el.type === "line" || el.type === "dimension") && (
                            <p>Len: <span style={{ color: COLORS.cyan }}>
                              {formatUnit(Math.sqrt(Math.pow((el.x2 ?? 0) - el.x, 2) + Math.pow((el.y2 ?? 0) - el.y, 2)), settings)}
                            </span></p>
                          )}
                          {el.type === "block" && (
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-1">
                                <span>Rot:</span>
                                <input
                                  type="number"
                                  value={(el as any).rotation || 0}
                                  onChange={(e) => {
                                    let val = parseFloat(e.target.value) || 0;
                                    setElements(prev => prev.map(p => p.id === el.id ? { ...p, rotation: val } : p));
                                  }}
                                  className="w-12 bg-black/50 border rounded px-1 text-center"
                                  style={{ borderColor: COLORS.toolbarBorder, color: COLORS.cyan }}
                                />
                                <span>°</span>
                              </div>
                              <div className="flex gap-1 mt-1 text-[9px]">
                                <button
                                  onClick={() => setElements(prev => prev.map(p => p.id === el.id ? { ...p, rotation: (((p as any).rotation || 0) - 90) % 360 } : p))}
                                  className="flex-1 rounded py-0.5 transition-colors border"
                                  style={{ backgroundColor: COLORS.bg, borderColor: COLORS.toolbarBorder, color: COLORS.white }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.toolbarBorder)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.bg)}
                                >
                                  -90° Focus
                                </button>
                                <button
                                  onClick={() => setElements(prev => prev.map(p => p.id === el.id ? { ...p, rotation: (((p as any).rotation || 0) + 90) % 360 } : p))}
                                  className="flex-1 rounded py-0.5 transition-colors border"
                                  style={{ backgroundColor: COLORS.bg, borderColor: COLORS.toolbarBorder, color: COLORS.white }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.toolbarBorder)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.bg)}
                                >
                                  +90° Turn
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                  <button
                    onClick={() => {
                      setElements((prev) => prev.filter((e) => !selectedIds.has(e.id)));
                      setSelectedIds(new Set());
                      setSelected(null);
                      cmdLog(`Deleted ${selectedIds.size} elements`);
                    }}
                    className="mt-2 w-full text-[9px] py-1 rounded hover:bg-red-700 transition-colors"
                    style={{ background: "#c62828", color: COLORS.white }}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Command Line ─────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col relative transition-colors duration-300"
          style={{
            background: aiMode ? "#120a1e" : "#0d0f14",
            borderTop: aiMode ? "1px solid #7c3aed44" : `1px solid ${COLORS.toolbarBorder}`,
          }}
        >
          {/* Autocomplete suggestions dropdown */}
          {(() => {
            if (aiMode) return null;
            const suggestions = getCommandSuggestions(cmdInput);
            if (
              !showSuggestions ||
              suggestions.length === 0 ||
              !cmdInput.trim()
            )
              return null;
            // Don't show if input is a coordinate
            if (/^[@\d-]/.test(cmdInput.trim()) && /[,<]/.test(cmdInput))
              return null;
            return (
              <div
                className="absolute bottom-full left-0 right-0 z-50 border-t"
                style={{
                  background: "#161922",
                  borderColor: COLORS.toolbarBorder,
                  maxHeight: 240,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                {suggestions.map((cmd, i) => (
                  <button
                    key={cmd.alias + cmd.name}
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent blur
                      executeCommand(cmd);
                      setCmdInput("");
                      setShowSuggestions(false);
                      cmdInputRef.current?.focus();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                    style={{
                      background:
                        i === suggestionIdx ? COLORS.highlight : "transparent",
                      borderLeft:
                        i === suggestionIdx
                          ? `2px solid ${COLORS.cyan}`
                          : "2px solid transparent",
                    }}
                  >
                    <span
                      className="text-xs font-bold w-12 shrink-0"
                      style={{
                        color: COLORS.cyan,
                        fontFamily: "'Roboto Mono', monospace",
                      }}
                    >
                      {cmd.alias}
                    </span>
                    <span
                      className="text-xs w-28 shrink-0"
                      style={{
                        color: COLORS.white,
                        fontFamily: "'Roboto Mono', monospace",
                      }}
                    >
                      {cmd.name}
                    </span>
                    <span
                      className="text-[11px] truncate"
                      style={{ color: COLORS.muted }}
                    >
                      {cmd.description}
                    </span>
                  </button>
                ))}
              </div>
            );
          })()}
          {/* Command history */}
          <div
            ref={cmdHistoryRef}
            className="px-4 py-1.5 overflow-y-auto text-xs leading-relaxed"
            style={{
              maxHeight: 90,
              color: COLORS.muted,
              fontFamily: "'Roboto Mono', monospace",
              scrollbarWidth: "thin",
            }}
          >
            {cmdHistory.map((line, i) => (
              <div
                key={i}
                className="py-px"
                style={{
                  color: line.startsWith(">")
                    ? COLORS.white
                    : line.startsWith("Command:")
                      ? COLORS.cyan
                      : line.startsWith("AI AGENT")
                        ? "#a855f7"
                        : COLORS.muted,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          {/* Input row */}
          <div
            className="flex items-center gap-2 px-4 transition-colors duration-300"
            style={{
              height: 40,
              background: aiMode ? "#1a0e2e" : "#0a0c10",
              borderTop: aiMode ? "1px solid #7c3aed33" : `1px solid ${COLORS.toolbarBorder}`,
            }}
          >
            {/* Mode badge */}
            <span
              className="text-[11px] font-bold shrink-0 px-1.5 py-0.5 rounded transition-colors duration-300"
              style={{
                color: aiMode ? "#c084fc" : COLORS.cyan,
                background: aiMode ? "#7c3aed22" : "transparent",
                letterSpacing: 1,
              }}
            >
              {aiMode ? "AI" : tool.toUpperCase()}
            </span>
            <span
              className="text-xs shrink-0"
              style={{ color: aiMode ? "#7c3aed" : COLORS.muted }}
            >
              {aiMode ? "~" : ">"}
            </span>
            <input
              ref={cmdInputRef}
              type="text"
              value={cmdInput}
              onChange={(e) => {
                setCmdInput(e.target.value);
                setSuggestionIdx(0);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              onKeyDown={(e) => {
                const suggestions = getCommandSuggestions(cmdInput);
                const hasSuggestions =
                  showSuggestions &&
                  suggestions.length > 0 &&
                  cmdInput.trim() &&
                  !/^[@\d-].*[,<]/.test(cmdInput.trim());

                if (e.key === "Tab" && hasSuggestions) {
                  e.preventDefault();
                  const cmd = suggestions[suggestionIdx];
                  setCmdInput(cmd.alias);
                  setSuggestionIdx(0);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (!cmdInput.trim()) return;

                  if (aiMode) {
                    cmdLog(`AI AGENT > ${cmdInput}`);
                    executeAgentDraw(cmdInput);
                    setCmdInput("");
                    setShowSuggestions(false);
                  } else if (
                    hasSuggestions &&
                    !COMMAND_MAP[cmdInput.trim().toLowerCase()]
                  ) {
                    // If typed text doesn't exactly match a command, pick the highlighted suggestion
                    executeCommand(suggestions[suggestionIdx]);
                    setCmdInput("");
                    setShowSuggestions(false);
                  } else {
                    processCommand(cmdInput);
                    setCmdInput("");
                    setShowSuggestions(false);
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  if (showSuggestions && hasSuggestions) {
                    setShowSuggestions(false);
                  } else {
                    if (drawing) {
                      cmdLog("Cancelled");
                      setDrawing(false);
                      setPreviewEl(null);
                    }
                    setCmdInput("");
                    setShowSuggestions(false);
                    cmdInputRef.current?.blur();
                  }
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (hasSuggestions) {
                    setSuggestionIdx((prev) =>
                      prev > 0 ? prev - 1 : suggestions.length - 1,
                    );
                  } else if (pastCommands.length > 0) {
                    const newIdx =
                      cmdHistoryIdx === -1
                        ? pastCommands.length - 1
                        : Math.max(0, cmdHistoryIdx - 1);
                    setCmdHistoryIdx(newIdx);
                    setCmdInput(pastCommands[newIdx]);
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (hasSuggestions) {
                    setSuggestionIdx((prev) =>
                      prev < suggestions.length - 1 ? prev + 1 : 0,
                    );
                  } else if (cmdHistoryIdx >= 0) {
                    const newIdx = cmdHistoryIdx + 1;
                    if (newIdx >= pastCommands.length) {
                      setCmdHistoryIdx(-1);
                      setCmdInput("");
                    } else {
                      setCmdHistoryIdx(newIdx);
                      setCmdInput(pastCommands[newIdx]);
                    }
                  }
                }
              }}
              className="flex-1 bg-transparent outline-none text-[13px]"
              style={{
                color: aiMode ? "#e9d5ff" : COLORS.white,
                fontFamily: "'Roboto Mono', monospace",
                caretColor: aiMode ? "#a855f7" : COLORS.cyan,
              }}
              placeholder={
                aiMode
                  ? agentLoading
                    ? "AI Agent is generating your drawing..."
                    : 'Describe what to draw (e.g. "3-bedroom house with garage")'
                  : agentLoading
                    ? "AI Agent is drawing..."
                    : drawing
                      ? getDrawingPrompt()
                      : "Type command: L, PL, REC, C, DIM, T, E, P, S, U, AI or x,y"
              }
              autoComplete="off"
              spellCheck={false}
              disabled={agentLoading}
            />
            {/* AI loading indicator */}
            {agentLoading && (
              <span
                className="shrink-0 flex items-center gap-1.5 animate-pulse"
                style={{ color: "#a855f7" }}
              >
                <LoadingOutlined style={{ fontSize: 14 }} />
                <span className="text-[11px] font-medium">Generating...</span>
              </span>
            )}
            {/* AI mode toggle */}
            <div
              className="flex items-center gap-2 ml-auto shrink-0 pl-4 border-l transition-colors duration-300"
              style={{ borderColor: aiMode ? "#7c3aed33" : COLORS.toolbarBorder }}
            >
              <button
                onClick={() => {
                  setAiMode(!aiMode);
                  setTimeout(() => cmdInputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: aiMode ? "#c084fc" : COLORS.muted,
                  background: aiMode ? "#7c3aed33" : "transparent",
                  border: aiMode ? "1px solid #7c3aed55" : `1px solid ${COLORS.toolbarBorder}`,
                  boxShadow: aiMode ? "0 0 12px #7c3aed22" : "none",
                }}
              >
                <RobotOutlined style={{ fontSize: 13 }} />
                {aiMode ? "AI On" : "AI Off"}
              </button>
            </div>
            <span
              className="text-[10px] shrink-0"
              style={{ color: COLORS.muted }}
            >
              Layer: {activeLayer} | Snap: ON
            </span>
          </div>
        </div>

        {/* ── Settings Modal ─────────────────────────────── */}
        <Modal
          title="DRAWING SETTINGS"
          open={showSettings}
          getContainer={false}
          zIndex={1100}
          onOk={() => setShowSettings(false)}
          onCancel={() => setShowSettings(false)}
          footer={[
            <Button key="reset" onClick={() => setSettings(DEFAULT_SETTINGS)}>
              Reset Defaults
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => setShowSettings(false)}
            >
              OK
            </Button>,
          ]}
          styles={{ body: { paddingTop: 12, maxHeight: "70vh", overflowY: "auto" } }}
          width={540}
        >
          <div className="space-y-4 text-xs font-mono">

            {/* ── BUILDING INFO ─────────────────────────── */}
            <div className="border-b pb-3" style={{ borderColor: COLORS.toolbarBorder }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                BUILDING INFORMATION
              </p>
              <div className="mb-3">
                <label className="block mb-1 font-semibold text-gray-400">Project Name</label>
                <input
                  className="w-full px-2 py-1 rounded text-xs bg-[#1a1d27] border outline-none focus:border-cyan-600"
                  style={{ borderColor: COLORS.toolbarBorder, color: "#e2e8f0" }}
                  value={settings.projectName}
                  onChange={(e) => setSettings((s) => ({ ...s, projectName: e.target.value }))}
                  placeholder="e.g. Smith Residence"
                />
              </div>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Building Type</label>
                  <Select
                    value={settings.buildingType}
                    onChange={(val) => setSettings((s) => ({ ...s, buildingType: val as BuildingType }))}
                    className="w-full"
                    options={[
                      { value: "residential", label: "Residential" },
                      { value: "commercial", label: "Commercial" },
                      { value: "industrial", label: "Industrial" },
                      { value: "institutional", label: "Institutional" },
                      { value: "mixed-use", label: "Mixed-Use" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Number of Storeys</label>
                  <InputNumber min={1} max={100} className="w-full" value={settings.numStoreys}
                    onChange={(val) => setSettings((s) => ({ ...s, numStoreys: Number(val) || 1 }))}
                  />
                </div>
              </div>
            </div>

            {/* ── STRUCTURAL DIMENSIONS ─────────────────── */}
            <div className="border-b pb-3" style={{ borderColor: COLORS.toolbarBorder }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                STRUCTURAL DIMENSIONS
              </p>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Floor-to-Floor Height (mm)</label>
                  <InputNumber min={2400} max={6000} className="w-full" value={settings.floorToFloorHeight}
                    onChange={(val) => setSettings((s) => ({ ...s, floorToFloorHeight: Number(val) || 3000 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Ceiling Height (mm)</label>
                  <InputNumber min={2100} max={5000} className="w-full" value={settings.ceilingHeight}
                    onChange={(val) => setSettings((s) => ({ ...s, ceilingHeight: Number(val) || 2700 }))}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Slab Thickness (mm)</label>
                  <InputNumber min={100} max={500} className="w-full" value={settings.slabThickness}
                    onChange={(val) => setSettings((s) => ({ ...s, slabThickness: Number(val) || 170 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Foundation Depth (mm)</label>
                  <InputNumber min={300} max={3000} className="w-full" value={settings.foundationDepth}
                    onChange={(val) => setSettings((s) => ({ ...s, foundationDepth: Number(val) || 600 }))}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Foundation Type</label>
                  <Select
                    value={settings.foundationType}
                    onChange={(val) => setSettings((s) => ({ ...s, foundationType: val as FoundationType }))}
                    className="w-full"
                    options={[
                      { value: "strip", label: "Strip Footing" },
                      { value: "stepped", label: "Stepped Footing" },
                      { value: "pad", label: "Pad / Isolated Footing" },
                      { value: "raft", label: "Raft / Mat Foundation" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* ── MATERIALS ─────────────────────────────── */}
            <div className="border-b pb-3" style={{ borderColor: COLORS.toolbarBorder }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                MATERIALS
              </p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Wall Material</label>
                  <Select
                    value={settings.wallMaterial}
                    onChange={(val) => setSettings((s) => ({ ...s, wallMaterial: val as WallMaterial }))}
                    className="w-full"
                    options={[
                      { value: "brick", label: "Brick" },
                      { value: "concrete-block", label: "Concrete Block" },
                      { value: "timber-frame", label: "Timber Frame" },
                      { value: "steel-frame", label: "Steel Frame" },
                      { value: "stone", label: "Stone" },
                      { value: "precast", label: "Precast Concrete" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Roof Material</label>
                  <Select
                    value={settings.roofMaterial}
                    onChange={(val) => setSettings((s) => ({ ...s, roofMaterial: val as RoofMaterial }))}
                    className="w-full"
                    options={[
                      { value: "concrete-tile", label: "Concrete Tile" },
                      { value: "clay-tile", label: "Clay Tile" },
                      { value: "metal-sheet", label: "Metal Sheet (IBR)" },
                      { value: "slate", label: "Slate" },
                      { value: "thatch", label: "Thatch" },
                      { value: "membrane", label: "Membrane / Flat" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* ── SITE ──────────────────────────────────── */}
            <div className="border-b pb-3" style={{ borderColor: COLORS.toolbarBorder }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                SITE & SETBACKS
              </p>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Plot Width (mm)</label>
                  <InputNumber min={1000} className="w-full" value={settings.plotWidth}
                    onChange={(val) => setSettings((s) => ({ ...s, plotWidth: Number(val) || 20000 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Plot Depth (mm)</label>
                  <InputNumber min={1000} className="w-full" value={settings.plotDepth}
                    onChange={(val) => setSettings((s) => ({ ...s, plotDepth: Number(val) || 30000 }))}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Front</label>
                  <InputNumber min={0} className="w-full" value={settings.setbackFront}
                    onChange={(val) => setSettings((s) => ({ ...s, setbackFront: Number(val) || 0 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Rear</label>
                  <InputNumber min={0} className="w-full" value={settings.setbackRear}
                    onChange={(val) => setSettings((s) => ({ ...s, setbackRear: Number(val) || 0 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Left</label>
                  <InputNumber min={0} className="w-full" value={settings.setbackLeft}
                    onChange={(val) => setSettings((s) => ({ ...s, setbackLeft: Number(val) || 0 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Right</label>
                  <InputNumber min={0} className="w-full" value={settings.setbackRight}
                    onChange={(val) => setSettings((s) => ({ ...s, setbackRight: Number(val) || 0 }))}
                  />
                </div>
              </div>
              <p className="text-[9px] mt-1 opacity-70 text-gray-500">
                Setback distances from plot boundary (mm)
              </p>
            </div>

            {/* ── DRAWING SETTINGS ──────────────────────── */}
            <div className="border-b pb-3" style={{ borderColor: COLORS.toolbarBorder }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                DRAWING
              </p>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Drawing Units</label>
                  <Select
                    value={settings.unit}
                    onChange={(val) => setSettings((s) => ({ ...s, unit: val as UnitSystem }))}
                    className="w-full"
                    options={[
                      { value: "mm", label: "Millimeters (mm)" },
                      { value: "cm", label: "Centimeters (cm)" },
                      { value: "m", label: "Meters (m)" },
                      { value: "in", label: "Inches (in)" },
                      { value: "ft", label: "Feet (ft)" },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Precision</label>
                  <Select
                    value={settings.precision}
                    onChange={(val) => setSettings((s) => ({ ...s, precision: val }))}
                    className="w-full"
                    options={[
                      { value: 0, label: "0 (e.g. 10)" },
                      { value: 1, label: "0.1 (e.g. 10.5)" },
                      { value: 2, label: "0.01 (e.g. 10.50)" },
                      { value: 3, label: "0.001 (e.g. 10.500)" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Grid Snap Size</label>
                  <InputNumber className="w-full" value={settings.gridSize}
                    onChange={(val) => setSettings((s) => ({ ...s, gridSize: val || 20 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Major Grid Lines</label>
                  <InputNumber className="w-full" value={settings.majorGrid}
                    onChange={(val) => setSettings((s) => ({ ...s, majorGrid: val || 5 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Annotation Scale</label>
                  <Select
                    value={settings.annoScale}
                    onChange={(val) => setSettings((s) => ({ ...s, annoScale: val }))}
                    className="w-full"
                    options={[
                      { value: 200, label: "1:50" },
                      { value: 100, label: "1:100" },
                      { value: 50, label: "1:200" },
                      { value: 25, label: "1:400" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Checkbox checked={settings.mergeWalls}
                  onChange={(e) => setSettings((s) => ({ ...s, mergeWalls: e.target.checked }))}
                >Merge Walls</Checkbox>
                <Checkbox checked={settings.hatchRooms}
                  onChange={(e) => setSettings((s) => ({ ...s, hatchRooms: e.target.checked }))}
                >Hatch Rooms</Checkbox>
                <Checkbox checked={settings.roomLabels}
                  onChange={(e) => setSettings((s) => ({ ...s, roomLabels: e.target.checked }))}
                >Room Labels + Area</Checkbox>
              </div>
            </div>

            {/* ── ARCHITECTURAL TOOL DEFAULTS ───────────── */}
            <div>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: "#22d3ee" }}>
                ARCHITECTURAL TOOL DEFAULTS
              </p>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Wall Thickness (mm)</label>
                  <InputNumber min={50} className="w-full" value={settings.wallThickness}
                    onChange={(val) => setSettings((s) => ({ ...s, wallThickness: Number(val) || 200 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Door Width (mm)</label>
                  <InputNumber min={100} className="w-full" value={settings.doorWidth}
                    onChange={(val) => setSettings((s) => ({ ...s, doorWidth: Number(val) || 900 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Door Height (mm)</label>
                  <InputNumber min={1500} className="w-full" value={settings.doorHeight}
                    onChange={(val) => setSettings((s) => ({ ...s, doorHeight: Number(val) || 2100 }))}
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Window Width (mm)</label>
                  <InputNumber min={100} className="w-full" value={settings.windowWidth}
                    onChange={(val) => setSettings((s) => ({ ...s, windowWidth: Number(val) || 1200 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Window Height (mm)</label>
                  <InputNumber min={100} className="w-full" value={settings.windowHeight}
                    onChange={(val) => setSettings((s) => ({ ...s, windowHeight: Number(val) || 1200 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Sill Height (mm)</label>
                  <InputNumber min={0} className="w-full" value={settings.windowSillHeight}
                    onChange={(val) => setSettings((s) => ({ ...s, windowSillHeight: Number(val) || 900 }))}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Stair Width (mm)</label>
                  <InputNumber min={100} className="w-full" value={settings.stairWidth}
                    onChange={(val) => setSettings((s) => ({ ...s, stairWidth: Number(val) || 900 }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-semibold text-gray-400">Stair Depth (mm)</label>
                  <InputNumber min={100} className="w-full" value={settings.stairDepth}
                    onChange={(val) => setSettings((s) => ({ ...s, stairDepth: Number(val) || 1800 }))}
                  />
                </div>
                <div className="flex-1" />
              </div>
            </div>
          </div>
        </Modal>

        {/* ── Print Elevations Overlay ── */}
        {showPrintElevations && (
          <PrintElevations
            elements={elements}
            settings={{
              projectName: settings.projectName || projectName || "",
              wallThickness: settings.wallThickness,
              floorToFloorHeight: settings.floorToFloorHeight,
              ceilingHeight: settings.ceilingHeight,
              foundationDepth: settings.foundationDepth,
              foundationType: settings.foundationType,
              slabThickness: settings.slabThickness,
              numStoreys: settings.numStoreys,
              doorWidth: settings.doorWidth,
              doorHeight: settings.doorHeight,
              windowWidth: settings.windowWidth,
              windowHeight: settings.windowHeight,
              windowSillHeight: settings.windowSillHeight,
              roofType,
              roofMaterial: settings.roofMaterial,
              wallMaterial: settings.wallMaterial,
              plotWidth: settings.plotWidth,
              plotDepth: settings.plotDepth,
            }}
            onClose={() => setShowPrintElevations(false)}
          />
        )}

        {/* ── Print Floor Plan Overlay ── */}
        {showPrintFloorPlan && (
          <PrintFloorPlan
            elements={elements}
            layers={layers}
            settings={{
              projectName: settings.projectName || projectName || "",
              unit: settings.unit,
              precision: settings.precision,
              gridSize: settings.gridSize,
              majorGrid: settings.majorGrid,
              annoScale: settings.annoScale,
              mergeWalls: settings.mergeWalls,
              hatchRooms: settings.hatchRooms,
              roomLabels: settings.roomLabels,
              wallThickness: settings.wallThickness,
              floorToFloorHeight: settings.floorToFloorHeight,
              ceilingHeight: settings.ceilingHeight,
              foundationDepth: settings.foundationDepth,
              foundationType: settings.foundationType,
              numStoreys: settings.numStoreys,
              wallMaterial: settings.wallMaterial,
              roofMaterial: settings.roofMaterial,
              plotWidth: settings.plotWidth,
              plotDepth: settings.plotDepth,
            }}
            onClose={() => setShowPrintFloorPlan(false)}
          />
        )}
        {/* ── Print Section Overlay ── */}
        {showPrintSection && (
          <PrintSection
            elements={elements}
            settings={{
              projectName: settings.projectName || projectName || "",
              wallThickness: settings.wallThickness,
              floorToFloorHeight: settings.floorToFloorHeight,
              ceilingHeight: settings.ceilingHeight,
              foundationDepth: settings.foundationDepth,
              foundationType: settings.foundationType,
              slabThickness: settings.slabThickness,
              numStoreys: settings.numStoreys,
              roofType,
              roofMaterial: settings.roofMaterial,
              wallMaterial: settings.wallMaterial,
              plotWidth: settings.plotWidth,
              plotDepth: settings.plotDepth,
            }}
            onClose={() => setShowPrintSection(false)}
          />
        )}

      {/* ── Open Project Dialog ── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-cyan-600" />
            <span>Open Project Drawing</span>
          </div>
        }
        open={showOpenProject}
        onCancel={() => setShowOpenProject(false)}
        footer={null}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {allProjects.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <LoadingOutlined className="text-2xl mb-4" />
              <p>Loading projects...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setShowOpenProject(false);
                    if (p.id !== projectIdNum) {
                      navigate({ to: "/builder/architectural-studio", search: { projectId: String(p.id) } });
                    }
                  }}
                  className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                    <p className="text-xs text-slate-500">{p.location || "No location"}</p>
                  </div>
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      </div>
    </ConfigProvider >
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import {
  DragOutlined,
  ArrowsAltOutlined,
  LineOutlined,
  DeploymentUnitOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  FontSizeOutlined,
  ColumnWidthOutlined,
  FormatPainterOutlined,
  RobotOutlined,
  UndoOutlined,
  RedoOutlined,
  BlockOutlined,
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
  Switch,
} from "antd";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { aiApi } from "@/services/api";

// ─── Types ─────────────────────────────────────────────────
type Tool =
  | "select"
  | "line"
  | "polyline"
  | "wall"
  | "rect"
  | "circle"
  | "text"
  | "dimension"
  | "eraser"
  | "pan"
  | "agent"
  | "offset";
type LayerData = {
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
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

const DEFAULT_LAYERS: LayerData[] = [
  { name: "Layer 0", visible: true, locked: false, color: "#e8eaf0" },
  { name: "Walls", visible: true, locked: false, color: "#00bcd4" },
  { name: "Doors", visible: true, locked: false, color: "#4caf50" },
  { name: "Windows", visible: true, locked: false, color: "#ffeb3b" },
  { name: "Annotations", visible: true, locked: false, color: "#e91e63" },
];

export const Route = createFileRoute(
  "/_authenticated/builder/architectural-studio",
)({
  component: ArchitecturalStudioCanvas,
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
export interface DrawingSettings {
  unit: UnitSystem;
  precision: number;
  gridSize: number;
  majorGrid: number;
  annoScale: number;
  mergeWalls: boolean;
}

export const DEFAULT_SETTINGS: DrawingSettings = {
  unit: "mm",
  precision: 1,
  gridSize: 20,
  majorGrid: 5,
  annoScale: 100,
  mergeWalls: true,
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
  }
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

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: DrawingElement,
  pan: { x: number; y: number },
  zoom: number,
  selected: boolean,
  s: DrawingSettings,
) {
  ctx.save();
  ctx.strokeStyle = selected ? COLORS.yellow : el.color;
  ctx.fillStyle = selected ? COLORS.yellow + "22" : "transparent";
  ctx.lineWidth = el.lineWidth;

  if (el.type === "line") {
    const sx = el.x * zoom + pan.x;
    const sy = el.y * zoom + pan.y;
    const ex = el.x2 * zoom + pan.x;
    const ey = el.y2 * zoom + pan.y;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
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
    ctx.font = `${scaledFontSize}px 'Courier New', monospace`;
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
    ctx.beginPath();
    ctx.rect(
      el.x * zoom + pan.x,
      el.y * zoom + pan.y,
      el.width * zoom,
      el.height * zoom,
    );
    ctx.stroke();
    if (selected) ctx.fill();
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
    ctx.font = `${scaledFontSize}px 'Courier New', monospace`;
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
  } else if (el.type === "dimension") {
    const dsx = el.x * zoom + pan.x;
    const dsy = el.y * zoom + pan.y;
    const ex = (el.x2 ?? el.x) * zoom + pan.x;
    const ey = (el.y2 ?? el.y) * zoom + pan.y;
    const dist = Math.sqrt(
      Math.pow(el.x2! - el.x, 2) + Math.pow(el.y2! - el.y, 2),
    );
    ctx.strokeStyle = COLORS.magenta;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(dsx, dsy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const angle = Math.atan2(ey - dsy, ex - dsx);
    // Draw straight, perpendicular end ticks ("sticks")
    const tickLen = 6;
    ctx.beginPath();
    const px1 = dsx + tickLen * Math.cos(angle + Math.PI / 2);
    const py1 = dsy + tickLen * Math.sin(angle + Math.PI / 2);
    const px2 = dsx - tickLen * Math.cos(angle + Math.PI / 2);
    const py2 = dsy - tickLen * Math.sin(angle + Math.PI / 2);
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);

    const qx1 = ex + tickLen * Math.cos(angle + Math.PI / 2);
    const qy1 = ey + tickLen * Math.sin(angle + Math.PI / 2);
    const qx2 = ex - tickLen * Math.cos(angle + Math.PI / 2);
    const qy2 = ey - tickLen * Math.sin(angle + Math.PI / 2);
    ctx.moveTo(qx1, qy1);
    ctx.lineTo(qx2, qy2);
    ctx.stroke();

    const midX = (dsx + ex) / 2;
    const midY = (dsy + ey) / 2;
    ctx.fillStyle = COLORS.magenta;
    const scaledFontSize = 80 * (settings.annoScale / 100) * zoom;
    ctx.font = `bold ${scaledFontSize}px 'Courier New', monospace`;
    
    // Rotate text to align with the dimension line
    ctx.save();
    ctx.translate(midX, midY);
    let textAngle = angle;
    // Keep text readable (upright)
    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
      textAngle += Math.PI;
    }
    ctx.rotate(textAngle);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(formatUnit(dist, s), 0, -4);
    ctx.restore();
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
    if (img && img.complete && img.naturalWidth > 0) {
      if (el.color === "#ffffff") {
        // Fast path for white color (commonly used in dark mode)
        ctx.filter = "invert(1)";
        ctx.drawImage(img, drawX, drawY, bw, bh);
        ctx.filter = "none";
      } else {
        // Dynamic tinting for other colors (Cyan, Green, etc. according to Layer)
        const tintCnv = document.createElement("canvas");
        tintCnv.width = bw;
        tintCnv.height = bh;
        const tCtx = tintCnv.getContext("2d");
        if (tCtx) {
          tCtx.drawImage(img, 0, 0, bw, bh);
          tCtx.globalCompositeOperation = "source-in";
          tCtx.fillStyle = el.color;
          tCtx.fillRect(0, 0, bw, bh);
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
      ctx.font = `${Math.min(bw, bh) * 0.2}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(el.symbolName, 0, 0);
      // Retry load
      if (img) img.onload = () => {}; // trigger re-render on next redraw
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
) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len,
    ny = dx / len;
  const h = width / 2;
  return [
    [
      [x1 + nx * h, y1 + ny * h],
      [x1 - nx * h, y1 - ny * h],
      [x2 - nx * h, y2 - ny * h],
      [x2 + nx * h, y2 + ny * h],
      [x1 + nx * h, y1 + ny * h],
    ],
  ];
}

type HistoryState<T> = { past: T[]; present: T; future: T[] };
type HistoryAction<T> =
  | { type: "SET"; payload: T | ((prev: T) => T) }
  | { type: "UNDO" }
  | { type: "REDO" };

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
  const setState = useCallback(
    (payload: T | ((prev: T) => T)) => dispatch({ type: "SET", payload }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  return {
    state: state.present,
    setState,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

// AutoCAD-style command definitions
type CommandDef = {
  alias: string;
  name: string;
  description: string;
  action: Tool | "undo" | "redo";
};

const COMMANDS: CommandDef[] = [
  {
    alias: "L",
    name: "LINE",
    description: "Draw line segments",
    action: "line",
  },
  {
    alias: "PL",
    name: "PLINE",
    description: "Draw connected polyline segments",
    action: "polyline",
  },
  {
    alias: "W",
    name: "WALL",
    description: "Draw connected thick wall segments",
    action: "wall",
  },
  {
    alias: "REC",
    name: "RECTANGLE",
    description: "Draw a rectangle",
    action: "rect",
  },
  {
    alias: "C",
    name: "CIRCLE",
    description: "Draw a circle by center and radius",
    action: "circle",
  },
  {
    alias: "DIM",
    name: "DIMENSION",
    description: "Add a measurement dimension",
    action: "dimension",
  },
  {
    alias: "T",
    name: "TEXT",
    description: "Place single-line text",
    action: "text",
  },
  {
    alias: "DT",
    name: "DTEXT",
    description: "Place dynamic text",
    action: "text",
  },
  {
    alias: "O",
    name: "OFFSET",
    description: "Create parallel copy at specified distance",
    action: "offset",
  },
  {
    alias: "E",
    name: "ERASE",
    description: "Delete an element",
    action: "eraser",
  },
  {
    alias: "S",
    name: "SELECT",
    description: "Select and inspect elements",
    action: "select",
  },
  { alias: "P", name: "PAN", description: "Pan the viewport", action: "pan" },
  { alias: "U", name: "UNDO", description: "Undo last action", action: "undo" },
  {
    alias: "REDO",
    name: "REDO",
    description: "Redo last undone action",
    action: "redo",
  },
  {
    alias: "AI",
    name: "AGENT",
    description: "AI draws from your description",
    action: "agent",
  },
];

// Build a lookup map from all aliases and names
const COMMAND_MAP: Record<string, Tool | "undo" | "redo"> = {};
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const cmdHistoryRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [aiMode, setAiMode] = useState(false);
  const [color, setColor] = useState(COLORS.white);
  const lineWidth = 1;
  const saved = useRef(
    loadSaved<{
      elements: DrawingElement[];
      layers: LayerData[];
      activeLayer: string;
    }>(STORAGE_KEY, {
      elements: [],
      layers: DEFAULT_LAYERS,
      activeLayer: "Layer 0",
    }),
  );
  const {
    state: elements,
    setState: setElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<DrawingElement[]>(saved.current.elements);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<DrawingElement[]>([]);
  const [showProps, setShowProps] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [previewEl, setPreviewEl] = useState<DrawingElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
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
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const dragMoveStart = useRef<{ wx: number; wy: number } | null>(null);
  const isDragging = useRef(false);

  const cmdLog = useCallback((msg: string) => {
    setCmdHistory((prev) => [...prev.slice(-50), msg]);
  }, []);

  // Get the base point for the current drawing operation
  const getBasePoint = useCallback(() => {
    if (tool === "polyline" && previewEl?.type === "polyline") {
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
      if (tool === "polyline" && previewEl && previewEl.type === "polyline") {
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

  const executeAgentDraw = useCallback(
    async (prompt: string) => {
      setAgentLoading(true);
      cmdLog("AI Agent thinking...");
      try {
        const { data } = await aiApi.drawAgent(prompt, elements);
        const cmds = data.commands ?? [];
        if (cmds.length === 0) {
          cmdLog("AI Agent returned no drawing commands");
          setAgentLoading(false);
          return;
        }
        cmdLog(`AI Agent generating ${cmds.length} elements...`);
        const newElements: DrawingElement[] = [];
        for (const cmd of cmds) {
          const id = crypto.randomUUID();
          const p = cmd.params ?? {};
          let el: DrawingElement | null = null;
          const layerName = p.layer || activeLayer;
          const layerDef = layers.find((l) => l.name === layerName);
          const elementColor = layerDef ? layerDef.color : color;
          const lw = p.lineWidth ?? lineWidth;

          if (
            cmd.type === "LINE" &&
            p.x != null &&
            p.y != null &&
            p.x2 != null &&
            p.y2 != null
          ) {
            el = {
              id,
              type: "line",
              x: p.x,
              y: p.y,
              x2: p.x2,
              y2: p.y2,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "RECT" &&
            p.x != null &&
            p.y != null &&
            p.width != null &&
            p.height != null
          ) {
            el = {
              id,
              type: "rect",
              x: p.x,
              y: p.y,
              width: p.width,
              height: p.height,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "CIRCLE" &&
            p.x != null &&
            p.y != null &&
            p.radius != null
          ) {
            el = {
              id,
              type: "circle",
              x: p.x,
              y: p.y,
              radius: p.radius,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "TEXT" &&
            p.x != null &&
            p.y != null &&
            p.text
          ) {
            el = {
              id,
              type: "text",
              x: p.x,
              y: p.y,
              text: p.text,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "POLYLINE" &&
            Array.isArray(p.points) &&
            p.points.length >= 2
          ) {
            el = {
              id,
              type: "polyline",
              points: p.points,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "DIMENSION" &&
            p.x != null &&
            p.y != null &&
            p.x2 != null &&
            p.y2 != null
          ) {
            // Dimensions are always drawn magenta
            el = {
              id,
              type: "dimension",
              x: p.x,
              y: p.y,
              x2: p.x2,
              y2: p.y2,
              color: "#f0f",
              lineWidth: lw,
              layer: layerName,
            };
          } else if (
            cmd.type === "BLOCK" &&
            p.x != null &&
            p.y != null &&
            p.name
          ) {
            const symDef = SYMBOL_LIBRARY[p.name];
            const w = p.width ?? symDef?.defaultWidth ?? 900;
            const h = p.height ?? symDef?.defaultHeight ?? 900;
            el = {
              id,
              type: "block",
              x: p.x,
              y: p.y,
              width: w,
              height: h,
              symbolName: p.name,
              rotation: p.rotation ?? 0,
              color: elementColor,
              lineWidth: lw,
              layer: layerName,
              flipX: p.flipX,
              flipY: p.flipY,
            };
          }
          if (el) newElements.push(el);
        }
        setElements(newElements);
        // Auto-fit view to show the full drawing
        setTimeout(() => zoomToFit(newElements), 100);
        cmdLog(
          `AI Agent: ${data.summary ?? `${newElements.length} elements drawn`}`,
        );
      } catch (err: any) {
        const msg =
          err?.response?.data?.error || err?.message || "Unknown error";
        cmdLog(`AI Agent error: ${msg}`);
      }
      setAgentLoading(false);
    },
    [
      elements,
      color,
      lineWidth,
      activeLayer,
      layers,
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
      if (cmd) {
        if (drawing) {
          setDrawing(false);
          setPreviewEl(null);
        }
        if (cmd === "offset") {
          setTool("offset");
          setOffsetDist(null);
          setOffsetSourceId(null);
          cmdLog("OFFSET — Enter offset distance:");
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
        `Unknown command: "${raw}" — type L, PL, REC, C, DIM, T, E, P, S, U, AI, or enter length / length<angle / x,y`,
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
    const groups: Record<string, any[]> = {}; // key: layer
    const layerColors: Record<string, string> = {};

    for (const el of elements) {
      if (activeHidden.has(el.layer)) continue;
      if (
        (el.type === "line" || el.type === "polyline") &&
        el.lineWidth >= 10
      ) {
        const key = el.layer;
        if (!groups[key]) groups[key] = [];
        layerColors[key] = el.color;

        const polys = [];
        if (el.type === "line") {
          polys.push(thickenLine(el.x, el.y, el.x2!, el.y2!, el.lineWidth));
        } else if (el.type === "polyline") {
          for (let i = 0; i < el.points.length - 1; i++) {
            polys.push(
              thickenLine(
                el.points[i].x,
                el.points[i].y,
                el.points[i + 1].x,
                el.points[i + 1].y,
                el.lineWidth,
              ),
            );
          }
        }
        groups[key].push(...polys);
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
  }, [elements, layers, settings.mergeWalls]);

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

    // Draw standard elements
    for (const el of elements) {
      if (hiddenLayers.has(el.layer)) continue;
      // If we are merging walls, skip standard drawing for thick lines (they will be drawn in the union pass)
      if (
        settings.mergeWalls &&
        (el.type === "line" || el.type === "polyline") &&
        el.lineWidth >= 10
      ) {
        continue;
      }
      drawElement(
        ctx,
        el,
        pan,
        zoom,
        el.id === selected || selectedIds.has(el.id),
        settings,
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
      drawElement(ctx, previewEl, pan, zoom, false, settings);

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

    if (snapPoint) {
      ctx.strokeStyle = COLORS.magenta;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        snapPoint.x * zoom + pan.x - 5,
        snapPoint.y * zoom + pan.y - 5,
        10,
        10,
      );
    }

    // Coordinates readout
    ctx.fillStyle = COLORS.muted;
    ctx.font = "11px Courier New";
    ctx.fillText(
      `X: ${snapToGrid(cursor.x).toFixed(0)} mm  Y: ${snapToGrid(cursor.y).toFixed(0)} mm  Zoom: ${(zoom * 100).toFixed(0)}%`,
      12,
      canvas.height - 10,
    );
  }, [elements, pan, zoom, selected, previewEl, cursor, layers]);

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

  const getSnapPoint = (wx: number, wy: number) => {
    if (
      tool === "select" ||
      tool === "eraser" ||
      tool === "pan" ||
      tool === "text"
    )
      return null;
    let bestDist = 15 / zoom;
    let bestPt: { x: number; y: number } | null = null;
    const check = (x: number, y: number) => {
      const d = Math.hypot(x - wx, y - wy);
      if (d < bestDist) {
        bestDist = d;
        bestPt = { x, y };
      }
    };
    const hiddenLayers = new Set(
      layers.filter((l) => !l.visible).map((l) => l.name),
    );
    for (const el of elements) {
      if (hiddenLayers.has(el.layer)) continue;
      if (el.type === "line" || el.type === "dimension") {
        check(el.x, el.y);
        check(el.x2, el.y2);
        check((el.x + el.x2) / 2, (el.y + el.y2) / 2);
      } else if (el.type === "rect") {
        check(el.x, el.y);
        check(el.x + el.width, el.y);
        check(el.x, el.y + el.height);
        check(el.x + el.width, el.y + el.height);
      } else if (el.type === "circle") {
        check(el.x, el.y);
      } else if (el.type === "polyline") {
        for (let i = 0; i < el.points.length; i++) {
          check(el.points[i].x, el.points[i].y);
          if (i < el.points.length - 1) {
            check(
              (el.points[i].x + el.points[i + 1].x) / 2,
              (el.points[i].y + el.points[i + 1].y) / 2,
            );
          }
        }
      }
    }
    return bestPt;
  };

  const getPos = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = toWorld(sx, sy);

    let finalX = snapToGrid(w.x);
    let finalY = snapToGrid(w.y);

    const snapPt = getSnapPoint(w.x, w.y);
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
        if (hitTest(el, wx, wy)) {
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
        if (hitTest(elements[i], wx, wy)) {
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
    const partialEl: DrawingElement = {
      id: "__preview__",
      type: tool as any,
      x: sx0,
      y: sy0,
      color,
      lineWidth,
      layer: activeLayer,
    };
    if (tool === "line" || tool === "dimension") {
      setPreviewEl({
        ...partialEl,
        type: tool === "dimension" ? "dimension" : "line",
        x2: wx,
        y2: wy,
      });
    } else if (tool === "rect") {
      setPreviewEl({
        ...partialEl,
        type: "rect",
        width: wx - sx0,
        height: wy - sy0,
      });
    } else if (tool === "circle") {
      const r = Math.sqrt(Math.pow(wx - sx0, 2) + Math.pow(wy - sy0, 2));
      setPreviewEl({ ...partialEl, type: "circle", radius: r });
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
    if (tool === "polyline") return; // Polylines strictly use clicks

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
    const tol = 5;
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
    if (!["door_swing_right", "door_swing_left", "window", "garage"].includes(symbolName)) return null;

    const SNAP_DIST = 400; // Snapping radius (400mm)
    let bestLine: DrawingElement | null = null;
    let minDist = SNAP_DIST;
    let projX = wx;
    let projY = wy;
    let lineAngle = 0;

    for (const el of elements) {
      if (el.type === "line") {
        const px = (el.x2 ?? el.x) - el.x;
        const py = (el.y2 ?? el.y) - el.y;
        const lenSq = px * px + py * py;
        // Project cursor onto the line (allowing extension past endpoints to span gaps)
        let t = lenSq === 0 ? 0 : ((wx - el.x) * px + (wy - el.y) * py) / lenSq;
        // Allows snapping into gaps between walls up to 100% of wall lengths away
        t = Math.max(-1.0, Math.min(2.0, t)); 
        
        const cx = el.x + t * px;
        const cy = el.y + t * py;
        
        const dist = Math.hypot(wx - cx, wy - cy);
        if (dist < minDist) {
          minDist = dist;
          bestLine = el;
          projX = cx;
          projY = cy;
          lineAngle = Math.atan2(py, px);
        }
      }
    }

    if (bestLine) {
      let rotDeg = (lineAngle * 180) / Math.PI;
      if (rotDeg < 0) rotDeg += 360;
      // Snap rotation to perfectly orthogonal angles aligned with the wall line
      rotDeg = Math.round(rotDeg / 90) * 90;
      
      return { x: projX, y: projY, rotation: rotDeg };
    }
    return null;
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

      // If command input is focused, let it handle its own keys
      if (e.target === cmdInputRef.current) return;

      if (
        e.key === "Enter" &&
        tool === "polyline" &&
        previewEl &&
        previewEl.type === "polyline"
      ) {
        const pts = previewEl.points;
        const finalPts = pts.slice(0, pts.length - 1);
        if (finalPts.length > 1) {
          setElements((prev) => [
            ...prev,
            { ...previewEl, id: crypto.randomUUID(), points: finalPts },
          ]);
          cmdLog("Polyline completed");
        }
        setDrawing(false);
        setPreviewEl(null);
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
    [selected, selectedIds, elements, clipboard, undo, redo, tool, previewEl, drawing, cmdLog],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Persist drawing to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ elements, layers, activeLayer }),
      );
    } catch {
      /* storage full, ignore */
    }
  }, [elements, layers, activeLayer]);

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

  const toolDefs: {
    id: Tool;
    icon: React.ReactNode;
    label: string;
    key: string;
  }[] = [
    { id: "select", icon: <DragOutlined />, label: "Select", key: "S" },
    { id: "pan", icon: <ArrowsAltOutlined />, label: "Pan", key: "P" },
    { id: "line", icon: <LineOutlined />, label: "Line", key: "L" },
    {
      id: "polyline",
      icon: <DeploymentUnitOutlined />,
      label: "Polyline",
      key: "PL",
    },
    { id: "wall", icon: <BlockOutlined />, label: "Wall", key: "W" },
    { id: "rect", icon: <BorderOutlined />, label: "Rectangle", key: "REC" },
    {
      id: "circle",
      icon: <RadiusSettingOutlined />,
      label: "Circle",
      key: "C",
    },
    { id: "text", icon: <FontSizeOutlined />, label: "Text", key: "T" },
    {
      id: "dimension",
      icon: <ColumnWidthOutlined />,
      label: "Dimension",
      key: "DIM",
    },
    {
      id: "eraser",
      icon: <FormatPainterOutlined />,
      label: "Eraser",
      key: "E",
    },
    { id: "agent", icon: <RobotOutlined />, label: "AI Agent", key: "AI" },
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
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* ── Top Menu Bar ──────────────────────────────── */}
        <div
          className="flex items-center gap-0 px-2 h-12 shrink-0"
          style={{
            background: COLORS.toolbar,
            borderBottom: `1px solid ${COLORS.toolbarBorder}`,
          }}
        >
          <Link
            to="/builder"
            className="flex flex-col items-center justify-center gap-0.5 mr-4 px-2 py-1 rounded transition-all hover:bg-white/10"
            title="Exit Studio"
            style={{ color: COLORS.muted }}
          >
            <ArrowLeftOutlined style={{ fontSize: 16 }} />
            <span className="text-[8px] uppercase tracking-wider">Back</span>
          </Link>
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
                        setElements([]);
                        setLayers(DEFAULT_LAYERS);
                        setActiveLayer("Layer 0");
                        localStorage.removeItem(STORAGE_KEY);
                      }
                    },
                  },
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
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px]" style={{ color: COLORS.muted }}>
              {elements.length} object{elements.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
              style={{
                color: COLORS.cyan,
                border: `1px solid ${COLORS.cyan}44`,
              }}
            >
              Reset View
            </button>
            {elements.length > 0 && (
              <button
                onClick={() => zoomToFit(elements)}
                className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10"
                style={{
                  color: COLORS.cyan,
                  border: `1px solid ${COLORS.cyan}44`,
                }}
              >
                Zoom to Fit
              </button>
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

          {/* ── Canvas ───────────────────────────────────── */}
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
                    { name, visible: true, locked: false, color: COLORS.white },
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
          className="shrink-0 flex flex-col relative"
          style={{
            background: "#0d0f14",
            borderTop: `1px solid ${COLORS.toolbarBorder}`,
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
                  maxHeight: 200,
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
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors"
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
                      className="text-[11px] font-bold w-10 shrink-0"
                      style={{
                        color: COLORS.cyan,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {cmd.alias}
                    </span>
                    <span
                      className="text-[11px] w-24 shrink-0"
                      style={{
                        color: COLORS.white,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {cmd.name}
                    </span>
                    <span
                      className="text-[10px] truncate"
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
            className="px-3 py-1 overflow-y-auto text-[11px] leading-relaxed"
            style={{
              maxHeight: 60,
              color: COLORS.muted,
              fontFamily: "'Courier New', monospace",
              scrollbarWidth: "thin",
            }}
          >
            {cmdHistory.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith(">")
                    ? COLORS.white
                    : line.startsWith("Command:")
                      ? COLORS.cyan
                      : COLORS.muted,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          {/* Input row */}
          <div
            className="flex items-center gap-2 px-3 h-7"
            style={{
              background: "#0a0c10",
              borderTop: `1px solid ${COLORS.toolbarBorder}`,
            }}
          >
            <span
              className="text-[10px] font-bold shrink-0"
              style={{ color: COLORS.cyan, letterSpacing: 1 }}
            >
              {tool.toUpperCase()}
            </span>
            <span
              className="text-[10px] shrink-0"
              style={{ color: COLORS.muted }}
            >
              {">"}
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
              className="flex-1 bg-transparent outline-none text-[11px]"
              style={{
                color: COLORS.white,
                fontFamily: "'Courier New', monospace",
                caretColor: COLORS.cyan,
              }}
              placeholder={
                aiMode
                  ? 'Ask the AI architect to generate geometry (e.g., "draw a 2 bedroom floor plan")'
                  : agentLoading
                    ? "AI Agent is drawing..."
                    : drawing
                      ? getDrawingPrompt()
                      : "Type command: L, PL, REC, C, DIM, T, E, P, S, U, AI or x,y"
              }
              autoComplete="off"
              spellCheck={false}
            />
            <div
              className="flex items-center gap-2 ml-auto shrink-0 pl-4 border-l"
              style={{ borderColor: COLORS.toolbarBorder }}
            >
              <span
                className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1"
                style={{ color: aiMode ? "#a855f7" : COLORS.muted }}
              >
                <RobotOutlined /> AI Mode
              </span>
              <Switch
                size="small"
                checked={aiMode}
                onChange={(val) => {
                  setAiMode(val);
                  setTimeout(() => cmdInputRef.current?.focus(), 50);
                }}
              />
            </div>
            {agentLoading && (
              <span
                className="text-[10px] shrink-0 animate-pulse"
                style={{ color: COLORS.yellow }}
              >
                <LoadingOutlined style={{ fontSize: 12 }} /> Drawing...
              </span>
            )}
            <span
              className="text-[9px] shrink-0"
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
          styles={{ body: { paddingTop: 16 } }}
          width={400}
        >
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block mb-1 font-semibold text-gray-400">
                Drawing Units
              </label>
              <Select
                value={settings.unit}
                onChange={(val) =>
                  setSettings((s) => ({ ...s, unit: val as UnitSystem }))
                }
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

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-400">
                  Precision
                </label>
                <Select
                  value={settings.precision}
                  onChange={(val) =>
                    setSettings((s) => ({ ...s, precision: val }))
                  }
                  className="w-full"
                  options={[
                    { value: 0, label: "0 (e.g. 10)" },
                    { value: 1, label: "0.1 (e.g. 10.5)" },
                    { value: 2, label: "0.01 (e.g. 10.50)" },
                    { value: 3, label: "0.001 (e.g. 10.500)" },
                  ]}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-400">
                  Annotation Scale
                </label>
                <Select
                  value={settings.annoScale}
                  onChange={(val) =>
                    setSettings((s) => ({ ...s, annoScale: val }))
                  }
                  className="w-full"
                  options={[
                    { value: 200, label: "1:50 (200% size)" },
                    { value: 100, label: "1:100 (100% size)" },
                    { value: 50, label: "1:200 (50% size)" },
                    { value: 25, label: "1:400 (25% size)" },
                  ]}
                />
                <p className="text-[9px] mt-1 opacity-70 text-gray-500">
                  Affects Text & Dimensions
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-400">
                  Grid Snap Size
                </label>
                <InputNumber
                  className="w-full"
                  value={settings.gridSize}
                  onChange={(val) =>
                    setSettings((s) => ({ ...s, gridSize: val || 20 }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-400">
                  Major Grid Lines
                </label>
                <InputNumber
                  className="w-full"
                  value={settings.majorGrid}
                  onChange={(val) =>
                    setSettings((s) => ({ ...s, majorGrid: val || 5 }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Checkbox
                checked={settings.mergeWalls}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, mergeWalls: e.target.checked }))
                }
              >
                Merge Walls (Thickness ≥ 10)
              </Checkbox>
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}

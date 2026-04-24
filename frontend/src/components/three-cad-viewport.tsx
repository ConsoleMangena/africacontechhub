import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  Text,
  PerspectiveCamera,
  PointerLockControls,
} from "@react-three/drei";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Types (mirrored exactly from architectural-studio) ──
type DrawingElement =
  | { id: string; type: "line"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "circle"; x: number; y: number; radius: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "text"; x: number; y: number; text: string; color: string; lineWidth: number; layer: string }
  | { id: string; type: "dimension"; x: number; y: number; x2: number; y2: number; color: string; lineWidth: number; layer: string }
  | { id: string; type: "polyline"; points: { x: number; y: number }[]; color: string; lineWidth: number; layer: string }
  | { id: string; type: "block"; x: number; y: number; width: number; height: number; symbolName: string; rotation: number; color: string; lineWidth: number; layer: string; flipX?: boolean; flipY?: boolean };

type LayerData = { name: string; visible: boolean; locked: boolean; color: string };

// ─── Scale: studio uses mm, Three.js uses meters ─────────
const S = 1 / 1000;
const WALL_HEIGHT = 2.7;
const WALL_THICKNESS = 0.15; // 150mm default wall thickness
const LINE_HEIGHT = 0.02; // thin lines sit just above the floor
const ROOF_THICKNESS = 0.08;

function createHatchTexture(base = "#777", line = "#555", step = 16) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let i = -128; i < 256; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 128);
    ctx.lineTo(i + 128, 0);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = 4;
  return tex;
}

// ─── Realistic brick texture generator ───────────────────
const BRICK_W = 80;   // px per brick width
const BRICK_H = 34;   // px per brick height
const MORTAR = 4;     // mortar joint thickness in px
const TEX_COLS = 6;
const TEX_ROWS = 12;
const BRICK_TEX_W = TEX_COLS * (BRICK_W + MORTAR) + MORTAR;
const BRICK_TEX_H = TEX_ROWS * (BRICK_H + MORTAR) + MORTAR;

function _randBrickColor(): string {
  // Varied clay brick tones
  const bases = [
    [178, 100, 65], [190, 110, 70], [165, 90, 60],
    [155, 85, 55],  [185, 105, 68], [170, 95, 62],
    [195, 115, 75], [160, 88, 58],  [175, 98, 64],
  ];
  const b = bases[Math.floor(Math.random() * bases.length)];
  // Slight per-brick variation
  const v = () => Math.floor((Math.random() - 0.5) * 18);
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  return `rgb(${clamp(b[0] + v())},${clamp(b[1] + v())},${clamp(b[2] + v())})`;
}

function _drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Fill with base brick color
  ctx.fillStyle = _randBrickColor();
  ctx.fillRect(x, y, w, h);
  // Subtle shading: darker bottom edge, lighter top edge
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "rgba(255,255,255,0.06)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.10)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  // Tiny speckle noise for realism
  for (let i = 0; i < 6; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)";
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function createBrickTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = BRICK_TEX_W;
  canvas.height = BRICK_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Mortar background
  ctx.fillStyle = "#b8b0a4";
  ctx.fillRect(0, 0, BRICK_TEX_W, BRICK_TEX_H);
  // Mortar grain
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
    ctx.fillRect(Math.random() * BRICK_TEX_W, Math.random() * BRICK_TEX_H, 2, 1);
  }

  // Draw bricks in staggered bond pattern
  for (let row = 0; row < TEX_ROWS; row++) {
    const y = MORTAR + row * (BRICK_H + MORTAR);
    const offset = row % 2 === 0 ? 0 : (BRICK_W + MORTAR) / 2;
    for (let col = -1; col < TEX_COLS + 1; col++) {
      const x = MORTAR + col * (BRICK_W + MORTAR) + offset;
      // Clip to canvas
      const bx = Math.max(0, x);
      const bw = Math.min(x + BRICK_W, BRICK_TEX_W) - bx;
      if (bw <= 0) continue;
      _drawBrick(ctx, bx, y, bw, BRICK_H);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBrickBumpMap() {
  const canvas = document.createElement("canvas");
  canvas.width = BRICK_TEX_W;
  canvas.height = BRICK_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Mortar joints are recessed (dark = low)
  ctx.fillStyle = "#404040";
  ctx.fillRect(0, 0, BRICK_TEX_W, BRICK_TEX_H);

  // Bricks are raised (light = high)
  for (let row = 0; row < TEX_ROWS; row++) {
    const y = MORTAR + row * (BRICK_H + MORTAR);
    const offset = row % 2 === 0 ? 0 : (BRICK_W + MORTAR) / 2;
    for (let col = -1; col < TEX_COLS + 1; col++) {
      const x = MORTAR + col * (BRICK_W + MORTAR) + offset;
      const bx = Math.max(0, x);
      const bw = Math.min(x + BRICK_W, BRICK_TEX_W) - bx;
      if (bw <= 0) continue;
      // Raised brick surface
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(bx, y, bw, BRICK_H);
      // Subtle rounded edge: darker 1px border inside
      ctx.fillStyle = "#999";
      ctx.fillRect(bx, y, bw, 1);
      ctx.fillRect(bx, y + BRICK_H - 1, bw, 1);
      ctx.fillRect(bx, y, 1, BRICK_H);
      ctx.fillRect(bx + bw - 1, y, 1, BRICK_H);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

// ─── Shared brick material textures (created once) ──────
let _brickTexCache: THREE.Texture | null = null;
let _brickBumpCache: THREE.Texture | null = null;
function getBrickTextures() {
  if (!_brickTexCache) _brickTexCache = createBrickTexture();
  if (!_brickBumpCache) _brickBumpCache = createBrickBumpMap();
  return { map: _brickTexCache, bump: _brickBumpCache };
}

function useBrickMaterial(lengthM: number, heightM: number) {
  return useMemo(() => {
    const { map, bump } = getBrickTextures();
    if (!map || !bump) return { map: undefined, bumpMap: undefined, repeatX: 1, repeatY: 1 };
    // Each texture tile = ~0.5m wide, ~0.4m tall in real world
    const repeatX = lengthM / 0.5;
    const repeatY = heightM / 0.4;
    // Clone textures so each wall can have independent repeats
    const m = map.clone();
    m.wrapS = m.wrapT = THREE.RepeatWrapping;
    m.repeat.set(repeatX, repeatY);
    m.needsUpdate = true;
    const b = bump.clone();
    b.wrapS = b.wrapT = THREE.RepeatWrapping;
    b.repeat.set(repeatX, repeatY);
    b.needsUpdate = true;
    return { map: m, bumpMap: b, repeatX, repeatY };
  }, [lengthM, heightM]);
}

// ─── Helper: is this layer a "wall" layer? ───────────────
const isWallLayer = (layer: string) => /wall/i.test(layer);

// ─── Helper: get element color for 3D material ───────────
// Uses the exact element.color that the 2D canvas uses (which comes from layer color)
const matColor = (c: string) => c;

// ─── Helper: compute bounds of all elements ──────────────
function computeBounds(elements: DrawingElement[]) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const el of elements) {
    if (el.type === "line" || el.type === "dimension") {
      for (const px of [el.x, el.x2]) { minX = Math.min(minX, px * S); maxX = Math.max(maxX, px * S); }
      for (const py of [el.y, el.y2]) { minZ = Math.min(minZ, py * S); maxZ = Math.max(maxZ, py * S); }
    } else if (el.type === "rect") {
      minX = Math.min(minX, el.x * S, (el.x + el.width) * S);
      maxX = Math.max(maxX, el.x * S, (el.x + el.width) * S);
      minZ = Math.min(minZ, el.y * S, (el.y + el.height) * S);
      maxZ = Math.max(maxZ, el.y * S, (el.y + el.height) * S);
    } else if (el.type === "circle") {
      minX = Math.min(minX, (el.x - el.radius) * S); maxX = Math.max(maxX, (el.x + el.radius) * S);
      minZ = Math.min(minZ, (el.y - el.radius) * S); maxZ = Math.max(maxZ, (el.y + el.radius) * S);
    } else if (el.type === "polyline") {
      for (const p of el.points) { minX = Math.min(minX, p.x * S); maxX = Math.max(maxX, p.x * S); minZ = Math.min(minZ, p.y * S); maxZ = Math.max(maxZ, p.y * S); }
    } else if (el.type === "block") {
      minX = Math.min(minX, el.x * S, (el.x + el.width) * S);
      maxX = Math.max(maxX, el.x * S, (el.x + el.width) * S);
      minZ = Math.min(minZ, el.y * S, (el.y + el.height) * S);
      maxZ = Math.max(maxZ, el.y * S, (el.y + el.height) * S);
    }
  }
  if (!isFinite(minX)) return null;
  return { minX, minZ, maxX, maxZ };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3D ELEMENT RENDERERS
//  Every 2D element has a 1:1 3D counterpart at the exact
//  same position (X→X, Y→Z in Three.js coords)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── LINE ──────────────────────────────────────────────────
// Walls layer → extruded box wall (full height)
// Other layers → thin raised line
function Line3D({ el }: { el: DrawingElement & { type: "line" } }) {
  const dx = (el.x2 - el.x) * S;
  const dz = (el.y2 - el.y) * S;
  const length = Math.hypot(dx, dz);
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT;
  const thick = wall ? WALL_THICKNESS : Math.max(el.lineWidth * S * 5, 0.02);
  const brick = useBrickMaterial(length, h);

  if (length < 0.001) return null;
  const angle = Math.atan2(dz, dx);
  const cx = ((el.x + el.x2) / 2) * S;
  const cz = ((el.y + el.y2) / 2) * S;

  return (
    <mesh position={[cx, h / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, h, thick]} />
      {wall ? (
        <meshStandardMaterial
          map={brick.map}
          bumpMap={brick.bumpMap}
          bumpScale={0.015}
          roughness={0.88}
          metalness={0.02}
        />
      ) : (
        <meshStandardMaterial color={matColor(el.color)} roughness={0.5} />
      )}
    </mesh>
  );
}

// ── POLYLINE ──────────────────────────────────────────────
// Same logic as lines: wall layer → wall segments, else thin tubes
function PolylineWallSegment({ p1, p2, id, idx, h, thick, wall, color }: {
  p1: { x: number; y: number }; p2: { x: number; y: number };
  id: string; idx: number; h: number; thick: number; wall: boolean; color: string;
}) {
  const dx = (p2.x - p1.x) * S;
  const dz = (p2.y - p1.y) * S;
  const length = Math.hypot(dx, dz);
  const brick = useBrickMaterial(length, h);

  if (length < 0.001) return null;
  const angle = Math.atan2(dz, dx);
  const cx = ((p1.x + p2.x) / 2) * S;
  const cz = ((p1.y + p2.y) / 2) * S;

  return (
    <mesh key={`${id}-s${idx}`} position={[cx, h / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length + thick, h, thick]} />
      {wall ? (
        <meshStandardMaterial
          map={brick.map}
          bumpMap={brick.bumpMap}
          bumpScale={0.015}
          roughness={0.88}
          metalness={0.02}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.5} />
      )}
    </mesh>
  );
}

function Polyline3D({ el }: { el: DrawingElement & { type: "polyline" } }) {
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT;
  const thick = wall ? WALL_THICKNESS : Math.max(el.lineWidth * S * 5, 0.02);
  const color = matColor(el.color);

  return (
    <>
      {el.points.slice(0, -1).map((p1, i) => (
        <PolylineWallSegment
          key={`${el.id}-s${i}`}
          p1={p1}
          p2={el.points[i + 1]}
          id={el.id}
          idx={i}
          h={h}
          thick={thick}
          wall={wall}
          color={color}
        />
      ))}
    </>
  );
}

// ── RECT ──────────────────────────────────────────────────
// On wall layer → 4 wall segments forming a room outline
// Other layers → thin flat outline on floor
function RectWall({ pos, geoArgs, wall, color, lengthM, heightM }: {
  pos: [number, number, number]; geoArgs: [number, number, number];
  wall: boolean; color: string; lengthM: number; heightM: number;
}) {
  const brick = useBrickMaterial(lengthM, heightM);
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={geoArgs} />
      {wall ? (
        <meshStandardMaterial
          map={brick.map}
          bumpMap={brick.bumpMap}
          bumpScale={0.015}
          roughness={0.88}
          metalness={0.02}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.85} />
      )}
    </mesh>
  );
}

function Rect3D({ el }: { el: DrawingElement & { type: "rect" } }) {
  const x1 = el.x * S;
  const z1 = el.y * S;
  const x2 = (el.x + el.width) * S;
  const z2 = (el.y + el.height) * S;
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT;
  const thick = wall ? WALL_THICKNESS : Math.max(el.lineWidth * S * 5, 0.02);
  const color = matColor(el.color);
  const w = Math.abs(x2 - x1);
  const d = Math.abs(z2 - z1);
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;

  return (
    <group>
      <RectWall pos={[cx, h / 2, z1]} geoArgs={[w + thick, h, thick]} wall={wall} color={color} lengthM={w} heightM={h} />
      <RectWall pos={[cx, h / 2, z2]} geoArgs={[w + thick, h, thick]} wall={wall} color={color} lengthM={w} heightM={h} />
      <RectWall pos={[x1, h / 2, cz]} geoArgs={[thick, h, d + thick]} wall={wall} color={color} lengthM={d} heightM={h} />
      <RectWall pos={[x2, h / 2, cz]} geoArgs={[thick, h, d + thick]} wall={wall} color={color} lengthM={d} heightM={h} />
    </group>
  );
}

// ── CIRCLE ────────────────────────────────────────────────
// Exact same center and radius, extruded as a cylinder column
function Circle3D({ el }: { el: DrawingElement & { type: "circle" } }) {
  const r = el.radius * S;
  const cx = el.x * S;
  const cz = el.y * S;
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT * 2;

  return (
    <mesh position={[cx, h / 2, cz]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 32]} />
      <meshStandardMaterial color={matColor(el.color)} roughness={0.6} transparent={!wall} opacity={wall ? 1 : 0.8} />
    </mesh>
  );
}

// ── DIMENSION ─────────────────────────────────────────────
// Line on floor + measurement label (matching 2D exactly)
function Dimension3D({ el }: { el: DrawingElement & { type: "dimension" } }) {
  const dx = (el.x2 - el.x) * S;
  const dz = (el.y2 - el.y) * S;
  const length = Math.hypot(dx, dz);
  if (length < 0.001) return null;
  const angle = Math.atan2(dz, dx);
  const cx = ((el.x + el.x2) / 2) * S;
  const cz = ((el.y + el.y2) / 2) * S;
  // Distance in mm for label
  const distMm = Math.hypot(el.x2 - el.x, el.y2 - el.y);
  const label = distMm >= 1000 ? `${(distMm / 1000).toFixed(2)} m` : `${Math.round(distMm)} mm`;
  // Text offset perpendicular to line
  const offsetDist = 0.15;
  const nx = Math.cos(angle - Math.PI / 2);
  const nz = Math.sin(angle - Math.PI / 2);

  return (
    <group>
      {/* Dimension line on floor */}
      <mesh position={[cx, 0.01, cz]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[length, 0.005, 0.01]} />
        <meshStandardMaterial color={matColor(el.color)} />
      </mesh>
      {/* Tick mark at start */}
      <mesh position={[el.x * S, 0.01, el.y * S]} rotation={[0, -angle + Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.005, 0.01]} />
        <meshStandardMaterial color={matColor(el.color)} />
      </mesh>
      {/* Tick mark at end */}
      <mesh position={[el.x2 * S, 0.01, el.y2 * S]} rotation={[0, -angle + Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.005, 0.01]} />
        <meshStandardMaterial color={matColor(el.color)} />
      </mesh>
      {/* Measurement text */}
      <Text
        position={[cx + nx * offsetDist, 0.02, cz + nz * offsetDist]}
        rotation={[-Math.PI / 2, 0, -angle]}
        fontSize={0.1}
        color={matColor(el.color)}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// ── TEXT ───────────────────────────────────────────────────
// Same position, rendered as flat text on the floor plane
function Text3D({ el }: { el: DrawingElement & { type: "text" } }) {
  return (
    <Text
      position={[el.x * S, 0.02, el.y * S]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.15}
      color={matColor(el.color)}
      anchorX="left"
      anchorY="top"
    >
      {el.text}
    </Text>
  );
}

// ── BLOCK ─────────────────────────────────────────────────
// Symbol-specific 3D representations at exact 2D position + rotation
function Block3D({ el }: { el: DrawingElement & { type: "block" } }) {
  const w = el.width * S;
  let blockDepth = el.height * S;
  const rot = -(el.rotation * Math.PI) / 180;
  const px = el.x * S;
  const pz = el.y * S;

  // Symbol-specific heights and shapes
  const sym = el.symbolName.toLowerCase();
  const isDoor = sym.includes("door");
  const isWindow = sym.includes("window");

  if (isDoor || isWindow) {
    if (isDoor) {
      // Door frame representation
      const thickness = WALL_THICKNESS * 1.5;
      const doorHeight = 2.1; // 2.1m standard door height
      const lintelH = 0.1;   // 100mm lintel depth
      const lintelExtra = 0.1; // 100mm extend each side
      // Center pivot offset
      const dx = Math.cos(-rot) * (w / 2);
      const dz = Math.sin(-rot) * (w / 2);

      return (
        <group position={[px + dx, 0, pz + dz]} rotation={[0, rot, 0]}>
          {/* Door panel */}
          <mesh position={[0, doorHeight / 2, 0]} castShadow>
            <boxGeometry args={[w, doorHeight, thickness]} />
            <meshStandardMaterial color={"#5c3d2e"} roughness={0.8} />
          </mesh>
          {/* Lintel — concrete beam above door */}
          <mesh position={[0, doorHeight + lintelH / 2, 0]} castShadow>
            <boxGeometry args={[w + lintelExtra * 2, lintelH, WALL_THICKNESS * 1.2]} />
            <meshStandardMaterial color="#9e9e9e" roughness={0.7} metalness={0.05} />
          </mesh>
        </group>
      );
    }

    if (isWindow) {
      const width = w;
      const frameThick = WALL_THICKNESS * 1.1; // depth into wall
      const frameBar = 0.04; // 40mm frame profile
      const windowHeight = 1.2;
      const windowSill = 0.9;
      const mullionBar = 0.025; // 25mm mullion divider

      const dx = Math.cos(-rot) * (width / 2);
      const dz = Math.sin(-rot) * (width / 2);

      // Inner glass area
      const glassW = width - frameBar * 2;
      const glassH = windowHeight - frameBar * 2;

      // Pane grid: columns based on width, rows based on height
      const numCols = Math.max(1, Math.round(glassW / 0.35)); // ~350mm per pane
      const numRows = Math.max(1, Math.round(glassH / 0.45)); // ~450mm per pane
      const paneW = (glassW - mullionBar * (numCols - 1)) / numCols;
      const paneH = (glassH - mullionBar * (numRows - 1)) / numRows;

      // Wall-punch material: writes depth only → hides wall behind window
      const punchMat = useMemo(() => {
        const mat = new THREE.MeshBasicMaterial({ colorWrite: false });
        mat.depthWrite = true;
        return mat;
      }, []);

      // Build mullion and pane arrays
      const mullions: React.ReactNode[] = [];
      const panes: React.ReactNode[] = [];

      // Vertical mullions
      for (let c = 1; c < numCols; c++) {
        const mx = -glassW / 2 + c * (paneW + mullionBar) - mullionBar / 2;
        mullions.push(
          <mesh key={`mv-${c}`} position={[mx, 0, 0]} castShadow>
            <boxGeometry args={[mullionBar, glassH, frameThick * 0.5]} />
            <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.6} />
          </mesh>
        );
      }
      // Horizontal mullions
      for (let r = 1; r < numRows; r++) {
        const my = -glassH / 2 + r * (paneH + mullionBar) - mullionBar / 2;
        mullions.push(
          <mesh key={`mh-${r}`} position={[0, my, 0]} castShadow>
            <boxGeometry args={[glassW, mullionBar, frameThick * 0.5]} />
            <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.6} />
          </mesh>
        );
      }

      // Individual glass panes
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const px2 = -glassW / 2 + paneW / 2 + c * (paneW + mullionBar);
          const py2 = -glassH / 2 + paneH / 2 + r * (paneH + mullionBar);
          panes.push(
            <mesh key={`pane-${r}-${c}`} position={[px2, py2, 0]} renderOrder={1}>
              <boxGeometry args={[paneW - 0.005, paneH - 0.005, frameThick * 0.12]} />
              <meshPhysicalMaterial
                color="#a8d8ea"
                transmission={0.7}
                transparent
                opacity={0.3}
                roughness={0.05}
                metalness={0.1}
                ior={1.5}
                thickness={0.005}
                envMapIntensity={1.5}
                depthWrite={false}
              />
            </mesh>
          );
        }
      }

      const lintelH = 0.1;    // 100mm lintel depth
      const lintelExtra = 0.1; // 100mm extend each side

      return (
        <group position={[px + dx, windowSill + windowHeight / 2, pz + dz]} rotation={[0, rot, 0]}>
          {/* Wall cutout — depth-only pass, renders before walls to punch a hole */}
          <mesh renderOrder={-1} material={punchMat}>
            <boxGeometry args={[glassW, glassH, WALL_THICKNESS * 2]} />
          </mesh>

          {/* Lintel — concrete beam above window */}
          <mesh position={[0, windowHeight / 2 + lintelH / 2, 0]} castShadow>
            <boxGeometry args={[width + lintelExtra * 2, lintelH, WALL_THICKNESS * 1.2]} />
            <meshStandardMaterial color="#9e9e9e" roughness={0.7} metalness={0.05} />
          </mesh>

          {/* Outer frame — aluminium */}
          {/* Top bar */}
          <mesh position={[0, windowHeight / 2 - frameBar / 2, 0]} castShadow>
            <boxGeometry args={[width, frameBar, frameThick]} />
            <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* Bottom bar (sill) */}
          <mesh position={[0, -(windowHeight / 2 - frameBar / 2), 0]} castShadow>
            <boxGeometry args={[width + 0.03, frameBar + 0.01, frameThick + 0.02]} />
            <meshStandardMaterial color="#737d85" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Left bar */}
          <mesh position={[-(width / 2 - frameBar / 2), 0, 0]} castShadow>
            <boxGeometry args={[frameBar, windowHeight, frameThick]} />
            <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* Right bar */}
          <mesh position={[width / 2 - frameBar / 2, 0, 0]} castShadow>
            <boxGeometry args={[frameBar, windowHeight, frameThick]} />
            <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.6} />
          </mesh>

          {/* Mullion dividers */}
          {mullions}

          {/* Individual glass panes */}
          {panes}
        </group>
      );
    }
  }

  const d = blockDepth;

  // ── Toilet ──
  if (sym.includes("toilet")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Tank */}
        <mesh position={[w / 2, 0.35, d * 0.1]} castShadow>
          <boxGeometry args={[w * 0.7, 0.45, d * 0.25]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
        </mesh>
        {/* Bowl */}
        <mesh position={[w / 2, 0.2, d * 0.55]} castShadow>
          <cylinderGeometry args={[w * 0.35, w * 0.3, 0.35, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Seat */}
        <mesh position={[w / 2, 0.38, d * 0.55]} castShadow>
          <cylinderGeometry args={[w * 0.32, w * 0.34, 0.04, 16]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.25} />
        </mesh>
      </group>
    );
  }

  // ── Basin / Wash Basin ──
  if (sym.includes("basin") && !sym.includes("sink")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Pedestal */}
        <mesh position={[w / 2, 0.35, d / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 0.7, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.25} />
        </mesh>
        {/* Basin bowl */}
        <mesh position={[w / 2, 0.72, d / 2]} castShadow>
          <cylinderGeometry args={[w * 0.45, w * 0.35, 0.12, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.05} />
        </mesh>
        {/* Tap */}
        <mesh position={[w / 2, 0.85, d * 0.15]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // ── Bathtub ──
  if (sym.includes("bath") || sym.includes("tub")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Outer shell */}
        <mesh position={[w / 2, 0.28, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.55, d]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.25} />
        </mesh>
        {/* Inner basin (water area) */}
        <mesh position={[w / 2, 0.35, d / 2]}>
          <boxGeometry args={[w - 0.08, 0.35, d - 0.08]} />
          <meshStandardMaterial color="#e3f2fd" roughness={0.1} metalness={0.05} />
        </mesh>
        {/* Tap end */}
        <mesh position={[w / 2, 0.6, d * 0.05]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.2} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  // ── Shower ──
  if (sym.includes("shower")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Tray */}
        <mesh position={[w / 2, 0.03, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.06, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.3} />
        </mesh>
        {/* Glass walls (2 sides) */}
        <mesh position={[w / 2, 1.0, 0.02]} castShadow>
          <boxGeometry args={[w, 2.0, 0.02]} />
          <meshPhysicalMaterial color="#a8d8ea" transmission={0.7} transparent opacity={0.2} roughness={0.05} />
        </mesh>
        <mesh position={[0.02, 1.0, d / 2]} castShadow>
          <boxGeometry args={[0.02, 2.0, d]} />
          <meshPhysicalMaterial color="#a8d8ea" transmission={0.7} transparent opacity={0.2} roughness={0.05} />
        </mesh>
        {/* Shower head */}
        <mesh position={[w * 0.3, 2.0, d * 0.15]} castShadow>
          <cylinderGeometry args={[0.06, 0.04, 0.02, 12]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Riser pipe */}
        <mesh position={[w * 0.3, 1.5, 0.05]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.2} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  // ── Kitchen Sink ──
  if (sym.includes("sink")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Counter base */}
        <mesh position={[w / 2, 0.43, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.85, d]} />
          <meshStandardMaterial color="#795548" roughness={0.85} />
        </mesh>
        {/* Countertop */}
        <mesh position={[w / 2, 0.88, d / 2]} castShadow>
          <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Sink basin */}
        <mesh position={[w / 2, 0.82, d / 2]}>
          <boxGeometry args={[w * 0.6, 0.15, d * 0.5]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.15} metalness={0.3} />
        </mesh>
        {/* Tap */}
        <mesh position={[w / 2, 1.05, d * 0.15]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // ── Stove / Cooktop ──
  if (sym.includes("stove") || sym.includes("cooktop")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Oven body */}
        <mesh position={[w / 2, 0.43, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.85, d]} />
          <meshStandardMaterial color="#424242" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Cooktop surface */}
        <mesh position={[w / 2, 0.87, d / 2]} castShadow>
          <boxGeometry args={[w, 0.02, d]} />
          <meshStandardMaterial color="#212121" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Burners (4) */}
        {[[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]].map(([bx, bz], i) => (
          <mesh key={i} position={[w * bx, 0.89, d * bz]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[w * 0.06, w * 0.1, 16]} />
            <meshStandardMaterial color="#616161" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        {/* Oven door handle */}
        <mesh position={[w / 2, 0.55, d + 0.02]} castShadow>
          <boxGeometry args={[w * 0.5, 0.025, 0.025]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // ── Fridge ──
  if (sym.includes("fridge")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Main body */}
        <mesh position={[w / 2, 0.9, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.8, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Freezer door line */}
        <mesh position={[w / 2, 1.55, d / 2 + 0.001]}>
          <boxGeometry args={[w - 0.02, 0.01, 0.001]} />
          <meshStandardMaterial color="#9e9e9e" />
        </mesh>
        {/* Handle */}
        <mesh position={[w * 0.85, 1.1, d / 2 + 0.03]} castShadow>
          <boxGeometry args={[0.02, 0.3, 0.03]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Freezer handle */}
        <mesh position={[w * 0.85, 1.65, d / 2 + 0.03]} castShadow>
          <boxGeometry args={[0.02, 0.15, 0.03]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.25} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // ── Kitchen Counter ──
  if (sym.includes("kitchen_counter") || sym.includes("counter")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Cabinets */}
        <mesh position={[w / 2, 0.4, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.8, d]} />
          <meshStandardMaterial color="#5d4037" roughness={0.85} />
        </mesh>
        {/* Countertop */}
        <mesh position={[w / 2, 0.82, d / 2]} castShadow>
          <boxGeometry args={[w + 0.03, 0.04, d + 0.03]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Cabinet handles */}
        {Array.from({ length: Math.max(1, Math.round(w / 0.6)) }, (_, i) => (
          <mesh key={i} position={[0.3 + i * 0.6, 0.5, d / 2 + 0.02]} castShadow>
            <boxGeometry args={[0.08, 0.015, 0.02]} />
            <meshStandardMaterial color="#bdbdbd" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Bed (Single & Double) ──
  if (sym.includes("bed")) {
    const isDouble = sym.includes("double");
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Frame base */}
        <mesh position={[w / 2, 0.15, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.3, d]} />
          <meshStandardMaterial color="#5d4037" roughness={0.85} />
        </mesh>
        {/* Mattress */}
        <mesh position={[w / 2, 0.38, d / 2]} castShadow>
          <boxGeometry args={[w - 0.04, 0.16, d - 0.04]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
        </mesh>
        {/* Headboard */}
        <mesh position={[w / 2, 0.55, 0.04]} castShadow>
          <boxGeometry args={[w, 0.6, 0.06]} />
          <meshStandardMaterial color="#4e342e" roughness={0.8} />
        </mesh>
        {/* Pillow(s) */}
        {isDouble ? (
          <>
            <mesh position={[w * 0.3, 0.5, d * 0.12]} castShadow>
              <boxGeometry args={[w * 0.35, 0.08, d * 0.15]} />
              <meshStandardMaterial color="#fff9c4" roughness={0.95} />
            </mesh>
            <mesh position={[w * 0.7, 0.5, d * 0.12]} castShadow>
              <boxGeometry args={[w * 0.35, 0.08, d * 0.15]} />
              <meshStandardMaterial color="#fff9c4" roughness={0.95} />
            </mesh>
          </>
        ) : (
          <mesh position={[w / 2, 0.5, d * 0.12]} castShadow>
            <boxGeometry args={[w * 0.7, 0.08, d * 0.15]} />
            <meshStandardMaterial color="#fff9c4" roughness={0.95} />
          </mesh>
        )}
        {/* Duvet / blanket */}
        <mesh position={[w / 2, 0.48, d * 0.55]} castShadow>
          <boxGeometry args={[w - 0.06, 0.06, d * 0.6]} />
          <meshStandardMaterial color="#bbdefb" roughness={0.95} />
        </mesh>
      </group>
    );
  }

  // ── Sofa ──
  if (sym.includes("sofa")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Base/frame */}
        <mesh position={[w / 2, 0.15, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.3, d]} />
          <meshStandardMaterial color="#5d4037" roughness={0.85} />
        </mesh>
        {/* Seat cushion */}
        <mesh position={[w / 2, 0.33, d * 0.55]} castShadow>
          <boxGeometry args={[w - 0.06, 0.12, d * 0.6]} />
          <meshStandardMaterial color="#78909c" roughness={0.9} />
        </mesh>
        {/* Back rest */}
        <mesh position={[w / 2, 0.52, d * 0.08]} castShadow>
          <boxGeometry args={[w - 0.06, 0.4, d * 0.2]} />
          <meshStandardMaterial color="#607d8b" roughness={0.85} />
        </mesh>
        {/* Left armrest */}
        <mesh position={[0.05, 0.35, d / 2]} castShadow>
          <boxGeometry args={[0.08, 0.28, d * 0.8]} />
          <meshStandardMaterial color="#607d8b" roughness={0.85} />
        </mesh>
        {/* Right armrest */}
        <mesh position={[w - 0.05, 0.35, d / 2]} castShadow>
          <boxGeometry args={[0.08, 0.28, d * 0.8]} />
          <meshStandardMaterial color="#607d8b" roughness={0.85} />
        </mesh>
        {/* Legs (4) */}
        {[[0.06, 0.06], [w - 0.06, 0.06], [0.06, d - 0.06], [w - 0.06, d - 0.06]].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.03, lz]}>
            <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
            <meshStandardMaterial color="#3e2723" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Dining Table ──
  if (sym.includes("dining_table") || sym.includes("table")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Table top */}
        <mesh position={[w / 2, 0.75, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.7} />
        </mesh>
        {/* Legs (4) */}
        {[[0.06, 0.06], [w - 0.06, 0.06], [0.06, d - 0.06], [w - 0.06, d - 0.06]].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.37, lz]} castShadow>
            <boxGeometry args={[0.05, 0.73, 0.05]} />
            <meshStandardMaterial color="#5d4037" roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── TV Unit ──
  if (sym.includes("tv_unit") || sym.includes("tv")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Console table */}
        <mesh position={[w / 2, 0.25, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color="#37474f" roughness={0.7} />
        </mesh>
        {/* TV screen */}
        <mesh position={[w / 2, 0.95, d * 0.15]} castShadow>
          <boxGeometry args={[w * 0.85, 0.65, 0.03]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.3} />
        </mesh>
        {/* TV stand */}
        <mesh position={[w / 2, 0.55, d * 0.15]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.08]} />
          <meshStandardMaterial color="#424242" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
    );
  }

  // ── Stairs ──
  if (sym.includes("stair")) {
    const numSteps = Math.max(4, Math.round(d / 0.28));
    const stepH = WALL_HEIGHT / numSteps;
    const stepD = d / numSteps;
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {Array.from({ length: numSteps }, (_, i) => (
          <mesh key={i} position={[w / 2, stepH * (i + 0.5), stepD * (i + 0.5)]} castShadow receiveShadow>
            <boxGeometry args={[w, stepH, stepD]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#bcaaa4" : "#a1887f"} roughness={0.8} />
          </mesh>
        ))}
        {/* Railing */}
        <mesh position={[0.03, WALL_HEIGHT / 2 + 0.45, d / 2]} castShadow>
          <boxGeometry args={[0.04, WALL_HEIGHT + 0.9, d]} />
          <meshStandardMaterial color="#78909c" roughness={0.3} metalness={0.5} transparent opacity={0.4} />
        </mesh>
      </group>
    );
  }

  // ── Column ──
  if (sym === "column") {
    const radius = Math.max(w, d) / 2;
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[0, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, WALL_HEIGHT, 16]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.4} />
        </mesh>
        {/* Capital */}
        <mesh position={[0, WALL_HEIGHT, 0]} castShadow>
          <cylinderGeometry args={[radius * 1.2, radius, 0.08, 16]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.35} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[radius, radius * 1.2, 0.08, 16]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.35} />
        </mesh>
      </group>
    );
  }

  // ── Elevator ──
  if (sym === "elevator") {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Shaft walls */}
        <mesh position={[w / 2, WALL_HEIGHT / 2, d / 2]} castShadow>
          <boxGeometry args={[w, WALL_HEIGHT, d]} />
          <meshStandardMaterial color="#78909c" roughness={0.5} transparent opacity={0.4} />
        </mesh>
        {/* Doors */}
        <mesh position={[w / 2, WALL_HEIGHT * 0.4, d + 0.01]}>
          <boxGeometry args={[w * 0.7, WALL_HEIGHT * 0.75, 0.03]} />
          <meshStandardMaterial color="#b0bec5" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Door gap line */}
        <mesh position={[w / 2, WALL_HEIGHT * 0.4, d + 0.025]}>
          <boxGeometry args={[0.01, WALL_HEIGHT * 0.75, 0.01]} />
          <meshStandardMaterial color="#455a64" />
        </mesh>
      </group>
    );
  }

  // ── Escalator ──
  if (sym === "escalator") {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, WALL_HEIGHT * 0.3, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, WALL_HEIGHT * 0.6, d]} />
          <meshStandardMaterial color="#90a4ae" roughness={0.5} transparent opacity={0.6} />
        </mesh>
        {/* Steps (visible lines) */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[w / 2, 0.02, d * (i / 8) + d * 0.06]} castShadow>
            <boxGeometry args={[w * 0.85, 0.015, d * 0.08]} />
            <meshStandardMaterial color="#78909c" roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Pool ──
  if (sym === "pool") {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Pool walls */}
        <mesh position={[w / 2, -0.25, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
        </mesh>
        {/* Water */}
        <mesh position={[w / 2, -0.1, d / 2]}>
          <boxGeometry args={[w - 0.1, 0.3, d - 0.1]} />
          <meshPhysicalMaterial color="#42a5f5" transmission={0.6} transparent opacity={0.5} roughness={0.05} />
        </mesh>
        {/* Pool edge/coping */}
        <mesh position={[w / 2, 0.03, d / 2]} castShadow>
          <boxGeometry args={[w + 0.1, 0.06, d + 0.1]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  // ── Septic Tank ──
  if (sym.includes("septic")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, -0.2, d / 2]}>
          <cylinderGeometry args={[Math.min(w, d) / 2, Math.min(w, d) / 2, 0.8, 16]} />
          <meshStandardMaterial color="#795548" roughness={0.9} transparent opacity={0.5} />
        </mesh>
        {/* Lid */}
        <mesh position={[w / 2, 0.02, d / 2]} castShadow>
          <cylinderGeometry args={[Math.min(w, d) * 0.3, Math.min(w, d) * 0.3, 0.06, 16]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  // ── Parking ──
  if (sym === "parking") {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.02, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.95} />
        </mesh>
        {/* Parking lines */}
        <mesh position={[0.05, 0.045, d / 2]}>
          <boxGeometry args={[0.05, 0.005, d]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[w - 0.05, 0.045, d / 2]}>
          <boxGeometry args={[0.05, 0.005, d]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* P label */}
        <Text position={[w / 2, 0.06, d / 2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={Math.min(w, d) * 0.4} color="#ffffff" anchorX="center" anchorY="middle">P</Text>
      </group>
    );
  }

  // ── Garage (car space) ──
  if (sym === "garage" && !sym.includes("door")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Floor slab */}
        <mesh position={[w / 2, 0.02, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.9} />
        </mesh>
        {/* Car outline (simple) */}
        <mesh position={[w / 2, 0.35, d / 2]} castShadow>
          <boxGeometry args={[w * 0.55, 0.6, d * 0.7]} />
          <meshStandardMaterial color="#546e7a" roughness={0.5} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  // ── Trees ──
  if (sym.includes("tree_deciduous") || (sym.includes("tree") && !sym.includes("palm") && !sym.includes("conifer") && !sym.includes("pine"))) {
    const r = Math.min(w, d) / 2;
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Trunk */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[r * 0.08, r * 0.12, 2.4, 8]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
        {/* Canopy layers */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <sphereGeometry args={[r * 0.8, 12, 10]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.85} />
        </mesh>
        <mesh position={[r * 0.3, 2.5, r * 0.2]} castShadow>
          <sphereGeometry args={[r * 0.5, 10, 8]} />
          <meshStandardMaterial color="#388e3c" roughness={0.85} />
        </mesh>
        <mesh position={[-r * 0.25, 3.1, -r * 0.15]} castShadow>
          <sphereGeometry args={[r * 0.45, 10, 8]} />
          <meshStandardMaterial color="#43a047" roughness={0.85} />
        </mesh>
      </group>
    );
  }

  if (sym.includes("palm")) {
    const r = Math.min(w, d) / 2;
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Trunk */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <cylinderGeometry args={[r * 0.06, r * 0.1, 4.0, 8]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.9} />
        </mesh>
        {/* Fronds */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <mesh key={i} position={[Math.cos(rad) * r * 0.4, 3.8, Math.sin(rad) * r * 0.4]} rotation={[0.8, rad, 0]} castShadow>
              <boxGeometry args={[r * 0.15, 0.02, r * 0.8]} />
              <meshStandardMaterial color="#388e3c" roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    );
  }

  if (sym.includes("conifer") || sym.includes("pine")) {
    const r = Math.min(w, d) / 2;
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Trunk */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[r * 0.06, r * 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
        {/* Cone layers */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <coneGeometry args={[r * 0.7, 1.2, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.4, 0]} castShadow>
          <coneGeometry args={[r * 0.55, 1.0, 8]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.0, 0]} castShadow>
          <coneGeometry args={[r * 0.35, 0.8, 8]} />
          <meshStandardMaterial color="#388e3c" roughness={0.85} />
        </mesh>
      </group>
    );
  }

  // ── Shrub ──
  if (sym.includes("shrub")) {
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[Math.min(w, d) * 0.4, 10, 8]} />
          <meshStandardMaterial color="#4caf50" roughness={0.9} />
        </mesh>
        <mesh position={[w * 0.15, 0.3, d * 0.1]} castShadow>
          <sphereGeometry args={[Math.min(w, d) * 0.25, 8, 6]} />
          <meshStandardMaterial color="#66bb6a" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // ── Hedge ──
  if (sym.includes("hedge")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.5, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.0, d]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // ── Flower Bed ──
  if (sym.includes("flower_bed") || sym.includes("flower")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Soil */}
        <mesh position={[w / 2, 0.05, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.1, d]} />
          <meshStandardMaterial color="#5d4037" roughness={0.95} />
        </mesh>
        {/* Flowers (random spheres) */}
        {Array.from({ length: Math.min(12, Math.round(w * d * 8)) }, (_, i) => {
          const fx = w * 0.1 + (i * 0.37 * w) % (w * 0.8);
          const fz = d * 0.1 + (i * 0.53 * d) % (d * 0.8);
          const colors = ["#e91e63", "#ff5722", "#ffeb3b", "#9c27b0", "#ff9800"];
          return (
            <mesh key={i} position={[fx, 0.18, fz]} castShadow>
              <sphereGeometry args={[0.06, 6, 5]} />
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // ── Garden Bed ──
  if (sym.includes("garden_bed") || sym.includes("garden")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.06, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.12, d]} />
          <meshStandardMaterial color="#4e342e" roughness={0.95} />
        </mesh>
        {/* Plant rows */}
        {Array.from({ length: Math.max(2, Math.round(d / 0.5)) }, (_, i) => (
          <mesh key={i} position={[w / 2, 0.2, d * 0.15 + i * (d * 0.7 / Math.max(2, Math.round(d / 0.5)))]} castShadow>
            <boxGeometry args={[w * 0.8, 0.15, 0.1]} />
            <meshStandardMaterial color="#66bb6a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Lawn ──
  if (sym.includes("lawn")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.01, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.02, d]} />
          <meshStandardMaterial color="#4caf50" roughness={0.95} />
        </mesh>
      </group>
    );
  }

  // ── Boundary Fence ──
  if (sym.includes("boundary_fence") || (sym.includes("fence") && !sym.includes("wall"))) {
    const numPosts = Math.max(2, Math.round(w / 1.5));
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Fence panels */}
        <mesh position={[w / 2, 0.55, d / 2]} castShadow>
          <boxGeometry args={[w, 1.0, 0.04]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.85} />
        </mesh>
        {/* Posts */}
        {Array.from({ length: numPosts }, (_, i) => (
          <mesh key={i} position={[w * (i / (numPosts - 1)), 0.6, d / 2]} castShadow>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Boundary Wall ──
  if (sym.includes("boundary_wall")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.9, d / 2]} castShadow receiveShadow>
          <boxGeometry args={[w, 1.8, d]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.85} />
        </mesh>
        {/* Cap */}
        <mesh position={[w / 2, 1.82, d / 2]} castShadow>
          <boxGeometry args={[w + 0.05, 0.06, d + 0.05]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  // ── Gate ──
  if (sym.includes("gate")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Gate posts */}
        <mesh position={[0.06, 0.75, d / 2]} castShadow>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color="#616161" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[w - 0.06, 0.75, d / 2]} castShadow>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color="#616161" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Gate panels (double) */}
        <mesh position={[w * 0.27, 0.6, d / 2]} castShadow>
          <boxGeometry args={[w * 0.42, 1.1, 0.04]} />
          <meshStandardMaterial color="#37474f" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[w * 0.73, 0.6, d / 2]} castShadow>
          <boxGeometry args={[w * 0.42, 1.1, 0.04]} />
          <meshStandardMaterial color="#37474f" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    );
  }

  // ── Water Tank ──
  if (sym.includes("water_tank")) {
    const r = Math.min(w, d) / 2;
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r, 2.0, 16]} />
          <meshStandardMaterial color="#78909c" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Lid */}
        <mesh position={[0, 2.02, 0]} castShadow>
          <cylinderGeometry args={[r * 1.02, r * 1.02, 0.06, 16]} />
          <meshStandardMaterial color="#607d8b" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Pipe outlet */}
        <mesh position={[r + 0.05, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // ── Borehole ──
  if (sym.includes("borehole")) {
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Casing */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
          <meshStandardMaterial color="#616161" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Protection slab */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.06, 16]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // ── Fire Pit ──
  if (sym.includes("fire_pit") || sym.includes("firepit")) {
    const r = Math.min(w, d) / 2;
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Stone ring */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[r, r * 1.1, 0.3, 16]} />
          <meshStandardMaterial color="#757575" roughness={0.9} />
        </mesh>
        {/* Inner pit */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[r * 0.7, r * 0.7, 0.2, 16]} />
          <meshStandardMaterial color="#3e2723" roughness={0.95} />
        </mesh>
        {/* Glow */}
        <pointLight position={[0, 0.4, 0]} color="#ff6d00" intensity={2} distance={4} />
      </group>
    );
  }

  // ── Clothesline ──
  if (sym.includes("clothesline")) {
    return (
      <group position={[px + w / 2, 0, pz + d / 2]} rotation={[0, rot, 0]}>
        {/* Center pole */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 2.0, 8]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Arms */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const arm = Math.min(w, d) * 0.35;
          return (
            <mesh key={i} position={[Math.cos(rad) * arm / 2, 1.95, Math.sin(rad) * arm / 2]} rotation={[0, rad, 0]} castShadow>
              <boxGeometry args={[arm, 0.02, 0.02]} />
              <meshStandardMaterial color="#b0bec5" roughness={0.35} metalness={0.5} />
            </mesh>
          );
        })}
      </group>
    );
  }

  // ── Driveway ──
  if (sym.includes("driveway")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.02, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // ── Veranda / Patio ──
  if (sym.includes("veranda") || sym.includes("patio")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        {/* Floor slab */}
        <mesh position={[w / 2, 0.05, d / 2]} receiveShadow castShadow>
          <boxGeometry args={[w, 0.1, d]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.8} />
        </mesh>
        {/* Corner columns */}
        {[[0.08, 0.08], [w - 0.08, 0.08], [0.08, d - 0.08], [w - 0.08, d - 0.08]].map(([cx, cz], i) => (
          <mesh key={i} position={[cx, 1.35, cz]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 2.7, 8]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
          </mesh>
        ))}
        {/* Roof slab */}
        <mesh position={[w / 2, 2.72, d / 2]} castShadow>
          <boxGeometry args={[w + 0.2, 0.08, d + 0.2]} />
          <meshStandardMaterial color="#795548" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // ── Paved Area ──
  if (sym.includes("paved_area") || sym.includes("paved")) {
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[w / 2, 0.02, d / 2]} receiveShadow>
          <boxGeometry args={[w, 0.04, d]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.85} />
        </mesh>
      </group>
    );
  }

  // ── Sliding Door (if not caught by isDoor) ──
  if (sym.includes("sliding")) {
    const dx = Math.cos(-rot) * (w / 2);
    const dz2 = Math.sin(-rot) * (w / 2);
    return (
      <group position={[px + dx, 0, pz + dz2]} rotation={[0, rot, 0]}>
        {/* Frame */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[w, 2.1, WALL_THICKNESS * 1.2]} />
          <meshStandardMaterial color="#8a9199" roughness={0.35} metalness={0.5} />
        </mesh>
        {/* Glass panel left */}
        <mesh position={[-w * 0.25, 1.05, 0]}>
          <boxGeometry args={[w * 0.48, 2.0, 0.02]} />
          <meshPhysicalMaterial color="#a8d8ea" transmission={0.7} transparent opacity={0.3} roughness={0.05} />
        </mesh>
        {/* Glass panel right */}
        <mesh position={[w * 0.25, 1.05, 0.01]}>
          <boxGeometry args={[w * 0.48, 2.0, 0.02]} />
          <meshPhysicalMaterial color="#a8d8ea" transmission={0.7} transparent opacity={0.3} roughness={0.05} />
        </mesh>
      </group>
    );
  }

  // ── Default fallback: generic box with label ──
  return (
    <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
      <mesh position={[w / 2, 0.4, d / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.8, d]} />
        <meshStandardMaterial color={matColor(el.color)} roughness={0.7} />
      </mesh>
      <Text
        position={[w / 2, 0.95, d / 2]}
        fontSize={0.08}
        color={matColor(el.color)}
        anchorX="center"
        anchorY="bottom"
      >
        {el.symbolName.replace(/_/g, " ")}
      </Text>
    </group>
  );
}

// ─── Floor tile texture generator ────────────────────────
function createFloorTileTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const tileSize = 128; // each tile = 128px
  const grout = 3;

  // Grout background
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(0, 0, size, size);

  // Draw tiles
  for (let r = 0; r < size / tileSize; r++) {
    for (let c = 0; c < size / tileSize; c++) {
      const x = c * tileSize + grout;
      const y = r * tileSize + grout;
      const tw = tileSize - grout * 2;
      // Slight color variation per tile
      const v = Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${58 + v},${55 + v},${52 + v})`;
      ctx.fillRect(x, y, tw, tw);
      // Subtle sheen gradient
      const grad = ctx.createLinearGradient(x, y, x + tw, y + tw);
      grad.addColorStop(0, "rgba(255,255,255,0.03)");
      grad.addColorStop(1, "rgba(0,0,0,0.03)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tw, tw);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Ground floor slab ───────────────────────────────────

function FloorSlab({ elements }: { elements: DrawingElement[] }) {
  const bounds = useMemo(() => {
    const b = computeBounds(elements);
    if (!b) return null;
    const pad = 0.5;
    return { minX: b.minX - pad, minZ: b.minZ - pad, maxX: b.maxX + pad, maxZ: b.maxZ + pad };
  }, [elements]);
  const floorTex = useMemo(() => {
    const tex = createFloorTileTexture();
    if (!tex) return null;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  if (!bounds) return null;
  const w = bounds.maxX - bounds.minX;
  const d = bounds.maxZ - bounds.minZ;

  return (
    <mesh
      position={[(bounds.minX + bounds.maxX) / 2, -0.025, (bounds.minZ + bounds.maxZ) / 2]}
      receiveShadow
    >
      <boxGeometry args={[w, 0.05, d]} />
      <meshStandardMaterial color="#3a3836" roughness={0.85} map={floorTex ?? undefined} />
    </mesh>
  );
}

// ─── Foundation plinth + DPC band + ghost foundation depth ─
const PLINTH_HEIGHT = 0.15;  // 150mm concrete plinth above ground
const DPC_HEIGHT = 0.012;    // 12mm dark DPC band
const FOOTING_WIDTH = 0.6;   // 600mm wide strip footing
const PAD_SIZE = 0.9;        // 900mm square pad footing
const STEP_HEIGHT_RATIO = 0.33; // each step is 1/3 of total depth


function FoundationPlinth({ elements, foundationType = "strip", foundationDepthMm = 600 }: {
  elements: DrawingElement[];
  foundationType?: string;
  foundationDepthMm?: number;
}) {
  const wallBounds = useMemo(() => computeWallBounds(elements), [elements]);
  if (!wallBounds) return null;

  const FDEPTH = (foundationDepthMm ?? 600) / 1000; // mm → m
  const cx = (wallBounds.minX + wallBounds.maxX) / 2;
  const cz = (wallBounds.minZ + wallBounds.maxZ) / 2;
  const wallW = wallBounds.maxX - wallBounds.minX + WALL_THICKNESS;
  const wallD = wallBounds.maxZ - wallBounds.minZ + WALL_THICKNESS;
  const fY = -PLINTH_HEIGHT - FDEPTH / 2;

  const typeLabels: Record<string, string> = {
    strip: "Strip Footing",
    stepped: "Stepped Footing",
    pad: "Pad / Isolated",
    raft: "Raft Foundation",
  };

  // Helper: ghost box + wireframe overlay pair
  const GhostBox = ({ pos, args }: { pos: [number, number, number]; args: [number, number, number] }) => (
    <>
      <mesh position={pos}>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#7a7a72" transparent opacity={0.25} roughness={0.9} depthWrite={false} />
      </mesh>
      <mesh position={pos}>
        <boxGeometry args={args} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.35} />
      </mesh>
    </>
  );

  // 4 corner positions for pad footings
  const corners: [number, number][] = [
    [wallBounds.minX - WALL_THICKNESS / 2, wallBounds.minZ - WALL_THICKNESS / 2],
    [wallBounds.maxX + WALL_THICKNESS / 2, wallBounds.minZ - WALL_THICKNESS / 2],
    [wallBounds.minX - WALL_THICKNESS / 2, wallBounds.maxZ + WALL_THICKNESS / 2],
    [wallBounds.maxX + WALL_THICKNESS / 2, wallBounds.maxZ + WALL_THICKNESS / 2],
  ];

  return (
    <group>
      {/* ── GHOST FOUNDATION ── */}
      {foundationType === "strip" && (
        <>
          <GhostBox pos={[cx, fY, wallBounds.minZ - WALL_THICKNESS / 2]} args={[wallW + 0.1, FDEPTH, FOOTING_WIDTH]} />
          <GhostBox pos={[cx, fY, wallBounds.maxZ + WALL_THICKNESS / 2]} args={[wallW + 0.1, FDEPTH, FOOTING_WIDTH]} />
          <GhostBox pos={[wallBounds.minX - WALL_THICKNESS / 2, fY, cz]} args={[FOOTING_WIDTH, FDEPTH, wallD + 0.1]} />
          <GhostBox pos={[wallBounds.maxX + WALL_THICKNESS / 2, fY, cz]} args={[FOOTING_WIDTH, FDEPTH, wallD + 0.1]} />
        </>
      )}

      {foundationType === "stepped" && (() => {
        const stepH = FDEPTH * STEP_HEIGHT_RATIO;
        const stepW = FOOTING_WIDTH;
        const steps: React.ReactNode[] = [];
        // 3 steps, each narrower and deeper
        for (let i = 0; i < 3; i++) {
          const w = stepW + (2 - i) * 0.15; // wider at base, narrower at top
          const yOff = -PLINTH_HEIGHT - stepH * i - stepH / 2;
          // Front
          steps.push(<GhostBox key={`sf${i}`} pos={[cx, yOff, wallBounds.minZ - WALL_THICKNESS / 2]} args={[wallW + 0.1, stepH, w]} />);
          // Back
          steps.push(<GhostBox key={`sb${i}`} pos={[cx, yOff, wallBounds.maxZ + WALL_THICKNESS / 2]} args={[wallW + 0.1, stepH, w]} />);
          // Left
          steps.push(<GhostBox key={`sl${i}`} pos={[wallBounds.minX - WALL_THICKNESS / 2, yOff, cz]} args={[w, stepH, wallD + 0.1]} />);
          // Right
          steps.push(<GhostBox key={`sr${i}`} pos={[wallBounds.maxX + WALL_THICKNESS / 2, yOff, cz]} args={[w, stepH, wallD + 0.1]} />);
        }
        return <>{steps}</>;
      })()}

      {foundationType === "pad" && (
        <>
          {corners.map(([px, pz], i) => (
            <GhostBox key={`pad${i}`} pos={[px, fY, pz]} args={[PAD_SIZE, FDEPTH, PAD_SIZE]} />
          ))}
          {/* Tie beams connecting pads */}
          <GhostBox pos={[cx, fY, wallBounds.minZ - WALL_THICKNESS / 2]} args={[wallW, FDEPTH * 0.5, 0.25]} />
          <GhostBox pos={[cx, fY, wallBounds.maxZ + WALL_THICKNESS / 2]} args={[wallW, FDEPTH * 0.5, 0.25]} />
          <GhostBox pos={[wallBounds.minX - WALL_THICKNESS / 2, fY, cz]} args={[0.25, FDEPTH * 0.5, wallD]} />
          <GhostBox pos={[wallBounds.maxX + WALL_THICKNESS / 2, fY, cz]} args={[0.25, FDEPTH * 0.5, wallD]} />
        </>
      )}

      {foundationType === "raft" && (
        <GhostBox pos={[cx, fY, cz]} args={[wallW + 0.3, FDEPTH, wallD + 0.3]} />
      )}

      {/* Foundation type + depth label */}
      <Text
        position={[wallBounds.maxX + WALL_THICKNESS / 2 + 0.5, fY, cz]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.07}
        color="#22d3ee"
        anchorX="center"
        anchorY="middle"
      >
        {`${typeLabels[foundationType] ?? foundationType} — ${foundationDepthMm}mm`}
      </Text>

      {/* ── CONCRETE PLINTH (visible above ground) ── */}
      {/* Front */}
      <mesh position={[cx, -PLINTH_HEIGHT / 2, wallBounds.minZ - WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallW + 0.06, PLINTH_HEIGHT, WALL_THICKNESS + 0.03]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.85} />
      </mesh>
      {/* Back */}
      <mesh position={[cx, -PLINTH_HEIGHT / 2, wallBounds.maxZ + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallW + 0.06, PLINTH_HEIGHT, WALL_THICKNESS + 0.03]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.85} />
      </mesh>
      {/* Left */}
      <mesh position={[wallBounds.minX - WALL_THICKNESS / 2, -PLINTH_HEIGHT / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS + 0.03, PLINTH_HEIGHT, wallD + 0.06]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.85} />
      </mesh>
      {/* Right */}
      <mesh position={[wallBounds.maxX + WALL_THICKNESS / 2, -PLINTH_HEIGHT / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS + 0.03, PLINTH_HEIGHT, wallD + 0.06]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.85} />
      </mesh>

      {/* ── DPC band (dark strip at ground level) ── */}
      {/* Front */}
      <mesh position={[cx, DPC_HEIGHT / 2, wallBounds.minZ - WALL_THICKNESS / 2]}>
        <boxGeometry args={[wallW + 0.07, DPC_HEIGHT, WALL_THICKNESS + 0.04]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[cx, DPC_HEIGHT / 2, wallBounds.maxZ + WALL_THICKNESS / 2]}>
        <boxGeometry args={[wallW + 0.07, DPC_HEIGHT, WALL_THICKNESS + 0.04]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* Left */}
      <mesh position={[wallBounds.minX - WALL_THICKNESS / 2, DPC_HEIGHT / 2, cz]}>
        <boxGeometry args={[WALL_THICKNESS + 0.04, DPC_HEIGHT, wallD + 0.07]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* Right */}
      <mesh position={[wallBounds.maxX + WALL_THICKNESS / 2, DPC_HEIGHT / 2, cz]}>
        <boxGeometry args={[WALL_THICKNESS + 0.04, DPC_HEIGHT, wallD + 0.07]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Ceiling plane ───────────────────────────────────────

function CeilingPlane({ elements }: { elements: DrawingElement[] }) {
  const wallBounds = useMemo(() => computeWallBounds(elements), [elements]);
  if (!wallBounds) return null;

  const cx = (wallBounds.minX + wallBounds.maxX) / 2;
  const cz = (wallBounds.minZ + wallBounds.maxZ) / 2;
  const w = wallBounds.maxX - wallBounds.minX;
  const d = wallBounds.maxZ - wallBounds.minZ;

  return (
    <mesh position={[cx, WALL_HEIGHT - 0.01, cz]} receiveShadow>
      <boxGeometry args={[w, 0.02, d]} />
      <meshStandardMaterial color="#e8e4df" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Fascia, soffit & gutters ────────────────────────────

const FASCIA_H = 0.18;    // 180mm fascia board height
const FASCIA_THICK = 0.02; // 20mm thick
const SOFFIT_W = 0.28;    // 280mm soffit board width (under overhang)
const GUTTER_H = 0.08;    // 80mm gutter depth
const GUTTER_W = 0.12;    // 120mm gutter width

function FasciaSoffitGutters({ elements, roofType }: { elements: DrawingElement[]; roofType: RoofType }) {
  const wallBounds = useMemo(() => computeWallBounds(elements), [elements]);
  if (!wallBounds || roofType === "none") return null;

  const cx = (wallBounds.minX + wallBounds.maxX) / 2;
  const cz = (wallBounds.minZ + wallBounds.maxZ) / 2;
  const roofW = (wallBounds.maxX - wallBounds.minX) + ROOF_OVERHANG * 2;
  const roofD = (wallBounds.maxZ - wallBounds.minZ) + ROOF_OVERHANG * 2;
  const hw = roofW / 2;
  const hd = roofD / 2;

  // For gable roofs, fascia/gutters only on the sloped sides (left/right)
  const isGable = roofType === "gable";

  return (
    <group position={[cx, WALL_HEIGHT, cz]}>
      {/* FASCIA BOARDS — vertical boards along roof edge */}
      {/* Front fascia */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H / 2, -hd]} castShadow>
          <boxGeometry args={[roofW, FASCIA_H, FASCIA_THICK]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
        </mesh>
      )}
      {/* Back fascia */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H / 2, hd]} castShadow>
          <boxGeometry args={[roofW, FASCIA_H, FASCIA_THICK]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
        </mesh>
      )}
      {/* Left fascia */}
      <mesh position={[-hw, -FASCIA_H / 2, 0]} castShadow>
        <boxGeometry args={[FASCIA_THICK, FASCIA_H, roofD]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
      </mesh>
      {/* Right fascia */}
      <mesh position={[hw, -FASCIA_H / 2, 0]} castShadow>
        <boxGeometry args={[FASCIA_THICK, FASCIA_H, roofD]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
      </mesh>

      {/* SOFFIT BOARDS — horizontal boards under the overhang */}
      {/* Front soffit */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H, -hd + SOFFIT_W / 2]}>
          <boxGeometry args={[roofW, 0.01, SOFFIT_W]} />
          <meshStandardMaterial color="#ede8e0" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Back soffit */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H, hd - SOFFIT_W / 2]}>
          <boxGeometry args={[roofW, 0.01, SOFFIT_W]} />
          <meshStandardMaterial color="#ede8e0" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Left soffit */}
      <mesh position={[-hw + SOFFIT_W / 2, -FASCIA_H, 0]}>
        <boxGeometry args={[SOFFIT_W, 0.01, roofD]} />
        <meshStandardMaterial color="#ede8e0" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Right soffit */}
      <mesh position={[hw - SOFFIT_W / 2, -FASCIA_H, 0]}>
        <boxGeometry args={[SOFFIT_W, 0.01, roofD]} />
        <meshStandardMaterial color="#ede8e0" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* GUTTERS — half-round profile along fascia bottom */}
      {/* Front gutter */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H - GUTTER_H / 2, -hd - FASCIA_THICK / 2]}>
          <boxGeometry args={[roofW + 0.04, GUTTER_H, GUTTER_W]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
        </mesh>
      )}
      {/* Back gutter */}
      {!isGable && (
        <mesh position={[0, -FASCIA_H - GUTTER_H / 2, hd + FASCIA_THICK / 2]}>
          <boxGeometry args={[roofW + 0.04, GUTTER_H, GUTTER_W]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
        </mesh>
      )}
      {/* Left gutter */}
      <mesh position={[-hw - FASCIA_THICK / 2, -FASCIA_H - GUTTER_H / 2, 0]}>
        <boxGeometry args={[GUTTER_W, GUTTER_H, roofD + 0.04]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Right gutter */}
      <mesh position={[hw + FASCIA_THICK / 2, -FASCIA_H - GUTTER_H / 2, 0]}>
        <boxGeometry args={[GUTTER_W, GUTTER_H, roofD + 0.04]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Realistic roof tile texture ─────────────────────────
const TILE_W = 100;  // px per tile width
const TILE_H = 50;   // px per tile height (visible part)
const TILE_OVERLAP = 12; // overlap between rows
const TILE_COLS = 6;
const TILE_ROWS = 10;
const ROOF_TEX_W = TILE_COLS * TILE_W;
const ROOF_TEX_H = TILE_ROWS * (TILE_H - TILE_OVERLAP);

function _randTileColor(): string {
  const bases = [
    [140, 90, 75], [148, 95, 78], [135, 85, 70],
    [155, 100, 82], [130, 82, 68], [145, 92, 76],
    [160, 105, 85], [138, 88, 72], [150, 98, 80],
  ];
  const b = bases[Math.floor(Math.random() * bases.length)];
  const v = () => Math.floor((Math.random() - 0.5) * 14);
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  return `rgb(${clamp(b[0] + v())},${clamp(b[1] + v())},${clamp(b[2] + v())})`;
}

function createRoofTileTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = ROOF_TEX_W;
  canvas.height = ROOF_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark underlay
  ctx.fillStyle = "#4a3a32";
  ctx.fillRect(0, 0, ROOF_TEX_W, ROOF_TEX_H);

  for (let row = 0; row < TILE_ROWS; row++) {
    const y = row * (TILE_H - TILE_OVERLAP);
    const offset = row % 2 === 0 ? 0 : TILE_W / 2;
    for (let col = -1; col <= TILE_COLS + 1; col++) {
      const x = col * TILE_W + offset;
      // Clip to canvas
      const tx = Math.max(0, x);
      const tw = Math.min(x + TILE_W, ROOF_TEX_W) - tx;
      if (tw <= 2) continue;

      // Tile body
      ctx.fillStyle = _randTileColor();
      // Rounded bottom edge via arc
      ctx.beginPath();
      ctx.rect(tx, y, tw, TILE_H - 6);
      ctx.fill();
      // Rounded bottom
      ctx.beginPath();
      ctx.ellipse(tx + tw / 2, y + TILE_H - 6, tw / 2, 6, 0, 0, Math.PI);
      ctx.fill();

      // Top shadow (overlap shadow from row above)
      const topGrad = ctx.createLinearGradient(tx, y, tx, y + 8);
      topGrad.addColorStop(0, "rgba(0,0,0,0.2)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(tx, y, tw, 8);

      // Bottom edge highlight
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(tx + 2, y + TILE_H - 10, tw - 4, 2);

      // Side edges (thin dark lines)
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(tx, y, 1, TILE_H);
      ctx.fillRect(tx + tw - 1, y, 1, TILE_H);

      // Slight surface grain
      for (let i = 0; i < 4; i++) {
        const sx = tx + Math.random() * tw;
        const sy = y + Math.random() * TILE_H;
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRoofTileBumpMap() {
  const canvas = document.createElement("canvas");
  canvas.width = ROOF_TEX_W;
  canvas.height = ROOF_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Gaps between tiles are recessed (dark)
  ctx.fillStyle = "#404040";
  ctx.fillRect(0, 0, ROOF_TEX_W, ROOF_TEX_H);

  for (let row = 0; row < TILE_ROWS; row++) {
    const y = row * (TILE_H - TILE_OVERLAP);
    const offset = row % 2 === 0 ? 0 : TILE_W / 2;
    for (let col = -1; col <= TILE_COLS + 1; col++) {
      const x = col * TILE_W + offset;
      const tx = Math.max(0, x);
      const tw = Math.min(x + TILE_W, ROOF_TEX_W) - tx;
      if (tw <= 2) continue;

      // Raised tile surface
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(tx + 1, y + 1, tw - 2, TILE_H - 2);

      // Rounded bottom bump
      ctx.beginPath();
      ctx.ellipse(tx + tw / 2, y + TILE_H - 6, tw / 2 - 1, 5, 0, 0, Math.PI);
      ctx.fill();

      // Edge recess
      ctx.fillStyle = "#707070";
      ctx.fillRect(tx, y, tw, 1);
      ctx.fillRect(tx, y, 1, TILE_H);
      ctx.fillRect(tx + tw - 1, y, 1, TILE_H);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

let _roofTexCache: THREE.Texture | null = null;
let _roofBumpCache: THREE.Texture | null = null;
function getRoofTextures() {
  if (!_roofTexCache) _roofTexCache = createRoofTileTexture();
  if (!_roofBumpCache) _roofBumpCache = createRoofTileBumpMap();
  return { map: _roofTexCache, bump: _roofBumpCache };
}

function useRoofMaterial(widthM: number, heightM: number) {
  return useMemo(() => {
    const { map, bump } = getRoofTextures();
    if (!map || !bump) return { map: undefined, bumpMap: undefined };
    // Each texture tile ≈ 0.6m wide, 0.4m tall
    const repeatX = widthM / 0.6;
    const repeatY = heightM / 0.4;
    const m = map.clone();
    m.wrapS = m.wrapT = THREE.RepeatWrapping;
    m.repeat.set(repeatX, repeatY);
    m.needsUpdate = true;
    const b = bump.clone();
    b.wrapS = b.wrapT = THREE.RepeatWrapping;
    b.repeat.set(repeatX, repeatY);
    b.needsUpdate = true;
    return { map: m, bumpMap: b };
  }, [widthM, heightM]);
}

// ─── Roof types ──────────────────────────────────────────
export type RoofType = "none" | "flat" | "gable" | "hip" | "shed" | "mansard" | "pyramid";

const ROOF_OVERHANG = 0.3; // 300mm overhang beyond walls
const ROOF_PITCH = 0.35;   // rise/run ratio for sloped roofs
const ROOF_COLOR = "#c49078";
const ROOF_COLOR_DARK = "#6b5548";

/** Compute the bounding box of wall-layer elements only */
function computeWallBounds(elements: DrawingElement[]) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  let hasWalls = false;
  for (const el of elements) {
    if (!isWallLayer(el.layer)) continue;
    hasWalls = true;
    if (el.type === "line" || el.type === "dimension") {
      for (const px of [el.x, el.x2]) { minX = Math.min(minX, px * S); maxX = Math.max(maxX, px * S); }
      for (const py of [el.y, el.y2]) { minZ = Math.min(minZ, py * S); maxZ = Math.max(maxZ, py * S); }
    } else if (el.type === "rect") {
      minX = Math.min(minX, el.x * S, (el.x + el.width) * S);
      maxX = Math.max(maxX, el.x * S, (el.x + el.width) * S);
      minZ = Math.min(minZ, el.y * S, (el.y + el.height) * S);
      maxZ = Math.max(maxZ, el.y * S, (el.y + el.height) * S);
    } else if (el.type === "polyline") {
      for (const p of el.points) { minX = Math.min(minX, p.x * S); maxX = Math.max(maxX, p.x * S); minZ = Math.min(minZ, p.y * S); maxZ = Math.max(maxZ, p.y * S); }
    }
  }
  if (!hasWalls || !isFinite(minX)) return null;
  return { minX, minZ, maxX, maxZ };
}

/** Custom BufferGeometry builder for roof shapes */
function buildRoofGeometry(
  roofType: RoofType,
  w: number, d: number,
): THREE.BufferGeometry | null {
  if (roofType === "none" || roofType === "flat") return null;

  const hw = w / 2;
  const hd = d / 2;
  const rise = Math.min(w, d) * ROOF_PITCH;
  const geo = new THREE.BufferGeometry();

  if (roofType === "gable") {
    // Ridge runs along the longer axis (Z / depth)
    // Only the two sloping roof planes — gable end walls rendered separately as brick
    const vertices = new Float32Array([
      // Left slope (2 triangles)
      -hw, 0, -hd,   0, rise, -hd,   -hw, 0, hd,
      0, rise, -hd,   0, rise, hd,    -hw, 0, hd,
      // Right slope (2 triangles)
      hw, 0, -hd,    hw, 0, hd,       0, rise, -hd,
      0, rise, -hd,   hw, 0, hd,      0, rise, hd,
    ]);
    // UVs: each slope maps as a rectangle (u=along depth, v=up the slope)
    const uvs = new Float32Array([
      // Left slope
      0, 0,   0, 1,   1, 0,
      0, 1,   1, 1,   1, 0,
      // Right slope
      0, 0,   1, 0,   0, 1,
      0, 1,   1, 0,   1, 1,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  // Helper: auto-generate UVs from vertex positions (project XZ → UV)
  const autoUVs = (g: THREE.BufferGeometry, _w: number, _d: number) => {
    const pos = g.getAttribute("position");
    const count = pos.count;
    const uvArr = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      uvArr[i * 2]     = (x + _w / 2) / _w; // u: 0→1 across width
      uvArr[i * 2 + 1] = (z + _d / 2) / _d; // v: 0→1 across depth
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));
  };

  if (roofType === "hip") {
    // Four sloping faces, ridge shorter than building length
    const ridgeLen = Math.max(0, d - w) / 2; // ridge inset
    const rl = ridgeLen > 0.01 ? ridgeLen : 0;
    const vertices = new Float32Array([
      // Front face (triangle or trapezoid)
      -hw, 0, -hd,   hw, 0, -hd,    rl > 0 ? hw - (w / 2) : 0, rise, -hd + (d / 2 - rl),
      ...(rl > 0 ? [
        -hw, 0, -hd,  hw - (w / 2), rise, -hd + (d / 2 - rl),  -(hw - (w / 2)), rise, -hd + (d / 2 - rl),
      ] : []),
      // Back face
      -hw, 0, hd,    rl > 0 ? -(hw - (w / 2)) : 0, rise, hd - (d / 2 - rl),   hw, 0, hd,
      ...(rl > 0 ? [
        hw, 0, hd,   -(hw - (w / 2)), rise, hd - (d / 2 - rl),  hw - (w / 2), rise, hd - (d / 2 - rl),
      ] : []),
      // Left face
      -hw, 0, -hd,   rl > 0 ? -(hw - (w / 2)) : 0, rise, -hd + (d / 2 - rl),   -hw, 0, hd,
      ...(rl > 0 ? [
        rl > 0 ? -(hw - (w / 2)) : 0, rise, -hd + (d / 2 - rl),
        -(hw - (w / 2)), rise, hd - (d / 2 - rl),
        -hw, 0, hd,
      ] : []),
      // Right face
      hw, 0, -hd,    hw, 0, hd,      rl > 0 ? hw - (w / 2) : 0, rise, -hd + (d / 2 - rl),
      ...(rl > 0 ? [
        hw - (w / 2), rise, -hd + (d / 2 - rl),
        hw, 0, hd,
        hw - (w / 2), rise, hd - (d / 2 - rl),
      ] : []),
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    autoUVs(geo, w, d);
    geo.computeVertexNormals();
    return geo;
  }

  if (roofType === "shed") {
    // Single slope from back (high) to front (low)
    const vertices = new Float32Array([
      // Top slope
      -hw, rise, -hd,   hw, rise, -hd,   -hw, 0, hd,
      hw, rise, -hd,    hw, 0, hd,       -hw, 0, hd,
      // Left triangle
      -hw, rise, -hd,   -hw, 0, hd,      -hw, 0, -hd,
      // Right triangle
      hw, rise, -hd,    hw, 0, -hd,      hw, 0, hd,
      // Back face
      -hw, 0, -hd,      -hw, rise, -hd,  hw, rise, -hd,
      -hw, 0, -hd,      hw, rise, -hd,   hw, 0, -hd,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    autoUVs(geo, w, d);
    geo.computeVertexNormals();
    return geo;
  }

  if (roofType === "pyramid") {
    // Four triangular faces meeting at center apex
    const vertices = new Float32Array([
      // Front
      -hw, 0, -hd,   hw, 0, -hd,   0, rise, 0,
      // Right
      hw, 0, -hd,    hw, 0, hd,    0, rise, 0,
      // Back
      hw, 0, hd,     -hw, 0, hd,   0, rise, 0,
      // Left
      -hw, 0, hd,    -hw, 0, -hd,  0, rise, 0,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    autoUVs(geo, w, d);
    geo.computeVertexNormals();
    return geo;
  }

  if (roofType === "mansard") {
    // Double-slope on all four sides: steep lower + shallow upper
    const inset = Math.min(w, d) * 0.25;
    const lowerRise = rise * 0.7;
    const upperRise = rise;
    const iw = hw - inset;
    const id = hd - inset;
    const vertices = new Float32Array([
      // Front lower
      -hw, 0, -hd,   hw, 0, -hd,    iw, lowerRise, -id,
      -hw, 0, -hd,   iw, lowerRise, -id,  -iw, lowerRise, -id,
      // Back lower
      hw, 0, hd,     -hw, 0, hd,    -iw, lowerRise, id,
      hw, 0, hd,     -iw, lowerRise, id,   iw, lowerRise, id,
      // Left lower
      -hw, 0, hd,    -hw, 0, -hd,   -iw, lowerRise, -id,
      -hw, 0, hd,    -iw, lowerRise, -id,  -iw, lowerRise, id,
      // Right lower
      hw, 0, -hd,    hw, 0, hd,     iw, lowerRise, id,
      hw, 0, -hd,    iw, lowerRise, id,    iw, lowerRise, -id,
      // Top flat cap
      -iw, upperRise, -id,   iw, upperRise, -id,   iw, upperRise, id,
      -iw, upperRise, -id,   iw, upperRise, id,    -iw, upperRise, id,
      // Upper front slope
      -iw, lowerRise, -id,   iw, lowerRise, -id,   iw, upperRise, -id,
      -iw, lowerRise, -id,   iw, upperRise, -id,   -iw, upperRise, -id,
      // Upper back slope
      iw, lowerRise, id,     -iw, lowerRise, id,   -iw, upperRise, id,
      iw, lowerRise, id,     -iw, upperRise, id,    iw, upperRise, id,
      // Upper left slope
      -iw, lowerRise, id,    -iw, lowerRise, -id,  -iw, upperRise, -id,
      -iw, lowerRise, id,    -iw, upperRise, -id,  -iw, upperRise, id,
      // Upper right slope
      iw, lowerRise, -id,    iw, lowerRise, id,    iw, upperRise, id,
      iw, lowerRise, -id,    iw, upperRise, id,    iw, upperRise, -id,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    autoUVs(geo, w, d);
    geo.computeVertexNormals();
    return geo;
  }

  return null;
}

/** Build a triangular gable wall geometry with UV mapping for brick texture */
function buildGableWallGeo(wallW: number, rise: number, thick: number): THREE.BufferGeometry {
  const hw = wallW / 2;
  const ht = thick / 2;
  const geo = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    // Front face
    -hw, 0, -ht,   hw, 0, -ht,   0, rise, -ht,
    // Back face
    hw, 0, ht,     -hw, 0, ht,    0, rise, ht,
    // Bottom edge
    -hw, 0, -ht,   -hw, 0, ht,    hw, 0, ht,
    -hw, 0, -ht,   hw, 0, ht,     hw, 0, -ht,
    // Left slope
    -hw, 0, -ht,   0, rise, -ht,  0, rise, ht,
    -hw, 0, -ht,   0, rise, ht,   -hw, 0, ht,
    // Right slope
    hw, 0, -ht,    hw, 0, ht,     0, rise, ht,
    hw, 0, -ht,    0, rise, ht,   0, rise, -ht,
  ]);
  // UV coordinates: front/back faces map 0→1 in U (width) and V (height)
  // so useBrickMaterial repeat tiles the brick pattern correctly
  const uvs = new Float32Array([
    // Front face — full triangle, brick mapped across
    0, 0,       1, 0,       0.5, 1,
    // Back face
    1, 0,       0, 0,       0.5, 1,
    // Bottom edge — thin strip
    0, 0,   0, 0.05,   1, 0.05,
    0, 0,   1, 0.05,   1, 0,
    // Left slope — brick along the slope
    0, 0,       1, 0,       1, 0.05,
    0, 0,       1, 0.05,   0, 0.05,
    // Right slope
    0, 0,       0, 0.05,   1, 0.05,
    0, 0,       1, 0.05,   1, 0,
  ]);
  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function GableWall({ position, rotation, wallW, rise }: {
  position: [number, number, number];
  rotation: [number, number, number];
  wallW: number;
  rise: number;
}) {
  const brick = useBrickMaterial(wallW, rise);
  const geo = useMemo(() => buildGableWallGeo(wallW, rise, WALL_THICKNESS), [wallW, rise]);

  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial
        map={brick.map}
        bumpMap={brick.bumpMap}
        bumpScale={0.015}
        roughness={0.88}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Roof3D({ elements, roofType }: { elements: DrawingElement[]; roofType: RoofType }) {
  const wallBounds = useMemo(() => computeWallBounds(elements), [elements]);

  const roofGeo = useMemo(() => {
    if (!wallBounds || roofType === "none") return null;
    const w = (wallBounds.maxX - wallBounds.minX) + ROOF_OVERHANG * 2;
    const d = (wallBounds.maxZ - wallBounds.minZ) + ROOF_OVERHANG * 2;

    if (roofType === "flat") return { type: "flat" as const, w, d };
    const geo = buildRoofGeometry(roofType, w, d);
    if (!geo) return null;
    return { type: "custom" as const, geo, w, d };
  }, [wallBounds, roofType]);

  // Compute slope length for texture repeat (must call hooks before early return)
  const slopeLen = roofGeo
    ? Math.hypot(roofGeo.w / 2, Math.min(roofGeo.w, roofGeo.d) * ROOF_PITCH)
    : 1;
  const roofMat = useRoofMaterial(
    roofGeo ? roofGeo.d : 1,
    roofGeo ? slopeLen : 1,
  );

  if (!wallBounds || !roofGeo) return null;

  const cx = (wallBounds.minX + wallBounds.maxX) / 2;
  const cz = (wallBounds.minZ + wallBounds.maxZ) / 2;
  // Actual wall dimensions (no overhang) for gable walls
  const wallW = wallBounds.maxX - wallBounds.minX;
  const wallD = wallBounds.maxZ - wallBounds.minZ;
  const rise = Math.min(roofGeo.w, roofGeo.d) * ROOF_PITCH;

  if (roofGeo.type === "flat") {
    return (
      <mesh
        position={[cx, WALL_HEIGHT + ROOF_THICKNESS / 2, cz]}
        castShadow receiveShadow
      >
        <boxGeometry args={[roofGeo.w, ROOF_THICKNESS, roofGeo.d]} />
        <meshStandardMaterial
          color={ROOF_COLOR}
          roughness={0.8}
          metalness={0.05}
          map={roofMat.map ?? undefined}
          bumpMap={roofMat.bumpMap ?? undefined}
          bumpScale={0.012}
        />
      </mesh>
    );
  }

  return (
    <group position={[cx, WALL_HEIGHT, cz]}>
      {/* Roof slopes */}
      <mesh geometry={roofGeo.geo} castShadow receiveShadow>
        <meshStandardMaterial
          color={ROOF_COLOR}
          roughness={0.75}
          metalness={0.08}
          side={THREE.DoubleSide}
          map={roofMat.map ?? undefined}
          bumpMap={roofMat.bumpMap ?? undefined}
          bumpScale={0.012}
        />
      </mesh>
      {/* Underside / soffit */}
      <mesh geometry={roofGeo.geo}>
        <meshStandardMaterial
          color={ROOF_COLOR_DARK}
          roughness={0.9}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Brick gable end walls — flush with building walls */}
      {roofType === "gable" && (
        <>
          {/* Front gable wall */}
          <GableWall
            position={[0, 0, -(wallD / 2)]}
            rotation={[0, 0, 0]}
            wallW={wallW}
            rise={rise}
          />
          {/* Back gable wall */}
          <GableWall
            position={[0, 0, wallD / 2]}
            rotation={[0, 0, 0]}
            wallW={wallW}
            rise={rise}
          />
        </>
      )}
    </group>
  );
}

// ─── Wall segment data for collision ─────────────────────
interface WallSeg { x1: number; z1: number; x2: number; z2: number; thick: number }

function extractWallSegments(elements: DrawingElement[], layers: LayerData[]): WallSeg[] {
  const vis = new Set(layers.filter(l => l.visible).map(l => l.name));
  const segs: WallSeg[] = [];
  for (const el of elements) {
    if (!vis.has(el.layer) || !isWallLayer(el.layer)) continue;
    if (el.type === "line" || el.type === "dimension") {
      segs.push({ x1: el.x * S, z1: el.y * S, x2: el.x2 * S, z2: el.y2 * S, thick: WALL_THICKNESS });
    } else if (el.type === "polyline") {
      for (let i = 0; i < el.points.length - 1; i++) {
        segs.push({ x1: el.points[i].x * S, z1: el.points[i].y * S, x2: el.points[i + 1].x * S, z2: el.points[i + 1].y * S, thick: WALL_THICKNESS });
      }
    } else if (el.type === "rect") {
      const x1 = el.x * S, z1 = el.y * S, x2 = (el.x + el.width) * S, z2 = (el.y + el.height) * S;
      segs.push({ x1, z1, x2: x2, z2: z1, thick: WALL_THICKNESS });
      segs.push({ x1: x2, z1, x2: x2, z2, thick: WALL_THICKNESS });
      segs.push({ x1: x2, z1: z2, x2: x1, z2, thick: WALL_THICKNESS });
      segs.push({ x1, z1: z2, x2: x1, z2: z1, thick: WALL_THICKNESS });
    }
  }
  return segs;
}

// ─── Door data for interaction ───────────────────────────
interface DoorInfo {
  id: string; cx: number; cz: number; width: number; rotation: number;
}

function extractDoors(elements: DrawingElement[], layers: LayerData[]): DoorInfo[] {
  const vis = new Set(layers.filter(l => l.visible).map(l => l.name));
  const doors: DoorInfo[] = [];
  for (const el of elements) {
    if (!vis.has(el.layer)) continue;
    if (el.type === "block" && el.symbolName.toLowerCase().includes("door")) {
      const w = el.width * S;
      const rot = -(el.rotation * Math.PI) / 180;
      const dx = Math.cos(-rot) * (w / 2);
      const dz = Math.sin(-rot) * (w / 2);
      doors.push({ id: el.id, cx: el.x * S + dx, cz: el.y * S + dz, width: w, rotation: rot });
    }
  }
  return doors;
}

// ─── Point-to-segment distance for collision ─────────────
function pointToSegDist(px: number, pz: number, s: WallSeg): number {
  const dx = s.x2 - s.x1, dz = s.z2 - s.z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 0.0001) return Math.hypot(px - s.x1, pz - s.z1);
  let t = ((px - s.x1) * dx + (pz - s.z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (s.x1 + t * dx), pz - (s.z1 + t * dz));
}

// ─── Check if a door is near a wall seg (removes collision when open) ──
function isDoorNearSeg(seg: WallSeg, doors: DoorInfo[], openDoors: Set<string>): boolean {
  for (const d of doors) {
    if (!openDoors.has(d.id)) continue;
    const mx = (seg.x1 + seg.x2) / 2, mz = (seg.z1 + seg.z2) / 2;
    if (Math.hypot(mx - d.cx, mz - d.cz) < d.width * 1.2) return true;
  }
  return false;
}

// ─── Interactive Door 3D ─────────────────────────────────
function InteractiveDoor3D({ el, isOpen, onToggle }: {
  el: DrawingElement & { type: "block" }; isOpen: boolean; onToggle: () => void;
}) {
  const w = el.width * S;
  const rot = -(el.rotation * Math.PI) / 180;
  const dx = Math.cos(-rot) * (w / 2);
  const dz = Math.sin(-rot) * (w / 2);
  const px = el.x * S + dx;
  const pz = el.y * S + dz;
  const thickness = WALL_THICKNESS * 1.5;
  const doorHeight = 2.1;
  const lintelH = 0.1;
  const [swing, setSwing] = useState(0);
  const targetSwing = isOpen ? Math.PI / 2 : 0;

  useFrame((_, delta) => {
    const newSwing = THREE.MathUtils.lerp(swing, targetSwing, Math.min(1, delta * 5));
    if (Math.abs(newSwing - swing) > 0.001) setSwing(newSwing);
  });

  return (
    <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
      {/* Door panel - pivots on left edge */}
      <group position={[-w / 2, 0, 0]} rotation={[0, swing, 0]}>
        <mesh position={[w / 2, doorHeight / 2, 0]} castShadow onClick={onToggle}>
          <boxGeometry args={[w, doorHeight, thickness]} />
          <meshStandardMaterial color={isOpen ? "#7b5b3a" : "#5c3d2e"} roughness={0.8} />
        </mesh>
        {/* Door handle */}
        <mesh position={[w * 0.85, doorHeight * 0.47, thickness / 2 + 0.015]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
      {/* Lintel */}
      <mesh position={[0, doorHeight + lintelH / 2, 0]} castShadow>
        <boxGeometry args={[w + 0.2, lintelH, WALL_THICKNESS * 1.2]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Door frame */}
      <mesh position={[-w / 2 - 0.025, doorHeight / 2, 0]}>
        <boxGeometry args={[0.05, doorHeight, thickness + 0.04]} />
        <meshStandardMaterial color="#4a3525" roughness={0.85} />
      </mesh>
      <mesh position={[w / 2 + 0.025, doorHeight / 2, 0]}>
        <boxGeometry args={[0.05, doorHeight, thickness + 0.04]} />
        <meshStandardMaterial color="#4a3525" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ─── Exterior ground plane ───────────────────────────────
function ExteriorGround({ elements }: { elements: DrawingElement[] }) {
  const bounds = useMemo(() => computeBounds(elements), [elements]);
  if (!bounds) return null;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  return (
    <mesh position={[cx, -0.06, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#2d5a1e" roughness={0.95} />
    </mesh>
  );
}

// ─── Sky dome ────────────────────────────────────────────
function SkyDome() {
  return (
    <mesh>
      <sphereGeometry args={[500, 32, 16]} />
      <meshBasicMaterial color="#87ceeb" side={THREE.BackSide} />
    </mesh>
  );
}

// ─── Placed objects store ────────────────────────────────
interface PlacedObject { id: string; type: string; x: number; z: number; rotation: number }

// ─── Placed object 3D renderers ──────────────────────────
function PlacedObject3D({ obj }: { obj: PlacedObject }) {
  const t = obj.type;
  const pos: [number, number, number] = [obj.x, 0, obj.z];

  if (t === "tree_deciduous") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[1.5, 12, 10]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (t === "tree_palm") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 3, 0]} castShadow>
          <sphereGeometry args={[1.2, 8, 6]} />
          <meshStandardMaterial color="#388e3c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 3, 8]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (t === "tree_conifer") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[1.2, 3, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (t === "shrub") {
    return (
      <group position={pos}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshStandardMaterial color="#4caf50" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (t === "water_tank") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
          <meshStandardMaterial color="#78909c" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>
    );
  }
  if (t === "garage") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 3, 7]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.85} />
        </mesh>
        {/* Garage door */}
        <mesh position={[0, 1.2, -3.51]} castShadow>
          <boxGeometry args={[4, 2.4, 0.08]} />
          <meshStandardMaterial color="#5d4037" roughness={0.7} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[6.6, 0.15, 7.6]} />
          <meshStandardMaterial color="#795548" roughness={0.75} />
        </mesh>
      </group>
    );
  }
  if (t === "fence_section") {
    return (
      <group position={pos} rotation={[0, obj.rotation, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[3, 1.2, 0.08]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.85} />
        </mesh>
        <mesh position={[-1.45, 0.65, 0]} castShadow>
          <boxGeometry args={[0.1, 1.3, 0.1]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.9} />
        </mesh>
        <mesh position={[1.45, 0.65, 0]} castShadow>
          <boxGeometry args={[0.1, 1.3, 0.1]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.9} />
        </mesh>
      </group>
    );
  }
  if (t === "fire_pit") {
    return (
      <group position={pos}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.7, 0.5, 12]} />
          <meshStandardMaterial color="#757575" roughness={0.9} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} color="#ff6d00" intensity={2} distance={5} />
      </group>
    );
  }
  // Default: generic box
  return (
    <group position={pos} rotation={[0, obj.rotation, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#90a4ae" roughness={0.7} />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.15} color="#fff" anchorX="center">
        {t.replace(/_/g, " ")}
      </Text>
    </group>
  );
}

// ─── Placement ghost preview ─────────────────────────────
function PlacementGhost({ camera }: { camera: THREE.Camera }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    // Intersect with ground plane (y=0)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, hit);
    if (hit) {
      meshRef.current.position.set(hit.x, 0.5, hit.z);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00e676" transparent opacity={0.4} wireframe />
    </mesh>
  );
}

// ─── Enhanced FPS Walkthrough Controller ─────────────────
const PLAYER_RADIUS = 0.3;
const PLAYER_EYE_HEIGHT = 1.7;
const GRAVITY = 9.8;

function WalkthroughController({ enabled, start, walls, doors, openDoors, onInteract, placingType, onPlace }: {
  enabled: boolean;
  start: [number, number, number];
  walls: WallSeg[];
  doors: DoorInfo[];
  openDoors: Set<string>;
  onInteract: () => void;
  placingType: string | null;
  onPlace: (x: number, z: number) => void;
}) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocityY = useRef(0);
  const onGround = useRef(true);
  const pointerRef = useRef<any>(null);

  useEffect(() => {
    if (enabled) {
      camera.position.set(start[0], start[1], start[2]);
      camera.lookAt(start[0] + 1, start[1], start[2]);
      velocityY.current = 0;
      onGround.current = true;
    } else if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [enabled, camera, start]);

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      // Jump
      if (k === " " && onGround.current) {
        velocityY.current = 4.5;
        onGround.current = false;
      }
      // Interact (E key)
      if (k === "e") onInteract();
      // Place object (F key)
      if (k === "f" && placingType) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const placeX = camera.position.x + dir.x * 3;
        const placeZ = camera.position.z + dir.z * 3;
        onPlace(placeX, placeZ);
      }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [enabled, onInteract, placingType, onPlace, camera]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const dt = Math.min(delta, 0.05);
    const sprint = keys.current["shift"];
    const speed = (sprint ? 6.0 : 3.0) * dt;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3(dir.z, 0, -dir.x).normalize();

    let moveX = 0, moveZ = 0;
    if (keys.current["w"] || keys.current["arrowup"]) { moveX += dir.x * speed; moveZ += dir.z * speed; }
    if (keys.current["s"] || keys.current["arrowdown"]) { moveX -= dir.x * speed; moveZ -= dir.z * speed; }
    if (keys.current["a"] || keys.current["arrowleft"]) { moveX -= right.x * speed; moveZ -= right.z * speed; }
    if (keys.current["d"] || keys.current["arrowright"]) { moveX += right.x * speed; moveZ += right.z * speed; }

    // Proposed new position
    let nx = camera.position.x + moveX;
    let nz = camera.position.z + moveZ;

    // Wall collision: push back from any wall closer than PLAYER_RADIUS
    for (const seg of walls) {
      // Skip wall segments near open doors
      if (isDoorNearSeg(seg, doors, openDoors)) continue;
      const dist = pointToSegDist(nx, nz, seg);
      if (dist < PLAYER_RADIUS + seg.thick / 2) {
        // Push away from wall
        const segDx = seg.x2 - seg.x1, segDz = seg.z2 - seg.z1;
        const segLen = Math.hypot(segDx, segDz);
        if (segLen < 0.001) continue;
        // Normal perpendicular to segment
        const normX = -segDz / segLen, normZ = segDx / segLen;
        // Which side is player on?
        const side = (nx - seg.x1) * normX + (nz - seg.z1) * normZ;
        const pushDir = side > 0 ? 1 : -1;
        const penetration = (PLAYER_RADIUS + seg.thick / 2) - dist;
        nx += normX * pushDir * penetration;
        nz += normZ * pushDir * penetration;
      }
    }

    camera.position.x = nx;
    camera.position.z = nz;

    // Gravity & jump
    velocityY.current -= GRAVITY * dt;
    camera.position.y += velocityY.current * dt;
    if (camera.position.y <= PLAYER_EYE_HEIGHT) {
      camera.position.y = PLAYER_EYE_HEIGHT;
      velocityY.current = 0;
      onGround.current = true;
    }
  });

  if (!enabled) return null;
  return (
    <>
      <PointerLockControls ref={pointerRef} />
      {placingType && <PlacementGhost camera={camera} type={placingType} />}
    </>
  );
}

// ─── Camera zoom binder (connects external buttons to OrbitControls) ──

function CameraZoomBinder({ orbitRef, viewCenter, onZoomIn3D, onZoomOut3D, onResetView3D }: {
  orbitRef: React.MutableRefObject<any>;
  viewCenter: { cx: number; cz: number; span: number };
  onZoomIn3D?: (fn: () => void) => void;
  onZoomOut3D?: (fn: () => void) => void;
  onResetView3D?: (fn: () => void) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const zoomIn = () => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, camera.position.length() * 0.2);
      orbitRef.current?.update();
    };
    const zoomOut = () => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, -camera.position.length() * 0.25);
      orbitRef.current?.update();
    };
    const resetView = () => {
      camera.position.set(
        viewCenter.cx + viewCenter.span * 0.6,
        viewCenter.span * 0.45,
        viewCenter.cz + viewCenter.span * 0.6,
      );
      if (orbitRef.current) {
        orbitRef.current.target.set(viewCenter.cx, 0, viewCenter.cz);
        orbitRef.current.update();
      }
    };
    onZoomIn3D?.(zoomIn);
    onZoomOut3D?.(zoomOut);
    onResetView3D?.(resetView);
  }, [camera, orbitRef, viewCenter, onZoomIn3D, onZoomOut3D, onResetView3D]);

  return null;
}

// ─── Scene: exact layer visibility matching 2D ───────────

function SceneElements({ elements, layers, roofType, foundationType, foundationDepth, walkthrough, openDoors, onToggleDoor, placedObjects }: {
  elements: DrawingElement[]; layers: LayerData[]; roofType: RoofType;
  foundationType?: string; foundationDepth?: number;
  walkthrough?: boolean; openDoors?: Set<string>; onToggleDoor?: (id: string) => void;
  placedObjects?: PlacedObject[];
}) {
  const visibleLayers = useMemo(
    () => new Set(layers.filter((l) => l.visible).map((l) => l.name)),
    [layers],
  );

  const visible = useMemo(
    () => elements.filter((el) => visibleLayers.has(el.layer)),
    [elements, visibleLayers],
  );

  // In walkthrough mode, doors get interactive rendering
  const doorElements = useMemo(() => {
    if (!walkthrough) return [];
    return visible.filter(el => el.type === "block" && el.symbolName.toLowerCase().includes("door"));
  }, [visible, walkthrough]);

  const nonDoorVisible = useMemo(() => {
    if (!walkthrough) return visible;
    const doorIds = new Set(doorElements.map(el => el.id));
    return visible.filter(el => !doorIds.has(el.id));
  }, [visible, walkthrough, doorElements]);

  return (
    <>
      {nonDoorVisible.map((el) => {
        switch (el.type) {
          case "line":
            return <Line3D key={el.id} el={el} />;
          case "polyline":
            return <Polyline3D key={el.id} el={el} />;
          case "rect":
            return <Rect3D key={el.id} el={el} />;
          case "circle":
            return <Circle3D key={el.id} el={el} />;
          case "dimension":
            return <Dimension3D key={el.id} el={el} />;
          case "text":
            return <Text3D key={el.id} el={el} />;
          case "block":
            return <Block3D key={el.id} el={el} />;
          default:
            return null;
        }
      })}
      {/* Interactive doors in walkthrough mode */}
      {walkthrough && doorElements.map((el) => (
        <InteractiveDoor3D
          key={`door-${el.id}`}
          el={el as DrawingElement & { type: "block" }}
          isOpen={openDoors?.has(el.id) ?? false}
          onToggle={() => onToggleDoor?.(el.id)}
        />
      ))}
      {/* Placed objects from walkthrough placement */}
      {placedObjects?.map((obj) => (
        <PlacedObject3D key={obj.id} obj={obj} />
      ))}
      <FloorSlab elements={visible} />
      <FoundationPlinth elements={visible} foundationType={foundationType} foundationDepthMm={foundationDepth} />
      <CeilingPlane elements={visible} />
      <FasciaSoffitGutters elements={visible} roofType={roofType} />
      <Roof3D elements={visible} roofType={roofType} />
      {/* Exterior environment in walkthrough */}
      {walkthrough && <ExteriorGround elements={visible} />}
      {walkthrough && <SkyDome />}
    </>
  );
}

// ─── Main exported component ─────────────────────────────
// Receives the exact same pan/zoom/grid state from the 2D canvas
// so the 3D view is the SAME environment, just seen from a 3D angle.

// 2D canvas mapping:
//   screen_x = world_x * zoom + pan.x
//   screen_y = world_y * zoom + pan.y
// So the world-space center of what the user sees in 2D is:
//   center_world_x = (canvasWidth/2 - pan.x) / zoom   (in mm)
//   center_world_y = (canvasHeight/2 - pan.y) / zoom   (in mm)
// The visible width in world space ≈ canvasWidth / zoom (mm)

// ─── Placeable object types ──────────────────────────────
const PLACEABLE_OBJECTS: { id: string; label: string; icon: string }[] = [
  { id: "tree_deciduous", label: "Tree", icon: "🌳" },
  { id: "tree_palm", label: "Palm", icon: "🌴" },
  { id: "tree_conifer", label: "Pine", icon: "🌲" },
  { id: "shrub", label: "Shrub", icon: "🌿" },
  { id: "water_tank", label: "Tank", icon: "🪣" },
  { id: "garage", label: "Garage", icon: "🏠" },
  { id: "fence_section", label: "Fence", icon: "🪵" },
  { id: "fire_pit", label: "Fire Pit", icon: "🔥" },
  { id: "flower_bed", label: "Flowers", icon: "🌸" },
  { id: "garden_bed", label: "Garden", icon: "🥬" },
  { id: "hedge", label: "Hedge", icon: "🟩" },
  { id: "boundary_wall", label: "Wall", icon: "🧱" },
];

// ─── Game HUD overlay ────────────────────────────────────
function WalkthroughHUD({ placingType, onSelectPlaceable, onClearPlaceable, showControls, onToggleControls }: {
  placingType: string | null;
  onSelectPlaceable: (id: string) => void;
  onClearPlaceable: () => void;
  showControls: boolean;
  onToggleControls: () => void;
}) {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <>
      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div style={{ width: 2, height: 24, background: "rgba(255,255,255,0.6)", position: "absolute" }} />
        <div style={{ width: 24, height: 2, background: "rgba(255,255,255,0.6)", position: "absolute" }} />
        <div style={{ width: 6, height: 6, border: "1px solid rgba(255,255,255,0.4)", borderRadius: "50%", position: "absolute" }} />
      </div>

      {/* Interact prompt */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: "rgba(0,0,0,0.7)", color: "#67e8f9", border: "1px solid rgba(103,232,249,0.3)" }}>
          {placingType ? `Placing: ${placingType.replace(/_/g, " ")} — Press F to place, Q to cancel` : "Press E near a door to open/close"}
        </div>
      </div>

      {/* Top-left: current mode indicator */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        <div className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider" style={{ background: "rgba(0,0,0,0.75)", color: "#7dd3fc", border: "1px solid #38bdf866" }}>
          Walkthrough Mode
        </div>
      </div>

      {/* Bottom-left: controls help */}
      <div className="absolute bottom-3 left-3 z-20">
        <button
          onClick={onToggleControls}
          className="px-2 py-1 rounded text-[10px] mb-1"
          style={{ background: "rgba(0,0,0,0.7)", color: "#aab4c6", border: "1px solid #3a425288" }}
        >
          {showControls ? "Hide Controls" : "Controls (H)"}
        </button>
        {showControls && (
          <div className="mt-1 p-2.5 rounded text-[10px] leading-relaxed" style={{ background: "rgba(0,0,0,0.85)", color: "#d1d5db", border: "1px solid #3a425288", minWidth: 180 }}>
            <div className="font-bold text-[#67e8f9] mb-1">Movement</div>
            <div><span style={{ color: "#fbbf24" }}>W A S D</span> / Arrow Keys — Move</div>
            <div><span style={{ color: "#fbbf24" }}>Mouse</span> — Look around</div>
            <div><span style={{ color: "#fbbf24" }}>Shift</span> — Sprint</div>
            <div><span style={{ color: "#fbbf24" }}>Space</span> — Jump</div>
            <div className="font-bold text-[#67e8f9] mt-1.5 mb-1">Interaction</div>
            <div><span style={{ color: "#fbbf24" }}>E</span> — Open/Close door</div>
            <div><span style={{ color: "#fbbf24" }}>P</span> — Object palette</div>
            <div><span style={{ color: "#fbbf24" }}>F</span> — Place object</div>
            <div><span style={{ color: "#fbbf24" }}>Q</span> — Cancel placement</div>
            <div><span style={{ color: "#fbbf24" }}>Esc</span> — Release mouse</div>
          </div>
        )}
      </div>

      {/* Right side: object palette toggle */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col items-end gap-1.5">
        <button
          onClick={() => setShowPalette(v => !v)}
          className="px-2.5 py-1.5 rounded text-[11px] font-semibold"
          style={{ background: showPalette ? "#0f2a3d" : "rgba(0,0,0,0.7)", color: showPalette ? "#7dd3fc" : "#aab4c6", border: `1px solid ${showPalette ? "#38bdf8" : "#3a425288"}` }}
        >
          {showPalette ? "Close Palette" : "Place Objects (P)"}
        </button>

        {showPalette && (
          <div className="p-2 rounded overflow-y-auto" style={{ background: "rgba(0,0,0,0.88)", border: "1px solid #3a4252", maxHeight: 320, width: 160 }}>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "#67e8f9" }}>Place Object</div>
            <div className="flex flex-col gap-1">
              {PLACEABLE_OBJECTS.map(obj => (
                <button
                  key={obj.id}
                  onClick={() => { onSelectPlaceable(obj.id); setShowPalette(false); }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition-colors"
                  style={{
                    background: placingType === obj.id ? "#1e3a5f" : "transparent",
                    color: placingType === obj.id ? "#7dd3fc" : "#d1d5db",
                    border: placingType === obj.id ? "1px solid #38bdf866" : "1px solid transparent",
                  }}
                >
                  <span>{obj.icon}</span>
                  <span>{obj.label}</span>
                </button>
              ))}
            </div>
            {placingType && (
              <button
                onClick={onClearPlaceable}
                className="mt-2 w-full px-2 py-1 rounded text-[10px]"
                style={{ background: "#4a1c1c", color: "#fca5a5", border: "1px solid #7f1d1d88" }}
              >
                Cancel Placement
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function ThreeCADViewport({
  elements,
  layers,
  pan,
  zoom,
  gridSize,
  majorGrid,
  canvasWidth,
  canvasHeight,
  roofType = "flat",
  foundationType = "strip",
  foundationDepth = 600,
  onRoofTypeChange,
  onZoomIn3D,
  onZoomOut3D,
  onResetView3D,
}: {
  elements: DrawingElement[];
  layers: LayerData[];
  pan: { x: number; y: number };
  zoom: number;
  gridSize: number;
  majorGrid: number;
  canvasWidth: number;
  canvasHeight: number;
  roofType?: RoofType;
  foundationType?: string;
  foundationDepth?: number;
  onRoofTypeChange?: (roofType: RoofType) => void;
  onZoomIn3D?: (fn: () => void) => void;
  onZoomOut3D?: (fn: () => void) => void;
  onResetView3D?: (fn: () => void) => void;
}) {
  const [walkthrough, setWalkthrough] = useState(false);
  const [openDoors, setOpenDoors] = useState<Set<string>>(new Set());
  const [placingType, setPlacingType] = useState<string | null>(null);
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [showControls, setShowControls] = useState(true);
  const orbitRef = useRef<any>(null);

  const ROOF_OPTIONS: { id: RoofType; label: string }[] = [
    { id: "none", label: "No Roof" },
    { id: "flat", label: "Flat" },
    { id: "gable", label: "Gable" },
    { id: "hip", label: "Hip" },
    { id: "shed", label: "Shed" },
    { id: "mansard", label: "Mansard" },
    { id: "pyramid", label: "Pyramid" },
  ];

  // Convert the 2D viewport center to 3D world coords (mm → meters)
  const viewCenter = useMemo(() => {
    const worldCenterXmm = (canvasWidth / 2 - pan.x) / zoom;
    const worldCenterYmm = (canvasHeight / 2 - pan.y) / zoom;
    const cx = worldCenterXmm * S;
    const cz = worldCenterYmm * S;
    const spanX = (canvasWidth / zoom) * S;
    const spanZ = (canvasHeight / zoom) * S;
    const span = Math.max(spanX, spanZ, 2);
    return { cx, cz, span };
  }, [pan, zoom, canvasWidth, canvasHeight]);

  // Grid: convert mm gridSize to meters, match 2D grid exactly
  const gridCellM = gridSize * S;
  const gridSectionM = gridCellM * majorGrid;

  // Extract wall segments for collision detection
  const wallSegments = useMemo(() => extractWallSegments(elements, layers), [elements, layers]);
  // Extract door info for interaction
  const doorInfos = useMemo(() => extractDoors(elements, layers), [elements, layers]);

  // Camera position ref for door interaction (updated by controller)
  const camPosRef = useRef({ x: 0, z: 0 });

  const handleInteractWithCam = useCallback(() => {
    let nearest: DoorInfo | null = null;
    let nearestDist = 2.5; // interaction range in meters
    for (const d of doorInfos) {
      const dist = Math.hypot(camPosRef.current.x - d.cx, camPosRef.current.z - d.cz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = d;
      }
    }
    if (nearest) {
      setOpenDoors(prev => {
        const next = new Set(prev);
        if (next.has(nearest!.id)) next.delete(nearest!.id);
        else next.add(nearest!.id);
        return next;
      });
    }
  }, [doorInfos]);

  const handleToggleDoor = useCallback((id: string) => {
    setOpenDoors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePlace = useCallback((x: number, z: number) => {
    if (!placingType) return;
    setPlacedObjects(prev => [...prev, {
      id: `placed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: placingType,
      x, z,
      rotation: Math.random() * Math.PI * 2,
    }]);
  }, [placingType]);

  // Keyboard shortcuts for palette and controls
  useEffect(() => {
    if (!walkthrough) return;
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p") setPlacingType(prev => prev ? null : "tree_deciduous");
      if (k === "q") setPlacingType(null);
      if (k === "h") setShowControls(v => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [walkthrough]);

  // Clear placing when exiting walkthrough
  useEffect(() => {
    if (!walkthrough) {
      setPlacingType(null);
      setShowControls(true);
    }
  }, [walkthrough]);

  return (
    <div className="w-full h-full relative" style={{ background: walkthrough ? "#000" : "#141414" }}>
      {/* Top toolbar — hidden in walkthrough (except exit button) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 flex-wrap justify-end">
        {!walkthrough && (
          <div className="flex items-center gap-1.5 bg-[#10131b] border border-[#3a4252] rounded px-2 py-1">
            <span className="text-[10px] text-[#aab4c6] uppercase tracking-wider font-semibold">Roof</span>
            <select
              value={roofType}
              onChange={(e) => onRoofTypeChange?.(e.target.value as RoofType)}
              className="text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
              style={{
                background: "#1a1f2e",
                border: "1px solid #22d3ee44",
                color: "#67e8f9",
                appearance: "auto",
              }}
            >
              {ROOF_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => setWalkthrough((v) => !v)}
          className="px-3 py-1.5 text-[11px] rounded border font-semibold"
          style={{
            background: walkthrough ? "#7f1d1d" : "#10131b",
            borderColor: walkthrough ? "#ef4444" : "#3a4252",
            color: walkthrough ? "#fca5a5" : "#aab4c6",
          }}
        >
          {walkthrough ? "Exit Game (Esc)" : "🎮 Walkthrough"}
        </button>
      </div>

      {/* Game HUD overlay — only in walkthrough */}
      {walkthrough && (
        <WalkthroughHUD
          placingType={placingType}
          onSelectPlaceable={setPlacingType}
          onClearPlaceable={() => setPlacingType(null)}
          showControls={showControls}
          onToggleControls={() => setShowControls(v => !v)}
        />
      )}

      <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <color attach="background" args={[walkthrough ? "#87ceeb" : "#141414"]} />

        <PerspectiveCamera
          makeDefault
          position={[
            viewCenter.cx + viewCenter.span * 0.6,
            viewCenter.span * 0.45,
            viewCenter.cz + viewCenter.span * 0.6,
          ]}
          fov={walkthrough ? 75 : 50}
          near={0.01}
          far={2000}
        />
        <OrbitControls
          ref={orbitRef}
          target={[viewCenter.cx, 0, viewCenter.cz]}
          enabled={!walkthrough}
          enableDamping
          dampingFactor={0.12}
          maxPolarAngle={Math.PI * 0.49}
          minDistance={0.2}
          maxDistance={500}
        />
        <CameraZoomBinder
          orbitRef={orbitRef}
          viewCenter={viewCenter}
          onZoomIn3D={onZoomIn3D}
          onZoomOut3D={onZoomOut3D}
          onResetView3D={onResetView3D}
        />
        <WalkthroughController
          enabled={walkthrough}
          start={[viewCenter.cx, PLAYER_EYE_HEIGHT, viewCenter.cz]}
          walls={wallSegments}
          doors={doorInfos}
          openDoors={openDoors}
          onInteract={handleInteractWithCam}
          placingType={placingType}
          onPlace={handlePlace}
        />
        {/* Camera position tracker for door interaction */}
        {walkthrough && <CamPosTracker camPosRef={camPosRef} />}

        {/* Lighting — enhanced for walkthrough */}
        <ambientLight intensity={walkthrough ? 0.7 : 0.5} />
        <directionalLight
          position={[viewCenter.cx + 20, 25, viewCenter.cz - 10]}
          intensity={walkthrough ? 1.5 : 1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[viewCenter.cx - 15, 15, viewCenter.cz + 15]} intensity={0.3} />
        {walkthrough && <hemisphereLight args={["#87ceeb", "#2d5a1e", 0.4]} />}
        <Environment preset={walkthrough ? "park" : "city"} background={false} />

        {/* Grid — hidden in walkthrough (replaced by ground) */}
        {!walkthrough && (
          <>
            <Grid
              args={[300, 300]}
              cellSize={gridSectionM}
              cellThickness={0.6}
              cellColor="#252d3a"
              sectionSize={gridSectionM * majorGrid}
              sectionThickness={1}
              sectionColor="#1e2430"
              fadeDistance={viewCenter.span * 3}
              fadeStrength={1.5}
              infiniteGrid
              position={[0, -0.001, 0]}
            />
            {/* Origin crosshair */}
            <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.005, viewCenter.span * 2]} />
              <meshBasicMaterial color="#00bcd4" transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.005, viewCenter.span * 2]} />
              <meshBasicMaterial color="#00bcd4" transparent opacity={0.25} />
            </mesh>
          </>
        )}

        {/* 3D Elements */}
        <SceneElements
          elements={elements}
          layers={layers}
          roofType={roofType}
          foundationType={foundationType}
          foundationDepth={foundationDepth}
          walkthrough={walkthrough}
          openDoors={openDoors}
          onToggleDoor={handleToggleDoor}
          placedObjects={placedObjects}
        />
      </Canvas>
    </div>
  );
}

// ─── Camera position tracker (syncs camera pos for door interaction) ──
function CamPosTracker({ camPosRef }: { camPosRef: React.MutableRefObject<{ x: number; z: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    camPosRef.current.x = camera.position.x;
    camPosRef.current.z = camera.position.z;
  });
  return null;
}

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  Text,
  PerspectiveCamera,
  PointerLockControls,
} from "@react-three/drei";
import { useMemo, useEffect, useRef, useState } from "react";
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
  // useMemo MUST be called before any early return (React hooks rule)
  const wallTex = useMemo(() => createHatchTexture("#777", "#606060", 18), []);

  const dx = (el.x2 - el.x) * S;
  const dz = (el.y2 - el.y) * S;
  const length = Math.hypot(dx, dz);
  if (length < 0.001) return null;
  const angle = Math.atan2(dz, dx);
  const cx = ((el.x + el.x2) / 2) * S;
  const cz = ((el.y + el.y2) / 2) * S;
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT;
  const thick = wall ? WALL_THICKNESS : Math.max(el.lineWidth * S * 5, 0.02);

  return (
    <mesh position={[cx, h / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, h, thick]} />
      <meshStandardMaterial color={matColor(el.color)} roughness={wall ? 0.85 : 0.5} map={wall ? wallTex ?? undefined : undefined} />
    </mesh>
  );
}

// ── POLYLINE ──────────────────────────────────────────────
// Same logic as lines: wall layer → wall segments, else thin tubes
function Polyline3D({ el }: { el: DrawingElement & { type: "polyline" } }) {
  const wall = isWallLayer(el.layer);
  const h = wall ? WALL_HEIGHT : LINE_HEIGHT;
  const thick = wall ? WALL_THICKNESS : Math.max(el.lineWidth * S * 5, 0.02);
  const color = matColor(el.color);

  const segments: JSX.Element[] = [];
  for (let i = 0; i < el.points.length - 1; i++) {
    const p1 = el.points[i];
    const p2 = el.points[i + 1];
    const dx = (p2.x - p1.x) * S;
    const dz = (p2.y - p1.y) * S;
    const length = Math.hypot(dx, dz);
    if (length < 0.001) continue;
    const angle = Math.atan2(dz, dx);
    const cx = ((p1.x + p2.x) / 2) * S;
    const cz = ((p1.y + p2.y) / 2) * S;

    segments.push(
      <mesh key={`${el.id}-s${i}`} position={[cx, h / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
        <boxGeometry args={[length + thick, h, thick]} />
        <meshStandardMaterial color={color} roughness={wall ? 0.85 : 0.5} />
      </mesh>,
    );
  }
  return <>{segments}</>;
}

// ── RECT ──────────────────────────────────────────────────
// On wall layer → 4 wall segments forming a room outline
// Other layers → thin flat outline on floor
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
  const wallTex = useMemo(() => createHatchTexture("#747474", "#595959", 18), []);

  return (
    <group>
      {/* Top wall */}
      <mesh position={[cx, h / 2, z1]} castShadow receiveShadow>
        <boxGeometry args={[w + thick, h, thick]} />
        <meshStandardMaterial color={color} roughness={0.85} map={wall ? wallTex ?? undefined : undefined} />
      </mesh>
      {/* Bottom wall */}
      <mesh position={[cx, h / 2, z2]} castShadow receiveShadow>
        <boxGeometry args={[w + thick, h, thick]} />
        <meshStandardMaterial color={color} roughness={0.85} map={wall ? wallTex ?? undefined : undefined} />
      </mesh>
      {/* Left wall */}
      <mesh position={[x1, h / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, d + thick]} />
        <meshStandardMaterial color={color} roughness={0.85} map={wall ? wallTex ?? undefined : undefined} />
      </mesh>
      {/* Right wall */}
      <mesh position={[x2, h / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, d + thick]} />
        <meshStandardMaterial color={color} roughness={0.85} map={wall ? wallTex ?? undefined : undefined} />
      </mesh>
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
      // Center pivot offset
      const dx = Math.cos(-rot) * (w / 2);
      const dz = Math.sin(-rot) * (w / 2);

      return (
        <mesh position={[px + dx, doorHeight / 2, pz + dz]} rotation={[0, rot, 0]} castShadow>
          <boxGeometry args={[w, doorHeight, thickness]} />
          <meshStandardMaterial color={"#5c3d2e"} roughness={0.8} />
        </mesh>
      );
    }

    if (isWindow) {
      // Window glass + frame representation
      const width = w;
      const thickness = WALL_THICKNESS * 1.1;
      const windowHeight = 1.2;
      const windowSill = 0.9;

      // Center pivot offset
      const dx = Math.cos(-rot) * (width / 2);
      const dz = Math.sin(-rot) * (width / 2);

      return (
        <group position={[px + dx, windowSill + windowHeight / 2, pz + dz]} rotation={[0, rot, 0]}>
          <mesh castShadow>
            <boxGeometry args={[width, windowHeight, thickness]} />
            <meshStandardMaterial color={"#87ceeb"} opacity={0.6} transparent roughness={0.1} />
          </mesh>
        </group>
      );
    }
  }

  const isToilet = sym.includes("toilet");
  const isSink = sym.includes("sink");
  const isBath = sym.includes("bath") || sym.includes("tub");
  const isStairs = sym.includes("stair");
  const isColumn = sym === "column";
  const isElevator = sym === "elevator";
  const isEscalator = sym === "escalator";
  const isPool = sym === "pool";
  const isSeptic = sym.includes("septic");
  const isParking = sym === "parking";

  // Override depth for thin elements (real-world thickness)
  let d = blockDepth;

  let blockHeight: number;
  let opacity = 1;
  let matRoughness = 0.7;
  let yOffset = 0;
  let useColor = matColor(el.color);
  let useGeometry: "box" | "cylinder" | "sunken" = "box";

  if (isToilet || isSink) {
    blockHeight = 0.4;
  } else if (isBath) {
    blockHeight = 0.55;
  } else if (isStairs) {
    blockHeight = WALL_HEIGHT;
    opacity = 0.7;
  } else if (isColumn) {
    blockHeight = WALL_HEIGHT;
    useGeometry = "cylinder";
    matRoughness = 0.4;
    useColor = "#b0bec5";
  } else if (isElevator) {
    blockHeight = WALL_HEIGHT;
    opacity = 0.5;
    useColor = "#78909c";
  } else if (isEscalator) {
    blockHeight = WALL_HEIGHT * 0.6;
    opacity = 0.6;
    useColor = "#90a4ae";
  } else if (isPool) {
    blockHeight = 0.1;
    yOffset = -0.5; // sunken below grade
    useColor = "#42a5f5";
    opacity = 0.6;
    matRoughness = 0.1;
  } else if (isSeptic) {
    blockHeight = 0.4;
    yOffset = -0.4; // underground
    useColor = "#795548";
    opacity = 0.5;
  } else if (isParking) {
    blockHeight = 0.05;
    useColor = "#9e9e9e";
    matRoughness = 0.95;
  } else {
    blockHeight = 0.8;
  }

  // Column renders as a cylinder
  if (useGeometry === "cylinder") {
    const radius = Math.max(w, d) / 2;
    return (
      <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
        <mesh position={[0, blockHeight / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, blockHeight, 16]} />
          <meshStandardMaterial color={useColor} roughness={matRoughness} />
        </mesh>
        <Text
          position={[0, blockHeight + 0.15, 0]}
          fontSize={0.08}
          color={useColor}
          anchorX="center"
          anchorY="bottom"
        >
          Column
        </Text>
      </group>
    );
  }

  return (
    <group position={[px, 0, pz]} rotation={[0, rot, 0]}>
      <mesh
        position={[w / 2, yOffset + blockHeight / 2, d / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, blockHeight, d]} />
        <meshStandardMaterial
          color={useColor}
          roughness={matRoughness}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      {/* Label floating above */}
      <Text
        position={[w / 2, yOffset + blockHeight + 0.15, d / 2]}
        rotation={[0, 0, 0]}
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

// ─── Ground floor slab ───────────────────────────────────

function FloorSlab({ elements }: { elements: DrawingElement[] }) {
  // Both useMemo hooks MUST be called before any early return (React hooks rule)
  const bounds = useMemo(() => {
    const b = computeBounds(elements);
    if (!b) return null;
    const pad = 0.5;
    return { minX: b.minX - pad, minZ: b.minZ - pad, maxX: b.maxX + pad, maxZ: b.maxZ + pad };
  }, [elements]);
  const floorTex = useMemo(() => createHatchTexture("#22242a", "#2f3440", 14), []);

  if (!bounds) return null;
  const w = bounds.maxX - bounds.minX;
  const d = bounds.maxZ - bounds.minZ;

  return (
    <mesh
      position={[(bounds.minX + bounds.maxX) / 2, -0.025, (bounds.minZ + bounds.maxZ) / 2]}
      receiveShadow
    >
      <boxGeometry args={[w, 0.05, d]} />
      <meshStandardMaterial color="#1a1a1e" roughness={0.95} map={floorTex ?? undefined} />
    </mesh>
  );
}

function RoofElements({ elements }: { elements: DrawingElement[] }) {
  const roofRects = useMemo(
    () => elements.filter((el): el is DrawingElement & { type: "rect" } => el.type === "rect"),
    [elements],
  );
  const roofTex = useMemo(() => createHatchTexture("#8a8d94", "#73767d", 10), []);
  return (
    <>
      {roofRects.map((r) => {
        const x1 = r.x * S;
        const z1 = r.y * S;
        const x2 = (r.x + r.width) * S;
        const z2 = (r.y + r.height) * S;
        const w = Math.abs(x2 - x1);
        const d = Math.abs(z2 - z1);
        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;
        if (w < 0.2 || d < 0.2) return null;
        return (
          <mesh
            key={`roof-${r.id}`}
            position={[cx, WALL_HEIGHT + ROOF_THICKNESS / 2, cz]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[w + WALL_THICKNESS * 0.5, ROOF_THICKNESS, d + WALL_THICKNESS * 0.5]} />
            <meshStandardMaterial color="#8e939f" roughness={0.8} metalness={0.05} map={roofTex ?? undefined} />
          </mesh>
        );
      })}
    </>
  );
}

function WalkthroughController({ enabled, start }: { enabled: boolean; start: [number, number, number] }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (enabled) {
      camera.position.set(start[0], start[1], start[2]);
      camera.lookAt(start[0] + 1, start[1], start[2]);
    } else if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [enabled, camera, start]);

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = (keys.current["shift"] ? 5.5 : 3.0) * delta;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3(dir.z, 0, -dir.x).normalize();
    if (keys.current["w"]) camera.position.addScaledVector(dir, speed);
    if (keys.current["s"]) camera.position.addScaledVector(dir, -speed);
    if (keys.current["a"]) camera.position.addScaledVector(right, -speed);
    if (keys.current["d"]) camera.position.addScaledVector(right, speed);
    camera.position.y = 1.7;
  });

  if (!enabled) return null;
  return <PointerLockControls />;
}

// ─── Scene: exact layer visibility matching 2D ───────────

function SceneElements({ elements, layers }: { elements: DrawingElement[]; layers: LayerData[] }) {
  const visibleLayers = useMemo(
    () => new Set(layers.filter((l) => l.visible).map((l) => l.name)),
    [layers],
  );

  const visible = useMemo(
    () => elements.filter((el) => visibleLayers.has(el.layer)),
    [elements, visibleLayers],
  );

  return (
    <>
      {visible.map((el) => {
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
      <FloorSlab elements={visible} />
      <RoofElements elements={visible} />
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

export function ThreeCADViewport({
  elements,
  layers,
  pan,
  zoom,
  gridSize,
  majorGrid,
  canvasWidth,
  canvasHeight,
}: {
  elements: DrawingElement[];
  layers: LayerData[];
  pan: { x: number; y: number };
  zoom: number;
  gridSize: number;
  majorGrid: number;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const [walkthrough, setWalkthrough] = useState(false);
  // Convert the 2D viewport center to 3D world coords (mm → meters)
  const viewCenter = useMemo(() => {
    const worldCenterXmm = (canvasWidth / 2 - pan.x) / zoom;
    const worldCenterYmm = (canvasHeight / 2 - pan.y) / zoom;
    // In Three.js: X = 2D X, Z = 2D Y (Y is up)
    const cx = worldCenterXmm * S;
    const cz = worldCenterYmm * S;
    // Visible span in meters
    const spanX = (canvasWidth / zoom) * S;
    const spanZ = (canvasHeight / zoom) * S;
    const span = Math.max(spanX, spanZ, 2);
    return { cx, cz, span };
  }, [pan, zoom, canvasWidth, canvasHeight]);

  // Grid: convert mm gridSize to meters, match 2D grid exactly
  const gridCellM = gridSize * S; // e.g. 20mm → 0.02m
  const gridSectionM = gridCellM * majorGrid; // e.g. 100mm → 0.1m

  return (
    <div className="w-full h-full" style={{ background: "#141414" }}>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setWalkthrough((v) => !v)}
          className="px-2 py-1 text-[11px] rounded border"
          style={{
            background: walkthrough ? "#0f2a3d" : "#10131b",
            borderColor: walkthrough ? "#38bdf8" : "#3a4252",
            color: walkthrough ? "#7dd3fc" : "#aab4c6",
          }}
        >
          {walkthrough ? "Exit Walkthrough" : "Walkthrough"}
        </button>
      </div>
      <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <color attach="background" args={["#141414"]} />

        <PerspectiveCamera
          makeDefault
          position={[
            viewCenter.cx + viewCenter.span * 0.6,
            viewCenter.span * 0.45,
            viewCenter.cz + viewCenter.span * 0.6,
          ]}
          fov={50}
          near={0.01}
          far={2000}
        />
        <OrbitControls
          target={[viewCenter.cx, 0, viewCenter.cz]}
          enabled={!walkthrough}
          enableDamping
          dampingFactor={0.12}
          maxPolarAngle={Math.PI * 0.49}
          minDistance={0.2}
          maxDistance={500}
        />
        <WalkthroughController
          enabled={walkthrough}
          start={[viewCenter.cx, 1.7, viewCenter.cz]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[viewCenter.cx + 20, 25, viewCenter.cz - 10]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[viewCenter.cx - 15, 15, viewCenter.cz + 15]} intensity={0.3} />
        <Environment preset="city" background={false} />

        {/* Grid — same spacing & colors as 2D canvas grid */}
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

        {/* Origin crosshair — same as 2D origin indicator */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.005, viewCenter.span * 2]} />
          <meshBasicMaterial color="#00bcd4" transparent opacity={0.25} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.005, viewCenter.span * 2]} />
          <meshBasicMaterial color="#00bcd4" transparent opacity={0.25} />
        </mesh>

        {/* 3D Elements — exact 1:1 mapping from 2D */}
        <SceneElements elements={elements} layers={layers} />
      </Canvas>
    </div>
  );
}

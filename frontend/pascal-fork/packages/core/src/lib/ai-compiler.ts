import { WallNode } from '../schema/nodes/wall'
import { DoorNode } from '../schema/nodes/door'
import { WindowNode } from '../schema/nodes/window'
import { SlabNode } from '../schema/nodes/slab'
import { CeilingNode } from '../schema/nodes/ceiling'
import { RoofNode } from '../schema/nodes/roof'
import { RoofSegmentNode } from '../schema/nodes/roof-segment'
import { LevelNode } from '../schema/nodes/level'
import { AnyNode } from '../schema/types'
import { generateId } from '../schema/base'
import useScene from '../store/use-scene'

type CardinalWall = 'north' | 'south' | 'east' | 'west'

export interface OOPDraftDoor {
  wall: CardinalWall
  offset: number
  width?: number
  height?: number
}

export interface OOPDraftWindow {
  wall: CardinalWall
  offset: number
  sill_height?: number
  width?: number
  height?: number
}

export interface OOPDraftRoom {
  id: string
  type: string
  dimensions: { width: number; depth: number }
  origin: [number, number]
  floor?: number
  wall_height?: number
  doors: OOPDraftDoor[]
  windows?: OOPDraftWindow[]
}

export interface OOPDraft {
  draft_name: string
  building_type?: 'residential' | 'commercial' | 'mixed_use' | 'industrial'
  floors?: number
  roof_type?: 'gable' | 'hip' | 'shed' | 'flat' | 'gambrel' | 'dutch' | 'mansard'
  wall_height?: number
  rooms: OOPDraftRoom[]
}

const DOOR_MIN_WIDTH = 0.7
const DOOR_MAX_WIDTH = 2.4
const WINDOW_MIN_WIDTH = 0.45
const WINDOW_MAX_WIDTH = 2.4

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getWallLengthByCardinal = (room: OOPDraftRoom, wall: CardinalWall): number =>
  wall === 'north' || wall === 'south' ? room.dimensions.width : room.dimensions.depth

const normalizeWallName = (raw: unknown): CardinalWall => {
  if (raw === 'north' || raw === 'south' || raw === 'east' || raw === 'west') return raw
  return 'south'
}

const normalizeDoorSpecs = (room: OOPDraftRoom): OOPDraftDoor[] => {
  const incoming = Array.isArray(room.doors) ? room.doors : []
  const defaults: OOPDraftDoor[] =
    incoming.length > 0 ? incoming : [{ wall: 'south', offset: getWallLengthByCardinal(room, 'south') / 2 }]

  return defaults.map((spec) => {
    const wall = normalizeWallName(spec.wall)
    const wallLength = getWallLengthByCardinal(room, wall)
    const width = clamp(
      typeof spec.width === 'number' && Number.isFinite(spec.width) ? spec.width : room.type === 'bathroom' ? 0.8 : 0.9,
      DOOR_MIN_WIDTH,
      Math.max(DOOR_MIN_WIDTH, Math.min(DOOR_MAX_WIDTH, wallLength * 0.7)),
    )
    const height = clamp(
      typeof spec.height === 'number' && Number.isFinite(spec.height) ? spec.height : 2.1,
      1.9,
      2.5,
    )
    const centerClearance = Math.max(0.25, width / 2 + 0.12)
    const minOffset = Math.min(centerClearance, wallLength / 2)
    const maxOffset = Math.max(minOffset, wallLength - centerClearance)
    const suggested = typeof spec.offset === 'number' && Number.isFinite(spec.offset)
      ? spec.offset
      : wallLength / 2

    return {
      wall,
      offset: clamp(suggested, minOffset, maxOffset),
      width,
      height,
    }
  })
}

const normalizeWindowSpecs = (room: OOPDraftRoom, wallHeight: number): OOPDraftWindow[] => {
  const incoming = Array.isArray(room.windows) ? room.windows : []
  // Bathrooms typically have no windows unless explicitly requested by prompt/user.
  if (room.type === 'bathroom' && incoming.length === 0) return []
  const defaults: OOPDraftWindow[] =
    incoming.length > 0
      ? incoming
      : room.type === 'bathroom'
        ? []
        : [{ wall: 'north', offset: getWallLengthByCardinal(room, 'north') / 2 }]

  return defaults.map((spec) => {
    const wall = normalizeWallName(spec.wall)
    const wallLength = getWallLengthByCardinal(room, wall)
    const width = clamp(
      typeof spec.width === 'number' && Number.isFinite(spec.width) ? spec.width : room.type === 'bathroom' ? 0.6 : 1.2,
      WINDOW_MIN_WIDTH,
      Math.max(WINDOW_MIN_WIDTH, Math.min(WINDOW_MAX_WIDTH, wallLength * 0.7)),
    )
    const height = clamp(
      typeof spec.height === 'number' && Number.isFinite(spec.height) ? spec.height : 1.2,
      0.6,
      1.8,
    )
    const sillHeight = clamp(
      typeof spec.sill_height === 'number' && Number.isFinite(spec.sill_height) ? spec.sill_height : 0.9,
      0.4,
      Math.max(0.4, wallHeight - height - 0.15),
    )
    const centerClearance = Math.max(0.25, width / 2 + 0.1)
    const minOffset = Math.min(centerClearance, wallLength / 2)
    const maxOffset = Math.max(minOffset, wallLength - centerClearance)
    const suggested = typeof spec.offset === 'number' && Number.isFinite(spec.offset)
      ? spec.offset
      : wallLength / 2

    return {
      wall,
      offset: clamp(suggested, minOffset, maxOffset),
      width,
      height,
      sill_height: sillHeight,
    }
  })
}

/**
 * OpenClaw Parametric Transpiler
 * Compiles a high-level OOP architectural draft into low-level Pascal scene nodes.
 * Generates: Walls, Slabs (floors), Doors, Windows, Ceilings, and Roof.
 */
export function compileOOPDraftToNodes(draft: OOPDraft, parentLevelId: string): AnyNode[] {
  const nodes: AnyNode[] = []
  const globalWallHeight = draft.wall_height ?? 2.8
  const allRoomCorners: [number, number][] = []
  const sceneNodes = useScene.getState().nodes
  const baseLevel = sceneNodes[parentLevelId]
  const baseBuildingId = baseLevel?.parentId ?? null
  const baseLevelIndex = baseLevel?.type === 'level' && typeof (baseLevel as any).level === 'number'
    ? (baseLevel as any).level
    : 0
  const totalFloors = Math.max(
    1,
    Math.floor(
      typeof draft.floors === 'number' && Number.isFinite(draft.floors)
        ? draft.floors
        : Math.max(1, ...draft.rooms.map((room) => (typeof room.floor === 'number' ? room.floor : 1))),
    ),
  )
  const levelIdsByFloor = new Map<number, string>([[1, parentLevelId]])

  if (baseBuildingId && totalFloors > 1) {
    for (let floor = 2; floor <= totalFloors; floor += 1) {
      const levelNode = LevelNode.parse({
        parentId: baseBuildingId,
        level: baseLevelIndex + (floor - 1),
        name: `Level ${baseLevelIndex + floor}`,
      })
      nodes.push(levelNode)
      levelIdsByFloor.set(floor, levelNode.id)
    }
  }

  draft.rooms.forEach((room) => {
    const requestedFloor = Math.floor(typeof room.floor === 'number' ? room.floor : 1)
    const floorNumber = Math.max(1, Math.min(totalFloors, Number.isFinite(requestedFloor) ? requestedFloor : 1))
    const targetLevelId = levelIdsByFloor.get(floorNumber) ?? parentLevelId
    const rx = room.origin[0]
    const rz = room.origin[1]
    const w = room.dimensions.width
    const d = room.dimensions.depth
    const wallH = room.wall_height ?? globalWallHeight

    // Corners (clockwise: TL → TR → BR → BL)
    const TL: [number, number] = [rx, rz]
    const TR: [number, number] = [rx + w, rz]
    const BR: [number, number] = [rx + w, rz + d]
    const BL: [number, number] = [rx, rz + d]

    allRoomCorners.push(TL, TR, BR, BL)

    // ── Floor slab ──
    const slab = SlabNode.parse({
      id: generateId('slab'),
      parentId: targetLevelId,
      name: `${room.id} floor`,
      polygon: [TL, TR, BR, BL],
      materialPreset: room.type === 'bathroom' ? 'tiles' : 'concrete',
    })
    nodes.push(slab)

    // ── Ceiling ──
    const ceiling = CeilingNode.parse({
      id: generateId('ceiling'),
      parentId: targetLevelId,
      name: `${room.id} ceiling`,
      polygon: [TL, TR, BR, BL],
      height: wallH,
    })
    nodes.push(ceiling)

    // ── Walls ──
    const createWall = (start: [number, number], end: [number, number], name: string, front: 'interior' | 'exterior' | 'unknown' = 'unknown'): WallNode => {
      return WallNode.parse({
        id: generateId('wall'),
        parentId: targetLevelId,
        name,
        start,
        end,
        height: wallH,
        thickness: 0.15,
        materialPreset: 'white_plaster',
        frontSide: front,
        backSide: front === 'exterior' ? 'interior' : front === 'interior' ? 'exterior' : 'unknown',
      })
    }

    const walls: Record<CardinalWall, WallNode> = {
      north: createWall(TL, TR, `${room.id} North Wall`),
      east:  createWall(TR, BR, `${room.id} East Wall`),
      south: createWall(BR, BL, `${room.id} South Wall`),
      west:  createWall(BL, TL, `${room.id} West Wall`),
    }

    nodes.push(walls.north, walls.east, walls.south, walls.west)

    // ── Helper: compute wall-local position factor ──
    // Clamps to [0.15, 0.85] so doors/windows never sit on corners
    const wallLocalT = (wall: WallNode, offsetMeters: number): number => {
      const length = Math.hypot(
        wall.end[0] - wall.start[0],
        wall.end[1] - wall.start[1],
      )
      if (length === 0) return 0.5
      const t = offsetMeters / length
      // If the AI gave a bad offset, fallback to center
      if (t <= 0 || t >= 1 || isNaN(t)) return 0.5
      return Math.max(0.15, Math.min(0.85, t))
    }

    // ── Doors ──
    const normalizedDoors = normalizeDoorSpecs(room)
    normalizedDoors.forEach((doorSpec) => {
      const targetWall = walls[doorSpec.wall]
      if (!targetWall) return

      const t = wallLocalT(targetWall, doorSpec.offset)
      const doorHeight = doorSpec.height ?? 2.1
      const door = DoorNode.parse({
        id: generateId('door'),
        parentId: targetWall.id,
        name: `${room.id} ${doorSpec.wall} door`,
        position: [t, doorHeight / 2, 0],
        width: doorSpec.width ?? 0.9,
        height: doorHeight,
      })
      nodes.push(door)
    })

    // ── Windows ──
    const normalizedWindows = normalizeWindowSpecs(room, wallH)
    normalizedWindows.forEach((winSpec) => {
      const targetWall = walls[winSpec.wall]
      if (!targetWall) return

      const t = wallLocalT(targetWall, winSpec.offset)
      const windowHeight = winSpec.height ?? 1.2
      const sillH = winSpec.sill_height ?? 0.9
      const window = WindowNode.parse({
        id: generateId('window'),
        parentId: targetWall.id,
        name: `${room.id} ${winSpec.wall} window`,
        position: [t, sillH + windowHeight / 2, 0],
        width: winSpec.width ?? 1.2,
        height: windowHeight,
      })
      nodes.push(window)
    })
  })

  // ── Roof (covers the full building footprint) ──
  if (allRoomCorners.length > 0) {
    const minX = Math.min(...allRoomCorners.map((c) => c[0]))
    const maxX = Math.max(...allRoomCorners.map((c) => c[0]))
    const minZ = Math.min(...allRoomCorners.map((c) => c[1]))
    const maxZ = Math.max(...allRoomCorners.map((c) => c[1]))
    const roofW = maxX - minX
    const roofD = maxZ - minZ
    const centerX = (minX + maxX) / 2
    const centerZ = (minZ + maxZ) / 2

    const topLevelId = levelIdsByFloor.get(totalFloors) ?? parentLevelId
    const roofId = generateId('roof')
    const segId = generateId('rseg')

    const roofSegment = RoofSegmentNode.parse({
      id: segId,
      parentId: roofId,
      name: 'Main Roof Segment',
      roofType: draft.roof_type ?? 'hip',
      width: roofW + 0.6,
      depth: roofD + 0.6,
      wallHeight: 0.3,
      roofHeight: 2.0,
      overhang: 0.4,
      position: [0, 0, 0],
    })
    nodes.push(roofSegment)

    const roof = RoofNode.parse({
      id: roofId,
      parentId: topLevelId,
      name: `${draft.draft_name} Roof`,
      position: [centerX, globalWallHeight * totalFloors, centerZ],
      children: [segId],
    })
    nodes.push(roof)
  }

  return nodes
}

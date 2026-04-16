type Point = { x: number; y: number }

type DrawingLineElement = {
  id: string
  type: 'line'
  x: number
  y: number
  x2: number
  y2: number
}

type DrawingRectElement = {
  id: string
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
}

type DrawingPolylineElement = {
  id: string
  type: 'polyline'
  points: Point[]
}

type DrawingBlockElement = {
  id: string
  type: 'block'
  x: number
  y: number
  width: number
  height: number
  symbolName?: string
}

type DrawingElement =
  | DrawingLineElement
  | DrawingRectElement
  | DrawingPolylineElement
  | DrawingBlockElement
  | { id: string; type: string }

type StudioPage = {
  id: string
  name: string
  elements: DrawingElement[]
}

type StudioState = {
  pages?: StudioPage[]
  activePageId?: string
  elements?: DrawingElement[]
}

type PascalNodeBase = {
  id: string
  type: string
  parentId: string | null
  visible: boolean
}

type PascalScene = {
  version: string
  metadata: {
    source: string
    projectId: number
    exportedAt: string
  }
  rootNodeIds: string[]
  nodes: Record<string, PascalNodeBase & Record<string, unknown>>
}

type BridgeDrawingLine = {
  id: string
  type: 'line'
  x: number
  y: number
  x2: number
  y2: number
  color: string
  lineWidth: number
  layer: string
}

type BridgeDrawingBlock = {
  id: string
  type: 'block'
  x: number
  y: number
  width: number
  height: number
  symbolName: string
  rotation: number
  color: string
  lineWidth: number
  layer: string
}

export type BridgeDiagnostics = {
  repairedNodes: number
  droppedNodes: number
  conversionMs: number
}

export type BridgeDrawingPayload = ReturnType<typeof buildStudioDrawingFromPascalScene>

function lineToWall(id: string, parentId: string, x1: number, y1: number, x2: number, y2: number) {
  return {
    id,
    type: 'wall',
    parentId,
    visible: true,
    start: [x1 / 1000, 0, y1 / 1000],
    end: [x2 / 1000, 0, y2 / 1000],
    thickness: 0.15,
    height: 2.8,
  }
}

function rectToWalls(rect: DrawingRectElement, parentId: string) {
  const x1 = rect.x
  const y1 = rect.y
  const x2 = rect.x + rect.width
  const y2 = rect.y + rect.height
  return [
    lineToWall(`${rect.id}-w1`, parentId, x1, y1, x2, y1),
    lineToWall(`${rect.id}-w2`, parentId, x2, y1, x2, y2),
    lineToWall(`${rect.id}-w3`, parentId, x2, y2, x1, y2),
    lineToWall(`${rect.id}-w4`, parentId, x1, y2, x1, y1),
  ]
}

function polylineToWalls(polyline: DrawingPolylineElement, parentId: string) {
  const walls: Array<ReturnType<typeof lineToWall>> = []
  for (let i = 1; i < polyline.points.length; i += 1) {
    const p1 = polyline.points[i - 1]
    const p2 = polyline.points[i]
    walls.push(lineToWall(`${polyline.id}-w${i}`, parentId, p1.x, p1.y, p2.x, p2.y))
  }
  return walls
}

function blockToItem(block: DrawingBlockElement, parentId: string) {
  const symbol = (block.symbolName || '').toLowerCase()
  const itemType = symbol.includes('door') ? 'door' : symbol.includes('window') ? 'window' : 'item'
  return {
    id: block.id,
    type: itemType,
    parentId,
    visible: true,
    position: [block.x / 1000, 0, block.y / 1000],
    width: Math.abs(block.width) / 1000,
    height: Math.abs(block.height) / 1000,
    symbolName: block.symbolName || null,
  }
}

function getActiveElements(studioState: StudioState): DrawingElement[] {
  if (Array.isArray(studioState.pages) && studioState.pages.length > 0) {
    const activePage =
      studioState.pages.find((p) => p.id === studioState.activePageId) || studioState.pages[0]
    return Array.isArray(activePage.elements) ? activePage.elements : []
  }
  return Array.isArray(studioState.elements) ? studioState.elements : []
}

export function buildPascalBridgeScene(projectId: number, studioState: StudioState): PascalScene {
  const siteId = `site-${projectId}`
  const buildingId = `building-${projectId}`
  const levelId = `level-${projectId}-1`
  const elements = getActiveElements(studioState)

  const nodes: PascalScene['nodes'] = {
    [siteId]: {
      id: siteId,
      type: 'site',
      parentId: null,
      visible: true,
      name: `Project ${projectId} Site`,
      children: [buildingId],
    },
    [buildingId]: {
      id: buildingId,
      type: 'building',
      parentId: siteId,
      visible: true,
      name: `Project ${projectId} Building`,
      children: [levelId],
    },
    [levelId]: {
      id: levelId,
      type: 'level',
      parentId: buildingId,
      visible: true,
      name: 'Level 1',
      elevation: 0,
      children: [],
    },
  }

  for (const el of elements) {
    if (el.type === 'line' && 'x' in el && 'x2' in el && 'y' in el && 'y2' in el) {
      nodes[el.id] = lineToWall(el.id, levelId, el.x, el.y, el.x2, el.y2)
      ;(nodes[levelId].children as string[]).push(el.id)
      continue
    }
    if (el.type === 'rect' && 'x' in el && 'y' in el && 'width' in el && 'height' in el) {
      const walls = rectToWalls(el, levelId)
      for (const wall of walls) {
        nodes[wall.id] = wall
        ;(nodes[levelId].children as string[]).push(wall.id)
      }
      continue
    }
    if (el.type === 'polyline' && 'points' in el) {
      const walls = polylineToWalls(el, levelId)
      for (const wall of walls) {
        nodes[wall.id] = wall
        ;(nodes[levelId].children as string[]).push(wall.id)
      }
      continue
    }
    if (el.type === 'block' && 'x' in el && 'y' in el && 'width' in el && 'height' in el) {
      nodes[el.id] = blockToItem(el, levelId)
      ;(nodes[levelId].children as string[]).push(el.id)
    }
  }

  return {
    version: '1.0.0',
    metadata: {
      source: 'africacontechhub-architectural-studio-bridge',
      projectId,
      exportedAt: new Date().toISOString(),
    },
    rootNodeIds: [siteId],
    nodes,
  }
}

function mmFromMeters(value: unknown): number {
  return typeof value === 'number' ? Math.round(value * 1000) : 0
}

function tupleToXY(tuple: unknown): { x: number; y: number } | null {
  if (!Array.isArray(tuple) || tuple.length < 2) return null
  if (tuple.length >= 3) {
    return { x: mmFromMeters(tuple[0]), y: mmFromMeters(tuple[2]) }
  }
  return { x: mmFromMeters(tuple[0]), y: mmFromMeters(tuple[1]) }
}

function getSceneNodeMap(scene: unknown): Record<string, Record<string, unknown>> {
  if (!scene || typeof scene !== 'object') return {}
  const maybeNodes = (scene as { nodes?: unknown }).nodes
  if (!maybeNodes || typeof maybeNodes !== 'object') return {}
  const entries = Object.entries(maybeNodes).filter(
    ([, value]) => Boolean(value) && typeof value === 'object',
  ) as Array<[string, Record<string, unknown>]>
  return Object.fromEntries(entries)
}

export function buildStudioDrawingFromPascalScene(scene: Record<string, any>) {
  const startedAt = performance.now()
  let repairedNodes = 0
  let droppedNodes = 0
  const nodes = getSceneNodeMap(scene)
  if (!Object.keys(nodes).length) {
    return {
      pages: [{ id: 'page-1', name: 'Page 1', elements: [] }],
      activePageId: 'page-1',
      layers: [
        { name: 'Layer 0', visible: true, locked: false, color: '#00d4ff', lineType: 'solid' },
        { name: 'A-WALL', visible: true, locked: false, color: '#00d4ff', lineType: 'solid' },
        { name: 'A-OPENING', visible: true, locked: false, color: '#ffd700', lineType: 'solid' },
      ],
      activeLayer: 'Layer 0',
    }
  }

  const elements: Array<BridgeDrawingLine | BridgeDrawingBlock> = []
  const nodeValues = Object.values(nodes) as Array<Record<string, any>>

  for (const node of nodeValues) {
    if (node?.type === 'wall') {
      const start = tupleToXY(node.start)
      const end = tupleToXY(node.end)
      if (!start || !end) {
        droppedNodes += 1
        continue
      }
      if (!node.id) repairedNodes += 1
      elements.push({
        id: node.id || crypto.randomUUID(),
        type: 'line',
        x: start.x,
        y: start.y,
        x2: end.x,
        y2: end.y,
        color: '#00d4ff',
        lineWidth: 2,
        layer: 'A-WALL',
      })
      continue
    }

    if (node?.type === 'door' || node?.type === 'window' || node?.type === 'item') {
      const pos = tupleToXY(node.position)
      if (!pos) {
        droppedNodes += 1
        continue
      }
      const width = typeof node.width === 'number' ? Math.max(300, mmFromMeters(node.width)) : 900
      const height = typeof node.height === 'number' ? Math.max(120, mmFromMeters(node.height)) : 300
      if (typeof node.width !== 'number' || typeof node.height !== 'number') repairedNodes += 1
      const symbolName =
        node.type === 'door'
          ? 'door_swing_right'
          : node.type === 'window'
            ? 'window'
            : (node.symbolName || 'sofa')

      elements.push({
        id: node.id || crypto.randomUUID(),
        type: 'block',
        x: pos.x,
        y: pos.y,
        width,
        height,
        symbolName,
        rotation: 0,
        color: '#ffd700',
        lineWidth: 1,
        layer: 'A-OPENING',
      })
    }
  }

  const payload = {
    pages: [{ id: 'page-1', name: 'Page 1', elements }],
    activePageId: 'page-1',
    layers: [
      { name: 'Layer 0', visible: true, locked: false, color: '#00d4ff', lineType: 'solid' },
      { name: 'A-WALL', visible: true, locked: false, color: '#00d4ff', lineType: 'solid' },
      { name: 'A-OPENING', visible: true, locked: false, color: '#ffd700', lineType: 'solid' },
    ],
    activeLayer: 'Layer 0',
  }
  ;(payload as any).__bridgeDiagnostics = {
    repairedNodes,
    droppedNodes,
    conversionMs: Math.round((performance.now() - startedAt) * 100) / 100,
  } satisfies BridgeDiagnostics
  return payload
}

export function getBridgeDiagnostics(payload: Record<string, any>): BridgeDiagnostics {
  const diagnostics = payload?.__bridgeDiagnostics
  if (!diagnostics || typeof diagnostics !== 'object') {
    return { repairedNodes: 0, droppedNodes: 0, conversionMs: 0 }
  }
  return {
    repairedNodes:
      typeof diagnostics.repairedNodes === 'number' ? Math.max(0, diagnostics.repairedNodes) : 0,
    droppedNodes: typeof diagnostics.droppedNodes === 'number' ? Math.max(0, diagnostics.droppedNodes) : 0,
    conversionMs: typeof diagnostics.conversionMs === 'number' ? Math.max(0, diagnostics.conversionMs) : 0,
  }
}

export function runPascalBridgeSelfCheck() {
  const demoScene = {
    nodes: {
      wall_1: { id: 'wall_1', type: 'wall', start: [0, 0, 0], end: [3.2, 0, 0] },
      item_1: { id: 'item_1', type: 'item', position: [1.2, 0, 1.1], width: 0.8, height: 0.6 },
      bad_1: { id: 'bad_1', type: 'wall', start: null, end: [0, 0, 0] },
    },
  }
  const drawing = buildStudioDrawingFromPascalScene(demoScene as Record<string, any>)
  const diagnostics = getBridgeDiagnostics(drawing as Record<string, any>)
  return {
    pass: drawing.pages[0]?.elements.length >= 2 && diagnostics.droppedNodes >= 1,
    diagnostics,
  }
}

function safeId(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_')
}

export function buildPascalCoreSceneFromStudioState(projectId: number, studioState: StudioState) {
  const siteId = `site_${projectId}`
  const buildingId = `building_${projectId}`
  const levelId = `level_${projectId}_1`
  const elements = getActiveElements(studioState)

  const nodes: Record<string, Record<string, unknown>> = {
    [siteId]: {
      id: siteId,
      object: 'node',
      type: 'site',
      parentId: null,
      visible: true,
      name: `Project ${projectId} Site`,
      children: [buildingId],
    },
    [buildingId]: {
      id: buildingId,
      object: 'node',
      type: 'building',
      parentId: siteId,
      visible: true,
      name: `Project ${projectId} Building`,
      children: [levelId],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    [levelId]: {
      id: levelId,
      object: 'node',
      type: 'level',
      parentId: buildingId,
      visible: true,
      name: 'Level 1',
      level: 0,
      children: [],
    },
  }

  let wallCount = 0
  let itemCount = 0

  const addWall = (id: string, x1: number, y1: number, x2: number, y2: number) => {
    nodes[id] = {
      id,
      object: 'node',
      type: 'wall',
      parentId: levelId,
      visible: true,
      children: [],
      start: [x1 / 1000, y1 / 1000],
      end: [x2 / 1000, y2 / 1000],
      height: 2.8,
      thickness: 0.15,
      frontSide: 'unknown',
      backSide: 'unknown',
    }
    ;(nodes[levelId].children as string[]).push(id)
    wallCount += 1
  }

  for (const el of elements) {
    if (el.type === 'line' && 'x' in el && 'x2' in el && 'y' in el && 'y2' in el) {
      addWall(`wall_${safeId(el.id)}`, el.x, el.y, el.x2, el.y2)
      continue
    }
    if (el.type === 'rect' && 'x' in el && 'y' in el && 'width' in el && 'height' in el) {
      addWall(`wall_${safeId(el.id)}_1`, el.x, el.y, el.x + el.width, el.y)
      addWall(`wall_${safeId(el.id)}_2`, el.x + el.width, el.y, el.x + el.width, el.y + el.height)
      addWall(`wall_${safeId(el.id)}_3`, el.x + el.width, el.y + el.height, el.x, el.y + el.height)
      addWall(`wall_${safeId(el.id)}_4`, el.x, el.y + el.height, el.x, el.y)
      continue
    }
    if (el.type === 'polyline' && 'points' in el) {
      for (let i = 1; i < el.points.length; i += 1) {
        const p1 = el.points[i - 1]
        const p2 = el.points[i]
        addWall(`wall_${safeId(el.id)}_${i}`, p1.x, p1.y, p2.x, p2.y)
      }
      continue
    }
    if (el.type === 'block' && 'x' in el && 'y' in el && 'width' in el && 'height' in el) {
      const itemId = `item_${safeId(el.id)}`
      nodes[itemId] = {
        id: itemId,
        object: 'node',
        type: 'item',
        parentId: levelId,
        visible: true,
        position: [el.x / 1000, 0, el.y / 1000],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        children: [],
        asset: {
          id: itemId,
          category: 'imported',
          name: el.symbolName || 'Imported Item',
          thumbnail: '',
          src: '',
          dimensions: [Math.max(0.2, Math.abs(el.width) / 1000), 1, Math.max(0.2, Math.abs(el.height) / 1000)],
          offset: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      }
      ;(nodes[levelId].children as string[]).push(itemId)
      itemCount += 1
    }
  }

  return {
    nodes,
    rootNodeIds: [siteId],
    stats: { wallCount, itemCount },
  }
}


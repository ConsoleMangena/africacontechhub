import { useRegistry, useScene, type WallNode } from '@pascal-app/core'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'
import {
  createMaterial,
  createMaterialFromPresetRef,
  DEFAULT_WALL_MATERIAL,
} from '../../../lib/materials'
import { NodeRenderer } from '../node-renderer'

export const WallRenderer = ({ node }: { node: WallNode }) => {
  const ref = useRef<Mesh>(null!)
  const wallLength = Math.max(0.05, Math.hypot(node.end[0] - node.start[0], node.end[1] - node.start[1]))
  const wallHeight = Math.max(0.2, node.height || 2.8)
  const wallThickness = Math.max(0.04, node.thickness || 0.15)
  const wallCenter: [number, number, number] = [
    (node.start[0] + node.end[0]) / 2,
    wallHeight / 2,
    (node.start[1] + node.end[1]) / 2,
  ]
  const wallAngle = Math.atan2(node.end[1] - node.start[1], node.end[0] - node.start[0])

  useRegistry(node.id, 'wall', ref)

  useLayoutEffect(() => {
    useScene.getState().markDirty(node.id)
  }, [node.id])

  const handlers = useNodeEvents(node, 'wall')

  const material = useMemo(() => {
    const presetMaterial = createMaterialFromPresetRef(node.materialPreset)
    if (presetMaterial) return presetMaterial
    const mat = node.material
    if (!mat) return DEFAULT_WALL_MATERIAL
    return createMaterial(mat)
  }, [
    node.material,
    node.material?.preset,
    node.material?.properties,
    node.material?.texture,
    node.materialPreset,
  ])

  return (
    <mesh
      castShadow
      material={material}
      position={wallCenter}
      receiveShadow
      ref={ref}
      rotation={[0, -wallAngle, 0]}
      visible={node.visible}
    >
      <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
      <mesh name="collision-mesh" visible={false} {...handlers}>
        <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
      </mesh>

      {node.children.map((childId) => (
        <NodeRenderer key={childId} nodeId={childId} />
      ))}
    </mesh>
  )
}

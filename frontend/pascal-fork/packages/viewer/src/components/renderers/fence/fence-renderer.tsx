import { type FenceNode, useRegistry, useScene } from '@pascal-app/core'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useNodeEvents } from '../../../hooks/use-node-events'
import {
  createMaterial,
  createDefaultMaterial,
  createMaterialFromPresetRef,
} from '../../../lib/materials'

export const FenceRenderer = ({ node }: { node: FenceNode }) => {
  const ref = useRef<Group>(null!)
  const handlers = useNodeEvents(node, 'fence')
  const length = useMemo(
    () => Math.max(0.05, Math.hypot(node.end[0] - node.start[0], node.end[1] - node.start[1])),
    [node.end, node.start],
  )
  const center = useMemo<[number, number, number]>(
    () => [(node.start[0] + node.end[0]) / 2, 0, (node.start[1] + node.end[1]) / 2],
    [node.end, node.start],
  )
  const angle = useMemo(
    () => Math.atan2(node.end[1] - node.start[1], node.end[0] - node.start[0]),
    [node.end, node.start],
  )
  const height = Math.max(0.2, node.height || 1.8)
  const thickness = Math.max(0.04, node.thickness || 0.08)
  const postSize = Math.max(0.05, thickness * 1.2)
  const railSize = Math.max(0.03, thickness * 0.55)
  const postSpacing = Math.max(0.9, Math.min(2.0, node.postSpacing || 1.5))
  const postCount = useMemo(() => Math.max(2, Math.floor(length / postSpacing) + 1), [length, postSpacing])
  const posts = useMemo(() => {
    const pts: number[] = []
    if (postCount <= 1) return pts
    for (let i = 0; i < postCount; i++) {
      const t = i / (postCount - 1)
      pts.push(-length / 2 + t * length)
    }
    return pts
  }, [length, postCount])
  const material = useMemo(() => {
    const presetMaterial = createMaterialFromPresetRef(node.materialPreset)
    if (presetMaterial) return presetMaterial
    const mat = node.material
    if (!mat) return createDefaultMaterial(node.color || '#111827', 0.85)
    return createMaterial(mat)
  }, [
    node.materialPreset,
    node.color,
    node.material,
    node.material?.preset,
    node.material?.properties,
    node.material?.texture,
  ])

  useRegistry(node.id, 'fence', ref)
  useLayoutEffect(() => {
    useScene.getState().markDirty(node.id)
  }, [node.id])

  return (
    <group
      position={center}
      ref={ref}
      rotation={[0, -angle, 0]}
      visible={node.visible}
      {...handlers}
    >
      {/* Posts */}
      {posts.map((x, idx) => (
        <mesh
          key={idx}
          castShadow
          material={material}
          position={[x, height / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[postSize, height, postSize]} />
        </mesh>
      ))}

      {/* Rails */}
      <mesh castShadow material={material} position={[0, height * 0.35, 0]} receiveShadow>
        <boxGeometry args={[length, railSize, railSize]} />
      </mesh>
      <mesh castShadow material={material} position={[0, height * 0.75, 0]} receiveShadow>
        <boxGeometry args={[length, railSize, railSize]} />
      </mesh>
    </group>
  )
}

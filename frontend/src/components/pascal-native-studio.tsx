import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { builderApi } from '@/services/api'
import {
  buildPascalCoreSceneFromStudioState,
  getBridgeDiagnostics,
  buildStudioDrawingFromPascalScene,
} from '@/lib/pascal-bridge'

type PascalNativeStudioProps = {
  projectId: number
  onNativeUnavailable?: (reason?: string) => void
  manualSaveSignal?: number
  onManualSaveDone?: (ok: boolean) => void
}

type StudioDebugEvent = {
  ts: string
  projectId: number
  event: string
  payload?: Record<string, unknown>
}

type StudioDebugWindow = Window & {
  __pascalStudioDebugEvents?: StudioDebugEvent[]
}

export function PascalNativeStudio({
  projectId,
  onNativeUnavailable,
  manualSaveSignal = 0,
  onManualSaveDone,
}: PascalNativeStudioProps) {
  const lastVersionSaveAtRef = useRef(0)
  const lastHandledManualSaveSignalRef = useRef(0)
  const queuedSceneRef = useRef<{ nodes: Record<string, any>; rootNodeIds: string[] } | null>(null)
  const saveDebounceTimerRef = useRef<number | null>(null)
  const saveInFlightRef = useRef(false)
  const pendingSaveAfterFlightRef = useRef(false)
  const loadedSceneRef = useRef<{ nodes: Record<string, any>; rootNodeIds: string[] } | null>(null)
  const hasAppliedInitialCameraRef = useRef(false)
  const sceneStoreRef = useRef<any>(null)
  const viewerStoreRef = useRef<any>(null)
  const editorStoreRef = useRef<any>(null)
  const emitterRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ wallCount: number; itemCount: number } | null>(null)
  const [EditorComp, setEditorComp] = useState<ComponentType<any> | null>(null)
  const [debugEvents, setDebugEvents] = useState<StudioDebugEvent[]>([])
  const loadInvocationCountRef = useRef(0)
  const saveInvocationCountRef = useRef(0)
  const debugEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    const value = params.get('studioDebug')
    return value === '1' || value === 'true' || value === 'on'
  }, [])
  const safeModeNoAutosave = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    const value = params.get('studioSafe')
    return value === '1' || value === 'true' || value === 'on'
  }, [])

  const debugLog = useCallback(
    (event: string, payload?: Record<string, unknown>) => {
      if (!debugEnabled) return
      const record: StudioDebugEvent = {
        ts: new Date().toISOString(),
        projectId,
        event,
        payload,
      }
      const target = window as StudioDebugWindow
      const events = target.__pascalStudioDebugEvents || []
      events.push(record)
      target.__pascalStudioDebugEvents = events.slice(-500)
      setDebugEvents((prev) => [...prev, record].slice(-150))
      console.debug(`[PascalStudio][P${projectId}] ${event}`, payload || {})
    },
    [debugEnabled, projectId],
  )

  const normalizeSceneGraph = useCallback(
    (inputNodes: Record<string, any>, inputRootNodeIds: string[] | undefined) => {
      const nodes = { ...(inputNodes || {}) } as Record<string, any>
      let rootNodeIds = Array.isArray(inputRootNodeIds) ? [...inputRootNodeIds] : []

      const ensureArray = (value: unknown) => (Array.isArray(value) ? value : [])
      const asNodeId = (value: unknown): string | null => {
        if (typeof value === 'string' && value) return value
        if (value && typeof value === 'object' && typeof (value as any).id === 'string') {
          return (value as any).id
        }
        return null
      }
      const normalizeChildren = (children: unknown): string[] =>
        ensureArray(children)
          .map(asNodeId)
          .filter((id): id is string => Boolean(id && nodes[id]))

      const nodeValues = Object.values(nodes) as Array<any>
      let site = nodeValues.find((node) => node?.type === 'site')
      let building = nodeValues.find((node) => node?.type === 'building')
      let level = nodeValues.find((node) => node?.type === 'level' && node?.level === 0)
      if (!level) level = nodeValues.find((node) => node?.type === 'level')

      if (!site) {
        const siteId = `site_${projectId}`
        site = {
          id: siteId,
          object: 'node',
          type: 'site',
          parentId: null,
          visible: true,
          name: `Project ${projectId} Site`,
          children: [],
        }
        nodes[siteId] = site
      }

      if (!building) {
        const buildingId = `building_${projectId}`
        building = {
          id: buildingId,
          object: 'node',
          type: 'building',
          parentId: site.id,
          visible: true,
          name: `Project ${projectId} Building`,
          children: [],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
        }
        nodes[buildingId] = building
      }

      if (!level) {
        const levelId = `level_${projectId}_1`
        level = {
          id: levelId,
          object: 'node',
          type: 'level',
          parentId: building.id,
          visible: true,
          name: 'Level 1',
          level: 0,
          children: [],
        }
        nodes[levelId] = level
      }

      site.children = normalizeChildren(site.children)
      building.children = normalizeChildren(building.children)
      level.children = normalizeChildren(level.children)

      if (!site.children.includes(building.id)) {
        site.children.push(building.id)
      }
      building.parentId = site.id

      if (!building.children.includes(level.id)) {
        building.children.push(level.id)
      }
      level.parentId = building.id
      if (typeof level.level !== 'number') {
        level.level = 0
      }

      for (const node of Object.values(nodes) as Array<any>) {
        if (!node || node.id === site.id || node.id === building.id || node.id === level.id) continue
        if (!node.parentId) {
          node.parentId = level.id
        }
      }

      const levelChildren = new Set(normalizeChildren(level.children))
      for (const node of Object.values(nodes) as Array<any>) {
        if (!node || node.id === level.id) continue
        if (node.parentId === level.id) {
          levelChildren.add(node.id)
        }
      }
      level.children = Array.from(levelChildren)
      rootNodeIds = [site.id]

      return { nodes, rootNodeIds }
    },
    [projectId],
  )

  useEffect(() => {
    let cancelled = false
    debugLog('module-load:start')
    ;(async () => {
      try {
        const [editorMod, coreMod, viewerMod] = await Promise.all([
          import('@pascal-app/editor'),
          import('@pascal-app/core'),
          import('@pascal-app/viewer'),
        ])
        if (cancelled) return
        setEditorComp(() => editorMod.Editor as ComponentType<any>)
        sceneStoreRef.current = (coreMod as any).useScene
        viewerStoreRef.current = (viewerMod as any).useViewer
        editorStoreRef.current = (editorMod as any).useEditor
        emitterRef.current = (coreMod as any).emitter
        debugLog('module-load:success')
      } catch {
        if (!cancelled) {
          const msg = 'Native Pascal editor could not be loaded in this browser.'
          setError(`${msg} Switching to Cloud Fallback...`)
          onNativeUnavailable?.(msg)
          debugLog('module-load:failed', { reason: msg })
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
      debugLog('module-load:cleanup')
    }
  }, [debugLog, onNativeUnavailable])

  const syncSelectionAndCamera = useCallback((nodes: Record<string, any>) => {
    const viewerStore = viewerStoreRef.current
    if (!viewerStore?.getState) return

    // Force dark theme for embedded Pascal view so the actual canvas goes black.
    try {
      viewerStore.getState().setTheme?.('dark')
    } catch {
      // ignore - theme API may vary across builds
    }

    const nodeValues = Object.values(nodes || {}) as Array<any>
    const building = nodeValues.find((node) => node?.type === 'building')
    const level = nodeValues.find((node) => node?.type === 'level')

    if (building?.id || level?.id) {
      viewerStore.getState().setSelection({
        buildingId: building?.id ?? null,
        levelId: level?.id ?? null,
        zoneId: null,
        selectedIds: [],
      })
    }

    const emitter = emitterRef.current
    if (!emitter?.emit) return

    // Prefer focusing an actual geometry node (walls/items/etc.) so the user sees something immediately.
    const focusPriority = [
      'wall',
      'slab',
      'zone',
      'opening',
      'door',
      'window',
      'stair',
      'fence',
      'roof',
      'item',
    ]
    const focusNode =
      nodeValues.find((n) => n?.id && focusPriority.includes(n?.type)) ??
      nodeValues.find((n) => n?.id && n?.type && !['site', 'building', 'level'].includes(n.type)) ??
      level ??
      building

    // Top-down makes floorplans immediately readable.
    emitter.emit('camera-controls:top-view', undefined)
    if (focusNode?.id) {
      emitter.emit('camera-controls:focus', { nodeId: focusNode.id })
    } else if (building?.id) {
      emitter.emit('camera-controls:focus', { nodeId: building.id })
    }
    debugLog('camera-sync:applied', {
      focusNodeId: focusNode?.id || null,
      buildingId: building?.id || null,
      levelId: level?.id || null,
      nodeCount: Object.keys(nodes || {}).length,
    })
  }, [debugLog])

  const getSceneContentScore = useCallback((nodes: Record<string, any>) => {
    const skipTypes = new Set(['site', 'building', 'level'])
    return Object.values(nodes || {}).filter((node: any) => node && !skipTypes.has(node.type)).length
  }, [])

  const loadScene = useCallback(async () => {
    loadInvocationCountRef.current += 1
    debugLog('scene-load:called', {
      invocation: loadInvocationCountRef.current,
      hasCachedScene: Boolean(loadedSceneRef.current),
    })

    const sceneStore = sceneStoreRef.current
    const liveState = sceneStore?.getState?.()
    const liveNodes = liveState?.nodes
    const liveRootNodeIds = liveState?.rootNodeIds
    if (liveNodes && typeof liveNodes === 'object' && Array.isArray(liveRootNodeIds)) {
      const liveSnapshot = {
        nodes: liveNodes as Record<string, any>,
        rootNodeIds: liveRootNodeIds as string[],
      }
      loadedSceneRef.current = liveSnapshot
      debugLog('scene-load:using-live-store', {
        invocation: loadInvocationCountRef.current,
        nodeCount: Object.keys(liveSnapshot.nodes || {}).length,
      })
      return liveSnapshot
    }

    if (loadedSceneRef.current) {
      debugLog('scene-load:using-cache', {
        invocation: loadInvocationCountRef.current,
        nodeCount: Object.keys(loadedSceneRef.current.nodes || {}).length,
      })
      return loadedSceneRef.current
    }
    setError(null)
    let nativeCandidate: { nodes: Record<string, unknown>; rootNodeIds: string[] } | null = null

    // Load latest native scene candidate first.
    try {
      const versionsRes = await builderApi.getPascalScenes(projectId)
      const versions = Array.isArray(versionsRes.data?.results) ? versionsRes.data.results : []
      debugLog('scene-load:versions-fetched', { count: versions.length })
      if (versions.length > 0) {
        const latest = [...versions]
          .filter((v) => typeof v?.id === 'string' && Boolean(v.id))
          .sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime()
            const tb = new Date(b.created_at || 0).getTime()
            return tb - ta
          })[0]
        if (latest?.id) {
          const sceneRes = await builderApi.getPascalScene(projectId, latest.id)
          const scene = sceneRes.data?.scene
          if (scene && typeof scene === 'object' && typeof scene.nodes === 'object') {
            const normalized = normalizeSceneGraph(
              scene.nodes as Record<string, any>,
              Array.isArray((scene as any).rootNodeIds)
                ? ((scene as any).rootNodeIds as string[])
                : [],
            )
            nativeCandidate = {
              nodes: normalized.nodes as Record<string, unknown>,
              rootNodeIds: normalized.rootNodeIds,
            }
            debugLog('scene-load:native-candidate-ready', {
              latestVersionId: latest.id,
              nodeCount: Object.keys(normalized.nodes || {}).length,
            })
          }
        }
      }
    } catch {
      debugLog('scene-load:native-candidate-failed')
      // If native loading fails, bridged drawing candidate below still loads.
    }

    try {
      const drawingRes = await builderApi.getProjectDrawing(projectId)
      const drawingData = drawingRes.data?.data || {}
      const bridgedRaw = buildPascalCoreSceneFromStudioState(projectId, drawingData)
      const bridged = normalizeSceneGraph(
        bridgedRaw.nodes as Record<string, any>,
        bridgedRaw.rootNodeIds as string[],
      )
      const bridgedNodeValues = Object.values(bridged.nodes) as Array<any>
      setStats({
        wallCount: bridgedNodeValues.filter((node) => node?.type === 'wall').length,
        itemCount: bridgedNodeValues.filter((node) => node?.type === 'item').length,
      })
      const bridgedCandidate = {
        nodes: bridged.nodes as Record<string, unknown>,
        rootNodeIds: bridged.rootNodeIds,
      }
      const nativeScore = nativeCandidate ? getSceneContentScore(nativeCandidate.nodes as Record<string, any>) : -1
      const bridgedScore = getSceneContentScore(bridgedCandidate.nodes as Record<string, any>)
      const selected = nativeScore >= bridgedScore ? nativeCandidate : bridgedCandidate
      const sceneToUse = selected || bridgedCandidate
      debugLog('scene-load:selected-scene', {
        nativeScore,
        bridgedScore,
        selected: selected === nativeCandidate ? 'native' : 'bridged',
        selectedNodeCount: Object.keys(sceneToUse.nodes || {}).length,
      })
      loadedSceneRef.current = sceneToUse
      if (!hasAppliedInitialCameraRef.current) {
        syncSelectionAndCamera((sceneToUse.nodes || bridgedCandidate.nodes) as Record<string, any>)
        hasAppliedInitialCameraRef.current = true
      }
      return sceneToUse
    } catch {
      // If BOTH API drawing load and native versions fail, still return a valid minimal scene
      // so the editor remains interactive (tools/camera/selection won’t dead-end).
      const fallback = normalizeSceneGraph({}, [])
      setStats({ wallCount: 0, itemCount: 0 })
      setError('Could not load project drawing. Loaded an empty scene.')
      const sceneToUse = {
        nodes: fallback.nodes as Record<string, unknown>,
        rootNodeIds: fallback.rootNodeIds,
      }
      debugLog('scene-load:fallback-scene', {
        nodeCount: Object.keys(sceneToUse.nodes || {}).length,
      })
      loadedSceneRef.current = sceneToUse
      if (!hasAppliedInitialCameraRef.current) {
        syncSelectionAndCamera(fallback.nodes as Record<string, any>)
        hasAppliedInitialCameraRef.current = true
      }
      return sceneToUse
    }
  }, [debugLog, getSceneContentScore, normalizeSceneGraph, projectId, syncSelectionAndCamera])

  const persistScene = useCallback(
    async (scene: { nodes: Record<string, any>; rootNodeIds: string[] }) => {
      debugLog('scene-persist:start', {
        nodeCount: Object.keys(scene.nodes || {}).length,
        rootCount: scene.rootNodeIds?.length || 0,
      })
      const drawing = buildStudioDrawingFromPascalScene({
        nodes: scene.nodes as Record<string, any>,
      })
      const diagnostics = getBridgeDiagnostics(drawing as Record<string, any>)
      const elements = Array.isArray((drawing as any).elements)
        ? (drawing as any).elements
        : Array.isArray((drawing as any).pages)
          ? ((drawing as any).pages.find((page: any) => Array.isArray(page?.elements))?.elements ?? [])
          : []
      await builderApi.saveProjectDrawing(projectId, drawing)
      const now = Date.now()
      if (now - lastVersionSaveAtRef.current > 30_000) {
        try {
          await builderApi.createPascalScene(projectId, {
            name: `Autosave ${new Date(now).toLocaleTimeString()}`,
            source: 'native-autosave',
            scene: { nodes: scene.nodes, rootNodeIds: scene.rootNodeIds },
          })
        } catch {
          // Keep drawing saves resilient even if version endpoint is transiently unavailable.
        }
        lastVersionSaveAtRef.current = now
      }
      setStats((current) => ({
        wallCount: elements.filter((el: any) => el?.type === 'line').length,
        itemCount: elements.filter((el: any) => el?.type === 'block').length,
      }))
      if (diagnostics.conversionMs > 250) {
        console.warn('Pascal bridge conversion is slow', diagnostics)
      }
      debugLog('scene-persist:done', {
        elementCount: elements.length,
        conversionMs: diagnostics.conversionMs,
      })
    },
    [debugLog, projectId],
  )

  const flushQueuedSave = useCallback(async () => {
    const scene = queuedSceneRef.current
    if (!scene) return
    debugLog('scene-save:flush-attempt', {
      hasScene: Boolean(scene),
      saveInFlight: saveInFlightRef.current,
      pendingAfterFlight: pendingSaveAfterFlightRef.current,
    })
    if (saveInFlightRef.current) {
      pendingSaveAfterFlightRef.current = true
      debugLog('scene-save:queued-while-inflight')
      return
    }
    saveInFlightRef.current = true
    queuedSceneRef.current = null
    try {
      await persistScene(scene)
    } finally {
      saveInFlightRef.current = false
      debugLog('scene-save:flush-complete', {
        pendingAfterFlight: pendingSaveAfterFlightRef.current,
      })
      if (pendingSaveAfterFlightRef.current) {
        pendingSaveAfterFlightRef.current = false
        if (queuedSceneRef.current) {
          await flushQueuedSave()
        }
      }
    }
  }, [persistScene])

  const saveScene = useCallback(async (scene: { nodes: Record<string, any>; rootNodeIds: string[] }) => {
    saveInvocationCountRef.current += 1
    debugLog('scene-save:called', {
      invocation: saveInvocationCountRef.current,
      nodeCount: Object.keys(scene.nodes || {}).length,
      rootCount: scene.rootNodeIds?.length || 0,
      safeModeNoAutosave,
    })
    loadedSceneRef.current = scene
    if (safeModeNoAutosave) {
      debugLog('scene-save:skipped-safe-mode')
      return
    }
    queuedSceneRef.current = scene
    if (saveDebounceTimerRef.current !== null) {
      window.clearTimeout(saveDebounceTimerRef.current)
    }
    saveDebounceTimerRef.current = window.setTimeout(() => {
      saveDebounceTimerRef.current = null
      debugLog('scene-save:debounce-flush')
      void flushQueuedSave()
    }, 1200)
  }, [debugLog, flushQueuedSave, safeModeNoAutosave])

  useEffect(() => {
    loadedSceneRef.current = null
    hasAppliedInitialCameraRef.current = false
    loadInvocationCountRef.current = 0
    saveInvocationCountRef.current = 0
    debugLog('project-change:reset-caches')
  }, [debugLog, projectId])

  useEffect(() => {
    if (!EditorComp) return
    setLoading(false)
    debugLog('editor:ready')
  }, [EditorComp])

  useEffect(() => {
    if (!manualSaveSignal) return
    if (manualSaveSignal === lastHandledManualSaveSignalRef.current) return
    lastHandledManualSaveSignalRef.current = manualSaveSignal
    const sceneStore = sceneStoreRef.current
    if (!sceneStore?.getState) {
      debugLog('manual-save:failed-no-store')
      onManualSaveDone?.(false)
      return
    }
    const state = sceneStore.getState()
    const nodes = state?.nodes
    const rootNodeIds = state?.rootNodeIds
    if (!nodes || typeof nodes !== 'object' || !Array.isArray(rootNodeIds)) {
      debugLog('manual-save:failed-invalid-scene')
      onManualSaveDone?.(false)
      return
    }
    debugLog('manual-save:triggered', {
      signal: manualSaveSignal,
      nodeCount: Object.keys(nodes || {}).length,
    })
    queuedSceneRef.current = { nodes, rootNodeIds }
    if (saveDebounceTimerRef.current !== null) {
      window.clearTimeout(saveDebounceTimerRef.current)
      saveDebounceTimerRef.current = null
    }
    flushQueuedSave()
      .then(() => onManualSaveDone?.(true))
      .catch(() => onManualSaveDone?.(false))
  }, [debugLog, flushQueuedSave, manualSaveSignal, onManualSaveDone])

  useEffect(() => {
    const sceneStore = sceneStoreRef.current
    if (!debugEnabled || !sceneStore?.subscribe || !sceneStore?.getState) return
    let lastNodeCount = Object.keys(sceneStore.getState()?.nodes || {}).length
    debugLog('scene-store:subscribe', { initialNodeCount: lastNodeCount })
    const unsubscribe = sceneStore.subscribe((state: any) => {
      const nodes = state?.nodes
      const rootNodeIds = state?.rootNodeIds
      if (nodes && typeof nodes === 'object' && Array.isArray(rootNodeIds)) {
        // Keep reload cache aligned with what user currently has on canvas.
        loadedSceneRef.current = {
          nodes: nodes as Record<string, any>,
          rootNodeIds: rootNodeIds as string[],
        }
      }
      const nextNodeCount = Object.keys(state?.nodes || {}).length
      if (nextNodeCount !== lastNodeCount) {
        debugLog('scene-store:nodes-changed', {
          previous: lastNodeCount,
          next: nextNodeCount,
        })
        lastNodeCount = nextNodeCount
      }
    })
    return () => {
      debugLog('scene-store:unsubscribe')
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [EditorComp, debugEnabled, debugLog])

  useEffect(() => {
    return () => {
      if (saveDebounceTimerRef.current !== null) {
        window.clearTimeout(saveDebounceTimerRef.current)
      }
    }
  }, [])

  const statusText = useMemo(() => {
    if (loading) return 'Loading native scene...'
    if (error) return error
    if (!stats) return 'Scene ready.'
    return `Loaded ${stats.wallCount} walls and ${stats.itemCount} items.`
  }, [loading, error, stats])

  return !error && EditorComp ? (
    <div className='relative h-full min-h-96'>
      <EditorComp
        key={projectId}
        projectId={String(projectId)}
        layoutVersion='v2'
        onLoad={loadScene}
        onSave={saveScene}
        onSaveStatusChange={() => {}}
      />
      {debugEnabled ? (
        <div className='pointer-events-auto absolute bottom-4 right-4 z-40 w-[26rem] max-w-[90vw] rounded-md border bg-background/95 p-2 text-[11px] shadow-lg backdrop-blur'>
          <div className='mb-1 flex items-center justify-between gap-2'>
            <div className='font-semibold'>
              Pascal Debug {safeModeNoAutosave ? '(safe mode: autosave off)' : ''}
            </div>
            <button
              type='button'
              onClick={() => {
                setDebugEvents([])
                ;(window as StudioDebugWindow).__pascalStudioDebugEvents = []
              }}
              className='rounded border px-1.5 py-0.5 text-[10px] hover:bg-accent'
            >
              Clear
            </button>
          </div>
          <div className='max-h-52 space-y-1 overflow-y-auto font-mono'>
            {debugEvents.length === 0 ? (
              <p className='text-muted-foreground'>No events yet.</p>
            ) : (
              debugEvents
                .slice(-40)
                .reverse()
                .map((entry, idx) => (
                  <div key={`${entry.ts}-${entry.event}-${idx}`} className='rounded border px-1.5 py-1'>
                    <div className='truncate'>
                      {new Date(entry.ts).toLocaleTimeString()} - {entry.event}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  ) : (
    <div className='flex h-full min-h-96 items-center justify-center rounded-md border px-3 text-xs text-muted-foreground'>
      {statusText}
    </div>
  )
}


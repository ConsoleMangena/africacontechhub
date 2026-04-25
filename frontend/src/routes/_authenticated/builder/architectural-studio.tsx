import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { message } from 'antd'
import { builderApi, aiApi } from '@/services/api'
import {
  buildPascalBridgeScene,
  buildStudioDrawingFromPascalScene,
  runPascalBridgeSelfCheck,
} from '@/lib/pascal-bridge'
import { PascalNativeStudio } from '@/components/pascal-native-studio'

const AICopilotConsole = lazy(() =>
  import('@pascal-app/editor').then((m) => ({ default: m.AICopilotConsole }))
)

const searchSchema = z.object({
  projectId: z.string().optional(),
})

const DEFAULT_PASCAL_URL = 'https://editor.pascal.app'
const CLOUD_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_PASCAL_CLOUD_FALLBACK === 'true'
const NATIVE_ENABLED_PROJECTS = (import.meta.env.VITE_PASCAL_NATIVE_PROJECT_IDS || '')
  .split(',')
  .map((value: string) => value.trim())
  .filter(Boolean)
  .map((value: string) => Number(value))
  .filter((value: number) => Number.isFinite(value))

function sanitizeProjectId(projectId?: string) {
  if (!projectId) return ''
  return projectId.replace(/^"+|"+$/g, "")
}

function buildPascalUrl(projectId?: string) {
  const baseUrl = (import.meta.env.VITE_PASCAL_EDITOR_URL || DEFAULT_PASCAL_URL).trim()
  const url = new URL(baseUrl)
  const cleanProjectId = sanitizeProjectId(projectId)
  if (cleanProjectId) {
    url.searchParams.set('projectId', cleanProjectId)
  }
  return url.toString()
}

export const Route = createFileRoute('/_authenticated/builder/architectural-studio')({
  component: ArchitecturalStudioRealisticRoute,
  validateSearch: searchSchema,
})

function ArchitecturalStudioRealisticRoute() {
  const { projectId } = Route.useSearch()
  const navigate = useNavigate({ from: '/builder/architectural-studio' })
  const pascalUrl = buildPascalUrl(projectId)
  const [isExporting, setIsExporting] = useState(false)
  const [isSavingVersion, setIsSavingVersion] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSavingNativeNow, setIsSavingNativeNow] = useState(false)
  const [manualSaveSignal, setManualSaveSignal] = useState(0)
  const [nativeUnavailable, setNativeUnavailable] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [showToolsPanel, setShowToolsPanel] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(true)
  const [versions, setVersions] = useState<
    Array<{ id: string; name: string; created_at: string; source: string; node_count: number }>
  >([])
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const refreshInFlightRef = useRef(false)
  const refreshCooldownUntilRef = useRef(0)
  const last429ToastAtRef = useRef(0)
  const cleanProjectId = useMemo(() => sanitizeProjectId(projectId), [projectId])
  const projectIdNum = useMemo(() => Number(cleanProjectId), [cleanProjectId])
  const hasProjectId = useMemo(() => Boolean(projectIdNum && !Number.isNaN(projectIdNum)), [projectIdNum])
  const nativeEnabledForProject = useMemo(() => {
    if (!hasProjectId || Number.isNaN(projectIdNum)) return false
    if (!NATIVE_ENABLED_PROJECTS.length) return true
    return NATIVE_ENABLED_PROJECTS.includes(projectIdNum)
  }, [hasProjectId, projectIdNum])

  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true)
      const res = await builderApi.getProjects()
      const rows = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      setProjects(rows.map((p: any) => ({ id: p.id, title: p.title || `Project ${p.id}` })))
    } catch {
      message.error('Failed to load projects.')
    } finally {
      setLoadingProjects(false)
    }
  }, [])

  useEffect(() => {
    if (!hasProjectId) {
      loadProjects()
    }
  }, [hasProjectId, loadProjects])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const check = runPascalBridgeSelfCheck()
    if (!check.pass) {
      console.warn('Pascal bridge self-check failed', check.diagnostics)
    }
  }, [])

  useEffect(() => {
    const onToolError = (event: Event) => {
      const detail = (event as CustomEvent<string>)?.detail
      message.error(detail || 'Failed to place object. Try again.')
    }
    window.addEventListener('pascal-tool-error', onToolError)
    return () => {
      window.removeEventListener('pascal-tool-error', onToolError)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return
      }
      if (!hasProjectId) return

      const key = event.key.toLowerCase()
      const withMeta = event.metaKey || event.ctrlKey

      if (withMeta && key === 's') {
        event.preventDefault()
        setIsSavingNativeNow(true)
        setManualSaveSignal((v) => v + 1)
        return
      }
      if (!withMeta && key === 'a') {
        event.preventDefault()
        setShowCopilot((v) => !v)
        return
      }
      if (!withMeta && key === 'k') {
        event.preventDefault()
        setShowToolsPanel((v) => !v)
        return
      }
      if (!withMeta && (key === '?' || (event.shiftKey && key === '/'))) {
        event.preventDefault()
        setShowKeyboardHelp((v) => !v)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [hasProjectId])

  const refreshVersions = useCallback(async () => {
    if (!projectIdNum || Number.isNaN(projectIdNum)) return
    const now = Date.now()
    if (refreshInFlightRef.current) return
    if (refreshCooldownUntilRef.current > now) return
    try {
      refreshInFlightRef.current = true
      setLoadingVersions(true)
      const res = await builderApi.getPascalScenes(projectIdNum)
      setVersions(res.data?.results || [])
    } catch {
      refreshCooldownUntilRef.current = Date.now() + 15_000
      if (Date.now() - last429ToastAtRef.current > 10_000) {
        message.warning('Version list is temporarily rate-limited. Retrying shortly.')
        last429ToastAtRef.current = Date.now()
      }
    } finally {
      refreshInFlightRef.current = false
      setLoadingVersions(false)
    }
  }, [projectIdNum])

  useEffect(() => {
    if (!hasProjectId) return
    refreshVersions()
  }, [refreshVersions, hasProjectId])

  const exportBridgeJson = async () => {
    if (!projectIdNum || Number.isNaN(projectIdNum)) {
      message.error('Add a valid numeric projectId in the URL to export bridge JSON.')
      return
    }

    try {
      setIsExporting(true)
      const res = await builderApi.getProjectDrawing(projectIdNum)
      const drawingData = res.data?.data || {}
      const bridgeScene = buildPascalBridgeScene(projectIdNum, drawingData)
      const pretty = JSON.stringify(bridgeScene, null, 2)

      const blob = new Blob([pretty], { type: 'application/json' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `project-${projectIdNum}-pascal-bridge.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pretty)
      }

      message.success('Bridge JSON exported. Import it into Pascal editor as scene data.')
    } catch {
      message.error('Failed to export bridge JSON from this project.')
    } finally {
      setIsExporting(false)
    }
  }

  const saveSceneVersion = async () => {
    if (!projectIdNum || Number.isNaN(projectIdNum)) {
      message.error('Add a valid numeric projectId in the URL to save scene versions.')
      return
    }
    try {
      setIsSavingVersion(true)
      const res = await builderApi.getProjectDrawing(projectIdNum)
      const drawingData = res.data?.data || {}
      const scene = buildPascalBridgeScene(projectIdNum, drawingData)
      await builderApi.createPascalScene(projectIdNum, {
        name: `Bridge ${new Date().toLocaleString()}`,
        source: 'arch-studio-bridge',
        scene,
      })
      message.success('Pascal scene version saved.')
      refreshVersions()
    } catch {
      message.error('Failed to save Pascal scene version.')
    } finally {
      setIsSavingVersion(false)
    }
  }

  const downloadSavedVersion = async (sceneId: string) => {
    if (!projectIdNum || Number.isNaN(projectIdNum)) return
    try {
      const res = await builderApi.getPascalScene(projectIdNum, sceneId)
      const pretty = JSON.stringify(res.data.scene || {}, null, 2)
      const blob = new Blob([pretty], { type: 'application/json' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `project-${projectIdNum}-pascal-scene-${sceneId}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch {
      message.error('Failed to download selected scene version.')
    }
  }

  const importPascalSceneFile = async (file: File) => {
    if (!projectIdNum || Number.isNaN(projectIdNum)) {
      message.error('Add a valid numeric projectId in the URL before importing.')
      return
    }
    try {
      setIsImporting(true)
      const raw = await file.text()
      const json = JSON.parse(raw)
      const scene = json?.nodes ? json : json?.scene
      if (!scene || typeof scene !== 'object') {
        throw new Error('invalid_scene')
      }

      const convertedDrawing = buildStudioDrawingFromPascalScene(scene)
      await builderApi.saveProjectDrawing(projectIdNum, convertedDrawing)
      await builderApi.createPascalScene(projectIdNum, {
        name: `Imported ${new Date().toLocaleString()}`,
        source: 'pascal-import',
        scene,
      })
      await refreshVersions()
      message.success('Pascal scene imported into Architectural Studio drawing.')
    } catch {
      message.error('Failed to import Pascal scene JSON. Check file format.')
    } finally {
      setIsImporting(false)
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  return (
    <div className='relative h-[100svh] w-full p-0 overflow-hidden text-slate-100 bg-slate-950'>
      {!hasProjectId ? (
        <div className='absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6'>
          <div className='w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur'>
            <div className='mb-4'>
              <h2 className='text-base font-semibold text-slate-100'>Select a project to open Architectural Studio</h2>
              <p className='mt-1 text-xs text-slate-400'>Pick a project to continue in native 3D mode.</p>
            </div>
            {loadingProjects ? (
              <div className='rounded-md border border-slate-800 bg-slate-950/60 px-3 py-4 text-sm text-slate-300'>
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className='rounded-md border border-slate-800 bg-slate-950/60 px-3 py-4 text-sm text-slate-300'>
                No projects found. Create one from your Builder dashboard first.
              </div>
            ) : (
              <div className='grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2'>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type='button'
                    onClick={() =>
                      navigate({
                        to: '/builder/architectural-studio',
                        search: { projectId: String(p.id) },
                        replace: true,
                      })
                    }
                    className='group rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-left transition-colors hover:border-cyan-700 hover:bg-slate-800'
                  >
                    <p className='truncate text-sm font-medium text-slate-100'>{p.title}</p>
                    <p className='mt-0.5 text-[11px] text-slate-400 group-hover:text-slate-300'>Project #{p.id}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : hasProjectId && projectIdNum && !Number.isNaN(projectIdNum) && nativeEnabledForProject ? (
        <div className='relative h-full'>
          <PascalNativeStudio
            projectId={projectIdNum}
            manualSaveSignal={manualSaveSignal}
            onManualSaveDone={(ok) => {
              setIsSavingNativeNow(false)
              if (ok) {
                message.success('Native 3D scene saved.')
                refreshVersions()
              } else {
                message.error('Failed to save native 3D scene.')
              }
            }}
            onNativeUnavailable={() => {
              setNativeUnavailable(true)
            }}
          />
          {showCopilot && (
            <Suspense fallback={null}>
              <AICopilotConsole onDraft={async (prompt: string) => {
                try {
                  const res = await aiApi.draftCopilot(prompt)
                  const data = res.data as any
                  if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
                  return data
                } catch (err: any) {
                  const detail = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Unknown backend error'
                  throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
                }
              }} />
            </Suspense>
          )}
        </div>
      ) : hasProjectId && !nativeEnabledForProject ? (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-950 text-xs text-slate-500'>
          Native Pascal editor is currently disabled for this project by rollout settings.
        </div>
      ) : null}

      {nativeUnavailable && CLOUD_FALLBACK_ENABLED && hasProjectId ? (
        <iframe
          title='Pascal Architectural Editor'
          src={pascalUrl}
          className='h-full w-full border-none bg-slate-950'
          allow='clipboard-read; clipboard-write; fullscreen'
        />
      ) : null}

      {hasProjectId ? (
        <div className='pointer-events-none absolute left-4 top-4 z-20 max-w-[calc(100vw-1.5rem)]'>
          <div className='pointer-events-auto relative flex w-fit max-w-[min(calc(100vw-1.5rem),58rem)] flex-wrap items-center gap-2 rounded-md border border-slate-800 bg-slate-900/95 px-2 py-1 text-xs shadow-sm backdrop-blur'>
            <button 
              type='button' 
              onClick={() => navigate({ to: '/builder/design-drafting', search: { projectId: String(projectIdNum) } })}
              className='rounded border border-red-900/50 bg-red-950/30 px-2 py-1 font-medium text-red-400 transition-colors hover:bg-red-900/50'
            >
              Exit Arch Studio
            </button>
            <span className='hidden text-slate-400 font-medium sm:inline'>Project {cleanProjectId}</span>
            <button
              type='button'
              onClick={() => {
                setIsSavingNativeNow(true)
                setManualSaveSignal((v) => v + 1)
              }}
              disabled={isSavingNativeNow}
              className='rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-60 px-2 py-1 transition-colors'
            >
              {isSavingNativeNow ? 'Saving...' : 'Save 3D'}
            </button>
            <button
              type='button'
              onClick={() => setShowCopilot((v) => !v)}
              className={`rounded border px-2 py-1 transition-colors ${
                showCopilot
                  ? 'border-cyan-600 bg-cyan-950/50 text-cyan-300'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {showCopilot ? 'Hide AI' : 'AI Draft'}
            </button>
            <button
              type='button'
              onClick={() => setShowToolsPanel((v) => !v)}
              className={`rounded border px-2 py-1 transition-colors ${
                showToolsPanel
                  ? 'border-cyan-600 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {showToolsPanel ? 'Hide Tools' : 'Tools'}
            </button>
            <button
              type='button'
              onClick={() => setShowKeyboardHelp((v) => !v)}
              className='rounded border border-slate-700 px-2 py-1 text-slate-300 transition-colors hover:bg-slate-800'
            >
              Keys
            </button>
            {showToolsPanel ? (
              <div className='absolute left-0 top-full z-30 mt-2 flex min-w-72 max-w-[min(calc(100vw-2rem),28rem)] flex-col gap-2 rounded-md border border-slate-800 bg-slate-900 p-2 shadow-xl'>
                <button
                  type='button'
                  onClick={exportBridgeJson}
                  disabled={isExporting}
                  className='rounded border border-slate-800 px-2 py-1 text-left hover:bg-slate-800 disabled:opacity-60 transition-colors'
                >
                  {isExporting ? 'Exporting bridge...' : 'Export Pascal Bridge JSON'}
                </button>
                <button
                  type='button'
                  onClick={saveSceneVersion}
                  disabled={isSavingVersion}
                  className='rounded border border-slate-800 px-2 py-1 text-left hover:bg-slate-800 disabled:opacity-60 transition-colors'
                >
                  {isSavingVersion ? 'Saving version...' : 'Save Scene Version'}
                </button>
                <button
                  type='button'
                  onClick={() => importInputRef.current?.click()}
                  disabled={isImporting}
                  className='rounded border border-slate-800 px-2 py-1 text-left hover:bg-slate-800 disabled:opacity-60 transition-colors'
                >
                  {isImporting ? 'Importing...' : 'Import Pascal Scene JSON'}
                </button>
                <input
                  ref={importInputRef}
                  type='file'
                  accept='application/json,.json'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) importPascalSceneFile(file)
                  }}
                />
                <div className='rounded-md border border-slate-800 p-2 bg-slate-950/50'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-slate-400 font-medium'>Saved versions</span>
                    <button type='button' onClick={refreshVersions} className='rounded border border-slate-800 px-2 py-0.5 hover:bg-slate-800 transition-colors text-[10px]'>
                      Refresh
                    </button>
                  </div>
                  {loadingVersions ? (
                    <p className='text-muted-foreground'>Loading...</p>
                  ) : versions.length === 0 ? (
                    <p className='text-muted-foreground'>No versions yet.</p>
                  ) : (
                    <div className='flex max-h-32 flex-col gap-1 overflow-y-auto'>
                      {versions.slice(0, 8).map((v) => (
                        <button
                          type='button'
                          key={v.id}
                          onClick={() => downloadSavedVersion(v.id)}
                          className='truncate rounded border border-slate-800 px-2 py-1 text-left hover:bg-slate-800 transition-colors'
                        >
                          {v.name} - {v.node_count} nodes
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          {showKeyboardHelp ? (
            <div className='pointer-events-auto mt-2 w-fit max-w-[min(calc(100vw-2rem),50rem)] rounded border border-slate-800 bg-slate-950/75 px-2 py-1 text-[10px] text-slate-400 backdrop-blur'>
              Ctrl/Cmd+S Save | A AI | K Tools | ? Help | Alt/Right-Drag Orbit | Shift/Space+Drag Pan | Wheel Zoom
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

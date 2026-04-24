import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { message } from 'antd'
import { builderApi } from '@/services/api'
import {
  buildPascalBridgeScene,
  buildStudioDrawingFromPascalScene,
  runPascalBridgeSelfCheck,
} from '@/lib/pascal-bridge'
import { PascalNativeStudio } from '@/components/pascal-native-studio'

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
  return projectId.replace(/^"+|"+$/g, '')
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

export const Route = createFileRoute('/_authenticated/builder/architectural-studio-realistic')({
  component: ArchitecturalStudioRealisticRoute,
  validateSearch: searchSchema,
})

function ArchitecturalStudioRealisticRoute() {
  const { projectId } = Route.useSearch()
  const navigate = useNavigate({ from: '/builder/architectural-studio-realistic' })
  const pascalUrl = buildPascalUrl(projectId)
  const [isExporting, setIsExporting] = useState(false)
  const [isSavingVersion, setIsSavingVersion] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSavingNativeNow, setIsSavingNativeNow] = useState(false)
  const [manualSaveSignal, setManualSaveSignal] = useState(0)
  const [nativeUnavailable, setNativeUnavailable] = useState(false)
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
    <div className='relative h-[calc(100svh-4rem)] p-3'>
      {!hasProjectId ? (
        <div className='rounded-md border p-4 text-sm'>
          <p className='mb-3 font-medium'>Select a project to continue</p>
          {loadingProjects ? (
            <p className='text-muted-foreground'>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className='text-muted-foreground'>No projects found. Create one from your Builder dashboard first.</p>
          ) : (
            <div className='flex max-h-56 flex-col gap-2 overflow-y-auto'>
              {projects.map((p) => (
                <button
                  key={p.id}
                  type='button'
                  onClick={() =>
                    navigate({
                      to: '/builder/architectural-studio-realistic',
                      search: { projectId: String(p.id) },
                      replace: true,
                    })
                  }
                  className='rounded-md border px-3 py-2 text-left hover:bg-accent'
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : hasProjectId && projectIdNum && !Number.isNaN(projectIdNum) && nativeEnabledForProject ? (
        <div className='h-full'>
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
        </div>
      ) : hasProjectId && !nativeEnabledForProject ? (
        <div className='rounded-md border p-3 text-xs text-muted-foreground'>
          Native Pascal editor is currently disabled for this project by rollout settings.
        </div>
      ) : null}

      {nativeUnavailable && CLOUD_FALLBACK_ENABLED && hasProjectId ? (
        <iframe
          title='Pascal Architectural Editor'
          src={pascalUrl}
          className='h-full w-full rounded-md border bg-background'
          allow='clipboard-read; clipboard-write; fullscreen'
        />
      ) : null}

      {hasProjectId ? (
        <div className='pointer-events-none absolute left-5 top-5 z-20'>
          <div className='pointer-events-auto flex items-center gap-2 rounded-md border bg-background/95 px-2 py-1 text-xs shadow-sm backdrop-blur'>
            <span className='text-muted-foreground'>Project {cleanProjectId}</span>
            <button
              type='button'
              onClick={() => {
                setIsSavingNativeNow(true)
                setManualSaveSignal((v) => v + 1)
              }}
              disabled={isSavingNativeNow}
              className='rounded border px-2 py-1 hover:bg-accent disabled:opacity-60'
            >
              {isSavingNativeNow ? 'Saving...' : 'Save 3D'}
            </button>
            <details>
              <summary className='cursor-pointer rounded border px-2 py-1 hover:bg-accent'>More</summary>
              <div className='mt-2 flex min-w-72 flex-col gap-2 rounded border bg-background p-2'>
                <button
                  type='button'
                  onClick={exportBridgeJson}
                  disabled={isExporting}
                  className='rounded border px-2 py-1 text-left hover:bg-accent disabled:opacity-60'
                >
                  {isExporting ? 'Exporting bridge...' : 'Export Pascal Bridge JSON'}
                </button>
                <button
                  type='button'
                  onClick={saveSceneVersion}
                  disabled={isSavingVersion}
                  className='rounded border px-2 py-1 text-left hover:bg-accent disabled:opacity-60'
                >
                  {isSavingVersion ? 'Saving version...' : 'Save Scene Version'}
                </button>
                <button
                  type='button'
                  onClick={() => importInputRef.current?.click()}
                  disabled={isImporting}
                  className='rounded border px-2 py-1 text-left hover:bg-accent disabled:opacity-60'
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
                <div className='rounded border p-2'>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-muted-foreground'>Saved versions</span>
                    <button type='button' onClick={refreshVersions} className='rounded border px-2 py-0.5 hover:bg-accent'>
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
                          className='truncate rounded border px-2 py-1 text-left hover:bg-accent'
                        >
                          {v.name} - {v.node_count} nodes
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      ) : null}
    </div>
  )
}

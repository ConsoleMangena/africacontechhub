import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useBuilderStore } from '@/stores/builder-store'
import { builderApi } from '@/services/api'
import type {
  Project, MaterialRequest,
  BOQBuildingItem, BOQLabourCost, BOQMachinePlant,
  BOQProfessionalFee, BOQAdminExpense,
} from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ProjectModeBadge } from '@/components/project-mode-badge'
import { ProjectWorkspacePicker } from '@/features/dashboards/builder/components/project-workspace-picker'

type ProcurementCategory = 'MATERIAL' | 'LABOUR' | 'PLANT' | 'PROFESSIONAL' | 'ADMIN'

const PROC_CATS: ProcurementCategory[] = ['MATERIAL', 'LABOUR', 'PLANT', 'PROFESSIONAL', 'ADMIN']

export const Route = createFileRoute(
  '/_authenticated/builder/procurement',
)({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.category as string | undefined
    const category = raw && PROC_CATS.includes(raw as ProcurementCategory) ? (raw as ProcurementCategory) : undefined
    const toBool = (v: unknown) =>
      v === true || v === 'true' || v === 1 || v === '1'
    const boqRaw = search.boqId
    const boqId =
      boqRaw !== undefined && boqRaw !== null && boqRaw !== ''
        ? Number(boqRaw)
        : undefined
    return {
      projectId: search.projectId ? Number(search.projectId) : undefined,
      category,
      prefill: toBool(search.prefill) ? true : undefined,
      bulkPrefill: toBool(search.bulkPrefill) ? true : undefined,
      boqId: boqId != null && !Number.isNaN(boqId) ? boqId : undefined,
    }
  },
  component: ProcurementPage,
})

const CATEGORIES: { key: ProcurementCategory; label: string; icon: string; activeCls: string }[] = [
  { key: 'MATERIAL', label: 'Building Materials', icon: 'construction', activeCls: 'bg-slate-900 text-white border-slate-900 shadow-none' },
  { key: 'LABOUR', label: 'Labour', icon: 'engineering', activeCls: 'bg-slate-900 text-white border-slate-900 shadow-none' },
  { key: 'PLANT', label: 'Plant & Equipment', icon: 'precision_manufacturing', activeCls: 'bg-slate-900 text-white border-slate-900 shadow-none' },
  { key: 'PROFESSIONAL', label: 'Professional Fees', icon: 'badge', activeCls: 'bg-slate-900 text-white border-slate-900 shadow-none' },
  { key: 'ADMIN', label: 'Admin & Expenses', icon: 'receipt_long', activeCls: 'bg-slate-900 text-white border-slate-900 shadow-none' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-slate-50 text-slate-700 border border-slate-200',
  APPROVED:  'bg-slate-50 text-slate-700 border border-slate-200',
  ORDERED:   'bg-slate-50 text-slate-700 border border-slate-200',
  DELIVERED: 'bg-slate-50 text-slate-700 border border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-100',
}

function LoadingBar() {
  return (
    <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
      <div className="h-full w-1/3 bg-slate-400 rounded-full" style={{ animation: 'procShimmer 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes procShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
    </div>
  )
}


function resolvePrefillBoqId(
  category: ProcurementCategory,
  preferredId: number | undefined,
  boqBuilding: BOQBuildingItem[],
  boqLabour: BOQLabourCost[],
  boqPlant: BOQMachinePlant[],
  boqProfessional: BOQProfessionalFee[],
  boqAdmin: BOQAdminExpense[],
): number | null {
  const list =
    category === 'MATERIAL'
      ? boqBuilding
      : category === 'LABOUR'
        ? boqLabour
        : category === 'PLANT'
          ? boqPlant
          : category === 'PROFESSIONAL'
            ? boqProfessional
            : boqAdmin
  if (!list.length) return null
  if (preferredId != null && list.some((i) => i.id === preferredId)) return preferredId
  return list[0].id
}

/** Build request payloads for ALL items across all categories */
function buildBulkPayloads(
  projectId: number,
  boqBuilding: BOQBuildingItem[],
  boqLabour: BOQLabourCost[],
  boqPlant: BOQMachinePlant[],
  boqProfessional: BOQProfessionalFee[],
  boqAdmin: BOQAdminExpense[],
  existingRequests: MaterialRequest[],
) {
  const existingBoqIds = new Set(
    existingRequests
      .map((r) => {
        const linkedId = r.object_id ?? (r.procurement_category === 'MATERIAL' ? r.boq_item : undefined)
        return linkedId ? `${r.procurement_category}:${linkedId}` : null
      })
      .filter(Boolean),
  )
  const payloads: { category: ProcurementCategory; data: Record<string, unknown> }[] = []

  for (const item of boqBuilding) {
    if (existingBoqIds.has(`MATERIAL:${item.id}`)) continue
    payloads.push({
      category: 'MATERIAL',
      data: {
        project: projectId, boq_source_id: item.id, procurement_category: 'MATERIAL',
        material_name: item.description, quantity_requested: String(item.quantity ?? '1'),
        unit: item.unit || '', price_at_request: String(item.rate ?? '0'),
        procurement_method: 'SELF', transport_cost: '0', group_buy_deduction: '0', notes: '',
      },
    })
  }
  for (const item of boqLabour) {
    if (existingBoqIds.has(`LABOUR:${item.id}`)) continue
    payloads.push({
      category: 'LABOUR',
      data: {
        project: projectId, boq_source_id: item.id, procurement_category: 'LABOUR',
        material_name: item.trade_role || item.phase || 'Labour',
        quantity_requested: String(item.total_man_days || '1'), unit: 'day',
        price_at_request: String(item.daily_rate ?? '0'),
        procurement_method: 'SELF', transport_cost: '0', group_buy_deduction: '0', notes: '',
      },
    })
  }
  for (const item of boqPlant) {
    if (existingBoqIds.has(`PLANT:${item.id}`)) continue
    payloads.push({
      category: 'PLANT',
      data: {
        project: projectId, boq_source_id: item.id, procurement_category: 'PLANT',
        material_name: item.machine_item || item.category || 'Plant',
        quantity_requested: String(item.days_rqd || '1'), unit: 'day',
        price_at_request: String(item.daily_wet_rate ?? '0'),
        procurement_method: 'SELF', transport_cost: '0', group_buy_deduction: '0', notes: '',
      },
    })
  }
  for (const item of boqProfessional) {
    if (existingBoqIds.has(`PROFESSIONAL:${item.id}`)) continue
    payloads.push({
      category: 'PROFESSIONAL',
      data: {
        project: projectId, boq_source_id: item.id, procurement_category: 'PROFESSIONAL',
        material_name: item.role_scope || item.discipline || 'Professional Fee',
        quantity_requested: '1', unit: 'lump sum',
        price_at_request: String(item.estimated_fee ?? '0'),
        procurement_method: 'SELF', transport_cost: '0', group_buy_deduction: '0', notes: '',
      },
    })
  }
  for (const item of boqAdmin) {
    if (existingBoqIds.has(`ADMIN:${item.id}`)) continue
    payloads.push({
      category: 'ADMIN',
      data: {
        project: projectId, boq_source_id: item.id, procurement_category: 'ADMIN',
        material_name: item.item_role || item.description || 'Admin Expense',
        quantity_requested: String(item.total_trips || '1'), unit: 'trip',
        price_at_request: String(item.rate ?? '0'),
        procurement_method: 'SELF', transport_cost: '0', group_buy_deduction: '0', notes: '',
      },
    })
  }
  return payloads
}

function ProcurementPage() {
  const navigate = Route.useNavigate()
  const builderStore = useBuilderStore()
  const { projectId, category: searchCategory, prefill, bulkPrefill, boqId: searchBoqId } = Route.useSearch() as {
    projectId?: number
    category?: ProcurementCategory
    prefill?: boolean
    bulkPrefill?: boolean
    boqId?: number
  }
  const resolvedProjectId = projectId || builderStore.selectedProjectId || null
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId)
  const [activeCategory, setActiveCategory] = useState<ProcurementCategory>(
    searchCategory && PROC_CATS.includes(searchCategory) ? searchCategory : 'MATERIAL',
  )
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [refetching, setRefetching] = useState(false)

  // BOQ source items per category
  const [boqBuilding, setBoqBuilding] = useState<BOQBuildingItem[]>([])
  const [boqLabour, setBoqLabour] = useState<BOQLabourCost[]>([])
  const [boqPlant, setBoqPlant] = useState<BOQMachinePlant[]>([])
  const [boqProfessional, setBoqProfessional] = useState<BOQProfessionalFee[]>([])
  const [boqAdmin, setBoqAdmin] = useState<BOQAdminExpense[]>([])
  const [loadingBOQ, setLoadingBOQ] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkCreating, setBulkCreating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })
  const [form, setForm] = useState({
    boq_ref: '',          // id of the selected source BOQ item
    material_name: '',
    quantity_requested: '1',
    unit: '',
    procurement_method: 'SELF' as 'SELF' | 'GROUP_BUY',
    price_at_request: '0',
    transport_cost: '0',
    group_buy_deduction: '0',
    notes: '',
  })

  const requestsCacheRef = useRef<Map<number, MaterialRequest[]>>(new Map())
  const prefillConsumedRef = useRef(false)
  const bulkConsumedRef = useRef(false)

  /** Tracks whether BOQ lists have been fetched for the currently selected project. */
  const boqLoadedRef = useRef(false)

  /** Fresh flags from API — list from GET /projects/ is often stale after signing the budget elsewhere */
  const [projectMeta, setProjectMeta] = useState<Project | null>(null)
  const [loadingProjectMeta, setLoadingProjectMeta] = useState(false)

  // DIFY mode check
  const isDIFY = projectMeta?.engagement_tier === 'DIFY'
  const currentProject = projectMeta ?? projects.find((project) => project.id === selectedProject) ?? null

  const selectProject = useCallback((nextProjectId: number) => {
    setSelectedProject(nextProjectId)
    builderStore.selectProject(nextProjectId)
    navigate({
      to: '/builder/procurement',
      search: {
        projectId: nextProjectId,
        category: activeCategory,
        prefill: undefined,
        bulkPrefill: undefined,
        boqId: undefined,
      },
      replace: true,
    })
  }, [activeCategory, navigate, builderStore])

  const exitProject = useCallback(() => {
    setSelectedProject(null)
    setProjectMeta(null)
    setRequests([])
    setShowForm(false)
    setLoadingRequests(false)
    setRefetching(false)
    setBulkCreating(false)
    setBulkProgress({ done: 0, total: 0 })
    setForm({ boq_ref: '', material_name: '', quantity_requested: '1', unit: '', procurement_method: 'SELF', price_at_request: '0', transport_cost: '0', group_buy_deduction: '0', notes: '' })
    builderStore.exitProject()
    navigate({
      to: '/builder/procurement',
      search: {
        projectId: undefined,
        category: activeCategory,
        prefill: undefined,
        bulkPrefill: undefined,
        boqId: undefined,
      },
      replace: true,
    })
  }, [activeCategory, navigate, builderStore])

  // Load projects
  // Reset prefill consumption when the incoming category changes so navigation from Budget re-applies correctly
  useEffect(() => {
    setSelectedProject(projectId || builderStore.selectedProjectId || null)
  }, [projectId, builderStore.selectedProjectId])

  useEffect(() => {
    prefillConsumedRef.current = false
    bulkConsumedRef.current = false
  }, [searchCategory])

  useEffect(() => {
    builderApi.getProjects()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoadingProjects(false))
  }, [projectId])

  useEffect(() => {
    if (loadingProjects || !selectedProject) return
    if (projects.some((project) => project.id === selectedProject)) return
    exitProject()
  }, [exitProject, loadingProjects, projects, selectedProject])

  // Always refresh selected project so is_budget_signed matches DB (e.g. after signing on Budget page)
  useEffect(() => {
    if (!selectedProject) {
      setProjectMeta(null)
      return
    }
    let cancelled = false
    setLoadingProjectMeta(true)
    builderApi.getProject(selectedProject)
      .then((res) => {
        if (cancelled) return
        setProjectMeta(res.data)
        setProjects((prev) =>
          prev.map((p) => (p.id === selectedProject ? { ...p, ...res.data } : p)),
        )
      })
      .catch(() => {
        if (!cancelled) setProjectMeta(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingProjectMeta(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedProject])

  // When returning from another tab/page (e.g. after signing budget), refresh flags
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !selectedProject) return
      builderApi
        .getProject(selectedProject)
        .then((res) => {
          setProjectMeta(res.data)
          setProjects((prev) =>
            prev.map((p) => (p.id === selectedProject ? { ...p, ...res.data } : p)),
          )
        })
        .catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [selectedProject])

  useEffect(() => {
    if (searchCategory && PROC_CATS.includes(searchCategory)) {
      setActiveCategory(searchCategory)
    }
  }, [searchCategory])

  const canProcure = true

  // Load final-budget BOQ lines whenever a project is selected.
  // No canProcure gate — backend returns [] when no final budget exists.
  useEffect(() => {
    if (!selectedProject) {
      setBoqBuilding([])
      setBoqLabour([])
      setBoqPlant([])
      setBoqProfessional([])
      setBoqAdmin([])
      boqLoadedRef.current = false
      return
    }
    let cancelled = false
    boqLoadedRef.current = false
    setLoadingBOQ(true)
    Promise.all([
      builderApi.getProjectBOQBuildingItems(selectedProject, 'final'),
      builderApi.getProjectBOQLabourCosts(selectedProject, 'final'),
      builderApi.getProjectBOQMachinePlants(selectedProject, 'final'),
      builderApi.getProjectBOQProfessionalFees(selectedProject, 'final'),
      builderApi.getProjectBOQAdminExpenses(selectedProject, 'final'),
    ])
      .then(([b, l, p, pf, a]) => {
        if (cancelled) return
        const extract = (r: any) =>
          Array.isArray(r.data) ? r.data : (r.data as any).results || []
        setBoqBuilding(extract(b))
        setBoqLabour(extract(l))
        setBoqPlant(extract(p))
        setBoqProfessional(extract(pf))
        setBoqAdmin(extract(a))
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load BOQ items') })
      .finally(() => {
        if (!cancelled) {
          boqLoadedRef.current = true
          setLoadingBOQ(false)
        }
      })
    return () => { cancelled = true }
  }, [selectedProject])


  const fetchRequests = useCallback(async () => {
    if (!selectedProject) {
      setRequests([])
      setLoadingRequests(false)
      setRefetching(false)
      return
    }
    const cached = requestsCacheRef.current.get(selectedProject)
    if (cached) { setRequests(cached); setRefetching(true) }
    else setLoadingRequests(true)
    try {
      const res = await builderApi.getProjectMaterialRequests(selectedProject)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setRequests(data)
      requestsCacheRef.current.set(selectedProject, data)
    } catch { toast.error('Failed to load requests') }
    finally { setLoadingRequests(false); setRefetching(false) }
  }, [selectedProject])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const applyBoqSelection = useCallback(
    (id: string) => {
      setForm((f) => ({ ...f, boq_ref: id }))
      if (!id) return
      const numId = Number(id)
      if (activeCategory === 'MATERIAL') {
        const item = boqBuilding.find((i) => i.id === numId)
        if (item)
          setForm((f) => ({
            ...f,
            boq_ref: id,
            material_name: item.description,
            unit: item.unit || '',
            price_at_request: String(item.rate ?? '0'),
            quantity_requested: String(item.quantity ?? '1'),
          }))
      } else if (activeCategory === 'LABOUR') {
        const item = boqLabour.find((i) => i.id === numId)
        if (item)
          setForm((f) => ({
            ...f,
            boq_ref: id,
            material_name: item.trade_role || item.phase || 'Labour',
            unit: 'day',
            price_at_request: String(item.daily_rate ?? '0'),
            quantity_requested: String(item.total_man_days || '1'),
          }))
      } else if (activeCategory === 'PLANT') {
        const item = boqPlant.find((i) => i.id === numId)
        if (item)
          setForm((f) => ({
            ...f,
            boq_ref: id,
            material_name: item.machine_item || item.category || 'Plant',
            unit: 'day',
            price_at_request: String(item.daily_wet_rate ?? '0'),
            quantity_requested: String(item.days_rqd || '1'),
          }))
      } else if (activeCategory === 'PROFESSIONAL') {
        const item = boqProfessional.find((i) => i.id === numId)
        if (item)
          setForm((f) => ({
            ...f,
            boq_ref: id,
            material_name: item.role_scope || item.discipline || 'Professional Fee',
            unit: 'lump sum',
            price_at_request: String(item.estimated_fee ?? '0'),
            quantity_requested: '1',
          }))
      } else if (activeCategory === 'ADMIN') {
        const item = boqAdmin.find((i) => i.id === numId)
        if (item)
          setForm((f) => ({
            ...f,
            boq_ref: id,
            material_name: item.item_role || item.description || 'Admin Expense',
            unit: 'trip',
            price_at_request: String(item.rate ?? '0'),
            quantity_requested: String(item.total_trips || '1'),
          }))
      }
    },
    [activeCategory, boqBuilding, boqLabour, boqPlant, boqProfessional, boqAdmin],
  )

  const handleBoqRefChange = (id: string) => {
    applyBoqSelection(id)
  }

  // Refs keep latest values without enlarging useEffect deps (avoids "dependency array changed size" + unstable navigate)
  const applyBoqSelectionRef = useRef(applyBoqSelection)
  applyBoqSelectionRef.current = applyBoqSelection
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const boqForPrefillRef = useRef({
    boqBuilding: [] as BOQBuildingItem[],
    boqLabour: [] as BOQLabourCost[],
    boqPlant: [] as BOQMachinePlant[],
    boqProfessional: [] as BOQProfessionalFee[],
    boqAdmin: [] as BOQAdminExpense[],
  })
  boqForPrefillRef.current = {
    boqBuilding,
    boqLabour,
    boqPlant,
    boqProfessional,
    boqAdmin,
  }

  // From Construction Budget "Procure": open new request + fill from matching BOQ line
  useEffect(() => {
    if (!prefill) {
      prefillConsumedRef.current = false
      return
    }
    if (!selectedProject) return
    // Wait until the active category matches the requested searchCategory (so default 'MATERIAL' doesn't consume prefill)
    if (searchCategory && activeCategory !== searchCategory) return
    // Wait for BOQ fetch to complete (avoid consuming prefill before lists are populated)
    if (!boqLoadedRef.current || loadingBOQ) return
    if (prefillConsumedRef.current) return

    prefillConsumedRef.current = true
    const { boqBuilding: bb, boqLabour: bl, boqPlant: bp, boqProfessional: bpf, boqAdmin: ba } =
      boqForPrefillRef.current
    const targetId = resolvePrefillBoqId(activeCategory, searchBoqId, bb, bl, bp, bpf, ba)
    setShowForm(true)
    if (targetId != null) {
      applyBoqSelectionRef.current(String(targetId))
    }

    navigateRef.current({
      to: '/builder/procurement',
      search: {
        projectId: selectedProject ?? undefined,
        category: activeCategory,
        prefill: undefined,
        bulkPrefill: undefined,
        boqId: undefined,
      },
      replace: true,
    })
  }, [
    prefill,
    loadingBOQ,
    activeCategory,
    searchBoqId,
    selectedProject,
    searchCategory,
  ])

  // Bulk-create procurement requests for ALL signed-budget BOQ items
  useEffect(() => {
    if (!bulkPrefill || bulkConsumedRef.current) return
    if (!selectedProject || !boqLoadedRef.current || loadingBOQ) return
    if (!canProcure) return

    bulkConsumedRef.current = true
    setBulkCreating(true)
    navigateRef.current({
      to: '/builder/procurement',
      search: { 
        projectId: selectedProject ?? undefined, 
        category: activeCategory,
        prefill: undefined,
        bulkPrefill: undefined,
        boqId: undefined,
      },
      replace: true,
    })

    const run = async () => {
      try {
        // Ensure we have the latest requests list for duplicate detection
        let latestRequests = requests
        try {
          const res = await builderApi.getProjectMaterialRequests(selectedProject)
          latestRequests = Array.isArray(res.data)
            ? res.data
            : (res.data as any).results || []
        } catch { /* use what we have */ }

        const { boqBuilding: bb, boqLabour: bl, boqPlant: bp, boqProfessional: bpf, boqAdmin: ba } =
          boqForPrefillRef.current
        const payloads = buildBulkPayloads(selectedProject, bb, bl, bp, bpf, ba, latestRequests)

        if (payloads.length === 0) {
          toast.info('All budget items already have procurement requests.')
          return
        }

        setBulkProgress({ done: 0, total: payloads.length })
        let created = 0
        let failed = 0
        const BATCH = 4
        const failedPayloads: Array<{ category: ProcurementCategory; data: Record<string, unknown> }> = []
        for (let i = 0; i < payloads.length; i += BATCH) {
          const batch = payloads.slice(i, i + BATCH)
          const results = await Promise.allSettled(
            batch.map((p) => builderApi.createMaterialRequest(p.data)),
          )
          results.forEach((r, idx) => {
            if (r.status === 'fulfilled') created++
            else failedPayloads.push(batch[idx])
          })
          setBulkProgress({ done: created, total: payloads.length })
        }

        // One retry pass for transient auth races (401s) after refresh settles.
        if (failedPayloads.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 250))
          const retryResults = await Promise.allSettled(
            failedPayloads.map((p) => builderApi.createMaterialRequest(p.data)),
          )
          retryResults.forEach((r) => {
            if (r.status === 'fulfilled') created++
            else failed++
          })
          setBulkProgress({ done: created + failed, total: payloads.length })
        }

        if (created > 0) {
          toast.success(`Created ${created} procurement request${created > 1 ? 's' : ''} from signed budget.`)
          requestsCacheRef.current.delete(selectedProject)
          fetchRequests()
        }
        if (failed > 0) {
          toast.error(`${failed} request${failed > 1 ? 's' : ''} failed to create.`)
        }
      } catch {
        toast.error('Failed to create procurement requests. Please retry.')
      } finally {
        setBulkCreating(false)
      }
    }
    run()
  }, [bulkPrefill, selectedProject, loadingBOQ, canProcure, activeCategory, requests, fetchRequests])

  const currentBOQOptions = () => {
    if (activeCategory === 'MATERIAL') return boqBuilding.map(i => ({ id: i.id, label: i.description }))
    if (activeCategory === 'LABOUR') return boqLabour.map(i => ({ id: i.id, label: `${i.trade_role || i.phase} (${i.skill_level || ''})` }))
    if (activeCategory === 'PLANT') return boqPlant.map(i => ({ id: i.id, label: `${i.machine_item || i.category}` }))
    if (activeCategory === 'PROFESSIONAL') return boqProfessional.map(i => ({ id: i.id, label: `${i.role_scope || i.discipline}` }))
    if (activeCategory === 'ADMIN') return boqAdmin.map(i => ({ id: i.id, label: `${i.item_role || i.description}` }))
    return []
  }

  const handleSubmit = async () => {
    if (!form.material_name || !form.quantity_requested || !selectedProject) {
      toast.error('Fill in all required fields')
      return
    }
    setSaving(true)
    try {
      await builderApi.createMaterialRequest({
        project: selectedProject,
        boq_source_id: form.boq_ref ? Number(form.boq_ref) : undefined,
        procurement_category: activeCategory,
        material_name: form.material_name,
        quantity_requested: form.quantity_requested,
        unit: form.unit,
        procurement_method: form.procurement_method,
        price_at_request: form.price_at_request,
        transport_cost: form.transport_cost,
        group_buy_deduction: form.group_buy_deduction,
        notes: form.notes,
      } as any)
      setForm({ boq_ref: '', material_name: '', quantity_requested: '1', unit: '', procurement_method: 'SELF', price_at_request: '0', transport_cost: '0', group_buy_deduction: '0', notes: '' })
      setShowForm(false)
      toast.success('Procurement request created')
      requestsCacheRef.current.delete(selectedProject)
      fetchRequests()
    } catch { toast.error('Failed to create request') }
    finally { setSaving(false) }
  }

  const categoryRequests = requests.filter(r => r.procurement_category === activeCategory)
  const cat = CATEGORIES.find(c => c.key === activeCategory)!

  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="w-full px-3 py-4 sm:p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a procurement workspace"
              description="Select a project tile before loading procurement requests, signed-budget checks, and BOQ sourcing. Only the chosen project's procurement data will be opened."
              projects={[]}
              loading
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: '/builder' })}
              primaryActionLabel="Open Portfolio"
            />
          </div>
        </Main>
      </>
    )
  }

  if (!selectedProject || !currentProject) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <ProfileDropdown />
          </div>
        </Header>

        <Main>
          <div className="w-full px-3 py-4 sm:p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a procurement workspace"
              description="Pick a project tile to manage material, labour, plant, and service requests. Until you choose one, this page stays clear of project-specific procurement data."
              projects={projects}
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: '/builder' })}
              primaryActionLabel="Open Portfolio"
              emptyTitle="No procurement workspaces yet"
              emptyDescription="Create a project from your builder portfolio first, then return here to raise and track procurement requests for that site."
            />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="w-full px-3 py-4 sm:p-4 md:p-8 space-y-4 sm:space-y-6">
          {/* Page Header Command Center Style */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 md:p-8 text-slate-900 relative shadow-sm border border-slate-200 overflow-hidden">
            {/* Very subtle ambient gradients on white */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-100/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon name="inventory_2" size={24} className="text-slate-700" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-display">Logistics & Procurement</h1>
                </div>
                {currentProject && (
                  <p className="text-sm font-semibold text-slate-500 flex items-center gap-2 ml-12">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                      <Icon name="location_on" size={14} className="text-slate-400" />
                      {currentProject.location}
                    </span>
                    <span className="text-slate-300 font-black">•</span>
                    <span className="text-slate-500">{currentProject.title}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <ProjectModeBadge engagementTier={currentProject.engagement_tier} size="sm" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={exitProject}
                  className="h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 px-4 text-xs font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm"
                >
                  <Icon name="logout" size={14} className="mr-1.5" />
                  Switch Project
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  disabled={!selectedProject}
                  className="bg-slate-900 border-slate-900 hover:bg-slate-800 text-white h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
                >
                  <Icon name="add" size={14} className="mr-1.5" />
                  New Request
                </Button>
              </div>
            </div>
          </div>

          {bulkCreating && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" size={18} className="animate-spin text-slate-600" />
                  <strong className="font-bold">Creating procurement requests</strong>
                </span>
                {bulkProgress.total > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {bulkProgress.done} / {bulkProgress.total}
                  </span>
                )}
              </div>
              {bulkProgress.total > 0 && (
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => { setActiveCategory(c.key); setShowForm(false) }}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border shrink-0',
                  activeCategory === c.key
                    ? c.activeCls
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                <Icon name={c.icon} size={14} className="sm:hidden" />
                <Icon name={c.icon} size={16} className="hidden sm:block" />
                <span className="hidden sm:inline">{c.label}</span>
                <span className="sm:hidden">{c.label.split(' ')[0]}</span>
                <span className={cn(
                  'text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  activeCategory === c.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  {requests.filter(r => r.procurement_category === c.key).length}
                </span>
              </button>
            ))}
          </div>
          <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Table */}
            <div className="lg:col-span-2 space-y-4">

              <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Icon name={cat.icon} size={18} className="text-slate-400 sm:hidden" />
                    <Icon name={cat.icon} size={20} className="text-slate-400 hidden sm:block" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                  </h2>
                  {isDIFY ? (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                      <Icon name="info" size={14} className="text-slate-400" />
                      <span>SQB manages procurement for DIFY projects</span>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="border-slate-200 text-[10px] font-bold uppercase tracking-wider h-8" onClick={() => setShowForm(true)}>
                      <Icon name="add" size={14} className="mr-1" /> New Request
                    </Button>
                  )}
              </div>

              {/* New Request Form */}
              {showForm && !isDIFY && (
                <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <Icon name={cat.icon} size={18} className="text-emerald-600" />
                        New {cat.label} Request
                      </p>
                      <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                        <Icon name="close" size={18} />
                      </button>
                    </div>

                    {/* BOQ Picker */}
                    {currentBOQOptions().length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Link to BOQ item (optional)</label>
                        <select
                          value={form.boq_ref}
                          onChange={e => handleBoqRefChange(e.target.value)}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                          <option value="">— Select from BOQ —</option>
                          {currentBOQOptions().map(o => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Description / Name *</label>
                        <input
                          value={form.material_name}
                          onChange={e => setForm(f => ({ ...f, material_name: e.target.value }))}
                          placeholder={activeCategory === 'LABOUR' ? 'e.g. Bricklayers x 5' : activeCategory === 'PLANT' ? 'e.g. Excavator — 20-tonne' : 'Item description'}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
                        <input
                          type="number" value={form.quantity_requested}
                          onChange={e => setForm(f => ({ ...f, quantity_requested: e.target.value }))}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                        <input
                          value={form.unit}
                          onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                          placeholder={activeCategory === 'LABOUR' ? 'man-days' : activeCategory === 'PLANT' ? 'days' : 'm³ / m² / kg'}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Rate / Price</label>
                        <input
                          type="number" value={form.price_at_request}
                          onChange={e => setForm(f => ({ ...f, price_at_request: e.target.value }))}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Transport Cost</label>
                        <input
                          type="number" value={form.transport_cost}
                          onChange={e => setForm(f => ({ ...f, transport_cost: e.target.value }))}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Procurement Method</label>
                      <div className="flex gap-2">
                        {(['SELF', 'GROUP_BUY'] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => setForm(f => ({ ...f, procurement_method: m }))}
                            className={cn(
                              'flex-1 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2',
                              form.procurement_method === m
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            <Icon name={m === 'SELF' ? 'foundation' : 'groups'} size={16} />
                            {m === 'SELF' ? 'Self-Procure' : 'Group Buy'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                      <textarea
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2}
                        placeholder="Additional details or vendor preferences..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                      <Button onClick={handleSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? <><Icon name="progress_activity" size={14} className="animate-spin mr-1.5" />Saving...</> : 'Submit Request'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requests Tiles */}
              <style>{`@keyframes tileIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              {refetching && <LoadingBar />}
              {loadingRequests ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 animate-pulse">
                      <div className="flex justify-between"><div className="h-4 w-32 bg-slate-100 rounded" /><div className="h-5 w-16 bg-slate-100 rounded-full" /></div>
                      <div className="flex gap-4"><div className="h-3 w-20 bg-slate-50 rounded" /><div className="h-3 w-20 bg-slate-50 rounded" /></div>
                      <div className="flex justify-between pt-2 border-t border-slate-50"><div className="h-3 w-20 bg-slate-50 rounded" /><div className="h-4 w-16 bg-slate-100 rounded" /></div>
                    </div>
                  ))}
                </div>
              ) : categoryRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Icon name={cat.icon} size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No {cat.label} requests yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Click "New Request" to raise a procurement request</p>
                  <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                    <Icon name="add" size={14} className="mr-1" /> New Request
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {categoryRequests.map((req, idx) => (
                    <div
                      key={req.id}
                      className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200"
                      style={{ animation: `tileIn 0.35s ease-out ${idx * 50}ms both` }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-slate-900 truncate flex-1">{req.material_name}</p>
                        <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide', STATUS_COLORS[req.status])}>
                          {req.status}
                        </span>
                      </div>
                      {req.notes && <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{req.notes}</p>}

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icon name="inventory_2" size={12} className="text-slate-400" />
                          {parseFloat(req.quantity_requested).toLocaleString()} {req.unit || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="payments" size={12} className="text-slate-400" />
                          {parseFloat(req.price_at_request).toLocaleString()}/{req.unit || 'unit'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name={req.procurement_method === 'SELF' ? 'foundation' : 'groups'} size={12} className="text-slate-400" />
                          {req.procurement_method === 'SELF' ? 'Self' : 'Group Buy'}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          ${parseFloat(req.total_calculated_cost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — Summary */}
            <div className="space-y-4">
              {/* Stats per active category */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{cat.label} Summary</p>
                  <div className="space-y-2">
                    {(['PENDING', 'APPROVED', 'ORDERED', 'DELIVERED'] as const).map(s => {
                      const count = categoryRequests.filter(r => r.status === s).length
                      const total = categoryRequests
                        .filter(r => r.status === s)
                        .reduce((sum, r) => sum + parseFloat(r.total_calculated_cost || '0'), 0)
                      return count > 0 ? (
                        <div key={s} className="flex items-center justify-between">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[s])}>{s}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-800">{count}</span>
                            <span className="text-xs text-slate-400 ml-1">req · {total.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : null
                    })}
                    {categoryRequests.length === 0 && (
                      <p className="text-xs text-slate-400">No requests raised</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Grand Total</span>
                      <span className="font-bold text-slate-900">
                        {categoryRequests.reduce((s, r) => s + parseFloat(r.total_calculated_cost || '0'), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BOQ Available Items count */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BOQ Source Items</p>
                  {loadingBOQ ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                      <Icon name="progress_activity" size={14} className="animate-spin" /> Loading...
                    </div>
                  ) : (
                    CATEGORIES.map(c => {
                      const count = c.key === 'MATERIAL' ? boqBuilding.length
                        : c.key === 'LABOUR' ? boqLabour.length
                        : c.key === 'PLANT' ? boqPlant.length
                        : c.key === 'PROFESSIONAL' ? boqProfessional.length
                        : boqAdmin.length
                      return (
                        <div key={c.key} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Icon name={c.icon} size={12} />
                            {c.label}
                          </span>
                          <span className="font-semibold text-slate-700">{count}</span>
                        </div>
                      )
                    })
                  )}
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <Link to="/builder/projectbudget" search={{ projectId: selectedProject }} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                      <Icon name="open_in_new" size={12} />
                      Edit Budget Sheets
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

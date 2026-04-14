import { createFileRoute, Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectModeBadge } from '@/components/project-mode-badge'
import { ProjectWorkspacePicker } from '@/features/dashboards/builder/components/project-workspace-picker'
import { DIFYProgressDashboard } from '@/components/dify-progress-dashboard'
import { QuickActionsPanel } from '@/components/quick-actions-panel'
import { ProjectTimeline } from '@/components/project-timeline'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import { builderApi } from '@/services/api'
import type {
  Project, ProjectTeam, ProfessionalProfile,
  MaterialRequest, BOQScheduleTask, BudgetSheets,
} from '@/types/api'

export const Route = createFileRoute('/_authenticated/builder/building')({
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: search.projectId ? Number(search.projectId) : undefined,
  }),
  component: RouteComponent,
})

const ARTISAN_ROLES: { value: ProjectTeam['role']; label: string; icon: string }[] = [
  { value: 'architect', label: 'Architect', icon: 'architecture' },
  { value: 'structural_engineer', label: 'Structural Engineer', icon: 'foundation' },
  { value: 'contractor', label: 'General Contractor', icon: 'engineering' },
  { value: 'project_manager', label: 'Project Manager', icon: 'manage_accounts' },
  { value: 'quantity_surveyor', label: 'Quantity Surveyor', icon: 'calculate' },
  { value: 'electrician', label: 'Electrician', icon: 'electrical_services' },
  { value: 'plumber', label: 'Plumber', icon: 'water_damage' },
  { value: 'mason', label: 'Mason/Bricklayer', icon: 'wall' },
  { value: 'carpenter', label: 'Carpenter', icon: 'carpenter' },
  { value: 'painter', label: 'Painter', icon: 'format_paint' },
  { value: 'roofer', label: 'Roofer', icon: 'roofing' },
  { value: 'tiler', label: 'Tiler', icon: 'grid_on' },
]

const PROJECT_STATUSES: { value: Project['status']; label: string; icon: string; triggerCls: string }[] = [
  { value: 'PLANNING', label: 'Planning', icon: 'assignment', triggerCls: 'bg-slate-50 border-slate-200 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: 'engineering', triggerCls: 'bg-slate-50 border-slate-200 text-slate-700 font-bold' },
  { value: 'ON_HOLD', label: 'On Hold', icon: 'pause_circle', triggerCls: 'bg-slate-50 border-slate-200 text-slate-500' },
  { value: 'COMPLETED', label: 'Completed', icon: 'check_circle', triggerCls: 'bg-slate-900 border-slate-900 text-white shadow-none' },
]

const PROC_STATUS_CFG: Record<string, { label: string; borderCls: string; bgCls: string; textCls: string }> = {
  PENDING:   { label: 'Pending',   borderCls: 'border-slate-200', bgCls: 'bg-slate-50/50', textCls: 'text-slate-500' },
  APPROVED:  { label: 'Approved',  borderCls: 'border-slate-200', bgCls: 'bg-slate-50/50', textCls: 'text-slate-600' },
  ORDERED:   { label: 'Ordered',   borderCls: 'border-slate-200', bgCls: 'bg-slate-50/50', textCls: 'text-slate-700' },
  DELIVERED: { label: 'Delivered', borderCls: 'border-slate-200', bgCls: 'bg-slate-50/50', textCls: 'text-slate-900 font-bold' },
  CANCELLED: { label: 'Cancelled', borderCls: 'border-slate-100',   bgCls: 'bg-slate-50/50',   textCls: 'text-slate-400' },
}

const ICON_COLOR: Record<string, { bg: string; text: string }> = {
  blue:    { bg: 'bg-slate-50', text: 'text-slate-600' },
  emerald: { bg: 'bg-slate-50', text: 'text-slate-600' },
  violet:  { bg: 'bg-slate-50', text: 'text-slate-600' },
  amber:   { bg: 'bg-slate-50', text: 'text-slate-600' },
}

function StatCard({ icon, iconColor, label, value, sub, href, search, progress }: { icon: string; iconColor: string; label: string; value: string | number; sub?: string; href?: string; search?: Record<string, number | string | undefined>; progress?: number }) {
  const ic = ICON_COLOR[iconColor] ?? ICON_COLOR.blue
  const Wrapper = href ? Link : 'div'
  const wrapperProps = href ? { to: href, search } : {}
  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full ${ic.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/50">
          <div className="h-full bg-slate-800 rounded-r-full transition-all duration-700 shadow-none border-none ease-out" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${ic.bg} border border-slate-100 transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10`}>
        <Icon name={icon} size={22} className={ic.text} />
      </div>
      <div className="min-w-0 flex-1 relative z-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight mt-1 font-display tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 truncate mt-1 font-medium">{sub}</p>}
      </div>
      {href && <Icon name="arrow_forward" size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 relative z-10" />}
    </Wrapper>
  )
}

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch()
  const navigate = Route.useNavigate()
  const builderStore = useBuilderStore()
  const resolvedProjectId = searchProjectId ?? builderStore.selectedProjectId ?? null
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Team
  const [artisans, setArtisans] = useState<ProjectTeam[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | 'all'>('all')
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null)
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [loadingPros, setLoadingPros] = useState(false)

  // WIP data
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([])
  const [scheduleTasks, setScheduleTasks] = useState<BOQScheduleTask[]>([])
  const [budgetSheets, setBudgetSheets] = useState<BudgetSheets | null>(null)
  const [loadingWip, setLoadingWip] = useState(false)

  // Collapsible sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ tasks: true, procurement: true, team: true, timeline: false })
  const toggle = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))


  const teamCacheRef = useRef<Map<number, ProjectTeam[]>>(new Map())
  const projectsCachedRef = useRef(false)

  const currentProject = projects.find(p => p.id === selectedProject) ?? null

  const selectProject = useCallback((projectId: number) => {
    setSelectedProject(projectId)
    builderStore.selectProject(projectId)
    navigate({
      to: '/builder/building',
      search: { projectId },
      replace: true,
    })
  }, [navigate, builderStore])

  const exitProject = useCallback(() => {
    setSelectedProject(null)
    setArtisans([])
    setMaterialRequests([])
    setScheduleTasks([])
    setBudgetSheets(null)
    setShowExploreModal(false)
    setShowContactModal(false)
    setSelectedProfessional(null)
    builderStore.exitProject()
    navigate({
      to: '/builder/building',
      search: { projectId: undefined },
      replace: true,
    })
  }, [navigate, builderStore])

  useEffect(() => {
    const next = searchProjectId ?? builderStore.selectedProjectId ?? null
    setSelectedProject(next)
  }, [searchProjectId, builderStore.selectedProjectId])

  // ── Load projects ──
  useEffect(() => {
    if (projectsCachedRef.current && projects.length > 0) {
      setLoadingProjects(false)
      return
    }
    builderApi.getProjects()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
        projectsCachedRef.current = true
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoadingProjects(false))
  }, [projects.length])

  useEffect(() => {
    if (loadingProjects || !selectedProject) return
    if (projects.some((project) => project.id === selectedProject)) return
    exitProject()
  }, [exitProject, loadingProjects, projects, selectedProject])

  // ── Load WIP data when project changes ──
  useEffect(() => {
    if (!selectedProject) {
      setMaterialRequests([])
      setScheduleTasks([])
      setBudgetSheets(null)
      return
    }
    let cancelled = false
    setLoadingWip(true)
    Promise.all([
      builderApi.getProjectMaterialRequests(selectedProject).catch(() => ({ data: [] })),
      builderApi.getProjectBOQScheduleTasks(selectedProject, 'final')
        .catch(() => builderApi.getProjectBOQScheduleTasks(selectedProject, 'preliminary'))
        .catch(() => ({ data: [] })),
      builderApi.getProjectBudgetSheets(selectedProject, 'final')
        .catch(() => builderApi.getProjectBudgetSheets(selectedProject, 'preliminary'))
        .catch(() => ({ data: null })),
    ]).then(([mrRes, stRes, bsRes]) => {
      if (cancelled) return
      const extract = (r: any) => Array.isArray(r.data) ? r.data : (r.data as any)?.results || r.data || []
      setMaterialRequests(Array.isArray(extract(mrRes)) ? extract(mrRes) : [])
      setScheduleTasks(Array.isArray(extract(stRes)) ? extract(stRes) : [])
      setBudgetSheets(bsRes.data && typeof bsRes.data === 'object' && !Array.isArray(bsRes.data) ? bsRes.data as BudgetSheets : null)
      
      // Initialize sample activities (TODO: fetch from API)
      setActivities([
        { id: 1, type: 'budget', action: 'Budget Updated', description: 'Final budget sheet was updated', user: 'John Doe', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, type: 'team', action: 'Team Member Added', description: 'Architect assigned to project', user: 'Admin', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, type: 'procurement', action: 'Procurement Request', description: 'New material request created', user: 'Jane Smith', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ])
    }).finally(() => { if (!cancelled) setLoadingWip(false) })
    return () => { cancelled = true }
  }, [selectedProject])

  // ── Team ──
  const fetchTeam = useCallback(async () => {
    if (!selectedProject) return
    const cached = teamCacheRef.current.get(selectedProject)
    if (cached) { setArtisans(cached); setRefetching(true) }
    else setLoadingTeam(true)
    try {
      const res = await builderApi.getProjectTeam(selectedProject)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setArtisans(data)
      teamCacheRef.current.set(selectedProject, data)
    } catch { toast.error('Failed to load team') }
    finally { setLoadingTeam(false); setRefetching(false) }
  }, [selectedProject])

  useEffect(() => {
    if (!selectedProject) {
      setArtisans([])
      setLoadingTeam(false)
      setRefetching(false)
      return
    }
    fetchTeam()
  }, [fetchTeam, selectedProject])

  const fetchProfessionals = async () => {
    setLoadingPros(true)
    try {
      const params: any = { search: searchTerm || undefined }
      if (selectedRole !== 'all') params.role = selectedRole
      const res = await builderApi.getProfessionalProfiles()
      const results = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      const filtered = results.filter((p: ProfessionalProfile) => {
        const matchesSearch = !searchTerm || p.user_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === 'all' || p.role === selectedRole
        return matchesSearch && matchesRole
      })
      setProfessionals(filtered)
    } catch { toast.error('Failed to load professionals') }
    finally { setLoadingPros(false) }
  }

  useEffect(() => { if (showExploreModal) fetchProfessionals() }, [showExploreModal, searchTerm, selectedRole])

  // ── Handlers ──
  const handleProjectStatusChange = async (status: Project['status']) => {
    if (!selectedProject) return
    setUpdatingStatus(true)
    try {
      await builderApi.updateProject(selectedProject, { status })
      setProjects(prev => prev.map(p => p.id === selectedProject ? { ...p, status } : p))
      toast.success(`Project moved to ${PROJECT_STATUSES.find(s => s.value === status)?.label}`)
    } catch { toast.error('Failed to update status') }
    finally { setUpdatingStatus(false) }
  }

  const handleDelete = async (id: number) => {
    const prev = artisans
    const updated = artisans.filter(a => a.id !== id)
    setArtisans(updated)
    if (selectedProject) teamCacheRef.current.set(selectedProject, updated)
    try { await builderApi.removeFromTeam(id); toast.success('Removed') }
    catch { setArtisans(prev); if (selectedProject) teamCacheRef.current.set(selectedProject, prev); toast.error('Failed') }
  }

  const handleTeamStatusChange = async (id: number, status: ProjectTeam['status']) => {
    try {
      await builderApi.updateTeamMember(id, { status })
      setArtisans(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch { toast.error('Failed to update status') }
  }

  const handleAddToTeam = async (professional: ProfessionalProfile) => {
    if (!selectedProject) { toast.error('Select a project first'); return }
    if (artisans.some(a => a.user === professional.user)) { toast.error('Already on team'); return }
    try {
      const res = await builderApi.addToTeam({
        project: selectedProject, user: professional.user,
        role: professional.role as any, status: 'pending',
        notes: `Added from directory – ${professional.completed_projects_count} completed projects`,
      })
      setArtisans(prev => [res.data, ...prev])
      toast.success(`${professional.user_details?.full_name} added`)
      setShowExploreModal(false)
      fetchTeam()
    } catch { toast.error('Failed to add to team') }
  }

  // ── Helpers ──
  const getRoleIcon = (role: string) => ARTISAN_ROLES.find(r => r.value === role)?.icon || 'person'
  const getRoleLabel = (role: string) => ARTISAN_ROLES.find(r => r.value === role)?.label || role
  const availColor = (a: string) => {
    if (a === 'available') return 'bg-green-100 text-green-700'
    if (a === 'busy') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  // ── Derived stats ──
  const budgetTotal = budgetSheets?.budget_meta?.gross_total ? Number(budgetSheets.budget_meta.gross_total) : 0
  const procByStatus = materialRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1; return acc
  }, {})
  const totalProc = materialRequests.length
  const deliveredProc = procByStatus['DELIVERED'] || 0
  const procPercent = totalProc > 0 ? Math.round((deliveredProc / totalProc) * 100) : 0
  
  // Calculate actual spent from procurement
  const actualSpent = materialRequests.reduce((sum, req) => {
    const qty = Number(req.quantity_requested || 0)
    const price = Number(req.price_at_request || 0)
    return sum + (qty * price)
  }, 0)

  const projectStatusCfg = PROJECT_STATUSES.find(s => s.value === currentProject?.status)
  const isDIFY = currentProject?.engagement_tier === 'DIFY'

  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block"><Search /></div>
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50/80 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="w-full px-3 py-4 sm:p-4 md:p-6 lg:p-8">
            <ProjectWorkspacePicker
              title="Select a project workspace"
              description="Choose the site you want to manage. I’ll only load live budget, team, schedule, and procurement data after you enter a specific project workspace."
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
          <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block"><Search /></div>
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50/80 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="w-full px-3 py-4 sm:p-4 md:p-6 lg:p-8">
            <ProjectWorkspacePicker
              title="Select a project workspace"
              description="Pick a project tile to open its management cockpit. Until you select one, no team, budget, schedule, or procurement details are pulled into this page."
              projects={projects}
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: '/builder' })}
              primaryActionLabel="Open Portfolio"
              emptyTitle="No project workspaces yet"
              emptyDescription="Create a project from your builder overview, then return here to enter its dedicated workspace."
            />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block"><Search /></div>
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-slate-50/80 min-h-[calc(100vh-theme(spacing.16))]">
        <div className="w-full px-3 py-4 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">

          {/* ── Hero Header ── */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 md:p-8 text-slate-900 relative shadow-sm border border-slate-200 overflow-hidden">
            {/* Very subtle ambient gradients on white */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-100/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon name="construction" size={24} className="text-slate-700" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-display">Project Command Center</h1>
                </div>
                {currentProject && (
                  <p className="text-sm font-semibold text-slate-500 flex items-center gap-2 ml-12">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                      <Icon name="location_on" size={14} className="text-slate-400" />
                      {currentProject.location}
                    </span>
                    <span className="text-slate-300 font-black">•</span>
                    <span className="text-slate-500">Created {new Date(currentProject.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
                  Exit
                </Button>
                {currentProject && (
                  <Select value={currentProject.status} onValueChange={v => handleProjectStatusChange(v as Project['status'])}>
                    <SelectTrigger className="h-10 w-full sm:w-44 font-bold text-sm rounded-xl bg-white border-slate-200 text-slate-800 hover:bg-slate-50 transition-all shadow-sm" disabled={updatingStatus}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2 font-semibold">
                            <Icon name={s.icon} size={16} />
                            {s.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            {currentProject && (
              <div className="relative mt-6 pt-5 border-t border-slate-100 z-10 w-full">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <span>Overall Project Burn</span>
                  <span className="text-emerald-600">{scheduleTasks.length > 0 ? Math.round((scheduleTasks.filter(t => t.est_cost).length / scheduleTasks.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${scheduleTasks.length > 0 ? Math.round((scheduleTasks.filter(t => t.est_cost).length / scheduleTasks.length) * 100) : 0}%` }}
                  >
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── DIFY Progress Dashboard ── */}
          {isDIFY && currentProject && (
            <DIFYProgressDashboard 
              project={currentProject}
              team={artisans}
              budgetSigned={budgetSheets?.budget_meta?.is_locked}
              procurementCount={totalProc}
              drawingsCount={0}
            />
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="wallet" iconColor="blue" label="Budget" value={budgetTotal > 0 ? `$${budgetTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'} sub={budgetSheets?.budget_meta?.is_locked ? 'Signed & Locked' : 'Draft'} href="/builder/projectbudget" search={{ projectId: selectedProject }} progress={budgetTotal > 0 ? (actualSpent / budgetTotal) * 100 : 0} />
            <StatCard icon="groups" iconColor="emerald" label="Team" value={artisans.length} sub={`${artisans.filter(a => a.status === 'assigned').length} active members`} progress={artisans.length > 0 ? (artisans.filter(a => a.status === 'assigned').length / artisans.length) * 100 : 0} />
            <StatCard icon="inventory_2" iconColor="violet" label="Procurement" value={totalProc} sub={totalProc > 0 ? `${procPercent}% delivered` : 'No requests yet'} href="/builder/procurement" search={{ projectId: selectedProject }} progress={procPercent} />
            <StatCard icon="schedule" iconColor="amber" label="Tasks" value={scheduleTasks.length} sub={scheduleTasks.length > 0 ? `${scheduleTasks.filter(t => t.est_cost).length} costed` : 'No tasks yet'} progress={scheduleTasks.length > 0 ? (scheduleTasks.filter(t => t.est_cost).length / scheduleTasks.length) * 100 : 0} />
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left column (2/3) */}
            <div className="lg:col-span-2 space-y-5">

              {/* Project Timeline */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <button type="button" onClick={() => toggle('timeline')} className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors rounded-t-xl sm:rounded-t-2xl">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Icon name="timeline" size={16} className="text-slate-400" />
                    </div>
                    Project Timeline
                  </h2>
                  <Icon name="expand_more" size={20} className={`text-slate-400 transition-transform duration-200 ${collapsed['timeline'] ? '-rotate-90' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed['timeline'] ? 'max-h-0' : 'max-h-[600px] overflow-y-auto'}`}>
                  {scheduleTasks.length > 0 ? (
                    <div className="p-5">
                      <ProjectTimeline
                        tasks={scheduleTasks}
                        projectStartDate={currentProject?.created_at}
                        projectEndDate={undefined}
                      />
                    </div>
                  ) : (
                    <div className="px-5 py-12 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                        <Icon name="timeline" size={28} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No timeline data available</p>
                      <p className="text-xs text-slate-400 mt-1">Add schedule tasks from your budget to see a visual timeline</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Tasks */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <button type="button" onClick={() => toggle('tasks')} className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors rounded-t-xl sm:rounded-t-2xl">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Icon name="schedule" size={16} className="text-slate-400" />
                    </div>
                    <span className="hidden xs:inline">Schedule</span> Tasks
                    <Badge variant="secondary" className="text-[10px] ml-1 rounded-full px-2">{scheduleTasks.length}</Badge>
                  </h2>
                  <Icon name="expand_more" size={20} className={`text-slate-400 transition-transform duration-200 ${collapsed['tasks'] ? '-rotate-90' : ''}`} />
                </button>
                <div className={`divide-y divide-slate-50 overflow-hidden transition-all duration-300 ease-in-out ${collapsed['tasks'] ? 'max-h-0' : 'max-h-96 overflow-y-auto'}`}>
                  {loadingWip ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                        <div className="h-5 w-5 rounded-md bg-slate-100 animate-pulse" />
                        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                        <div className="ml-auto h-4 w-20 bg-slate-100 rounded animate-pulse" />
                      </div>
                    ))
                  ) : scheduleTasks.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                        <Icon name="event_note" size={28} className="text-amber-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No schedule tasks yet</p>
                      <p className="text-xs text-slate-400 mt-1">Tasks will appear once your budget has schedule items</p>
                    </div>
                  ) : (
                    scheduleTasks.map((task, idx) => (
                      <div key={task.id} className="px-5 py-3 flex items-center gap-3 text-sm hover:bg-slate-50/50 transition-colors" style={{ animation: `fadeSlideIn 0.3s ease-out ${idx * 30}ms both` }}>
                        <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon name="check_box_outline_blank" size={16} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{task.task_description || task.wbs || '—'}</p>
                          {(task.start_date || task.end_date) && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Icon name="calendar_today" size={10} />
                              {task.start_date && <span>{task.start_date}</span>}
                              {task.start_date && task.end_date && <span className="text-slate-300">→</span>}
                              {task.end_date && <span>{task.end_date}</span>}
                              {task.days && <span className="ml-1 text-slate-500 font-medium">({task.days}d)</span>}
                            </p>
                          )}
                        </div>
                        {task.est_cost && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                            ${Number(task.est_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Procurement Progress */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <button type="button" onClick={() => toggle('procurement')} className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors rounded-t-xl sm:rounded-t-2xl">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Icon name="inventory_2" size={16} className="text-slate-400" />
                    </div>
                    Procurement
                    <Badge variant="secondary" className="text-[10px] ml-1 rounded-full px-2">{totalProc}</Badge>
                  </h2>
                  <div className="flex items-center gap-3">
                    {totalProc > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${procPercent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 tabular-nums">{procPercent}%</span>
                      </div>
                    )}
                    <Icon name="expand_more" size={20} className={`text-slate-400 transition-transform duration-200 ${collapsed['procurement'] ? '-rotate-90' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed['procurement'] ? 'max-h-0' : 'max-h-96'}`}>
                {totalProc === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                      <Icon name="local_shipping" size={28} className="text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">No procurement requests yet</p>
                    <p className="text-xs text-slate-400 mt-1">Create requests from your budget page</p>
                    <Link to="/builder/procurement" search={{ projectId: selectedProject }} className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-violet-600 hover:text-violet-700">
                      Go to Procurement <Icon name="arrow_forward" size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                    {Object.entries(PROC_STATUS_CFG).map(([key, cfg]) => {
                      const count = procByStatus[key] || 0
                      return (
                        <div key={key} className={`rounded-xl border-2 ${cfg.borderCls} ${cfg.bgCls} p-3 text-center transition-all hover:scale-105`}>
                          <p className="text-2xl font-bold text-slate-900">{count}</p>
                          <p className={`text-[9px] font-semibold uppercase tracking-wider ${cfg.textCls}`}>{cfg.label}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right column (1/3) — Team, Actions, Activity */}
            <div className="lg:col-span-1 space-y-5">

              {/* Quick Actions Panel */}
              <QuickActionsPanel
                projectId={selectedProject}
                onAddTask={() => toast.info('Add Task feature coming soon')}
                onAddInvoice={() => toast.info('Add Invoice feature coming soon')}
                onUploadPhoto={() => toast.info('Upload Photo feature coming soon')}
                onAddDocument={() => toast.info('Add Document feature coming soon')}
                onAddTeamMember={() => setShowExploreModal(true)}
                onCreateProcurement={() => navigate({ to: '/builder/procurement', search: { projectId: selectedProject ?? undefined } })}
                isDIFY={isDIFY}
              />

            </div>
          </div>

          {/* Global keyframe animations */}
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* ── Explore Professionals Modal ── */}
          {showExploreModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50" onClick={() => setShowExploreModal(false)}>
              <Card className="w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl border-0" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Icon name="verified_user" size={18} className="text-emerald-600" />
                    </div>
                    Verified Professionals
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowExploreModal(false)} className="rounded-xl hover:bg-slate-100">
                    <Icon name="close" size={20} />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-4 overflow-y-auto max-h-[70vh]">
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or company…" className="pl-9 h-10 rounded-xl" />
                    </div>
                    <Select value={selectedRole} onValueChange={v => setSelectedRole(v)}>
                      <SelectTrigger className="w-44 h-10 rounded-xl"><SelectValue placeholder="Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {ARTISAN_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    {loadingPros ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100">
                          <div className="h-11 w-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2"><div className="h-4 w-36 bg-slate-100 rounded animate-pulse" /><div className="h-3 w-48 bg-slate-50 rounded animate-pulse" /></div>
                        </div>
                      ))
                    ) : professionals.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <Icon name="search_off" size={28} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">No professionals found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or role filter</p>
                      </div>
                    ) : (
                      professionals.map((pro, idx) => (
                        <div key={pro.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all" style={{ animation: `fadeSlideIn 0.25s ease-out ${idx * 30}ms both` }}>
                          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 overflow-hidden">
                            {pro.user_details?.avatar ? (
                              <img src={pro.user_details.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Icon name={getRoleIcon(pro.role)} size={20} className="text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">{pro.user_details?.full_name}</p>
                              {pro.is_verified && <Icon name="verified" size={14} className="text-emerald-500 shrink-0" />}
                              <Badge className={`${availColor(pro.availability)} text-[9px] px-1.5 py-0 rounded-full`}>{pro.availability}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{getRoleLabel(pro.role)} · {pro.company_name} · {pro.experience_years}yr · ★{pro.average_rating}</p>
                          </div>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs shrink-0 rounded-lg" onClick={() => handleAddToTeam(pro)}>
                            <Icon name="person_add" size={14} className="mr-1" />Add
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-3 text-xs shrink-0 rounded-lg" onClick={() => { setSelectedProfessional(pro); setShowContactModal(true); setShowExploreModal(false) }}>
                            <Icon name="call" size={14} />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Contact Modal ── */}
          {showContactModal && selectedProfessional && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50" onClick={() => setShowContactModal(false)}>
              <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl border-0" onClick={e => e.stopPropagation()}>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="contact_phone" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold">{selectedProfessional.user_details?.full_name}</p>
                      <p className="text-xs text-slate-400 font-normal">{getRoleLabel(selectedProfessional.role)}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm p-5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Icon name="phone" size={16} className="text-slate-400" />
                    <span className="text-slate-700 font-medium">{selectedProfessional.user_details?.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Icon name="email" size={16} className="text-slate-400" />
                    <span className="text-slate-700 font-medium truncate">{selectedProfessional.user_details?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Icon name="business" size={16} className="text-slate-400" />
                    <span className="text-slate-700 font-medium">{selectedProfessional.company_name}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={() => setShowContactModal(false)}>Close</Button>
                    <Button size="sm" className="flex-1 rounded-xl h-9" onClick={() => {
                      if (selectedProfessional.user_details?.phone_number) {
                        navigator.clipboard.writeText(selectedProfessional.user_details.phone_number)
                        toast.success('Phone number copied!')
                      } else { toast.error('No phone number available') }
                    }}><Icon name="content_copy" size={14} className="mr-1" />Copy Phone</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </Main>
    </>
  )
}

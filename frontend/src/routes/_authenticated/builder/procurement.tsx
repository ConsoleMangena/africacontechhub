import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute(
  '/_authenticated/builder/procurement',
)({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      projectId: search.projectId ? Number(search.projectId) : undefined,
    }
  },
  component: ProcurementPage,
})

type ProcurementCategory = 'MATERIAL' | 'LABOUR' | 'PLANT' | 'PROFESSIONAL' | 'ADMIN'

const CATEGORIES: { key: ProcurementCategory; label: string; icon: string; color: string }[] = [
  { key: 'MATERIAL', label: 'Building Materials', icon: 'construction', color: 'emerald' },
  { key: 'LABOUR',   label: 'Labour',             icon: 'engineering',   color: 'blue' },
  { key: 'PLANT',    label: 'Plant & Equipment',   icon: 'precision_manufacturing', color: 'amber' },
  { key: 'PROFESSIONAL', label: 'Professional Fees', icon: 'badge',      color: 'purple' },
  { key: 'ADMIN',    label: 'Admin & Expenses',    icon: 'receipt_long', color: 'slate' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED:  'bg-blue-50 text-blue-700 border border-blue-200',
  ORDERED:   'bg-violet-50 text-violet-700 border border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
}

function LoadingBar() {
  return (
    <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
      <div className="h-full w-1/3 bg-blue-500 rounded-full" style={{ animation: 'procShimmer 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes procShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-50">
          <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-4 py-3 text-right"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse ml-auto" /></td>
          <td className="px-4 py-3 text-center"><div className="h-6 w-24 bg-slate-100 rounded animate-pulse mx-auto" /></td>
        </tr>
      ))}
    </>
  )
}

function ProcurementPage() {
  const { projectId } = Route.useSearch() as { projectId?: number }
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState<number | null>(projectId || null)
  const [activeCategory, setActiveCategory] = useState<ProcurementCategory>('MATERIAL')
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

  // Load projects
  useEffect(() => {
    builderApi.getProjects()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
        if (!projectId && data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].id)
        }
      })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoadingProjects(false))
  }, [])

  // Load BOQ source items for selected project
  useEffect(() => {
    if (!selectedProject) return
    setLoadingBOQ(true)
    Promise.all([
      builderApi.getProjectBOQBuildingItems(selectedProject),
      builderApi.getProjectBOQLabourCosts(selectedProject),
      builderApi.getProjectBOQMachinePlants(selectedProject),
      builderApi.getProjectBOQProfessionalFees(selectedProject),
      builderApi.getProjectBOQAdminExpenses(selectedProject),
    ]).then(([b, l, p, pf, a]) => {
      const extract = (r: any) => Array.isArray(r.data) ? r.data : (r.data as any).results || []
      setBoqBuilding(extract(b))
      setBoqLabour(extract(l))
      setBoqPlant(extract(p))
      setBoqProfessional(extract(pf))
      setBoqAdmin(extract(a))
    }).catch(() => toast.error('Failed to load BOQ items'))
    .finally(() => setLoadingBOQ(false))
  }, [selectedProject])

  const fetchRequests = useCallback(async () => {
    if (!selectedProject) return
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

  // Auto-fill form when a BOQ item is selected
  const handleBoqRefChange = (id: string) => {
    setForm(f => ({ ...f, boq_ref: id }))
    if (!id) return
    const numId = Number(id)
    if (activeCategory === 'MATERIAL') {
      const item = boqBuilding.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.description, unit: item.unit || '', price_at_request: item.rate, quantity_requested: item.quantity }))
    } else if (activeCategory === 'LABOUR') {
      const item = boqLabour.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.trade_role || item.phase || 'Labour', unit: 'day', price_at_request: item.daily_rate, quantity_requested: item.total_man_days || '1' }))
    } else if (activeCategory === 'PLANT') {
      const item = boqPlant.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.machine_item || item.category || 'Plant', unit: 'day', price_at_request: item.daily_wet_rate, quantity_requested: item.days_rqd || '1' }))
    } else if (activeCategory === 'PROFESSIONAL') {
      const item = boqProfessional.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.role_scope || item.discipline || 'Professional Fee', unit: 'lump sum', price_at_request: item.estimated_fee, quantity_requested: '1' }))
    } else if (activeCategory === 'ADMIN') {
      const item = boqAdmin.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.item_role || item.description || 'Admin Expense', unit: 'trip', price_at_request: item.rate, quantity_requested: item.total_trips || '1' }))
    }
  }

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
        boq_item: activeCategory === 'MATERIAL' && form.boq_ref ? Number(form.boq_ref) : undefined,
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
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Procurement</h1>
              <p className="text-sm text-slate-500 mt-1">Raise requests for materials, labour, plant, and services</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedProject || ''}
                onChange={e => setSelectedProject(Number(e.target.value))}
                className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-60"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <Button
                onClick={() => setShowForm(true)}
                disabled={!selectedProject}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10"
              >
                <Icon name="add" size={16} className="mr-1.5" />
                New Request
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => { setActiveCategory(c.key); setShowForm(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border',
                  activeCategory === c.key
                    ? `bg-${c.color}-600 text-white border-${c.color}-600 shadow-sm`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                <Icon name={c.icon} size={16} />
                {c.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  activeCategory === c.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  {requests.filter(r => r.procurement_category === c.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Table */}
            <div className="lg:col-span-2 space-y-4">

              {/* New Request Form */}
              {showForm && (
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

                    <div className="grid grid-cols-2 gap-3">
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

              {/* Requests Table */}
              <Card>
                <CardContent className="p-0">
                  {refetching && <LoadingBar />}
                  {loadingRequests ? (
                    <table className="w-full text-left">
                      <tbody><SkeletonRows /></tbody>
                    </table>
                  ) : categoryRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name={cat.icon} size={36} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">No {cat.label} requests yet</p>
                      <p className="text-xs text-slate-400 mt-1 mb-4">Click "New Request" to raise a procurement request</p>
                      <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                        <Icon name="add" size={14} className="mr-1" /> New Request
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Qty</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryRequests.map(req => (
                          <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              <p>{req.material_name}</p>
                              {req.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{req.notes}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 text-right">{parseFloat(req.quantity_requested).toLocaleString()}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{req.unit || '—'}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                              {parseFloat(req.total_calculated_cost).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', STATUS_COLORS[req.status])}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
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
                    <Link to="/builder/measurements" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
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

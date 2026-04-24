import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { 
  Project, MaterialRequest, 
  BOQBuildingItem, BOQLabourCost, BOQMachinePlant, 
  BOQProfessionalFee, BOQAdminExpense 
} from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId/material-requests',
)({
  component: ProjectProcurementPage,
})

type ProcurementCategory = 'MATERIAL' | 'LABOUR' | 'PLANT' | 'PROFESSIONAL' | 'ADMIN'

const CATEGORIES: { key: ProcurementCategory; label: string; icon: string; color: string }[] = [
  { key: 'MATERIAL', label: 'Materials', icon: 'construction', color: 'emerald' },
  { key: 'LABOUR',   label: 'Labour',    icon: 'engineering',   color: 'blue' },
  { key: 'PLANT',    label: 'Plant',     icon: 'precision_manufacturing', color: 'amber' },
  { key: 'PROFESSIONAL', label: 'Fees',  icon: 'badge',      color: 'purple' },
  { key: 'ADMIN',    label: 'Admin',     icon: 'receipt_long', color: 'slate' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED:  'bg-blue-50 text-blue-700 border border-blue-200',
  ORDERED:   'bg-violet-50 text-violet-700 border border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
}

function ProjectProcurementPage() {
  const { projectId } = Route.useParams()
  const pid = Number(projectId)
  const [project, setProject] = useState<Project | null>(null)
  const [activeCategory, setActiveCategory] = useState<ProcurementCategory>('MATERIAL')
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(false)
  
  // BOQ source items
  const [boqBuilding, setBoqBuilding] = useState<BOQBuildingItem[]>([])
  const [boqLabour, setBoqLabour] = useState<BOQLabourCost[]>([])
  const [boqPlant, setBoqPlant] = useState<BOQMachinePlant[]>([])
  const [boqProfessional, setBoqProfessional] = useState<BOQProfessionalFee[]>([])
  const [boqAdmin, setBoqAdmin] = useState<BOQAdminExpense[]>([])
  
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    boq_ref: '',
    material_name: '',
    quantity_requested: '1',
    unit: '',
    procurement_method: 'SELF' as 'SELF' | 'GROUP_BUY',
    notes: '',
  })

  const loadBOQDataSignedFinal = async () => {
    try {
      const [b, l, p, pf, a] = await Promise.all([
        builderApi.getProjectBOQBuildingItems(pid, 'final'),
        builderApi.getProjectBOQLabourCosts(pid, 'final'),
        builderApi.getProjectBOQMachinePlants(pid, 'final'),
        builderApi.getProjectBOQProfessionalFees(pid, 'final'),
        builderApi.getProjectBOQAdminExpenses(pid, 'final'),
      ])
      const extract = (r: any) => Array.isArray(r.data) ? r.data : (r.data as any).results || []
      setBoqBuilding(extract(b))
      setBoqLabour(extract(l))
      setBoqPlant(extract(p))
      setBoqProfessional(extract(pf))
      setBoqAdmin(extract(a))
    } catch {
      toast.error('Failed to load BOQ items')
    }
  }

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const res = await builderApi.getProjectMaterialRequests(pid)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setRequests(data)
    } catch {
      toast.error('Failed to load procurement requests')
    } finally {
      setLoadingRequests(false)
    }
  }, [pid])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const pres = await builderApi.getProject(pid)
        setProject(pres.data)
        await fetchRequests()
        if (pres.data.is_budget_signed) {
          await loadBOQDataSignedFinal()
        } else {
          setBoqBuilding([])
          setBoqLabour([])
          setBoqPlant([])
          setBoqProfessional([])
          setBoqAdmin([])
        }
      } catch {
        toast.error('Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [pid])

  const handleBoqRefChange = (id: string) => {
    setForm(f => ({ ...f, boq_ref: id }))
    if (!id) return
    const numId = Number(id)
    if (activeCategory === 'MATERIAL') {
      const item = boqBuilding.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.description, unit: item.unit || '', quantity_requested: item.quantity }))
    } else if (activeCategory === 'LABOUR') {
      const item = boqLabour.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.trade_role || item.phase || 'Labour', unit: 'day', quantity_requested: item.total_man_days || '1' }))
    } else if (activeCategory === 'PLANT') {
      const item = boqPlant.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.machine_item || item.category || 'Plant', unit: 'day', quantity_requested: item.days_rqd || '1' }))
    } else if (activeCategory === 'PROFESSIONAL') {
      const item = boqProfessional.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.role_scope || item.discipline || 'Fee', unit: 'lump sum', quantity_requested: '1' }))
    } else if (activeCategory === 'ADMIN') {
      const item = boqAdmin.find(i => i.id === numId)
      if (item) setForm(f => ({ ...f, material_name: item.item_role || item.description || 'Admin', unit: 'trip', quantity_requested: item.total_trips || '1' }))
    }
  }

  const canProcure = Boolean(project?.is_budget_signed)

  useEffect(() => {
    if (!canProcure) setShowForm(false)
  }, [canProcure])

  const handleSubmit = async () => {
    if (!canProcure) {
      toast.error('Sign the final construction budget before creating procurement requests.')
      return
    }
    if (!form.material_name || !form.quantity_requested) return
    setSaving(true)
    try {
      const boqItemRef = form.boq_ref ? Number(form.boq_ref) : undefined

      await builderApi.createMaterialRequest({
        project: pid,
        procurement_category: activeCategory,
        boq_source_id: boqItemRef,
        material_name: form.material_name,
        quantity_requested: form.quantity_requested,
        unit: form.unit,
        notes: form.notes,
        procurement_method: form.procurement_method,
        price_at_request: '0',
      } as any)
      
      setForm({
        boq_ref: '',
        material_name: '',
        quantity_requested: '1',
        unit: '',
        procurement_method: 'SELF',
        notes: '',
      })
      setShowForm(false)
      toast.success('Procurement request created')
      fetchRequests()
    } catch {
      toast.error('Failed to create request')
    } finally {
      setSaving(false)
    }
  }

  const categoryRequests = requests.filter(r => r.procurement_category === activeCategory)
  const currentCategory = CATEGORIES.find(c => c.key === activeCategory)!

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm">Loading Project Procurement...</p>
      </div>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="w-full space-y-6 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/builder/projectbudget`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Icon name="arrow_back" size={18} className="text-slate-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                  <Icon name="inventory_2" size={22} className="text-emerald-600" />
                  {project?.title} — Procurement
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Manage material, labour, and equipment requests</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              disabled={!canProcure}
              title={!canProcure ? 'Sign the final budget under Construction Budget first' : undefined}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Icon name="add" size={14} className="mr-1.5" />
              New Request
            </Button>
          </div>

          {!canProcure && project && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <strong className="font-semibold">Signed final budget required.</strong>{' '}
              Go to{' '}
              <Link to="/builder/projectbudget" className="underline font-medium">
                Construction Budget
              </Link>
              , promote to final, and sign before raising procurement requests.
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 border-b border-slate-100 pb-px overflow-x-auto">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => { setActiveCategory(c.key); setShowForm(false) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeCategory === c.key
                    ? `border-${c.color}-600 text-${c.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                )}
              >
                <Icon name={c.icon} size={16} />
                {c.label}
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  activeCategory === c.key ? `bg-${c.color}-100 text-${c.color}-700` : 'bg-slate-100 text-slate-400'
                )}>
                  {requests.filter(r => r.procurement_category === c.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Requests Table */}
              <Card>
                <CardContent className="p-0">
                  {loadingRequests ? (
                    <div className="p-12 text-center text-slate-400">
                      <Icon name="progress_activity" className="animate-spin mx-auto mb-2" />
                      <p className="text-xs">Loading requests...</p>
                    </div>
                  ) : categoryRequests.length === 0 ? (
                    <div className="py-16 text-center">
                      <Icon name={currentCategory.icon} size={48} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">No {currentCategory.label.toLowerCase()} requests found</p>
                      <p className="text-xs text-slate-400 mt-1">Start by clicking "New Request"</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Description</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-right">Qty</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-center">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryRequests.map(req => (
                          <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-900">{req.material_name}</p>
                              {req.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{req.notes}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 text-right">
                              {parseFloat(req.quantity_requested).toLocaleString()} {req.unit}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_COLORS[req.status] || 'bg-slate-100')}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Form & Info Sidebar */}
            <div className="space-y-4">
              {showForm && (
                <Card className="border-emerald-200 bg-emerald-50/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon name="add_circle" size={16} className="text-emerald-600" />
                        Create {currentCategory.label} Request
                      </h3>
                      <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                        <Icon name="close" size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select BOQ Item</label>
                        <select 
                          value={form.boq_ref}
                          onChange={e => handleBoqRefChange(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                          <option value="">— Choose from Budget —</option>
                          {activeCategory === 'MATERIAL' && boqBuilding.map(i => <option key={i.id} value={i.id}>{i.description}</option>)}
                          {activeCategory === 'LABOUR' && boqLabour.map(i => <option key={i.id} value={i.id}>{i.trade_role || i.phase}</option>)}
                          {activeCategory === 'PLANT' && boqPlant.map(i => <option key={i.id} value={i.id}>{i.machine_item || i.category}</option>)}
                          {activeCategory === 'PROFESSIONAL' && boqProfessional.map(i => <option key={i.id} value={i.id}>{i.role_scope || i.discipline}</option>)}
                          {activeCategory === 'ADMIN' && boqAdmin.map(i => <option key={i.id} value={i.id}>{i.item_role || i.description}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <input 
                          value={form.material_name} 
                          onChange={e => setForm({...form, material_name: e.target.value})} 
                          className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="e.g. Portland Cement"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                          <input 
                            value={form.quantity_requested} 
                            onChange={e => setForm({...form, quantity_requested: e.target.value})} 
                            type="number"
                            className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                          <input 
                            value={form.unit} 
                            onChange={e => setForm({...form, unit: e.target.value})} 
                            className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="bags, m³"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Procurement Method</label>
                        <div className="flex gap-2 mt-1">
                          {(['SELF', 'GROUP_BUY'] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => setForm(f => ({ ...f, procurement_method: m }))}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all flex items-center justify-center gap-1.5',
                                form.procurement_method === m
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              <Icon name={m === 'SELF' ? 'foundation' : 'groups'} size={14} />
                              {m === 'SELF' ? 'Self' : 'Group'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Additional Notes</label>
                        <textarea 
                          value={form.notes} 
                          onChange={e => setForm({...form, notes: e.target.value})} 
                          rows={2}
                          className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 mt-1 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                          placeholder="Special requirements..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button 
                        onClick={handleSubmit} 
                        disabled={saving || !form.material_name || !form.quantity_requested}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {saving ? 'Creating...' : 'Submit Request'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-slate-400">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* BOQ Overview Widget */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">BOQ Overview</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(c => {
                       const count = c.key === 'MATERIAL' ? boqBuilding.length
                       : c.key === 'LABOUR' ? boqLabour.length
                       : c.key === 'PLANT' ? boqPlant.length
                       : c.key === 'PROFESSIONAL' ? boqProfessional.length
                       : boqAdmin.length
                       return (
                        <div key={c.key} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-2">
                            <Icon name={c.icon} size={14} />
                            {c.label}
                          </span>
                          <span className="font-bold text-slate-700">{count} source items</span>
                        </div>
                       )
                    })}
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

import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { BOQItem, Project, MaterialRequest } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

// Redefinition removed, using type from @/types/api

function ProcurementPage() {
  const { projectId } = Route.useSearch() as { projectId?: number }
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(projectId || null)
  const [boqItems, setBoqItems] = useState<BOQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [form, setForm] = useState({
    boq_item: '',
    material_name: '',
    quantity_requested: '0',
    unit: '',
    notes: '',
    procurement_method: 'SELF' as 'SELF' | 'GROUP_BUY',
    price_at_request: '0',
    transport_cost: '0',
    group_buy_deduction: '0',
  })

  // Fetch projects on mount
  useEffect(() => {
    let cancelled = false
    builderApi.getProjects()
      .then(res => {
        if (cancelled) return
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
        // If no projectId from URL, default to first project
        if (!projectId && data.length > 0) {
          setSelectedProject(data[0].id)
        }
      })
      .catch(() => toast.error('Failed to load projects'))
    return () => { cancelled = true }
  }, [projectId])

  // Fetch BOQ items when project changes
  useEffect(() => {
    if (!selectedProject) {
      setLoading(false)
      return
    }

    const project = projects.find(p => p.id === selectedProject)
    if (project && !project.is_budget_signed) {
      setBoqItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    builderApi.getProjectBOQItems(selectedProject)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        // Filter for material-related items - simplified keywords
        const materialItems = data.filter((item: BOQItem) => 
          item.category.includes('Concrete') || 
          item.category.includes('Bricks') || 
          item.category.includes('Foundation') ||
          item.category.includes('Roofing') ||
          item.category.includes('Woodwork') ||
          item.category.includes('Plumbing') ||
          item.category.includes('Electricity') ||
          item.category.includes('Finishes') ||
          item.category.includes('Painting') ||
          item.category.includes('Water') ||
          item.category.includes('Yard')
        )
        setBoqItems(materialItems)
      })
      .catch(() => toast.error('Failed to load BOQ items'))
      .finally(() => setLoading(false))
  }, [selectedProject, projects])

  const handleSubmit = async () => {
    if (!form.material_name || !form.quantity_requested || !selectedProject) return
    setSaving(true)
    try {
      await builderApi.createMaterialRequest({
        project: selectedProject,
        boq_item: form.boq_item ? Number(form.boq_item) : undefined,
        material_name: form.material_name,
        quantity_requested: form.quantity_requested,
        unit: form.unit,
        procurement_method: form.procurement_method,
        price_at_request: form.price_at_request,
        transport_cost: form.transport_cost,
        group_buy_deduction: form.group_buy_deduction,
        notes: form.notes,
      })
      setForm({
        boq_item: '',
        material_name: '',
        quantity_requested: '0',
        unit: '',
        notes: '',
        procurement_method: 'SELF',
        price_at_request: '0',
        transport_cost: '0',
        group_buy_deduction: '0',
      })
      setShowForm(false)
      toast.success('Material request created')
      // Refresh requests
      fetchRequests()
    } catch (err) { 
      console.error(err)
      toast.error('Failed to create request')
    } finally { 
      setSaving(false) 
    }
  }

  const fetchRequests = async () => {
    if (!selectedProject) return
    try {
      const res = await builderApi.getProjectMaterialRequests(selectedProject)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setRequests(data)
    } catch (err) {
      console.error('Failed to fetch requests', err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [selectedProject])


  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="w-full max-w-6xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Icon name="inventory_2" className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-slate-900">Procurement</h1>
                <p className="text-xs text-slate-500">Manage material requests and orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Project Selector */}
              <select
                value={selectedProject || ''}
                onChange={e => setSelectedProject(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[200px]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <Button 
                onClick={() => setShowForm(true)} 
                disabled={!selectedProject || boqItems.length === 0}
                size="sm"
                className={cn(
                  !selectedProject || !projects.find(p => p.id === selectedProject)?.is_budget_signed ? "bg-slate-300 pointer-events-none opacity-50" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                <Icon name="add" size={14} className="mr-1.5" />
                New Request
              </Button>
            </div>
          </div>

          {/* Budget Signing Warning */}
          {selectedProject && !loading && !projects.find(p => p.id === selectedProject)?.is_budget_signed && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="verified" className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Budget Authorization Required</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  You must digitally sign the construction budget before you can procure materials for this project.
                </p>
              </div>
              <Link to="/builder/measurements" search={{ projectId: selectedProject }}>
                <Button variant="outline" className="mt-2 border-amber-200 hover:bg-amber-100 text-amber-700">
                  <Icon name="edit_note" size={16} className="mr-2" />
                  Sign Budget Now
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Cards */}
          {selectedProject && !loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Budget Items</p>
                  <span className="text-2xl font-bold text-slate-900">{boqItems.length}</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Requests</p>
                  <span className="text-2xl font-bold text-amber-600">
                    {requests.filter(r => r.status === 'PENDING').length}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Approved</p>
                  <span className="text-2xl font-bold text-emerald-600">
                    {requests.filter(r => r.status === 'APPROVED' || r.status === 'ORDERED').length}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Delivered</p>
                  <span className="text-2xl font-bold text-blue-600">
                    {requests.filter(r => r.status === 'DELIVERED').length}
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* BOQ Items List */}
          <Card>
            <CardContent className="p-0">
              {!selectedProject ? (
                <div className="text-center py-12">
                  <Icon name="assignment" size={36} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Select a project to view materials.</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="progress_activity" className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : !projects.find(p => p.id === selectedProject)?.is_budget_signed ? (
                <div className="text-center py-12">
                   <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Icon name="lock" size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Procurement Locked</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Material procurement is only available for authorized budgets.
                  </p>
                </div>
              ) : boqItems.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="inventory_2" size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Material Items</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                    This project has no material budget items. Add items to the construction budget first.
                  </p>
                  <Link to="/builder/measurements">
                    <Button variant="outline" size="sm">
                      Go to Budget
                    </Button>
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase">BOQ Item</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-right">Quantity</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Unit</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-right">Rate</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-right">Total</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map(item => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.item_name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">
                          {parseFloat(item.quantity).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">
                          ${parseFloat(item.rate).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                          ${parseFloat(item.total_amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {
                              setForm({
                                boq_item: String(item.id),
                                material_name: item.item_name,
                                quantity_requested: item.quantity,
                                unit: item.unit,
                                notes: '',
                                procurement_method: 'SELF',
                                price_at_request: item.rate,
                                transport_cost: '0',
                                group_buy_deduction: '0',
                              })
                              setShowForm(true)
                            }}
                          >
                            <Icon name="shopping_cart" size={14} className="mr-1" />
                            Procure
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Material Requests History */}
          {requests.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Request History</h3>
                <div className="space-y-2">
                  {requests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          request.status === 'DELIVERED' ? 'bg-blue-500' :
                          request.status === 'APPROVED' ? 'bg-emerald-500' :
                          'bg-amber-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {request.material_name} 
                            <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                              {request.procurement_method === 'GROUP_BUY' ? 'Group Buy' : 'Self'}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.quantity_requested} {request.unit} • Total: ${request.total_calculated_cost} • {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        request.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        request.status === 'ORDERED' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Request Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon name="local_shipping" className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Procure Materials</h3>
                      <p className="text-xs text-slate-500">{form.material_name} • {form.quantity_requested} {form.unit}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon name="close" size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                  {/* Procurement Method Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Self Procure Option */}
                    <div 
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer",
                        form.procurement_method === 'SELF' 
                          ? "border-blue-600 bg-blue-50/30" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                      onClick={() => setForm({
                        ...form, 
                        procurement_method: 'SELF',
                        transport_cost: '150',
                        group_buy_deduction: '0'
                      })}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">Procure Yourself</h4>
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          form.procurement_method === 'SELF' ? "border-blue-600" : "border-slate-300"
                        )}>
                          {form.procurement_method === 'SELF' && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">Individual procurement. You handle separate logistics ($150 fee).</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900">
                          ${parseFloat(form.price_at_request).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">/ {form.unit}</span>
                      </div>
                    </div>

                    {/* Group Buy Option */}
                    <div 
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer",
                        form.procurement_method === 'GROUP_BUY' 
                          ? "border-emerald-600 bg-emerald-50/30" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                      onClick={() => {
                        // Shared transport simulation
                        const transport = 50 // Fixed simulated shared transport
                        setForm({
                          ...form, 
                          procurement_method: 'GROUP_BUY',
                          transport_cost: String(transport),
                          group_buy_deduction: '0'
                        })
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900">Group Buy</h4>
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Best Value Transport</span>
                        </div>
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                          form.procurement_method === 'GROUP_BUY' ? "border-emerald-600" : "border-slate-300"
                        )}>
                          {form.procurement_method === 'GROUP_BUY' && <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">Shared bulk logistics with other local projects. Reduced shared fee ($50).</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-emerald-700">
                          ${parseFloat(form.price_at_request).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">/ {form.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Totals */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Material Cost ({form.quantity_requested} × ${form.price_at_request})</span>
                      <span className="font-medium text-slate-900">${(parseFloat(form.quantity_requested) * parseFloat(form.price_at_request)).toLocaleString()}</span>
                    </div>
                    
                    {form.procurement_method === 'GROUP_BUY' ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Icon name="groups" size={14} />
                          Shared Bulk Transport
                        </span>
                        <span className="font-medium text-emerald-700">+ ${parseFloat(form.transport_cost).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Individual Logistics Fee</span>
                        <span className="font-medium text-amber-600">+ ${parseFloat(form.transport_cost).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Calculated Cost</p>
                        <p className="text-2xl font-black text-slate-900">
                          ${(
                            parseFloat(form.quantity_requested) * parseFloat(form.price_at_request) + 
                            parseFloat(form.transport_cost) - 
                            parseFloat(form.group_buy_deduction)
                          ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400">Payment will be deducted</p>
                        <p className="text-[9px] text-slate-400">from project escrow</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Notes</label>
                    <textarea 
                      value={form.notes} 
                      onChange={e => setForm({...form, notes: e.target.value})} 
                      rows={2}
                      className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 mt-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                      placeholder="e.g. Deliver to rear entrance, call upon arrival..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className={cn(
                      "px-8 font-bold",
                      form.procurement_method === 'GROUP_BUY' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                    )}
                    disabled={saving || !form.material_name || !form.quantity_requested || parseFloat(form.quantity_requested) <= 0}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Icon name="sync" size={18} className="animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Order'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}

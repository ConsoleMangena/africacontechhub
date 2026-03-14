import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { BOQItem } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId/material-requests',
)({
  component: MaterialRequestsPage,
})

interface MaterialRequest {
  id: number
  boq_item: number
  material_name: string
  quantity_requested: string
  unit: string
  status: 'pending' | 'approved' | 'ordered' | 'delivered'
  notes: string
  created_at: string
}

function MaterialRequestsPage() {
  const { projectId } = Route.useParams()
  const pid = Number(projectId)
  const [boqItems, setBoqItems] = useState<BOQItem[]>([])
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    boq_item: '',
    material_name: '',
    quantity_requested: '',
    unit: '',
    notes: '',
  })

  const fetchData = async () => {
    try {
      // Fetch BOQ items for the project
      const boqRes = await builderApi.getProjectBOQItems(pid)
      const items = Array.isArray(boqRes.data) ? boqRes.data : (boqRes.data as any).results || []
      setBoqItems(items.filter((item: BOQItem) => 
        item.category.includes('Concrete') || 
        item.category.includes('Brickwork') || 
        item.category.includes('Roof') ||
        item.category.includes('Timber') ||
        item.category.includes('Plumbing') ||
        item.category.includes('Electrical') ||
        item.category.includes('Finishes')
      ))
    } catch { 
      toast.error('Failed to load BOQ items')
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [pid])

  const handleSubmit = async () => {
    if (!form.material_name || !form.quantity_requested) return
    setSaving(true)
    try {
      // Create material request
      await builderApi.createMaterialRequest({
        project: pid as any,
        boq_item: form.boq_item ? Number(form.boq_item) : undefined,
        material_name: form.material_name,
        quantity_requested: form.quantity_requested,
        unit: form.unit,
        notes: form.notes,
      })
      setForm({ boq_item: '', material_name: '', quantity_requested: '', unit: '', notes: '' })
      setShowForm(false)
      toast.success('Material request created')
    } catch (err) { 
      console.error(err)
      toast.error('Failed to create request')
    } finally { 
      setSaving(false) 
    }
  }

  const selectedBOQItem = boqItems.find(item => item.id === Number(form.boq_item))

  if (loading) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center py-12">
            <Icon name="progress_activity" className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="w-full max-w-5xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/builder/measurements`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Icon name="arrow_left" size={18} className="text-slate-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                  <Icon name="inventory_2" size={22} className="text-emerald-600" />
                  Material Requests
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Procure materials from finalized budget</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Icon name="add" size={14} className="mr-1.5" />
              New Request
            </Button>
          </div>

          {/* Material Requests List */}
          {boqItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="inventory_2" size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Budget Items Available</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  Create your construction budget first to enable material procurement.
                </p>
                <Link to="/builder/measurements">
                  <Button variant="outline" size="sm">
                    Go to Budget
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
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
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">{parseFloat(item.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">${parseFloat(item.rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">${parseFloat(item.total_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setForm({
                                boq_item: String(item.id),
                                material_name: item.item_name,
                                quantity_requested: item.quantity,
                                unit: item.unit,
                                notes: '',
                              })
                              setShowForm(true)
                            }}
                          >
                            Request
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* New Request Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Create Material Request</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                    <Icon name="close" size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Material Name</label>
                    <input 
                      value={form.material_name} 
                      onChange={e => setForm({...form, material_name: e.target.value})} 
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="e.g. Portland Cement"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase">Quantity</label>
                      <input 
                        value={form.quantity_requested} 
                        onChange={e => setForm({...form, quantity_requested: e.target.value})} 
                        type="number"
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase">Unit</label>
                      <input 
                        value={form.unit} 
                        onChange={e => setForm({...form, unit: e.target.value})} 
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        placeholder="e.g. bags, m³"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Notes</label>
                    <textarea 
                      value={form.notes} 
                      onChange={e => setForm({...form, notes: e.target.value})} 
                      rows={3}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={saving || !form.material_name || !form.quantity_requested}
                  >
                    {saving ? 'Creating...' : 'Create Request'}
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

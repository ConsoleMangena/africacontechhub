import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { MaterialAudit } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { toast } from 'sonner'
export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId/materials',
)({
  component: MaterialsPage,
})

// Skeleton table for loading
function MaterialsSkeleton() {
    return (
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Material</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivered</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Installed</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Theoretical</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Audit</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                        <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-14 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-6 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

function MatLoadingBar() {
    return (
        <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
            <div className="h-full w-1/3 bg-amber-500 rounded-full" style={{ animation: 'matShimmer 1.2s ease-in-out infinite' }} />
            <style>{`@keyframes matShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
        </div>
    )
}

function MaterialsPage() {
    const { projectId } = Route.useParams()
    const pid = Number(projectId)
    const [audits, setAudits] = useState<MaterialAudit[]>([])
    const [loading, setLoading] = useState(true)
    const [refetching, setRefetching] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)

    // Cache
    const auditsCacheRef = useRef<Map<number, MaterialAudit[]>>(new Map())
    const [form, setForm] = useState({
        material_name: '', delivered_qty: '', installed_qty: '',
        theoretical_usage: '', actual_usage: '', unit: 'bags',
    })

    const fetchData = async () => {
        const cached = auditsCacheRef.current.get(pid)
        if (cached) {
            setAudits(cached)
            setRefetching(true)
        } else {
            setLoading(true)
        }
        try {
            const res = await builderApi.getProjectMaterialAudits(pid)
            const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
            setAudits(data)
            auditsCacheRef.current.set(pid, data)
        } catch { /* empty */ }
        finally { setLoading(false); setRefetching(false) }
    }

    useEffect(() => { fetchData() }, [pid])

    const handleSubmit = async () => {
        if (!form.material_name || !form.delivered_qty || !form.installed_qty) return
        setSaving(true)
        try {
            await builderApi.createMaterialAudit({
                project: pid as any,
                material_name: form.material_name,
                delivered_qty: form.delivered_qty,
                installed_qty: form.installed_qty,
                theoretical_usage: form.theoretical_usage || '0',
                actual_usage: form.actual_usage || '0',
                unit: form.unit,
                audit_passed: Math.abs(parseFloat(form.theoretical_usage || '0') - parseFloat(form.actual_usage || '0')) <= parseFloat(form.theoretical_usage || '1') * 0.05,
            })
            setForm({ material_name: '', delivered_qty: '', installed_qty: '', theoretical_usage: '', actual_usage: '', unit: 'bags' })
            setShowForm(false)
            await fetchData()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: number) => {
        // Optimistic delete
        const previousAudits = audits
        const updated = audits.filter(a => a.id !== id)
        setAudits(updated)
        auditsCacheRef.current.set(pid, updated)
        try {
            await builderApi.deleteMaterialAudit(id)
            toast.success('Audit deleted')
        } catch (err) {
            console.error(err)
            setAudits(previousAudits)
            auditsCacheRef.current.set(pid, previousAudits)
            toast.error('Failed to delete audit')
        }
    }

    const passedCount = audits.filter(a => a.audit_passed).length
    const failedCount = audits.filter(a => !a.audit_passed).length

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main>
                <div className="w-full space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={`/builder/project/${projectId}`} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <Icon name="arrow_left" size={18} className="text-slate-500" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                                    <Icon name="search" size={22} className="text-amber-500" />
                                    Material Audits
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">Track deliveries, installations, and usage audits</p>
                            </div>
                        </div>
                        <button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                            <Icon name="add" size={14} /> Log Delivery
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Audits</p>
                            <span className="text-2xl font-bold text-slate-900">{audits.length}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-emerald-200/50 p-4">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Passed</p>
                            <span className="text-2xl font-bold text-emerald-600">{passedCount}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-red-200/50 p-4">
                            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Failed</p>
                            <span className="text-2xl font-bold text-red-600">{failedCount}</span>
                        </div>
                    </div>

                    {/* New Audit Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-800">Log Material Delivery & Audit</h2>
                                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><Icon name="close" size={16} className="text-slate-400" /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Material Name</label>
                                    <input value={form.material_name} onChange={e => setForm({...form, material_name: e.target.value})} placeholder="e.g. Bricks, Cement, Steel" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unit</label>
                                    <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                                        <option value="bags">Bags</option>
                                        <option value="bricks">Bricks</option>
                                        <option value="tons">Tons</option>
                                        <option value="m³">m³</option>
                                        <option value="sheets">Sheets</option>
                                        <option value="units">Units</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivered Qty</label>
                                    <input value={form.delivered_qty} onChange={e => setForm({...form, delivered_qty: e.target.value})} placeholder="0" type="number" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Installed Qty</label>
                                    <input value={form.installed_qty} onChange={e => setForm({...form, installed_qty: e.target.value})} placeholder="0" type="number" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Theoretical Usage</label>
                                    <input value={form.theoretical_usage} onChange={e => setForm({...form, theoretical_usage: e.target.value})} placeholder="0" type="number" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actual Usage</label>
                                    <input value={form.actual_usage} onChange={e => setForm({...form, actual_usage: e.target.value})} placeholder="0" type="number" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setShowForm(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
                                <button onClick={handleSubmit} disabled={saving || !form.material_name || !form.delivered_qty || !form.installed_qty} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors">
                                    {saving ? 'Saving...' : 'Log & Audit'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {refetching && <MatLoadingBar />}
                        {loading ? (
                            <MaterialsSkeleton />
                        ) : audits.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                    <Icon name="search" size={24} className="text-slate-300" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">No Material Audits</h3>
                                <p className="text-xs text-slate-500">Click "Log Delivery" to add your first record.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Material</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivered</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Installed</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Theoretical</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Audit</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audits.map(audit => (
                                        <tr key={audit.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-medium text-slate-800">{audit.material_name}</span>
                                                <span className="text-[10px] text-slate-400 ml-1.5">({audit.unit})</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 font-medium">{parseFloat(audit.delivered_qty).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 font-medium">{parseFloat(audit.installed_qty).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{parseFloat(audit.theoretical_usage)} {audit.unit}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-800">{parseFloat(audit.actual_usage)} {audit.unit}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {audit.audit_passed ? <Icon name="check_circle" size={14} className="text-emerald-500" /> : <Icon name="x_circle" size={14} className="text-red-500" />}
                                                    <span className={`text-[10px] font-bold ${audit.audit_passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {audit.audit_passed ? 'PASSED' : 'FAILED'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDelete(audit.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                    <Icon name="delete" size={14} className="text-slate-400 hover:text-red-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </Main>
        </>
    )
}

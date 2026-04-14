import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { ESignatureRequest } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId/signatures',
)({
  component: SignaturesPage,
})

function SignaturesPage() {
    const { projectId } = Route.useParams()
    const pid = Number(projectId)
    const [requests, setRequests] = useState<ESignatureRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'signed' | 'rejected'>('all')
    const [form, setForm] = useState({ document_type: '', party_name: '', amount: '', due_date: '' })

    const fetchData = async () => {
        try {
            const res = await builderApi.getProjectESignatures(pid)
            setRequests(Array.isArray(res.data) ? res.data : (res.data as any).results || [])
        } catch { /* empty */ }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [pid])

    const handleSubmit = async () => {
        if (!form.document_type || !form.party_name) return
        setSaving(true)
        try {
            await builderApi.createESignatureRequest({
                project: pid as any,
                document_type: form.document_type as "payment_release" | "variation_order" | undefined,
                party_name: form.party_name,
                amount: form.amount || '0',
                due_date: form.due_date || undefined,
                status: 'pending',
            })
            setForm({ document_type: '', party_name: '', amount: '', due_date: '' })
            setShowForm(false)
            await fetchData()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await builderApi.updateESignatureRequest(id, { status } as any)
            await fetchData()
        } catch (err) { console.error(err) }
    }

    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

    const statusIcon = (status: string) => {
        if (status === 'signed') return <Icon name="check_circle" size={14} className="text-emerald-500" />
        if (status === 'rejected') return <Icon name="x_circle" size={14} className="text-red-500" />
        return <Icon name="schedule" size={14} className="text-amber-500" />
    }

    const statusBadge = (status: string) => {
        const cls = status === 'signed' ? 'bg-emerald-100 text-emerald-700' : status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${cls}`}>{status}</span>
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
                <div className="w-full space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/builder/project/$projectId" params={{ projectId }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <Icon name="arrow_back" size={24} className="text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                                    <Icon name="edit_document" size={22} className="text-indigo-600" />
                                    E-Signature Requests
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">Manage document signature requests for this project</p>
                            </div>
                        </div>
                        <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                            <Icon name="add" size={14} /> New Request
                        </button>
                    </div>

                    {/* New Request Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-800">Create Signature Request</h2>
                                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><Icon name="close" size={16} className="text-slate-400" /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Document Type</label>
                                    <select value={form.document_type} onChange={e => setForm({...form, document_type: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                        <option value="">Select type...</option>
                                        <option value="Payment Release">Payment Release</option>
                                        <option value="Variation Order">Variation Order</option>
                                        <option value="Completion Certificate">Completion Certificate</option>
                                        <option value="Contract Amendment">Contract Amendment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Party Name</label>
                                    <input value={form.party_name} onChange={e => setForm({...form, party_name: e.target.value})} placeholder="e.g. ABC Construction" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                                    <input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" type="number" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</label>
                                    <input value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setShowForm(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
                                <button onClick={handleSubmit} disabled={saving || !form.document_type || !form.party_name} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors">
                                    {saving ? 'Creating...' : 'Create Request'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                        {(['all', 'pending', 'signed', 'rejected'] as const).map(tab => (
                            <button key={tab} onClick={() => setFilter(tab)} className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors capitalize ${filter === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                {tab} {tab === 'all' ? `(${requests.length})` : `(${requests.filter(r => r.status === tab).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Icon name="progress_activity" size={24} className="animate-spin text-slate-400" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon name="edit_document" size={36} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No signature requests found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Party</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(req => (
                                        <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {statusIcon(req.status)}
                                                    <span className="text-sm font-medium text-slate-800">{req.document_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{req.party_name}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-800">${parseFloat(req.amount).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}</td>
                                            <td className="px-4 py-3">{statusBadge(req.status)}</td>
                                            <td className="px-4 py-3">
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleStatusChange(req.id, 'signed')} className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded transition-colors">Sign</button>
                                                        <button onClick={() => handleStatusChange(req.id, 'rejected')} className="text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors">Reject</button>
                                                    </div>
                                                )}
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

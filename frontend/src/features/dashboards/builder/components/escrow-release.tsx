import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { EscrowMilestone } from '@/types/api'
import { builderApi } from '@/services/api'

interface EscrowReleaseProps {
    milestones?: EscrowMilestone[];
    projectId: number;
    onSignRequest?: (milestoneId: number) => void;
    onDataChange?: () => void;
}

export function EscrowRelease({ milestones, projectId, onSignRequest, onDataChange }: EscrowReleaseProps) {
    const data = milestones || []
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', amount: '', status: 'locked' as const })

    const handleSubmit = async () => {
        if (!form.name || !form.amount) return
        setSaving(true)
        try {
            await builderApi.createEscrowMilestone({ project: projectId as any, name: form.name, amount: form.amount, status: form.status })
            setForm({ name: '', amount: '', status: 'locked' })
            setShowForm(false)
            onDataChange?.()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const totalReleased = data.filter(m => m.status === 'completed').reduce((sum, m) => sum + parseFloat(m.amount), 0)
    const totalRemaining = data.filter(m => m.status !== 'completed').reduce((sum, m) => sum + parseFloat(m.amount), 0)

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-slate-900 font-bold font-display text-base flex items-center gap-2">
                    <Icon name="lock" size={18} className="text-emerald-600" />
                    Escrow Release
                </h2>
                <button onClick={() => setShowForm(true)} className="p-1 hover:bg-slate-200 rounded-md transition-colors" title="Add milestone">
                    <Icon name="add" size={16} className="text-slate-500" />
                </button>
            </div>

            {showForm && (
                <div className="p-4 border-b border-slate-100 bg-emerald-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">New Milestone</span>
                        <button onClick={() => setShowForm(false)} className="p-0.5 hover:bg-slate-200 rounded"><Icon name="close" size={14} className="text-slate-400" /></button>
                    </div>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Milestone name" className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    <input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Amount" type="number" className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                        <option value="locked">Locked</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button onClick={handleSubmit} disabled={saving || !form.name || !form.amount} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
                        {saving ? 'Saving...' : 'Add Milestone'}
                    </button>
                </div>
            )}

            <div className="p-4 space-y-2">
                {data.length === 0 && !showForm ? (
                    <p className="text-sm text-slate-400 text-center py-4">No escrow milestones set up.</p>
                ) : data.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between gap-3 p-2.5 border border-slate-100 rounded-lg">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-slate-800 text-xs truncate">{milestone.name}</p>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                                    milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                                    : milestone.status === 'pending' ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {milestone.status === 'completed' ? 'RELEASED' : milestone.status === 'pending' ? 'PENDING' : 'LOCKED'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 font-medium">${parseFloat(milestone.amount).toLocaleString()}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-1">
                                    <div className={`h-1 rounded-full ${
                                        milestone.status === 'completed' ? 'bg-emerald-500 w-full'
                                        : milestone.status === 'pending' ? 'bg-blue-500 w-1/2'
                                        : 'bg-slate-200 w-0'
                                    }`}></div>
                                </div>
                            </div>
                        </div>
                        {milestone.status === 'pending' && (
                            <button
                                onClick={() => onSignRequest?.(milestone.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold py-1.5 px-3 rounded-md flex items-center gap-1 shrink-0"
                            >
                                <Icon name="signature" size={12} /> Sign
                            </button>
                        )}
                    </div>
                ))}

                {data.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                            <span className="text-slate-500">Released </span>
                            <span className="font-bold text-emerald-600">${totalReleased.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Remaining </span>
                            <span className="font-bold text-slate-900">${totalRemaining.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

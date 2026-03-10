import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { CapitalScheduleItem, MaterialAudit, WeatherEvent } from '@/types/api'
import { builderApi } from '@/services/api'

// ---------- CAPITAL SCHEDULER ----------

interface CapitalSchedulerProps {
    schedule?: CapitalScheduleItem[];
    projectId: number;
    onDataChange?: () => void;
}

export function JitCapitalScheduler({ schedule, projectId, onDataChange }: CapitalSchedulerProps) {
    const data = schedule || []
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ description: '', amount: '', due_date: '', status: 'upcoming' as const })

    const handleSubmit = async () => {
        if (!form.description || !form.amount || !form.due_date) return
        setSaving(true)
        try {
            await builderApi.createCapitalSchedule({ project: projectId as any, ...form })
            setForm({ description: '', amount: '', due_date: '', status: 'upcoming' })
            setShowForm(false)
            onDataChange?.()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                    <Icon name="calendar_today" size={18} className="text-blue-500" />
                    Capital Scheduler
                </h2>
                <button onClick={() => setShowForm(true)} className="p-1 hover:bg-slate-200 rounded-md transition-colors" title="Add entry">
                    <Icon name="add" size={16} className="text-slate-500" />
                </button>
            </div>

            {showForm && (
                <div className="mb-3 p-3 border border-blue-100 bg-blue-50/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">New Schedule Entry</span>
                        <button onClick={() => setShowForm(false)} className="p-0.5 hover:bg-slate-200 rounded"><Icon name="close" size={14} className="text-slate-400" /></button>
                    </div>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (e.g. Foundation Materials)" className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    <div className="grid grid-cols-2 gap-2">
                        <input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Amount" type="number" className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <input value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} type="date" className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="upcoming">Upcoming</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    <button onClick={handleSubmit} disabled={saving || !form.description || !form.amount || !form.due_date} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
                        {saving ? 'Saving...' : 'Add Entry'}
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {data.length === 0 && !showForm ? (
                    <p className="text-sm text-slate-400 text-center py-4">No schedule entries yet.</p>
                ) : data.map((item) => {
                    const isPaid = item.status === 'paid'
                    const isNext = item.status === 'upcoming'
                    const formattedDate = new Date(item.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

                    return (
                        <div key={item.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                            isPaid ? 'border-slate-100 bg-slate-50' : isNext ? 'border-blue-200 bg-blue-50/80' : 'border-red-200 bg-red-50/80'
                        }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isPaid ? 'bg-emerald-100' : isNext ? 'bg-blue-100' : 'bg-red-100'
                            }`}>
                                {isPaid ? (
                                    <Icon name="check_circle" size={14} className="text-emerald-500" />
                                ) : (
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${isNext ? 'bg-blue-600' : 'bg-red-600'}`}></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className={`font-semibold text-xs ${isPaid ? 'text-slate-900' : isNext ? 'text-blue-900' : 'text-red-900'}`}>
                                        {formattedDate}
                                    </span>
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                        isPaid ? 'text-emerald-600 bg-emerald-50' : isNext ? 'text-blue-700 bg-blue-100/50' : 'text-red-700 bg-red-100/50'
                                    }`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`text-[10px] mt-0.5 ${isPaid ? 'text-slate-600' : isNext ? 'text-blue-900 font-medium' : 'text-red-900 font-medium'}`}>
                                    {item.description} (${parseFloat(item.amount).toLocaleString()})
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

// ---------- GROUP BUY AGGREGATOR ----------

export function GroupBuyAggregator() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-border/60 p-4 text-foreground relative overflow-hidden">
            <h2 className="text-base font-bold font-display mb-2 flex items-center gap-2 text-indigo-950">
                <Icon name="group" size={18} className="text-indigo-600" />
                Group Buy Aggregator
            </h2>
            <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100 mb-3">
                <p className="text-[10px] text-slate-600 mb-2">3 nearby projects ordering PPC cement.</p>
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-indigo-100">
                    <span className="text-slate-500">Your Retail Transport:</span>
                    <span className="line-through text-slate-400">$200.00</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1.5">
                    <span className="font-bold text-slate-700">Shared Bulk Transport:</span>
                    <span className="text-lg font-bold text-emerald-600">$50.00</span>
                </div>
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-sm border border-emerald-600">
                Join Cement Pool & Save $150
            </button>
        </section>
    )
}

// ---------- INFLATION SHIELD ----------

export function InflationShield() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-bold font-display text-slate-900 mb-2 flex items-center gap-2">
                <Icon name="trending_down" size={18} className="text-emerald-500" />
                Inflation Shield
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded text-[10px] uppercase tracking-wider mr-1">Currency Alert</span>
                Buying bricks in USD today is <strong className="text-slate-900">15% cheaper</strong> than converting to ZiG at the parallel rate.
            </p>
        </section>
    )
}

// ---------- ACT OF GOD / WEATHER VALIDATOR ----------

interface WeatherValidatorProps {
    events?: WeatherEvent[];
    projectId: number;
    onDataChange?: () => void;
}

export function ActOfGodValidator({ events, projectId, onDataChange }: WeatherValidatorProps) {
    const data = events || []
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ contractor_claim: '', claimed_delay_days: '', actual_rainfall_mm: '', date: '' })

    const handleSubmit = async () => {
        if (!form.contractor_claim || !form.claimed_delay_days || !form.date) return
        setSaving(true)
        try {
            await builderApi.createWeatherEvent({
                project: projectId as any,
                contractor_claim: form.contractor_claim,
                claimed_delay_days: parseInt(form.claimed_delay_days),
                actual_rainfall_mm: form.actual_rainfall_mm || '0',
                date: form.date,
                verdict: 'pending',
            })
            setForm({ contractor_claim: '', claimed_delay_days: '', actual_rainfall_mm: '', date: '' })
            setShowForm(false)
            onDataChange?.()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const event = data.length > 0 ? data[0] : null

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                    <Icon name="rainy" size={18} className="text-blue-500" />
                    Weather Validator
                </h2>
                <button onClick={() => setShowForm(true)} className="p-1 hover:bg-slate-200 rounded-md transition-colors" title="Log claim">
                    <Icon name="add" size={16} className="text-slate-500" />
                </button>
            </div>

            {showForm && (
                <div className="mb-3 p-3 border border-blue-100 bg-blue-50/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Log Weather Claim</span>
                        <button onClick={() => setShowForm(false)} className="p-0.5 hover:bg-slate-200 rounded"><Icon name="close" size={14} className="text-slate-400" /></button>
                    </div>
                    <textarea value={form.contractor_claim} onChange={e => setForm({...form, contractor_claim: e.target.value})} placeholder="Contractor's claim description" rows={2} className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                    <div className="grid grid-cols-3 gap-2">
                        <input value={form.claimed_delay_days} onChange={e => setForm({...form, claimed_delay_days: e.target.value})} placeholder="Delay days" type="number" className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <input value={form.actual_rainfall_mm} onChange={e => setForm({...form, actual_rainfall_mm: e.target.value})} placeholder="Rainfall (mm)" type="number" step="0.1" className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} type="date" className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                    <button onClick={handleSubmit} disabled={saving || !form.contractor_claim || !form.claimed_delay_days || !form.date} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
                        {saving ? 'Saving...' : 'Log Claim'}
                    </button>
                </div>
            )}

            {!event && !showForm ? (
                <p className="text-sm text-slate-400 text-center py-4">No weather claims filed.</p>
            ) : event && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Contractor Log:</span>
                        <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                            {event.claimed_delay_days}-DAY RAIN DELAY
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-700/90 italic border-l-2 border-slate-300 pl-2 mb-2">
                        "{event.contractor_claim}"
                    </p>
                    <div className="bg-white p-2 rounded border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-500"></div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Icon name="gpp_good" size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-semibold text-slate-800">Weather Audit:</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mb-2">
                            Verified: <span className="text-emerald-600 font-bold">{parseFloat(event.actual_rainfall_mm).toFixed(1)}mm</span> rain.
                        </p>
                        <div className={`text-[10px] font-bold ${
                            event.verdict === 'approved' ? 'text-emerald-600' : event.verdict === 'rejected' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                            {event.verdict === 'approved' ? 'Delay Approved' : event.verdict === 'rejected' ? 'Delay Rejected' : 'Pending Review'}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

// ---------- MATERIAL DETECTIVE ----------

interface MaterialDetectiveProps {
    audits?: MaterialAudit[];
    projectId: number;
    onManage?: () => void;
}

export function MaterialDetective({ audits, projectId, onManage }: MaterialDetectiveProps) {
    const data = audits || []
    const audit = data.length > 0 ? data[0] : null

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                    <Icon name="search" size={18} className="text-amber-500" />
                    Material Detective
                </h2>
                {onManage && (
                    <button onClick={onManage} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">
                        Manage
                    </button>
                )}
            </div>
            
            {!audit ? (
                <p className="text-sm text-slate-400 text-center py-4">No material audits recorded.</p>
            ) : (
                <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Delivery vs. Install Verification</h3>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-600 font-medium">Delivered</span>
                            <span className="font-bold text-slate-900">{parseFloat(audit.delivered_qty).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Installed</span>
                            <span className="font-bold text-slate-900">{parseFloat(audit.installed_qty).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className={`${audit.audit_passed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'} border rounded-lg p-3`}>
                        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Theoretical vs. Actual</h3>
                        <p className="text-[10px] text-slate-700 mb-2 leading-relaxed">
                            Based on {parseFloat(audit.installed_qty).toLocaleString()} {audit.material_name}, Theoretical Usage is <span className="font-bold">{parseFloat(audit.theoretical_usage)} {audit.unit}</span>.
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100/50">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-medium">Used:</span>
                                <span className="text-xs font-bold text-slate-900">{parseFloat(audit.actual_usage)} {audit.unit}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                audit.audit_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {audit.audit_passed ? 'Audit Passed' : 'Audit Failed'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

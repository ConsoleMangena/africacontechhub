import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SiteUpdate, ESignatureRequest } from '@/types/api'

interface ActionCenterProps {
    unverifiedUpdates: SiteUpdate[];
    onAuthorize?: (updateId: number) => void;
}

export function ActionCenter({ unverifiedUpdates, onAuthorize }: ActionCenterProps) {
    const [unlockedUpdates, setUnlockedUpdates] = useState<number[]>([])

    const handleUnlock = (id: number) => {
        setUnlockedUpdates(prev => [...prev, id])
        if (onAuthorize) {
            onAuthorize(id)
        }
    }

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-slate-900 text-base font-bold font-display flex items-center gap-2">
                    <Icon name="security" size={18} className="text-blue-500" />
                    Action Center
                </h2>
                {unverifiedUpdates.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {unverifiedUpdates.length - unlockedUpdates.length} Actions Required
                    </span>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                {unverifiedUpdates.length === 0 ? (
                    <div className="px-6 py-6 flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-full">
                            <Icon name="security" size={20} className="text-slate-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 text-sm">Fortress Secure</h3>
                            <p className="text-xs text-slate-500 mt-0.5">No pending site updates require your authorization.</p>
                        </div>
                    </div>
                ) : (
                    unverifiedUpdates.map((update) => {
                        const isUnlocked = unlockedUpdates.includes(update.id)
                        
                        return (
                            <div key={update.id} className={`p-6 transition-colors ${isUnlocked ? 'bg-emerald-50/50' : 'bg-orange-50/50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full mt-1 shrink-0 ${isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {isUnlocked ? <Icon name="unlock" size={24} /> : <Icon name="lock" size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-semibold text-slate-900 truncate pr-2">
                                                Zero-Rework Gate
                                            </h3>
                                            <span className="text-xs text-slate-500 shrink-0">
                                                {new Date(update.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <p className="text-slate-600 text-sm mb-4">
                                            {isUnlocked
                                                ? "Verified. Funds unlocked."
                                                : "Phase funds locked. Review site photo and authorize release."}
                                        </p>

                                        {!isUnlocked ? (
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                                <div className="h-20 w-32 bg-slate-200 rounded flex items-center justify-center text-slate-400 relative overflow-hidden group cursor-pointer shrink-0">
                                                    {update.image ? (
                                                        <img src={update.image} alt="Site progress" className="absolute inset-0 w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon name="camera" size={24} className="z-10 group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <div className="absolute inset-0 bg-slate-800/10 group-hover:bg-slate-800/30 transition-colors"></div>
                                                    <span className="absolute bottom-1 right-2 text-[10px] font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">View</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Log:</p>
                                                    <p className="text-sm text-slate-800 truncate mb-2" title={update.description}>
                                                        "{update.description}"
                                                    </p>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Audit:</p>
                                                    <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
                                                        <Icon name="alert_triangle" size={14} /> Pending Client Review
                                                    </p>
                                                </div>
                                                <div className="w-full sm:w-auto">
                                                    <button
                                                        onClick={() => handleUnlock(update.id)}
                                                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                                                    >
                                                        Authorize
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="check_circle" size={16} /> Update Verified
                                                </div>
                                                <span className="text-xs opacity-80 truncate ml-2">"{update.description}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}

// ---------- E-SIGNATURES PENDING ----------

interface ESignaturesPendingProps {
    requests?: ESignatureRequest[];
    projectId?: number;
}

export function ESignaturesPending({ requests, projectId }: ESignaturesPendingProps) {
    const data = requests || []
    const pendingCount = data.filter(r => r.status === 'pending').length

    if (data.length === 0) {
        return (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-slate-900 text-base font-bold font-display flex items-center gap-2">
                        <Icon name="check_circle" size={18} className="text-indigo-600" />
                        E-Signature Pending
                    </h2>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-bold">
                        0 Pending
                    </span>
                </div>
                <div className="px-6 py-8 flex-1 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-slate-400">No pending signatures.</p>
                    {projectId && (
                        <Link to={`/builder/project/${projectId}/signatures`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Manage Signatures →
                        </Link>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-slate-900 text-base font-bold font-display flex items-center gap-2">
                    <Icon name="check_circle" size={18} className="text-indigo-600" />
                    E-Signature Pending
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
                    {pendingCount} Pending
                </span>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
                {data.map((req) => (
                    <div key={req.id} className="p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-sm text-slate-900">
                                    {req.document_type === 'payment_release' ? 'Payment Release' : 'Variation Order'}
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {req.party_name} • {req.due_date}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Amount:</p>
                                <span className="text-sm font-bold text-slate-900">${parseFloat(req.amount).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md text-xs font-semibold transition-colors">
                                Sign
                            </button>
                            <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded-md text-xs font-semibold transition-colors">
                                Review
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                {projectId ? (
                    <Link to={`/builder/project/${projectId}/signatures`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View All Signatures →
                    </Link>
                ) : (
                    <span className="text-xs font-bold text-indigo-600">View All Signatures</span>
                )}
            </div>
        </section>
    )
}

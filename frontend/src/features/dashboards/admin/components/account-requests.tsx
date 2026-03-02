import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/services/api'
import { toast } from 'sonner'
import {
    Clock, CheckCircle2, XCircle, User, Briefcase,
    RefreshCw, Loader2
} from 'lucide-react'

interface AccountRequest {
    id: number
    user_id: number
    email: string
    first_name: string
    last_name: string
    requested_role: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    created_at: string
    reviewed_at: string | null
    reviewed_by: string | null
    notes: string | null
}

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
}

const ROLE_COLORS: Record<string, string> = {
    BUILDER: 'bg-blue-50 text-blue-700 border-blue-200',
    CONTRACTOR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SUPPLIER: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function AccountRequests() {
    const [requests, setRequests] = useState<AccountRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchRequests = async (isPoll = false) => {
        try {
            if (!isPoll) setLoading(true)
            const res = await adminApi.getRequests()
            setRequests(res.data)
        } catch {
            if (!isPoll) toast.error('Failed to load account requests')
        } finally {
            if (!isPoll) setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
        const intervalId = setInterval(() => fetchRequests(true), 10000)
        return () => clearInterval(intervalId)
    }, [])

    const handleReview = async (id: number, action: 'approve' | 'reject') => {
        setActionLoading(id)
        try {
            await adminApi.reviewRequest(id, action)
            toast.success(action === 'approve' ? 'Account approved' : 'Account rejected')
            await fetchRequests()
        } catch {
            toast.error('Action failed. Please try again.')
        } finally {
            setActionLoading(null)
        }
    }

    const pending = requests.filter(r => r.status === 'PENDING')
    const reviewed = requests.filter(r => r.status !== 'PENDING')

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Pending
                    </span>
                    {pending.length > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            {pending.length}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchRequests()} className="gap-1.5 text-xs text-muted-foreground h-7">
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                </Button>
            </div>

            {/* Pending Requests */}
            {pending.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-lg text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No pending requests</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pending.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {req.first_name || req.last_name
                                            ? `${req.first_name} ${req.last_name}`.trim()
                                            : 'Unnamed User'
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground">{req.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`text-[10px] px-1.5 py-0 border ${ROLE_COLORS[req.requested_role] || 'bg-muted text-muted-foreground border-border'}`}>
                                            <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                                            {req.requested_role}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1 text-xs h-7 px-3"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'approve')}
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg gap-1 text-xs h-7 px-3"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'reject')}
                                >
                                    <XCircle className="h-3 w-3" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review History */}
            {reviewed.length > 0 && (
                <>
                    <div className="flex items-center gap-2 pt-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            History
                        </span>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-1.5">
                        {reviewed.map((req) => {
                            const cfg = STATUS_CONFIG[req.status]
                            return (
                                <div key={req.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        {req.status === 'APPROVED'
                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                            : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                                        <div>
                                            <p className="text-xs font-medium text-foreground">{req.email}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString() : '—'}
                                                {req.reviewed_by ? ` · ${req.reviewed_by}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] border ${cfg.color}`}>
                                        {cfg.label}
                                    </Badge>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

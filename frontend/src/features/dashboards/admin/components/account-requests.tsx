import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/services/api'
import { toast } from 'sonner'

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
    PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'schedule' },
    APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'check_circle' },
    REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200', icon: 'cancel' },
}

const ROLE_COLORS: Record<string, string> = {
    BUILDER: 'bg-blue-50 text-blue-700 border-blue-200',
    CONTRACTOR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SUPPLIER: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
}

function getInitials(first?: string, last?: string, email?: string): string {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
    if (first) return first.slice(0, 2).toUpperCase()
    if (email) return email[0].toUpperCase()
    return '?'
}

export function AccountRequests() {
    const [requests, setRequests] = useState<AccountRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [showHistory, setShowHistory] = useState(false)

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
                <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Pending Review
                    </span>
                    {pending.length > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                            {pending.length}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchRequests()} className="gap-1.5 text-xs text-muted-foreground h-7 hover:text-foreground">
                    <Icon name="refresh" className="h-3 w-3" />
                    Refresh
                </Button>
            </div>

            {/* Pending Requests */}
            {pending.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-xl text-muted-foreground bg-muted/10">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                        <Icon name="check_circle" className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">No pending account requests.</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {pending.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-amber-50/40 border border-amber-100/80 hover:border-amber-200 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 text-[10px] font-bold">
                                    {getInitials(req.first_name, req.last_name, req.email)}
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">
                                        {req.first_name || req.last_name
                                            ? `${req.first_name} ${req.last_name}`.trim()
                                            : 'Unnamed User'
                                        }
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">{req.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge className={`text-[10px] px-1.5 py-0 border rounded-md ${ROLE_COLORS[req.requested_role] || 'bg-muted text-muted-foreground border-border'}`}>
                                            {req.requested_role}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground/70">
                                            {timeAgo(req.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md gap-1 text-[11px] h-7 px-2.5 shadow-sm"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'approve')}
                                >
                                    {actionLoading === req.id ? (
                                        <Icon name="progress_activity" className="h-2.5 w-2.5 animate-spin" />
                                    ) : (
                                        <Icon name="check" className="h-3 w-3" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md gap-1 text-[11px] h-7 px-2.5"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'reject')}
                                >
                                    <Icon name="close" className="h-3 w-3" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review History — Collapsible */}
            {reviewed.length > 0 && (
                <div className="pt-1">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 w-full group"
                    >
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                            <Icon name={showHistory ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} className="h-3.5 w-3.5" />
                            History ({reviewed.length})
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                    </button>

                    {showHistory && (
                        <div className="space-y-1.5 mt-3 max-h-64 overflow-y-auto">
                            {reviewed.map((req) => {
                                const cfg = STATUS_CONFIG[req.status]
                                return (
                                    <div key={req.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            {req.status === 'APPROVED'
                                                ? <span className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Icon name="check" className="h-3 w-3 text-emerald-600" /></span>
                                                : <span className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Icon name="close" className="h-3 w-3 text-red-500" /></span>}
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-foreground truncate">{req.email}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {req.reviewed_at ? timeAgo(req.reviewed_at) : '—'}
                                                    {req.reviewed_by ? ` · by ${req.reviewed_by}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`text-[10px] border rounded-md ${cfg.color}`}>
                                            {cfg.label}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

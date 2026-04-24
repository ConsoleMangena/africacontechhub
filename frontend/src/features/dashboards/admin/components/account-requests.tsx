import { Icon } from '@/components/ui/material-icon'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/services/api'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState<'ALL' | AccountRequest['status']>('PENDING')
    const [createdFrom, setCreatedFrom] = useState('')
    const [createdTo, setCreatedTo] = useState('')
    const [pendingPage, setPendingPage] = useState(1)
    const [historyPage, setHistoryPage] = useState(1)
    const [pageSize, setPageSize] = useState<'5' | '10' | '25'>('10')

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

    const createdFromDate = createdFrom ? new Date(`${createdFrom}T00:00:00`) : null
    const createdToDate = createdTo ? new Date(`${createdTo}T23:59:59`) : null

    const filtered = requests.filter((r) => {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
        if (roleFilter !== 'ALL' && r.requested_role !== roleFilter) return false
        if (search.trim()) {
            const q = search.toLowerCase()
            const name = `${r.first_name || ''} ${r.last_name || ''}`.trim().toLowerCase()
            if (!r.email?.toLowerCase().includes(q) && !name.includes(q)) return false
        }
        if (createdFromDate || createdToDate) {
            const createdAt = new Date(r.created_at)
            if (Number.isNaN(createdAt.getTime())) return false
            if (createdFromDate && createdAt < createdFromDate) return false
            if (createdToDate && createdAt > createdToDate) return false
        }
        return true
    })

    const pending = filtered.filter(r => r.status === 'PENDING')
    const reviewed = filtered.filter(r => r.status !== 'PENDING')

    useEffect(() => {
        setPendingPage(1)
        setHistoryPage(1)
    }, [search, roleFilter, statusFilter, createdFrom, createdTo, requests.length])

    const pendingPagination = useMemo(() => {
        const size = Number(pageSize)
        const total = pending.length
        const totalPages = Math.max(1, Math.ceil(total / size))
        const safePage = Math.min(Math.max(1, pendingPage), totalPages)
        const startIdx = (safePage - 1) * size
        const endIdx = Math.min(total, startIdx + size)
        return { size, total, totalPages, page: safePage, startIdx, endIdx, items: pending.slice(startIdx, endIdx) }
    }, [pending, pendingPage, pageSize])

    const historyPagination = useMemo(() => {
        const size = Number(pageSize)
        const total = reviewed.length
        const totalPages = Math.max(1, Math.ceil(total / size))
        const safePage = Math.min(Math.max(1, historyPage), totalPages)
        const startIdx = (safePage - 1) * size
        const endIdx = Math.min(total, startIdx + size)
        return { size, total, totalPages, page: safePage, startIdx, endIdx, items: reviewed.slice(startIdx, endIdx) }
    }, [reviewed, historyPage, pageSize])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[220px]">
                    <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search requests (name or email)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/50 focus-visible:bg-white"
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All roles</SelectItem>
                        <SelectItem value="BUILDER">Builder</SelectItem>
                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                        <SelectItem value="SUPPLIER">Supplier</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type="date"
                    value={createdFrom}
                    onChange={(e) => setCreatedFrom(e.target.value)}
                    className="h-9 text-xs w-full sm:w-[160px]"
                />
                <Input
                    type="date"
                    value={createdTo}
                    onChange={(e) => setCreatedTo(e.target.value)}
                    className="h-9 text-xs w-full sm:w-[160px]"
                />

                <Select value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                    <SelectTrigger className="h-9 w-full sm:w-[140px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 / page</SelectItem>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="25">25 / page</SelectItem>
                    </SelectContent>
                </Select>

                {(search || roleFilter !== 'ALL' || statusFilter !== 'PENDING' || createdFrom || createdTo) && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-[11px] font-bold"
                        onClick={() => {
                            setSearch('')
                            setRoleFilter('ALL')
                            setStatusFilter('PENDING')
                            setCreatedFrom('')
                            setCreatedTo('')
                        }}
                    >
                        <Icon name="close" className="h-4 w-4 mr-1.5" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Requests
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
            {pendingPagination.total === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-xl text-muted-foreground bg-muted/10">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                        <Icon name="check_circle" className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No matching requests</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingPagination.items.map((req) => (
                        <div key={req.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/40 border border-amber-100/80 hover:border-amber-200 hover:shadow-sm transition-all">
                            <div className="flex items-start sm:items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 text-xs font-bold">
                                    {getInitials(req.first_name, req.last_name, req.email)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">
                                        {req.first_name || req.last_name
                                            ? `${req.first_name} ${req.last_name}`.trim()
                                            : 'Unnamed User'
                                        }
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">{req.email}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border rounded-lg whitespace-nowrap ${ROLE_COLORS[req.requested_role] || 'bg-muted text-muted-foreground border-border'}`}>
                                            {req.requested_role}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                            <Icon name="schedule" size={10} />
                                            {timeAgo(req.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-amber-100/50">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 text-xs h-9 flex-1 lg:flex-none px-4 shadow-sm"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'approve')}
                                >
                                    {actionLoading === req.id ? (
                                        <Icon name="progress_activity" className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Icon name="check" className="h-4 w-4" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg gap-1.5 text-xs h-9 flex-1 lg:flex-none px-4"
                                    disabled={actionLoading === req.id}
                                    onClick={() => handleReview(req.id, 'reject')}
                                >
                                    <Icon name="close" className="h-4 w-4" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pendingPagination.total > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                    <div className="text-xs text-muted-foreground tabular-nums">
                        Showing {pendingPagination.startIdx + 1}-{pendingPagination.endIdx} of {pendingPagination.total} pending
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" disabled={pendingPagination.page <= 1} onClick={() => setPendingPage(1)}>First</Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={pendingPagination.page <= 1} onClick={() => setPendingPage(p => Math.max(1, p - 1))} title="Previous">
                            <Icon name="chevron_left" className="h-4 w-4" />
                        </Button>
                        <div className="text-xs text-muted-foreground tabular-nums px-2">
                            Page {pendingPagination.page} / {pendingPagination.totalPages}
                        </div>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={pendingPagination.page >= pendingPagination.totalPages} onClick={() => setPendingPage(p => Math.min(pendingPagination.totalPages, p + 1))} title="Next">
                            <Icon name="chevron_right" className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs" disabled={pendingPagination.page >= pendingPagination.totalPages} onClick={() => setPendingPage(pendingPagination.totalPages)}>Last</Button>
                    </div>
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
                            {historyPagination.items.map((req) => {
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

                    {showHistory && historyPagination.total > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                            <div className="text-xs text-muted-foreground tabular-nums">
                                Showing {historyPagination.startIdx + 1}-{historyPagination.endIdx} of {historyPagination.total} history
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={historyPagination.page <= 1} onClick={() => setHistoryPage(1)}>First</Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={historyPagination.page <= 1} onClick={() => setHistoryPage(p => Math.max(1, p - 1))} title="Previous">
                                    <Icon name="chevron_left" className="h-4 w-4" />
                                </Button>
                                <div className="text-xs text-muted-foreground tabular-nums px-2">
                                    Page {historyPagination.page} / {historyPagination.totalPages}
                                </div>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={historyPagination.page >= historyPagination.totalPages} onClick={() => setHistoryPage(p => Math.min(historyPagination.totalPages, p + 1))} title="Next">
                                    <Icon name="chevron_right" className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={historyPagination.page >= historyPagination.totalPages} onClick={() => setHistoryPage(historyPagination.totalPages)}>Last</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

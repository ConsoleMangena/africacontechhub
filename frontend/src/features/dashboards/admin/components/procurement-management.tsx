import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
    ORDERED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const CATEGORY_LABELS: Record<string, string> = {
    MATERIAL: 'Building Material',
    LABOUR: 'Labour',
    PLANT: 'Plant & Equipment',
    PROFESSIONAL: 'Professional Fee',
    ADMIN: 'Admin & Expense',
    OTHER: 'Other',
}

export function ProcurementManagement() {
    const [requests, setRequests] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setIsLoading(true)
        try {
            const params: any = {}
            if (statusFilter !== 'ALL') params.status = statusFilter
            if (categoryFilter !== 'ALL') params.category = categoryFilter
            
            const res = await adminApi.getProcurementRequests(params)
            setRequests(res.data.requests || [])
            setSummary(res.data.summary)
        } catch (error) {
            console.error("Failed to fetch procurement requests", error)
            toast.error('Failed to load procurement data')
        } finally {
            setIsLoading(false)
        }
    }

    // Refetch when filters change
    useEffect(() => {
        fetchRequests()
    }, [statusFilter, categoryFilter])

    const filteredRequests = useMemo(() => {
        if (!search.trim()) return requests
        const q = search.toLowerCase()
        return requests.filter(r => 
            r.material_name?.toLowerCase().includes(q) ||
            r.project_title?.toLowerCase().includes(q) ||
            r.owner_email?.toLowerCase().includes(q)
        )
    }, [requests, search])

    if (isLoading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Requests</p>
                        <p className="text-xl font-bold">{summary.total_requests}</p>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Pending Approval</p>
                        <p className="text-xl font-bold text-amber-600">{summary.pending_requests}</p>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Value</p>
                        <p className="text-xl font-bold text-emerald-600">${summary.total_cost.toLocaleString()}</p>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">System Health</p>
                        <p className="text-xl font-bold text-indigo-600">Stable</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                    <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search by material, project or owner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 text-sm bg-muted/30 border-border/50"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10 w-[140px] text-xs font-medium border-border/50 bg-muted/30">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="ORDERED">Ordered</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-10 w-[160px] text-xs font-medium border-border/50 bg-muted/30">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="MATERIAL">Building Material</SelectItem>
                            <SelectItem value="LABOUR">Labour</SelectItem>
                            <SelectItem value="PLANT">Plant & Equipment</SelectItem>
                            <SelectItem value="PROFESSIONAL">Professional Fee</SelectItem>
                            <SelectItem value="ADMIN">Admin & Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => fetchRequests()} className="h-10 w-10 shrink-0 text-muted-foreground">
                        <Icon name="refresh" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[200px]">Item / Request</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[180px]">Project</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[120px]">Category</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[120px]">Cost</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[100px]">Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase text-muted-foreground min-w-[100px]">Requested</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <Icon name="inventory_2" className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No procurement requests found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="hover:bg-muted/20 transition-colors group">
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <p className="text-[13px] font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                                                    {req.material_name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Qty: {req.quantity_requested} {req.unit} @ ${req.price_at_request}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <p className="text-[13px] font-medium text-foreground truncate max-w-[160px]">
                                                    {req.project_title}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                                    {req.owner_email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] font-medium border-border/60">
                                                {CATEGORY_LABELS[req.procurement_category] || req.procurement_category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-[13px] font-bold text-foreground">
                                                ${req.total_calculated_cost.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                                {req.procurement_method === 'GROUP_BUY' ? 'Group Buy' : 'Self'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-[10px] font-bold rounded-lg ${STATUS_STYLES[req.status] || ''}`}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

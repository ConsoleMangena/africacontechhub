import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
}

const statusConfig: Record<string, { color: string; icon: string; bg: string }> = {
    PLANNING: { color: 'text-slate-900', icon: 'edit_note', bg: 'bg-slate-100' },
    IN_PROGRESS: { color: 'text-slate-900', icon: 'construction', bg: 'bg-slate-50' },
    COMPLETED: { color: 'text-white', icon: 'check_circle', bg: 'bg-slate-900' },
    ON_HOLD: { color: 'text-slate-500', icon: 'pause_circle', bg: 'bg-slate-100' },
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-900 transition-all duration-300 group shadow-none">
            <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0`}>
                    <Icon name={icon} size={18} className="text-slate-400" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                    <p className="text-lg font-bold tracking-tight text-slate-900">{value}</p>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

export function AdminProjects() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [tierFilter, setTierFilter] = useState<'ALL' | 'DIT' | 'DIFY'>('ALL')
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [createdFrom, setCreatedFrom] = useState('')
    const [createdTo, setCreatedTo] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['admin-projects', search, statusFilter],
        queryFn: async () => {
            const params: any = {}
            if (search) params.search = search
            if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter
            return (await adminApi.getProjects(params)).data
        },
    })

    if (isLoading) return <Loading fullPage text="Loading projects..." />

    const projects = data?.projects ?? []
    const summary = data?.summary ?? {}
    const byStatus = summary.by_status ?? {}

    const parsedBudgetMin = budgetMin.trim() ? Number(budgetMin) : null
    const parsedBudgetMax = budgetMax.trim() ? Number(budgetMax) : null
    const createdFromDate = createdFrom ? new Date(`${createdFrom}T00:00:00`) : null
    const createdToDate = createdTo ? new Date(`${createdTo}T23:59:59`) : null

    const filteredProjects = projects.filter((p: any) => {
        if (tierFilter !== 'ALL' && p.engagement_tier !== tierFilter) return false

        const budgetVal = typeof p.budget === 'number' ? p.budget : Number(p.budget ?? 0)
        if (parsedBudgetMin !== null && !Number.isNaN(parsedBudgetMin) && budgetVal < parsedBudgetMin) return false
        if (parsedBudgetMax !== null && !Number.isNaN(parsedBudgetMax) && budgetVal > parsedBudgetMax) return false

        if (createdFromDate || createdToDate) {
            const createdAt = p.created_at ? new Date(p.created_at) : null
            if (!createdAt || Number.isNaN(createdAt.getTime())) return false
            if (createdFromDate && createdAt < createdFromDate) return false
            if (createdToDate && createdAt > createdToDate) return false
        }
        return true
    })

    const clearExtraFilters = () => {
        setTierFilter('ALL')
        setBudgetMin('')
        setBudgetMax('')
        setCreatedFrom('')
        setCreatedTo('')
    }

    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                    <Icon name="business" className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight">Projects Overview</h1>
                    <p className="text-sm text-muted-foreground">Browse and monitor all platform projects across users.</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Projects" value={summary.total ?? 0} icon="folder" />
                <StatCard title="Planning" value={byStatus.PLANNING ?? 0} icon="edit_note" />
                <StatCard title="In Progress" value={byStatus.IN_PROGRESS ?? 0} icon="construction" />
                <StatCard title="Completed" value={byStatus.COMPLETED ?? 0} icon="check_circle" />
                <StatCard title="Total Budget" value={`$${(summary.total_budget ?? 0).toLocaleString()}`} icon="attach_money" />
            </div>

            {/* Projects Table */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Icon name="list" className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                Project Directory
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                                {(tierFilter !== 'ALL' || budgetMin || budgetMax || createdFrom || createdTo) && (
                                    <span className="text-muted-foreground/70"> (filtered)</span>
                                )}
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Search projects, owners, locations..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 text-xs w-full sm:w-[240px]"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PLANNING">Planning</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as any)}>
                                <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                                    <SelectValue placeholder="Engagement tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Tiers</SelectItem>
                                    <SelectItem value="DIT">DIT</SelectItem>
                                    <SelectItem value="DIFY">DIFY</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    placeholder="Budget min"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    className="h-8 text-xs w-full sm:w-[130px]"
                                />
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    placeholder="Budget max"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    className="h-8 text-xs w-full sm:w-[130px]"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input
                                    type="date"
                                    value={createdFrom}
                                    onChange={(e) => setCreatedFrom(e.target.value)}
                                    className="h-8 text-xs w-full sm:w-[160px]"
                                />
                                <Input
                                    type="date"
                                    value={createdTo}
                                    onChange={(e) => setCreatedTo(e.target.value)}
                                    className="h-8 text-xs w-full sm:w-[160px]"
                                />
                            </div>

                            {(tierFilter !== 'ALL' || budgetMin || budgetMax || createdFrom || createdTo) && (
                                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearExtraFilters}>
                                    <Icon name="close" size={14} className="mr-1.5" />
                                    Clear filters
                                </Button>
                            )}
                    </div>
                </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 border-t border-border/40">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <Icon name="folder_off" className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No projects found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 text-muted-foreground text-xs">
                                        <th className="text-left px-4 py-2.5 font-medium">Project</th>
                                        <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Owner</th>
                                        <th className="text-center px-4 py-2.5 font-medium">Status</th>
                                        <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Location</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Budget</th>
                                        <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">Created</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((p: any) => {
                                        const cfg = statusConfig[p.status] || statusConfig.PLANNING
                                        return (
                                            <tr
                                                key={p.id}
                                                className="border-t border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                                                onClick={() => navigate({ to: '/admin/projects/$projectId', params: { projectId: String(p.id) } })}
                                            >
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium text-xs">{p.title}</p>
                                                    <p className="text-[10px] sm:hidden text-muted-foreground">{p.owner_name}</p>
                                                </td>
                                                <td className="px-4 py-2.5 hidden sm:table-cell">
                                                    <p className="text-xs">{p.owner_name}</p>
                                                    <p className="text-[11px] text-muted-foreground">{p.owner_email}</p>
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <Badge className={`${cfg.bg} ${cfg.color} text-[10px] gap-1 px-1.5 py-0`}>
                                                        <Icon name={cfg.icon} className="h-3 w-3" />
                                                        <span className="truncate max-w-[60px] sm:max-w-none">{p.status.replace('_', ' ')}</span>
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[180px] hidden lg:table-cell">{p.location}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-xs font-medium">
                                                    ${Number(p.budget ?? 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-xs text-muted-foreground hidden md:table-cell">{timeAgo(p.created_at)}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate({ to: '/admin/projects/$projectId', params: { projectId: String(p.id) } })
                                                        }}
                                                        aria-label="View project"
                                                    >
                                                        <Icon name="visibility" className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

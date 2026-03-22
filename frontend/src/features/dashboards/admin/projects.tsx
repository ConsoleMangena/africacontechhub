import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { useState } from 'react'

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
    PLANNING: { color: 'text-blue-700', icon: 'edit_note', bg: 'bg-blue-100' },
    IN_PROGRESS: { color: 'text-amber-700', icon: 'construction', bg: 'bg-amber-100' },
    COMPLETED: { color: 'text-emerald-700', icon: 'check_circle', bg: 'bg-emerald-100' },
    ON_HOLD: { color: 'text-gray-600', icon: 'pause_circle', bg: 'bg-gray-100' },
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon name={icon} size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <p className="text-lg font-bold tracking-tight">{value}</p>
                </div>
            </div>
        </div>
    )
}

export function AdminProjects() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

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

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Icon name="business" className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight">Projects Overview</h1>
                    <p className="text-sm text-muted-foreground">Browse and monitor all platform projects across users.</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Projects" value={summary.total ?? 0} icon="folder" color="from-blue-500 to-blue-600" />
                <StatCard title="Planning" value={byStatus.PLANNING ?? 0} icon="edit_note" color="from-sky-500 to-sky-600" />
                <StatCard title="In Progress" value={byStatus.IN_PROGRESS ?? 0} icon="construction" color="from-amber-500 to-amber-600" />
                <StatCard title="Completed" value={byStatus.COMPLETED ?? 0} icon="check_circle" color="from-emerald-500 to-emerald-600" />
                <StatCard title="Total Budget" value={`$${(summary.total_budget ?? 0).toLocaleString()}`} icon="attach_money" color="from-purple-500 to-violet-600" />
            </div>

            {/* Projects Table */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center">
                                    <Icon name="list" className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                All Projects
                            </CardTitle>
                            <CardDescription className="text-xs">{projects.length} project{projects.length !== 1 ? 's' : ''} found</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search projects, owners..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-[220px] h-8 text-xs"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
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
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {projects.length === 0 ? (
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((p: any) => {
                                        const cfg = statusConfig[p.status] || statusConfig.PLANNING
                                        return (
                                            <tr key={p.id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
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
                                                <td className="px-4 py-2.5 text-right font-mono text-xs font-medium">${p.budget.toLocaleString()}</td>
                                                <td className="px-4 py-2.5 text-right text-xs text-muted-foreground hidden md:table-cell">{timeAgo(p.created_at)}</td>
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

import { Icon } from '@/components/ui/material-icon'
import { Loading } from '@/components/ui/loading'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { SystemOverview } from './components/system-overview'
import { TransactionVolume } from './components/transaction-volume'
import { UserStats } from './components/user-stats'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { Link } from '@tanstack/react-router'

function StatCard({
    title,
    value,
    sub,
    icon,
}: {
    title: string
    value: string | number
    sub: string
    icon: string
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-900 transition-all duration-300 group shadow-none">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                        {title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0`}>
                    <Icon name={icon} size={20} className="text-slate-400" />
                </div>
            </div>
            {/* Minimalist accent */}
            <div className={`absolute top-0 left-0 w-1 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
    )
}

export function AdminDashboard() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => {
            const res = await adminApi.getMetrics()
            return res.data
        }
    })

    if (isLoading) {
        return <Loading fullPage text="Preparing your dashboard..." />
    }

    const overview = metrics?.system_overview ?? {}

    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        <Icon name="space_dashboard" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight">Platform Overview</h1>
                        <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-1">
                            Real-time metrics, activity trends, and system health.
                        </p>
                    </div>
                </div>
                {/* Quick actions */}
                {(overview.pending_requests ?? 0) > 0 && (
                    <Link
                        to="/admin/users"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors w-full sm:w-auto shadow-none"
                    >
                        <Icon name="pending_actions" className="h-3.5 w-3.5" />
                        {overview.pending_requests} Pending Requests
                        <Icon name="arrow_forward" className="h-3 w-3" />
                    </Link>
                )}
            </div>

            {/* Stats */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                    title="Total Users"
                    value={metrics?.total_users ?? "—"}
                    sub="Registered accounts"
                    icon="group"
                />
                <StatCard
                    title="Active Projects"
                    value={metrics?.active_projects ?? "—"}
                    sub="Projects in progress"
                    icon="business"
                />
                <StatCard
                    title="Active Suppliers"
                    value={metrics?.active_suppliers ?? "—"}
                    sub="Verified vendors"
                    icon="inventory_2"
                />
                <StatCard
                    title="Total Volume"
                    value={`$${(metrics?.total_volume ?? 0).toLocaleString()}`}
                    sub="Platform transactions"
                    icon="monetization_on"
                />
            </div>

            {/* Charts Row */}
            <div className='grid grid-cols-1 gap-5 lg:grid-cols-7'>
                <Card className='col-span-1 lg:col-span-4 border-border/60 bg-card shadow-sm'>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="trending_up" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            Platform Analytics
                        </CardTitle>
                        <CardDescription className="text-xs">Signups, projects & AI usage (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent className='ps-2'>
                        <TransactionVolume />
                    </CardContent>
                </Card>

                <Card className='col-span-1 lg:col-span-3 border-border/60 bg-card shadow-sm'>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="pie_chart" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            User Segments
                        </CardTitle>
                        <CardDescription className="text-xs">Breakdown by user type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserStats />
                    </CardContent>
                </Card>
            </div>

            {/* System Analytics */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                        <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Icon name="monitoring" className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        System Performance
                    </CardTitle>
                    <CardDescription className="text-xs">Key platform health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                    <SystemOverview />
                </CardContent>
            </Card>
        </div>
    )
}

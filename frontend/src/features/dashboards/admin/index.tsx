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
    gradientFrom,
    gradientTo,
}: {
    title: string
    value: string | number
    sub: string
    icon: string
    gradientFrom: string
    gradientTo: string
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                        {title}
                    </p>
                    <p className="text-2xl font-bold font-display tracking-tight text-foreground">
                        {value}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon name={icon} size={22} className="text-white" />
                </div>
            </div>
            {/* Decorative gradient glow */}
            <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-[0.06] blur-2xl`} />
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
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Icon name="space_dashboard" className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
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
                        className="inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] sm:text-xs font-medium hover:bg-amber-100 transition-colors w-full sm:w-auto"
                    >
                        <Icon name="pending_actions" className="h-3.5 w-3.5" />
                        {overview.pending_requests} pending request{overview.pending_requests !== 1 ? 's' : ''}
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
                    gradientFrom="from-indigo-500"
                    gradientTo="to-indigo-600"
                />
                <StatCard
                    title="Active Projects"
                    value={metrics?.active_projects ?? "—"}
                    sub="Projects in progress"
                    icon="business"
                    gradientFrom="from-blue-500"
                    gradientTo="to-cyan-500"
                />
                <StatCard
                    title="Active Suppliers"
                    value={metrics?.active_suppliers ?? "—"}
                    sub="Verified vendors"
                    icon="inventory_2"
                    gradientFrom="from-purple-500"
                    gradientTo="to-violet-600"
                />
                <StatCard
                    title="Total Volume"
                    value={`$${(metrics?.total_volume ?? 0).toLocaleString()}`}
                    sub="Platform transactions"
                    icon="monetization_on"
                    gradientFrom="from-emerald-500"
                    gradientTo="to-green-600"
                />
            </div>

            {/* Charts Row */}
            <div className='grid grid-cols-1 gap-5 lg:grid-cols-7'>
                <Card className='col-span-1 lg:col-span-4 border-border/60 bg-card shadow-sm'>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                            <div className="h-6 w-6 rounded-md bg-indigo-50 flex items-center justify-center">
                                <Icon name="trending_up" className="h-3.5 w-3.5 text-indigo-600" />
                            </div>
                            Platform Activity
                        </CardTitle>
                        <CardDescription className="text-xs">Signups, projects & AI usage (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent className='ps-2'>
                        <TransactionVolume />
                    </CardContent>
                </Card>

                <Card className='col-span-1 lg:col-span-3 border-border/60 bg-card shadow-sm'>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                            <div className="h-6 w-6 rounded-md bg-purple-50 flex items-center justify-center">
                                <Icon name="pie_chart" className="h-3.5 w-3.5 text-purple-600" />
                            </div>
                            User Distribution
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
                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                        <div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center">
                            <Icon name="monitoring" className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        System Metrics
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

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SystemOverview } from './components/system-overview'
import { TransactionVolume } from './components/transaction-volume'
import {
    Users, Building2, Package2, DollarSign, ShieldCheck,
    Activity, TrendingUp, Settings, Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    iconBg,
    iconColor,
}: {
    title: string
    value: string | number
    sub: string
    icon: React.ElementType
    iconBg: string
    iconColor: string
}) {
    return (
        <Card className="border-border/60 bg-card hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    {title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-display tracking-tight text-foreground">
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
        </Card>
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

    return (
            <Main>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="mt-3 text-sm text-muted-foreground">Loading dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-6">


                        {/* Stats */}
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                            <StatCard
                                title="Total Users"
                                value={metrics?.total_users ?? "—"}
                                sub="Registered accounts"
                                icon={Users}
                                iconBg="bg-indigo-50"
                                iconColor="text-indigo-600"
                            />
                            <StatCard
                                title="Active Projects"
                                value={metrics?.active_projects ?? "—"}
                                sub="Projects in progress"
                                icon={Building2}
                                iconBg="bg-blue-50"
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                title="Active Suppliers"
                                value={metrics?.active_suppliers ?? "—"}
                                sub="Verified vendors"
                                icon={Package2}
                                iconBg="bg-purple-50"
                                iconColor="text-purple-600"
                            />
                            <StatCard
                                title="Total Volume"
                                value={`$${(metrics?.total_volume ?? 0).toLocaleString()}`}
                                sub="Platform transactions"
                                icon={DollarSign}
                                iconBg="bg-green-50"
                                iconColor="text-green-600"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                            <Card className='col-span-1 lg:col-span-4 border-border/60 bg-card'>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                                        Transaction Volume
                                    </CardTitle>
                                    <CardDescription className="text-xs">Monthly platform activity</CardDescription>
                                </CardHeader>
                                <CardContent className='ps-2'>
                                    <TransactionVolume />
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Analytics */}
                        <Card className="border-border/60 bg-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    System Performance Analytics
                                </CardTitle>
                                <CardDescription className="text-xs">Platform performance and technical insights</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SystemOverview />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>
    )
}

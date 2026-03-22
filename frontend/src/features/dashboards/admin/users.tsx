import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { UserManagement } from './components/user-management'
import { AccountRequests } from './components/account-requests'
import { UserStats } from './components/user-stats'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export function AdminUsers() {
    const { data: metrics } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => (await adminApi.getMetrics()).data,
        staleTime: 30_000,
    })

    const overview = metrics?.system_overview ?? {}
    const distribution: { role: string; count: number }[] = metrics?.user_distribution ?? []
    const totalUsers = metrics?.total_users ?? 0

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Icon name="group" className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-display tracking-tight text-foreground">
                            Users & Approvals
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage platform access, roles, and review pending registrations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-foreground">{totalUsers}</span>
                    <span className="text-muted-foreground">total users</span>
                </div>
                {distribution.slice(0, 4).map((d) => (
                    <div key={d.role} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card text-[11px]">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                            d.role === 'BUILDER' ? 'bg-blue-500' :
                            d.role === 'CONTRACTOR' ? 'bg-emerald-500' :
                            d.role === 'SUPPLIER' ? 'bg-amber-500' :
                            d.role === 'ADMIN' ? 'bg-purple-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-semibold text-foreground">{d.count}</span>
                        <span className="text-muted-foreground">{d.role.toLowerCase()}s</span>
                    </div>
                ))}
                {(overview.pending_requests ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-[11px]">
                        <Icon name="pending_actions" className="h-2.5 w-2.5 text-amber-600" />
                        <span className="font-semibold text-amber-700">{overview.pending_requests}</span>
                        <span className="text-amber-600">pending</span>
                    </div>
                )}
                {(overview.new_users_30d ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-[11px]">
                        <Icon name="person_add" className="h-2.5 w-2.5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">+{overview.new_users_30d}</span>
                        <span className="text-emerald-600">this month</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Account Requests */}
                    <Card className="border-border/60 bg-card shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[13px] font-semibold font-display flex items-center gap-1.5 text-foreground">
                                <div className="h-5 w-5 rounded bg-amber-50 flex items-center justify-center">
                                    <Icon name="pending_actions" className="h-3 w-3 text-amber-600" />
                                </div>
                                Account Requests
                            </CardTitle>
                            <CardDescription className="text-xs">Review and approve or reject new user registrations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountRequests />
                        </CardContent>
                    </Card>

                    {/* User Management */}
                    <Card className="border-border/60 bg-card shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[13px] font-semibold font-display flex items-center gap-1.5 text-foreground">
                                <div className="h-5 w-5 rounded bg-indigo-50 flex items-center justify-center">
                                    <Icon name="manage_accounts" className="h-3 w-3 text-indigo-600" />
                                </div>
                                User Directory
                            </CardTitle>
                            <CardDescription className="text-xs">View, edit, and manage all active user accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserManagement />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {/* User Stats/Distribution */}
                    <Card className="border-border/60 bg-card shadow-sm sticky top-36">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[13px] font-semibold font-display flex items-center gap-1.5 text-foreground">
                                <div className="h-5 w-5 rounded bg-purple-50 flex items-center justify-center">
                                    <Icon name="pie_chart" className="h-3 w-3 text-purple-600" />
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
            </div>
        </div>
    )
}

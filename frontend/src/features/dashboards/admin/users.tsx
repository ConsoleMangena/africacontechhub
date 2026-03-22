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
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                        <Icon name="group" className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-display tracking-tight text-foreground">
                            Users & Permissions
                        </h1>
                        <p className="text-[13px] text-muted-foreground font-medium">
                            Manage platform access, roles, and review pending registrations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                    <span className="font-semibold text-foreground">{totalUsers}</span>
                    <span className="text-muted-foreground">total users</span>
                </div>
                {distribution.slice(0, 4).map((d) => (
                    <div key={d.role} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wider shadow-none">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                            d.role === 'BUILDER' ? 'bg-slate-900' :
                            d.role === 'CONTRACTOR' ? 'bg-slate-600' :
                            d.role === 'SUPPLIER' ? 'bg-slate-400' :
                            d.role === 'ADMIN' ? 'bg-slate-950' : 'bg-slate-300'
                        }`} />
                        <span className="text-slate-900">{d.count}</span>
                        <span className="text-slate-500">{d.role}s</span>
                    </div>
                ))}
                {(overview.pending_requests ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-900 bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        <Icon name="pending_actions" className="h-2.5 w-2.5" />
                        <span>{overview.pending_requests} Pending</span>
                    </div>
                )}
                {(overview.new_users_30d ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-900">
                        <Icon name="person_add" className="h-2.5 w-2.5 text-slate-400" />
                        <span>+{overview.new_users_30d} New Users</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Account Requests */}
                    <Card className="border-border/60 bg-card shadow-sm">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-[14px] font-bold font-display flex items-center gap-2 text-foreground">
                                <Icon name="pending_actions" className="h-4 w-4 text-slate-400" />
                                Account Requests
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">Review and approve new registrations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountRequests />
                        </CardContent>
                    </Card>

                    {/* User Management */}
                    <Card className="border-border/60 bg-card shadow-sm">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-[14px] font-bold font-display flex items-center gap-2 text-foreground">
                                <Icon name="manage_accounts" className="h-4 w-4 text-slate-400" />
                                User Directory
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">Manage all active user accounts.</CardDescription>
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
            </div>
        </div>
    )
}

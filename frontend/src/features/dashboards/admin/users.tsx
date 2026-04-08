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
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export function AdminUsers() {
    const { data: metrics } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => (await adminApi.getMetrics()).data,
        staleTime: 30_000,
    })

    const overview = metrics?.system_overview ?? {}
    const distribution: { role: string; count: number }[] = metrics?.user_distribution ?? []
    const totalUsers = metrics?.total_users ?? 0
    const pendingCount = overview.pending_requests ?? 0

    return (
        <div className="w-full space-y-6">
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
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="col-span-2 lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total users</p>
                            <p className="text-2xl font-extrabold tracking-tight text-slate-900">{totalUsers}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">All registered accounts</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Icon name="group" className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>

                {distribution.slice(0, 4).map((d) => {
                    const dot =
                        d.role === 'BUILDER' ? 'bg-indigo-600' :
                        d.role === 'CONTRACTOR' ? 'bg-emerald-600' :
                        d.role === 'SUPPLIER' ? 'bg-amber-500' :
                        d.role === 'ADMIN' ? 'bg-slate-900' : 'bg-slate-400'
                    return (
                        <div key={d.role} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        {d.role}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                                {d.count}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">Accounts</p>
                        </div>
                    )
                })}

                <div className="col-span-2 lg:col-span-6 flex flex-wrap gap-2">
                    {(overview.pending_requests ?? 0) > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold">
                            <Icon name="pending_actions" className="h-4 w-4" />
                            <span>{overview.pending_requests} pending request{overview.pending_requests === 1 ? '' : 's'}</span>
                        </div>
                    )}
                    {(overview.new_users_30d ?? 0) > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold">
                            <Icon name="person_add" className="h-4 w-4" />
                            <span>+{overview.new_users_30d} new in 30 days</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-5">
                    <Card className="border-border/60 bg-card shadow-sm">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="text-[14px] font-bold font-display flex items-center gap-2 text-foreground">
                                <Icon name="manage_accounts" className="h-4 w-4 text-slate-400" />
                                Directory
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">
                                Switch between requests and active users. Use filters to narrow results.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6">
                            <Tabs defaultValue="users" className="w-full">
                                <TabsList className="w-full justify-start bg-muted/30 border border-border/50 rounded-xl p-1">
                                    <TabsTrigger value="users" className="text-[11px] font-bold uppercase tracking-widest gap-2">
                                        Users
                                        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-slate-900 text-white leading-none">
                                            {totalUsers}
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="requests" className="text-[11px] font-bold uppercase tracking-widest gap-2">
                                        Account Requests
                                        {pendingCount > 0 && (
                                            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="users" className="mt-4 focus-visible:outline-none">
                                    <UserManagement />
                                </TabsContent>
                                <TabsContent value="requests" className="mt-4 focus-visible:outline-none">
                                    <AccountRequests />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

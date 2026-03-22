import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
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

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PAST_DUE: 'bg-amber-100 text-amber-700',
    TRIALING: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-600',
}

export function AdminBilling() {
    const [subSearch, setSubSearch] = useState('')
    const { data, isLoading } = useQuery({
        queryKey: ['admin-billing'],
        queryFn: async () => (await adminApi.getBilling()).data,
    })

    if (isLoading) return <Loading fullPage text="Loading billing data..." />

    const summary = data?.summary ?? {}
    const plans = data?.plans ?? []
    const subscriptions = (data?.subscriptions ?? []).filter((s: any) =>
        s.user_email.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.user_name.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.plan_name.toLowerCase().includes(subSearch.toLowerCase())
    )
    const invoices = data?.invoices ?? []

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Icon name="payments" className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight">Billing & Subscriptions</h1>
                    <p className="text-sm text-muted-foreground">Manage subscription plans, view active subscriptions, and track invoices.</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Subs" value={summary.active_subscriptions ?? 0} icon="credit_card" color="from-emerald-500 to-emerald-600" />
                <StatCard title="Total Revenue" value={`$${(summary.total_revenue ?? 0).toLocaleString()}`} icon="attach_money" color="from-blue-500 to-indigo-600" />
                <StatCard title="Plans" value={summary.total_plans ?? 0} icon="loyalty" color="from-purple-500 to-violet-600" />
                <StatCard title="Total Invoices" value={summary.total_invoices ?? 0} icon="receipt_long" color="from-amber-500 to-orange-600" />
            </div>

            {/* Plans */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-purple-50 flex items-center justify-center">
                            <Icon name="loyalty" className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        Subscription Plans
                    </CardTitle>
                    <CardDescription className="text-xs">{plans.length} plan{plans.length !== 1 ? 's' : ''} configured</CardDescription>
                </CardHeader>
                <CardContent>
                    {plans.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">No subscription plans configured yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {plans.map((plan: any) => (
                                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                            <Icon name="workspace_premium" className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{plan.name}</p>
                                            <p className="text-xs text-muted-foreground">{plan.billing_period}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">${parseFloat(plan.price).toLocaleString()}</p>
                                        {plan.is_active ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-emerald-50 flex items-center justify-center">
                                    <Icon name="credit_card" className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                Active Subscriptions
                            </CardTitle>
                            <CardDescription className="text-xs">{subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}</CardDescription>
                        </div>
                        <Input
                            placeholder="Search subscribers..."
                            value={subSearch}
                            onChange={(e) => setSubSearch(e.target.value)}
                            className="max-w-[200px] h-8 text-xs"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">No subscriptions found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 text-muted-foreground text-xs">
                                        <th className="text-left px-4 py-2.5 font-medium">User</th>
                                        <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                                        <th className="text-center px-4 py-2.5 font-medium">Status</th>
                                        <th className="text-left px-4 py-2.5 font-medium">Period</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map((sub: any) => (
                                        <tr key={sub.id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-2">
                                                <p className="font-medium text-xs">{sub.user_name}</p>
                                                <p className="text-[11px] text-muted-foreground">{sub.user_email}</p>
                                            </td>
                                            <td className="px-4 py-2 text-xs">{sub.plan_name}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge className={`text-[10px] ${statusColors[sub.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {sub.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-xs text-muted-foreground">
                                                {sub.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : '—'}
                                                {' → '}
                                                {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right text-xs text-muted-foreground">{timeAgo(sub.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-amber-50 flex items-center justify-center">
                            <Icon name="receipt_long" className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        Recent Invoices
                    </CardTitle>
                    <CardDescription className="text-xs">Last {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {invoices.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">No invoices yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/30 text-muted-foreground text-xs">
                                        <th className="text-left px-4 py-2.5 font-medium">User</th>
                                        <th className="text-left px-4 py-2.5 font-medium">Plan</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Amount</th>
                                        <th className="text-center px-4 py-2.5 font-medium">Status</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv: any) => (
                                        <tr key={inv.id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-2 text-xs">{inv.user_email}</td>
                                            <td className="px-4 py-2 text-xs text-muted-foreground">{inv.plan_name}</td>
                                            <td className="px-4 py-2 text-right font-mono text-xs font-medium">${inv.amount.toLocaleString()}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Badge className={`text-[10px] ${statusColors[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {inv.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-right text-xs text-muted-foreground">{timeAgo(inv.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

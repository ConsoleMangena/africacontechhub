import { Icon } from '@/components/ui/material-icon'
import { Loading } from '@/components/ui/loading'
import { useBuilderConnections } from '../hooks/use-builder-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { Separator } from '@/components/ui/separator'

export function BuilderConnectionsView() {
    const user = useAuthStore((state) => state.auth.user)
    const role = user?.profile?.role
    const { data, isLoading, error } = useBuilderConnections(role)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Connections</CardTitle>
                </CardHeader>
                <CardContent>
                    <Loading className="py-8" text="Connecting..." />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Connections</CardTitle>
                    <CardDescription>Failed to load connections. Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const contractors = data?.contractors || []
    const suppliers = data?.suppliers || []

    if (contractors.length === 0 && suppliers.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Connections</CardTitle>
                    <CardDescription>
                        You don't have any connections yet. Start by creating projects and receiving bids or orders.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Contractors Section */}
            {contractors.length > 0 && (
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                <Icon name="work" size={20} className="text-slate-700" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900">Contractors ({contractors.length})</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">
                            Contractors who have submitted bids on your projects
                        </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {contractors.map((contractor) => (
                                <div key={contractor.id} className="p-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Icon name="domain" size={16} className="text-slate-400" />
                                                <h4 className="font-bold text-sm text-slate-900">{contractor.company_name}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Icon name="person" className="h-3 w-3" />
                                                    <span>
                                                        {contractor.user.first_name} {contractor.user.last_name}
                                                    </span>
                                                </div>
                                                {contractor.user.phone_number && (
                                                    <div className="flex items-center gap-1">
                                                        <Icon name="phone" className="h-3 w-3" />
                                                        <span>{contractor.user.phone_number}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Icon name="mail" className="h-3 w-3" />
                                                    <span>{contractor.user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-900 text-white border-slate-900 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2 shadow-none shrink-0">
                                            {contractor.bids_count} {contractor.bids_count === 1 ? 'Bid' : 'Bids'}
                                        </Badge>
                                    </div>
                                    <div className="text-xs mt-3 flex items-center gap-6">
                                        <p className="text-slate-500">
                                            <span className="font-bold text-slate-700">License:</span> {contractor.license_number}
                                        </p>
                                        <p className="text-slate-500">
                                            <span className="font-bold text-slate-700">Projects:</span> {contractor.projects.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Suppliers Section */}
            {suppliers.length > 0 && (
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                <Icon name="package_2" size={20} className="text-slate-700" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900">Suppliers ({suppliers.length})</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">
                            Suppliers who have fulfilled orders for your projects
                        </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {suppliers.map((supplier) => (
                                <div key={supplier.id} className="p-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Icon name="domain" size={16} className="text-slate-400" />
                                                <h4 className="font-bold text-sm text-slate-900">{supplier.company_name}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Icon name="person" className="h-3 w-3" />
                                                    <span>
                                                        {supplier.user.first_name} {supplier.user.last_name}
                                                    </span>
                                                </div>
                                                {supplier.user.phone_number && (
                                                    <div className="flex items-center gap-1">
                                                        <Icon name="phone" className="h-3 w-3" />
                                                        <span>{supplier.user.phone_number}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Icon name="mail" className="h-3 w-3" />
                                                    <span>{supplier.user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-900 text-white border-slate-900 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2 shadow-none shrink-0">
                                            {supplier.orders_count} {supplier.orders_count === 1 ? 'Order' : 'Orders'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs mt-3">
                                        <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                            <Icon name="trending_up" size={14} />
                                            <span>
                                                On-Time: {supplier.on_time_rate}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                                            <Icon name="warning" size={14} />
                                            <span>
                                                Defects: {supplier.defect_rate}%
                                            </span>
                                        </div>
                                        <p className="text-slate-500 ml-auto">
                                            <span className="font-bold text-slate-700">Projects:</span> {supplier.projects.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}


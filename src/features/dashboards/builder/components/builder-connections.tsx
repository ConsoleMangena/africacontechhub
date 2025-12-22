import { useBuilderConnections } from '../hooks/use-builder-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Package, Mail, Phone, User, Briefcase, TrendingUp, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function BuilderConnections() {
    const { data, isLoading, error } = useBuilderConnections()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Connections</CardTitle>
                    <CardDescription>Loading your connections...</CardDescription>
                </CardHeader>
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <CardTitle>Contractors ({contractors.length})</CardTitle>
                        </div>
                        <CardDescription>
                            Contractors who have submitted bids on your projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {contractors.map((contractor) => (
                                <div key={contractor.id} className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <h4 className="font-semibold text-lg">{contractor.company_name}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        {contractor.user.first_name} {contractor.user.last_name}
                                                    </span>
                                                </div>
                                                {contractor.user.phone_number && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{contractor.user.phone_number}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{contractor.user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            {contractor.bids_count} {contractor.bids_count === 1 ? 'Bid' : 'Bids'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-muted-foreground mb-1">
                                            <span className="font-medium">License:</span> {contractor.license_number}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="font-medium">Projects:</span> {contractor.projects.join(', ')}
                                        </p>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Suppliers Section */}
            {suppliers.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-600" />
                            <CardTitle>Suppliers ({suppliers.length})</CardTitle>
                        </div>
                        <CardDescription>
                            Suppliers who have fulfilled orders for your projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {suppliers.map((supplier) => (
                                <div key={supplier.id} className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <h4 className="font-semibold text-lg">{supplier.company_name}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        {supplier.user.first_name} {supplier.user.last_name}
                                                    </span>
                                                </div>
                                                {supplier.user.phone_number && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{supplier.user.phone_number}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{supplier.user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            {supplier.orders_count} {supplier.orders_count === 1 ? 'Order' : 'Orders'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-green-600">
                                            <TrendingUp className="h-3 w-3" />
                                            <span>
                                                <span className="font-medium">On-Time Rate:</span> {supplier.on_time_rate}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-600">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>
                                                <span className="font-medium">Defect Rate:</span> {supplier.defect_rate}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>
                                            <span className="font-medium">Projects:</span> {supplier.projects.join(', ')}
                                        </p>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}


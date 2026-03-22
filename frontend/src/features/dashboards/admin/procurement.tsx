import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ProcurementManagement } from './components/procurement-management'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export function AdminProcurement() {
    const { data: metrics } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => (await adminApi.getMetrics()).data,
        staleTime: 30_000,
    })

    const overview = metrics?.system_overview ?? {}

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Icon name="inventory_2" className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-display tracking-tight text-foreground">
                            Procurement Oversight
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor material requests, costs, and procurement status across all projects.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex flex-wrap gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground mr-1">Global Procurement Mode</span>
                </div>
                {(overview.pending_requests ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-[11px]">
                        <Icon name="notification_important" className="h-2.5 w-2.5 text-amber-600" />
                        <span className="text-amber-600">Pending Actions Required</span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[14px] font-bold font-display flex items-center gap-2 text-foreground">
                                <Icon name="list_alt" className="h-4 w-4 text-indigo-500" />
                                All Material Requests
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">
                                Real-time view of every procurement activity on the platform.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <ProcurementManagement />
                </CardContent>
            </Card>
        </div>
    )
}

import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ProfessionalManagement } from './components/professional-management'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export function AdminTeam() {
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
                        <Icon name="engineering" className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-display tracking-tight text-foreground">
                            SQB Building Team Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage professionals appearing on the public building staff portal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-card text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-muted-foreground mr-1">Portal Synchronization Active</span>
                </div>
                {(overview.active_suppliers ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-[11px]">
                        <Icon name="verified" className="h-2.5 w-2.5 text-emerald-600" />
                        <span className="text-emerald-600">Verification Engine Live</span>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[14px] font-bold font-display flex items-center gap-2 text-foreground">
                                <Icon name="groups" className="h-4 w-4 text-indigo-500" />
                                Professional Profiles
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">
                                Add, verify, and monitor specialists for the building team.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <ProfessionalManagement />
                </CardContent>
            </Card>
        </div>
    )
}

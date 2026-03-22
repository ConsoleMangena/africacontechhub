import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ProcurementManagement } from './components/procurement-management'
// Removed unused adminApi import

export function AdminProcurement() {


    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        <Icon name="inventory_2" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Procurement Control
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium">
                            Monitor material requests, costs, and fulfillment across all projects.
                        </p>
                    </div>
            </div>


            {/* Main Content */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                <Icon name="list_alt" className="h-4 w-4 text-slate-400" />
                                Procurement Log
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

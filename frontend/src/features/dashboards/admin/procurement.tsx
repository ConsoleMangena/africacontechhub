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
        <div className="w-full space-y-6">
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

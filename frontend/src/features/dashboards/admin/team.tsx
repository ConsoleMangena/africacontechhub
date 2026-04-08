import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ProfessionalManagement } from './components/professional-management'

export function AdminTeam() {


    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm shrink-0">
                        <Icon name="engineering" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            SquareBase Building Team
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium">
                            Manage specialist profiles appearing on the public building staff portal.
                        </p>
                    </div>
            </div>


            {/* Main Content */}
            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                <Icon name="groups" className="h-4 w-4 text-slate-400" />
                                Professional Directory
                            </CardTitle>
                            <CardDescription className="text-xs pt-0.5">
                                Add and monitor specialists for the building team.
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

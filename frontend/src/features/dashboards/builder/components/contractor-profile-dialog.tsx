import { Icon } from '@/components/ui/material-icon'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

interface ContractorProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contractor: {
        id: number
        company_name: string
        license_number: string
        created_at?: string
        updated_at?: string
        user: {
            id: number
            email: string
            first_name: string
            last_name: string
            phone_number: string | null
        }
        average_rating?: number | null
        ratings_count: number
        completed_projects_count: number
        projects: string[]
    } | null
}

export function ContractorProfileDialog({ open, onOpenChange, contractor }: ContractorProfileDialogProps) {
    if (!contractor) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">Contractor Profile</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                        View detailed overview for {contractor.company_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Company Information */}
                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                    <Icon name="domain" size={20} className="text-slate-700" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">{contractor.company_name}</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-500 mt-0.5">Company Details</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">License No.</div>
                                    <div className="font-mono text-sm font-bold text-slate-900">{contractor.license_number}</div>
                                </div>
                                {contractor.created_at && (
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Member Since</div>
                                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                                            <Icon name="calendar_month" size={14} className="text-slate-400" />
                                            {format(new Date(contractor.created_at), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                            <CardTitle className="text-base font-bold text-slate-900">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                <div className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="h-10 w-10 shrink-0 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
                                        <Icon name="person" size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Contact Person</div>
                                        <div className="font-bold text-slate-900 text-sm">
                                            {contractor.user.first_name} {contractor.user.last_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="h-10 w-10 shrink-0 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
                                        <Icon name="mail" size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Email</div>
                                        <div className="text-sm font-semibold text-slate-900">{contractor.user.email}</div>
                                    </div>
                                </div>
                                {contractor.user.phone_number && (
                                    <div className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 shrink-0 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
                                            <Icon name="phone" size={20} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Phone</div>
                                            <div className="text-sm font-mono font-bold text-slate-900">{contractor.user.phone_number}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rating & Performance */}
                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                            <CardTitle className="text-base font-bold text-slate-900">Rating & Performance</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500">Client ratings and project completion metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-2 gap-4">
                                {contractor.average_rating ? (
                                    <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100/50">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Icon name="star" size={24} className="text-amber-500 fill-amber-500" />
                                            <div className="text-3xl font-black font-display text-amber-600">{contractor.average_rating}</div>
                                        </div>
                                        <div className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">
                                            {contractor.ratings_count} {contractor.ratings_count === 1 ? 'Rating' : 'Ratings'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">No ratings yet</div>
                                    </div>
                                )}
                                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Icon name="task_alt" size={24} className="text-emerald-600" />
                                        <div className="text-3xl font-black font-display text-emerald-600">{contractor.completed_projects_count}</div>
                                    </div>
                                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                                        Completed {contractor.completed_projects_count === 1 ? 'Project' : 'Projects'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    {contractor.projects.length > 0 && (
                        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-900">Projects</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">History with Aspirational Builder</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="flex flex-wrap gap-2">
                                    {contractor.projects.map((project, index) => (
                                        <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold px-3 py-1">
                                            <Icon name="folder" size={12} className="mr-1.5" />
                                            {project}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {contractor.projects.length === 0 && (
                        <Card className="rounded-2xl border-slate-200 border-dashed shadow-none bg-slate-50">
                            <CardContent className="py-8 text-center flex flex-col items-center justify-center">
                                <Icon name="folder_off" size={32} className="text-slate-300 mb-3" />
                                <p className="text-sm font-bold text-slate-500">No project history yet</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState } from 'react'
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
import { builderApi } from '@/services/api'
import { Project, Milestone, Payment } from '@/types/api'
import { format } from 'date-fns'
const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
}

const tierConfig = {
    DIT: { label: 'DIT', icon: 'group', className: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
    DIFY: { label: 'DIFY', icon: 'verified_user', className: 'text-teal-600 bg-teal-100 border-teal-200' },
}

const milestoneStatusConfig = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    VERIFIED: { label: 'Verified', className: 'bg-blue-100 text-blue-800' },
    PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
}

const paymentMethodConfig = {
    CASH: 'Cash',
    SWIPE_PAYNOW: 'Swipe/Paynow',
    STRIPE: 'Stripe',
}

interface ProjectDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: number
}

export function ProjectDetailsDialog({ open, onOpenChange, projectId }: ProjectDetailsDialogProps) {
    const [project, setProject] = useState<Project | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && projectId) {
            fetchProjectDetails()
        }
    }, [open, projectId])

    const fetchProjectDetails = async () => {
        setLoading(true)
        try {
            // Fetch project
            const projectResponse = await builderApi.getProject(projectId)
            setProject(projectResponse.data)

            // Fetch milestones
            const milestonesResponse = await builderApi.getProjectMilestones(projectId)
            setMilestones(milestonesResponse.data.results)

            // Fetch payments
            const paymentsResponse = await builderApi.getProjectPayments(projectId)
            setPayments(paymentsResponse.data.results)
        } catch (error) {
            console.error('Failed to fetch project details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    const tier = project?.engagement_tier || 'DIT'
    const TierIcon = tierConfig[tier]?.icon || 'group'

    // Calculate payment summary
    const totalPaid = milestones
        .filter(m => m.status === 'PAID')
        .reduce((sum, m) => sum + parseFloat(m.amount), 0)
    const budget = project ? parseFloat(project.budget) : 0
    const remainingBalance = budget - totalPaid
    const paymentProgress = budget > 0 ? (totalPaid / budget) * 100 : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">Project Details</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                        View complete project information, milestones, and payment history
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : project ? (
                    <div className="space-y-6">
                        {/* Project Header */}
                        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-slate-900 text-white border-subtle relative">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-800 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                            <CardHeader className="relative z-10 border-b border-slate-800 bg-slate-900/50 pb-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl font-black font-display tracking-tight mb-2 text-white">{project.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs uppercase tracking-widest">
                                            <Icon name="location_on" size={14} className="text-slate-500" />
                                            {project.location}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className={`font-bold tracking-wider text-[10px] uppercase shadow-none border-0 ${tier === 'DIT' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-teal-500/20 text-teal-300'}`}>
                                            <TierIcon className="w-3 h-3 mr-1.5" />
                                            {tierConfig[tier]?.label}
                                        </Badge>
                                        <Badge className={`font-bold tracking-wider text-[10px] uppercase shadow-none border-0 ${statusConfig[project.status as keyof typeof statusConfig]?.className || statusConfig.PLANNING.className}`}>
                                            {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 p-5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Budget</div>
                                        <div className="text-lg font-mono font-bold text-white">
                                            ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Total Paid</div>
                                        <div className="text-lg font-mono font-bold text-emerald-400">
                                            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Remaining</div>
                                        <div className={`text-lg font-mono font-bold ${remainingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Progress</div>
                                        <div className="text-lg font-mono font-bold text-white">
                                            {paymentProgress.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-emerald-400 h-1.5 rounded-full transition-all"
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-900">Milestones</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">Project milestones and payment status</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {milestones.length === 0 ? (
                                    <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-50">
                                        <Icon name="flag" size={32} className="text-slate-300 mb-3" />
                                        <p className="text-sm font-bold text-slate-500">No milestones yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {milestones.map((milestone) => (
                                            <div key={milestone.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-sm text-slate-900">{milestone.name}</span>
                                                        <Badge className={`text-[10px] font-bold uppercase tracking-widest shadow-none rounded-lg px-2 shrink-0 border-0 ${milestoneStatusConfig[milestone.status as keyof typeof milestoneStatusConfig]?.className || milestoneStatusConfig.PENDING.className}`}>
                                                            {milestoneStatusConfig[milestone.status as keyof typeof milestoneStatusConfig]?.label || milestone.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                                        <Icon name="event" size={14} className="text-slate-400" />
                                                        Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-mono font-bold text-slate-900">
                                                    ${parseFloat(milestone.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        {payments.length > 0 && (
                            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                    <CardTitle className="text-base font-bold text-slate-900">Payment History</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-500">Recorded payments for this project</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {paymentMethodConfig[payment.payment_method]}
                                                        </span>
                                                        <Badge className={`text-[10px] font-bold uppercase tracking-widest shadow-none rounded-lg px-2 shrink-0 border-0 ${payment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                                            {payment.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {payment.transaction_id && (
                                                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                                                Txn: {payment.transaction_id}
                                                            </div>
                                                        )}
                                                        {payment.reference_number && (
                                                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                                                Ref: {payment.reference_number}
                                                            </div>
                                                        )}
                                                        {payment.notes && (
                                                            <div className="text-xs text-slate-600 mt-1 italic">
                                                                {payment.notes}
                                                            </div>
                                                        )}
                                                        {payment.paid_at && (
                                                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-2">
                                                                <Icon name="event" size={14} className="text-slate-400" />
                                                                Paid: {format(new Date(payment.paid_at), 'MMM dd, yyyy')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                    ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Info */}
                        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-base font-bold text-slate-900">Project Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Created</span>
                                        <span className="text-sm font-bold text-slate-900">
                                            {format(new Date(project.created_at), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Last Updated</span>
                                        <span className="text-sm font-bold text-slate-900">
                                            {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    {project.si56_verified && (
                                        <div className="flex items-center justify-between p-4 sm:p-5 bg-emerald-50/50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                                                <Icon name="verified" size={18} className="text-emerald-600" />
                                                <span>SI 56 Verified</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        Failed to load project details
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}


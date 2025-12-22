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
import { 
    MapPin, 
    DollarSign, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Hammer,
    Users,
    ShieldCheck
} from 'lucide-react'
import { builderApi } from '@/services/api'
import { Project, Milestone, Payment } from '@/types/api'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
}

const tierConfig = {
    DIY: { label: 'DIY', icon: Hammer, className: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    DIT: { label: 'DIT', icon: Users, className: 'text-indigo-600 bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' },
    DIFY: { label: 'DIFY', icon: ShieldCheck, className: 'text-teal-600 bg-teal-100 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' },
}

const milestoneStatusConfig = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    VERIFIED: { label: 'Verified', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
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

    const tier = project?.engagement_tier || 'DIY'
    const TierIcon = tierConfig[tier]?.icon || Hammer

    // Calculate payment summary
    const totalPaid = milestones
        .filter(m => m.status === 'PAID')
        .reduce((sum, m) => sum + parseFloat(m.amount), 0)
    const budget = project ? parseFloat(project.budget) : 0
    const remainingBalance = budget - totalPaid
    const paymentProgress = budget > 0 ? (totalPaid / budget) * 100 : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Project Details</DialogTitle>
                    <DialogDescription>
                        View complete project information, milestones, and payment history
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : project ? (
                    <div className="space-y-6">
                        {/* Project Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {project.location}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className={tierConfig[tier]?.className}>
                                            <TierIcon className="w-3 h-3 mr-1" />
                                            {tierConfig[tier]?.label}
                                        </Badge>
                                        <Badge className={statusConfig[project.status as keyof typeof statusConfig]?.className || statusConfig.PLANNING.className}>
                                            {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Budget</div>
                                        <div className="text-lg font-semibold">
                                            ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total Paid</div>
                                        <div className="text-lg font-semibold text-green-600">
                                            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Remaining</div>
                                        <div className={`text-lg font-semibold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Progress</div>
                                        <div className="text-lg font-semibold">
                                            {paymentProgress.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Milestones</CardTitle>
                                <CardDescription>Project milestones and payment status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {milestones.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No milestones yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {milestones.map((milestone) => (
                                            <div key={milestone.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{milestone.name}</span>
                                                            <Badge className={milestoneStatusConfig[milestone.status as keyof typeof milestoneStatusConfig]?.className || milestoneStatusConfig.PENDING.className}>
                                                                {milestoneStatusConfig[milestone.status as keyof typeof milestoneStatusConfig]?.label || milestone.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-semibold">
                                                        ${parseFloat(milestone.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        {payments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                    <CardDescription>Recorded payments for this project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {paymentMethodConfig[payment.payment_method]}
                                                            </span>
                                                            <Badge className={payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
                                                                {payment.status}
                                                            </Badge>
                                                        </div>
                                                        {payment.transaction_id && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Transaction: {payment.transaction_id}
                                                            </div>
                                                        )}
                                                        {payment.reference_number && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Reference: {payment.reference_number}
                                                            </div>
                                                        )}
                                                        {payment.notes && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {payment.notes}
                                                            </div>
                                                        )}
                                                        {payment.paid_at && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Paid: {format(new Date(payment.paid_at), 'MMM dd, yyyy')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-semibold text-green-600">
                                                        ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">
                                        {format(new Date(project.created_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="text-sm font-medium">
                                        {format(new Date(project.updated_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {project.si56_verified && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>SI 56 Verified</span>
                                    </div>
                                )}
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


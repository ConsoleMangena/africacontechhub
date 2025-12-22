import { useState } from 'react'
import { useEscrowSummary } from '../hooks/use-builder-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, MapPin, Calendar, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { AddPaymentDialog } from './add-payment-dialog'
import { ProjectDetailsDialog } from './project-details-dialog'
import { builderApi } from '@/services/api'

const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
}

export function EscrowView() {
    const { data, isLoading, error } = useEscrowSummary()
    const [selectedProject, setSelectedProject] = useState<{
        id: number
        title: string
        milestones: Array<{
            id: number
            name: string
            amount: string
            status: string
            due_date: string
        }>
    } | null>(null)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Escrow & Payments</CardTitle>
                    <CardDescription>Loading payment information...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Escrow & Payments</CardTitle>
                    <CardDescription>Failed to load payment information. Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const projects = data?.projects || []

    if (projects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Escrow & Payments</CardTitle>
                    <CardDescription>
                        No projects found. Create a project to start tracking payments.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const handleAddPayment = (projectId: number, projectTitle: string) => {
        // Fetch milestones for this project
        builderApi.getProjectMilestones(projectId).then((response) => {
            setSelectedProject({
                id: projectId,
                title: projectTitle,
                milestones: response.data.results,
            })
            setIsPaymentDialogOpen(true)
        }).catch((error) => {
            console.error('Failed to fetch milestones:', error)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Project Payments Overview</h3>
                    <p className="text-sm text-gray-600">
                        Track your project budgets, payments made, and upcoming milestone payments.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        // Open dialog for first project or show message
                        if (projects.length > 0) {
                            handleAddPayment(projects[0].project.id, projects[0].project.title)
                        }
                    }}
                    disabled={projects.length === 0}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((item) => {
                    const project = item.project
                    const budget = parseFloat(item.budget)
                    const totalPaid = parseFloat(item.total_paid)
                    const remainingBalance = parseFloat(item.remaining_balance)
                    const paymentProgress = budget > 0 ? (totalPaid / budget) * 100 : 0
                    const nextPayment = item.next_payment

                    return (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{project.location}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge className={statusConfig[project.status as keyof typeof statusConfig]?.className || statusConfig.PLANNING.className}>
                                        {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Budget */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            Project Budget
                                        </span>
                                        <span className="font-semibold">
                                            ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Total Paid */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            Total Paid
                                        </span>
                                        <span className="font-semibold text-green-600">
                                            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Remaining Balance */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            Remaining Balance
                                        </span>
                                        <span className={`font-semibold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                            <span>Payment Progress</span>
                                            <span>{paymentProgress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Next Payment */}
                                {nextPayment ? (
                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span>Next Payment</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Milestone:</span>
                                                <span className="font-medium">{nextPayment.milestone_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="font-semibold text-blue-600">
                                                    ${parseFloat(nextPayment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Due Date:</span>
                                                <span className="font-medium">
                                                    {format(new Date(nextPayment.due_date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 pt-1">
                                                {formatDistanceToNow(new Date(nextPayment.due_date), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t">
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <span>All payments completed</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleAddPayment(project.id, project.title)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Payment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedProjectId(project.id)
                                            setIsDetailsDialogOpen(true)
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Add Payment Dialog */}
            {selectedProject && (
                <AddPaymentDialog
                    open={isPaymentDialogOpen}
                    onOpenChange={setIsPaymentDialogOpen}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                    milestones={selectedProject.milestones}
                    onSuccess={() => {
                        // Refresh escrow summary
                    }}
                />
            )}

            {/* Project Details Dialog */}
            {selectedProjectId && (
                <ProjectDetailsDialog
                    open={isDetailsDialogOpen}
                    onOpenChange={setIsDetailsDialogOpen}
                    projectId={selectedProjectId}
                />
            )}
        </div>
    )
}


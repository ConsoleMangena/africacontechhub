import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { 
    Map, 
    Lock, 
    CheckCircle2, 
    Circle, 
    Edit2, 
    FileText,
    AlertCircle,
    DollarSign,
    Calendar,
    Loader2
} from 'lucide-react'
import { Project, Milestone } from '@/types/api'
import { format } from 'date-fns'
import { builderApi } from '@/services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AddPaymentDialog } from './add-payment-dialog'

interface RoadmapTask {
    id: string
    title: string
    completed: boolean
}

interface RoadmapStage {
    id: number
    name: string
    description: string
    tasks: RoadmapTask[]
    assessmentTask: RoadmapTask
    unlocked: boolean
    completed: boolean
    milestoneAmount?: number
}

interface ProjectRoadmapProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project
}

const STAGES: Omit<RoadmapStage, 'unlocked' | 'completed' | 'tasks' | 'assessmentTask'>[] = [
    {
        id: 1,
        name: 'Planning & Design',
        description: 'Define your project scope, budget, and design requirements',
        milestoneAmount: 0.15, // 15% of project budget
    },
    {
        id: 2,
        name: 'Site Preparation',
        description: 'Prepare your site and gather all necessary materials',
        milestoneAmount: 0.10, // 10% of project budget
    },
    {
        id: 3,
        name: 'Foundation & Structure',
        description: 'Build the foundation and main structural elements',
        milestoneAmount: 0.25, // 25% of project budget
    },
    {
        id: 4,
        name: 'Systems Installation',
        description: 'Install electrical, plumbing, and HVAC systems',
        milestoneAmount: 0.20, // 20% of project budget
    },
    {
        id: 5,
        name: 'Interior & Exterior Finishing',
        description: 'Complete the interior and exterior finishes',
        milestoneAmount: 0.20, // 20% of project budget
    },
    {
        id: 6,
        name: 'Final Completion',
        description: 'Complete final inspections and handover',
        milestoneAmount: 0.10, // 10% of project budget
    },
]

const STAGE_TASKS: Record<number, string[]> = {
    1: [
        'Define project scope and requirements',
        'Create detailed project timeline',
        'Set project budget and track expenses',
        'Plan renovation phases to minimize disruption',
    ],
    2: [
        'Clear and prepare the site',
        'Order and receive all materials',
        'Set up temporary facilities',
        'Obtain necessary permits',
    ],
    3: [
        'Excavate and prepare foundation',
        'Pour foundation and allow curing',
        'Frame main structure',
        'Install structural elements',
    ],
    4: [
        'Install electrical wiring and panels',
        'Install plumbing systems',
        'Install HVAC systems',
        'Test all systems',
    ],
    5: [
        'Complete interior drywall and paint',
        'Install flooring and fixtures',
        'Complete exterior siding and paint',
        'Install windows and doors',
    ],
    6: [
        'Complete final walkthrough',
        'Obtain final inspections',
        'Clean and prepare for handover',
        'Transfer ownership documents',
    ],
}

export function ProjectRoadmap({ open, onOpenChange, project }: ProjectRoadmapProps) {
    const storageKey = `roadmap_${project.id}`
    const [stages, setStages] = useState<RoadmapStage[]>([])
    const [editingStage, setEditingStage] = useState<number | null>(null)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
    const [milestoneToPayId, setMilestoneToPayId] = useState<number | null>(null)
    const queryClient = useQueryClient()

    // Fetch milestones for this project
    const { data: milestonesData, isLoading: isLoadingMilestones, error: milestonesError } = useQuery({
        queryKey: ['project-milestones', project.id],
        queryFn: async () => {
            try {
                const response = await builderApi.getProjectMilestones(project.id)
                // Handle both paginated and non-paginated responses
                if (response.data && typeof response.data === 'object') {
                    if (Array.isArray(response.data)) {
                        return response.data
                    } else if (response.data.results && Array.isArray(response.data.results)) {
                        return response.data.results
                    } else if (response.data.milestones && Array.isArray(response.data.milestones)) {
                        return response.data.milestones
                    }
                }
                return []
            } catch (error) {
                console.error('Failed to fetch milestones:', error)
                // Return empty array on error instead of throwing
                return []
            }
        },
        enabled: open && !!project.id,
        retry: 1,
    })

    const milestones: Milestone[] = (milestonesData && Array.isArray(milestonesData)) ? milestonesData : []

    // Create milestone mutation
    const createMilestoneMutation = useMutation({
        mutationFn: (data: Partial<Milestone>) => builderApi.createMilestone(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-milestones', project.id] })
            toast.success('Milestone created successfully')
        },
        onError: (error: any) => {
            console.error('Failed to create milestone:', error)
            toast.error(error.response?.data?.message || 'Failed to create milestone')
        },
    })

    // Helper functions
    const saveStages = (stagesToSave: RoadmapStage[]) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(stagesToSave))
        } catch (error) {
            console.error('Failed to save stages to localStorage:', error)
        }
    }

    const syncStagesWithMilestones = (savedStages: RoadmapStage[], currentMilestones: Milestone[]) => {
        try {
            const projectBudget = parseFloat(project.budget) || 0
            const synced: RoadmapStage[] = savedStages.map((stage, index) => {
                // Find matching milestone from database
                const milestoneName = `Stage ${stage.id}: ${stage.name}`
                const dbMilestone = currentMilestones.find(
                    m => m.name === milestoneName && m.project === project.id
                )

                // Use milestone amount from database if available, otherwise calculate
                const milestoneAmount = dbMilestone 
                    ? parseFloat(dbMilestone.amount) || 0
                    : (stage.milestoneAmount || (STAGES.find(s => s.id === stage.id)?.milestoneAmount || 0) * projectBudget)

                // Determine if stage should be unlocked based on previous stage completion
                const previousStage = index > 0 ? savedStages[index - 1] : null
                const unlocked = index === 0 || (previousStage?.completed || false)

                return {
                    ...stage,
                    unlocked,
                    milestoneAmount,
                }
            })
            setStages(synced)
            saveStages(synced)
        } catch (error) {
            console.error('Error syncing stages with milestones:', error)
            // Fallback to initialization
            initializeStages(currentMilestones)
        }
    }

    const initializeStages = (currentMilestones: Milestone[] = []) => {
        try {
            const projectBudget = parseFloat(project.budget) || 0
            const initialized: RoadmapStage[] = STAGES.map((stage, index) => {
                const tasks = STAGE_TASKS[stage.id]?.map((title, i) => ({
                    id: `${stage.id}-${i}`,
                    title,
                    completed: false,
                })) || []

                // Find matching milestone from database
                const milestoneName = `Stage ${stage.id}: ${stage.name}`
                const dbMilestone = currentMilestones.find(
                    m => m.name === milestoneName && m.project === project.id
                )

                // Use milestone amount from database if available, otherwise calculate
                const milestoneAmount = dbMilestone 
                    ? parseFloat(dbMilestone.amount) || 0
                    : (stage.milestoneAmount ? stage.milestoneAmount * projectBudget : 0)

                return {
                    ...stage,
                    tasks,
                    assessmentTask: {
                        id: `${stage.id}-assessment`,
                        title: `Assess existing structure condition`,
                        completed: false,
                    },
                    unlocked: index === 0, // First stage is unlocked
                    completed: false,
                    milestoneAmount,
                }
            })
            setStages(initialized)
            saveStages(initialized)
        } catch (error) {
            console.error('Error initializing stages:', error)
            toast.error('Failed to initialize project roadmap')
        }
    }

    // Initialize stages from localStorage or create new, syncing with database milestones
    useEffect(() => {
        if (!open) return // Don't initialize if dialog is closed
        
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try {
                const savedStages = JSON.parse(saved)
                // Sync with database milestones
                syncStagesWithMilestones(savedStages, milestones)
            } catch (error) {
                console.error('Error parsing saved stages:', error)
                initializeStages(milestones)
            }
        } else {
            initializeStages(milestones)
        }
    }, [project.id, open, milestones.length]) // Use milestones.length to avoid infinite loops

    const toggleTask = (stageId: number, taskId: string) => {
        setStages(currentStages => {
            const updated = currentStages.map(stage => {
                if (stage.id !== stageId) return stage

                const updatedTasks = stage.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )

                const allTasksCompleted = updatedTasks.every(t => t.completed) && stage.assessmentTask.completed
                const completed = allTasksCompleted

                return {
                    ...stage,
                    tasks: updatedTasks,
                    completed,
                }
            })

            // Unlock next stage when current stage is completed
            const completedStage = updated.find(s => s.id === stageId)
            if (completedStage?.completed) {
                const currentIndex = updated.findIndex(s => s.id === stageId)
                if (currentIndex < updated.length - 1) {
                    updated[currentIndex + 1].unlocked = true
                }
                
                // Create milestone when stage is completed
                createMilestoneForStage(completedStage)
            }

            saveStages(updated)
            return updated
        })
    }

    const toggleAssessment = (stageId: number) => {
        setStages(currentStages => {
            const updated = currentStages.map(stage => {
                if (stage.id !== stageId) return stage

                const updatedAssessment = {
                    ...stage.assessmentTask,
                    completed: !stage.assessmentTask.completed,
                }

                const allTasksCompleted = stage.tasks.every(t => t.completed) && updatedAssessment.completed
                const completed = allTasksCompleted

                return {
                    ...stage,
                    assessmentTask: updatedAssessment,
                    completed,
                }
            })

            // Unlock next stage when current stage is completed
            const completedStage = updated.find(s => s.id === stageId)
            if (completedStage?.completed) {
                const currentIndex = updated.findIndex(s => s.id === stageId)
                if (currentIndex < updated.length - 1) {
                    updated[currentIndex + 1].unlocked = true
                }
                
                // Create milestone when stage is completed
                createMilestoneForStage(completedStage)
            }

            saveStages(updated)
            return updated
        })
    }

    const createMilestoneForStage = async (stage: RoadmapStage) => {
        // Check if milestone already exists in database for this stage
        const milestoneName = `Stage ${stage.id}: ${stage.name}`
        const existingMilestone = milestones.find(
            m => m.name === milestoneName && m.project === project.id
        )

        // Only create if it doesn't exist in database and has an amount
        if (!existingMilestone && stage.milestoneAmount && stage.milestoneAmount > 0) {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 30) // 30 days from now

            createMilestoneMutation.mutate({
                project: project.id,
                name: milestoneName,
                amount: stage.milestoneAmount.toString(),
                status: 'PENDING',
                due_date: format(dueDate, 'yyyy-MM-dd'),
            })
        }
    }

    const handleViewAndPay = async (stage: RoadmapStage) => {
        // Find milestone from database for this stage
        const milestoneName = `Stage ${stage.id}: ${stage.name}`
        let milestone = milestones.find(
            m => m.name === milestoneName && m.project === project.id
        )

        if (!milestone && stage.milestoneAmount && stage.milestoneAmount > 0) {
            // Create milestone in database if it doesn't exist
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 30)

            try {
                const response = await createMilestoneMutation.mutateAsync({
                    project: project.id,
                    name: milestoneName,
                    amount: stage.milestoneAmount.toString(),
                    status: 'PENDING',
                    due_date: format(dueDate, 'yyyy-MM-dd'),
                })
                
                // Refetch milestones to get the new one
                await queryClient.refetchQueries({ queryKey: ['project-milestones', project.id] })
                
                // Get the created milestone ID from response
                const newMilestoneId = response.data?.id
                if (newMilestoneId) {
                    setMilestoneToPayId(newMilestoneId)
                    setSelectedStageId(stage.id)
                    setPaymentDialogOpen(true)
                }
            } catch (error) {
                // Error already handled by mutation
                console.error('Failed to create milestone:', error)
            }
        } else if (milestone) {
            // Use milestone from database
            setMilestoneToPayId(milestone.id)
            setSelectedStageId(stage.id)
            setPaymentDialogOpen(true)
        } else {
            toast.error('No milestone amount configured for this stage')
        }
    }

    const getStageProgress = (stage: RoadmapStage) => {
        const totalTasks = stage.tasks.length + 1 // +1 for assessment
        const completedTasks = stage.tasks.filter(t => t.completed).length + (stage.assessmentTask.completed ? 1 : 0)
        return Math.round((completedTasks / totalTasks) * 100)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[9999] bg-white">
                <DialogHeader className="pb-4 border-b border-gray-200">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Map className="h-5 w-5 text-green-600" />
                        </div>
                        Project Roadmap
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        Track your project progress through each stage
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {milestonesError && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-800">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-sm font-medium">Warning: Could not load milestones. Some features may be limited.</p>
                            </div>
                        </div>
                    )}
                    
                    {isLoadingMilestones && stages.length === 0 ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">Loading project roadmap...</p>
                        </div>
                    ) : stages.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">No stages available. Please refresh the page.</p>
                        </div>
                    ) : (
                        stages.map((stage, index) => {
                            const progress = getStageProgress(stage)
                            const isEditing = editingStage === stage.id

                        return (
                            <Card
                                key={stage.id}
                                className={`border-2 transition-all ${
                                    stage.unlocked
                                        ? stage.completed
                                            ? 'border-green-300 bg-green-50/30'
                                            : 'border-gray-200 hover:border-green-300'
                                        : 'border-gray-200 bg-gray-50 opacity-75'
                                }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {!stage.unlocked ? (
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                ) : stage.completed ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-400" />
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            Stage {stage.id}: {stage.name}
                                                        </h3>
                                                        {stage.completed && (
                                                            <Badge className="bg-green-600 text-white">
                                                                Completed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {stage.unlocked && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingStage(isEditing ? null : stage.id)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <Edit2 className="h-4 w-4 mr-1" />
                                                {isEditing ? 'Done' : 'Edit'}
                                            </Button>
                                        )}
                                    </div>

                                    {stage.unlocked ? (
                                        <>
                                            {/* Progress Tracking */}
                                            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-2" />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {stage.tasks.filter(t => t.completed).length + (stage.assessmentTask.completed ? 1 : 0)} of {stage.tasks.length + 1} tasks completed
                                                </p>
                                            </div>

                                            {/* Checklist */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Planning</h4>
                                                {stage.tasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={task.completed}
                                                            onCheckedChange={() => toggleTask(stage.id, task.id)}
                                                            className="mt-0.5"
                                                        />
                                                        <label
                                                            className={`flex-1 cursor-pointer ${
                                                                task.completed
                                                                    ? 'line-through text-gray-500'
                                                                    : 'text-gray-900'
                                                            }`}
                                                            onClick={() => toggleTask(stage.id, task.id)}
                                                        >
                                                            {task.title}
                                                        </label>
                                                    </div>
                                                ))}

                                                <div className="h-px bg-gray-200 my-4"></div>

                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Assessment</h4>
                                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Checkbox
                                                        checked={stage.assessmentTask.completed}
                                                        onCheckedChange={() => toggleAssessment(stage.id)}
                                                        className="mt-0.5"
                                                    />
                                                    <label
                                                        className={`flex-1 cursor-pointer ${
                                                            stage.assessmentTask.completed
                                                                ? 'line-through text-gray-500'
                                                                : 'text-gray-900'
                                                        }`}
                                                        onClick={() => toggleAssessment(stage.id)}
                                                    >
                                                        {stage.assessmentTask.title}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Milestone Bill */}
                                            {stage.completed && (() => {
                                                const milestoneName = `Stage ${stage.id}: ${stage.name}`
                                                const dbMilestone = milestones.find(
                                                    m => m.name === milestoneName && m.project === project.id
                                                )
                                                
                                                // Use milestone from database if available
                                                const milestoneAmount = dbMilestone 
                                                    ? parseFloat(dbMilestone.amount)
                                                    : stage.milestoneAmount || 0
                                                
                                                const dueDate = dbMilestone 
                                                    ? new Date(dbMilestone.due_date)
                                                    : new Date()
                                                
                                                const milestoneStatus = dbMilestone?.status || 'PENDING'
                                                
                                                return (
                                                    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border-2 border-green-200">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="p-2 rounded-lg bg-green-200">
                                                                <DollarSign className="h-5 w-5 text-green-700" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-bold text-green-900">Stage {stage.id} Milestone - Ready for Billing</h4>
                                                                {dbMilestone && (
                                                                    <Badge className={`mt-1 ${
                                                                        milestoneStatus === 'PAID' ? 'bg-green-600 text-white' :
                                                                        milestoneStatus === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        {milestoneStatus}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700">Milestone Amount:</span>
                                                                <span className="text-xl font-bold text-green-700">
                                                                    ${milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                                <span className="text-sm font-medium text-gray-700">Due Date:</span>
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {format(dueDate, 'MMM d, yyyy')}
                                                                </span>
                                                            </div>
                                                            {dbMilestone && (
                                                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                                    <span className="text-sm font-medium text-gray-700">Milestone ID:</span>
                                                                    <span className="text-sm font-mono text-gray-600">
                                                                        #{dbMilestone.id}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <Button 
                                                                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleViewAndPay(stage)}
                                                                disabled={createMilestoneMutation.isPending || milestoneStatus === 'PAID'}
                                                            >
                                                                {createMilestoneMutation.isPending ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Creating Milestone...
                                                                    </>
                                                                ) : milestoneStatus === 'PAID' ? (
                                                                    <>
                                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                        Milestone Paid
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        View & Pay Milestone
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm">Complete the previous stage to unlock this one</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    }))}
                </div>

                {/* Payment Dialog */}
                <AddPaymentDialog
                    open={paymentDialogOpen}
                    onOpenChange={(open) => {
                        setPaymentDialogOpen(open)
                        if (!open) {
                            setMilestoneToPayId(null)
                            setSelectedStageId(null)
                        }
                    }}
                    projectId={project.id}
                    projectTitle={project.title}
                    milestones={milestones.map(m => ({
                        id: m.id,
                        name: m.name,
                        amount: m.amount,
                        status: m.status,
                        due_date: m.due_date,
                    }))}
                    preselectedMilestoneId={milestoneToPayId || undefined}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['project-milestones', project.id] })
                        setPaymentDialogOpen(false)
                        setMilestoneToPayId(null)
                        setSelectedStageId(null)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}


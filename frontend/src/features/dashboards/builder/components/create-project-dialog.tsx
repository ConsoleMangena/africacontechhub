import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Hammer, Users, ShieldCheck } from 'lucide-react'
import { builderApi } from '@/services/api'
import { toast } from 'sonner'
import { LocationPicker } from './location-picker'
import { Project } from '@/types/api'

const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title too long'),
    location: z.string().min(3, 'Location must be at least 3 characters').max(255, 'Location too long'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    budget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Budget must be a positive number',
    }),
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']).default('PLANNING'),
    engagement_tier: z.enum(['DIY', 'DIT', 'DIFY']).default('DIY'),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface CreateProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    project?: Project | null
}

export function CreateProjectDialog({ open, onOpenChange, onSuccess, project }: CreateProjectDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: '',
            location: '',
            latitude: undefined,
            longitude: undefined,
            budget: '',
            status: 'PLANNING',
            engagement_tier: 'DIY',
        },
    })

    useEffect(() => {
        if (open) {
            if (project) {
                form.reset({
                    title: project.title,
                    location: project.location,
                    budget: project.budget.toString(), // Ensure budget is string for form
                    status: project.status,
                    latitude: project.latitude ? Number(project.latitude) : undefined,
                    longitude: project.longitude ? Number(project.longitude) : undefined,
                    engagement_tier: project.engagement_tier || 'DIY',
                })
            } else {
                form.reset({
                    title: '',
                    location: '',
                    budget: '',
                    status: 'PLANNING',
                    latitude: undefined,
                    longitude: undefined,
                    engagement_tier: 'DIY',
                })
            }
        }
    }, [open, project, form])

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        form.setValue('latitude', lat)
        form.setValue('longitude', lng)
        if (address) {
            form.setValue('location', address)
        }
    }

    const onSubmit = async (data: ProjectFormData) => {
        setIsSubmitting(true)
        try {
            const apiData = {
                ...data,
                latitude: data.latitude?.toFixed(6),
                longitude: data.longitude?.toFixed(6),
            }

            if (project) {
                await builderApi.updateProject(project.id, apiData)
                toast.success('Project updated successfully!')
            } else {
                await builderApi.createProject(apiData)
                toast.success('Project created successfully!')
            }
            form.reset()
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error('Failed to save project:', error)
            toast.error(error.response?.data?.message || 'Failed to save project')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {project ? 'Update the details of your construction project.' : 'Add a new construction project to your portfolio.'} Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., Residential Home in Borrowdale' {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        A clear, descriptive name for your project
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='location'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., Harare, Zimbabwe' {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Click on the map below to pin-point the exact location
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location Picker Map */}
                        <div className='py-2'>
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={
                                    project?.latitude && project?.longitude
                                        ? { lat: Number(project.latitude), lng: Number(project.longitude) }
                                        : undefined
                                }
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="engagement_tier"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Engagement Tier</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                        >
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="DIY" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <Hammer className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">DIY (Free)</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Standard tools, self-service. You manage everything.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="DIT" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <Users className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">DIT (Hybrid)</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Shared dashboard with expert validation & support.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="DIFY" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <ShieldCheck className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">DIFY (Premium)</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Full autopilot service. We manage, you monitor.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='budget'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget (USD) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            step='0.01'
                                            placeholder='e.g., 50000.00'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Total project budget in US Dollars
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='status'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select project status' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='PLANNING'>Planning</SelectItem>
                                            <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                                            <SelectItem value='ON_HOLD'>On Hold</SelectItem>
                                            <SelectItem value='COMPLETED'>Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Current stage of the project
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-3 pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        {project ? 'Saving...' : 'Creating...'}
                                    </>
                                ) : (
                                    project ? 'Save Changes' : 'Create Project'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

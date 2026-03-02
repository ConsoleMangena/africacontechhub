import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { builderApi } from '@/services/api'
import { Project } from '@/types/api'
import { LocationPicker } from './location-picker'

interface CreateProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    project: Project | null
}

export function CreateProjectDialog({
    open,
    onOpenChange,
    onSuccess,
    project,
}: CreateProjectDialogProps) {
    const isEditing = !!project

    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('')
    const [budget, setBudget] = useState('')
    const [status, setStatus] = useState<Project['status']>('PLANNING')
    const [engagementTier, setEngagementTier] = useState<Project['engagement_tier']>('DIT')
    const [latitude, setLatitude] = useState<number | undefined>(undefined)
    const [longitude, setLongitude] = useState<number | undefined>(undefined)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            if (project) {
                setTitle(project.title)
                setLocation(project.location)
                setBudget(project.budget)
                setStatus(project.status)
                setEngagementTier(project.engagement_tier)
                setLatitude(project.latitude ? parseFloat(project.latitude) : undefined)
                setLongitude(project.longitude ? parseFloat(project.longitude) : undefined)
            } else {
                setTitle('')
                setLocation('')
                setBudget('')
                setStatus('PLANNING')
                setEngagementTier('DIT')
                setLatitude(undefined)
                setLongitude(undefined)
            }
        }
    }, [open, project])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !location.trim() || !budget.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            const data: Partial<Project> = {
                title: title.trim(),
                location: location.trim(),
                budget,
                status,
                engagement_tier: engagementTier,
            }

            // Only include lat/lng if they are set (round to 6 decimal places for backend DecimalField)
            if (latitude !== undefined) data.latitude = latitude.toFixed(6)
            if (longitude !== undefined) data.longitude = longitude.toFixed(6)

            if (isEditing) {
                await builderApi.updateProject(project.id, data)
                toast.success('Project updated successfully')
            } else {
                await builderApi.createProject(data)
                toast.success('Project created successfully')
            }

            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Project create/update error:', error?.response?.status, JSON.stringify(error?.response?.data, null, 2))
            const responseData = error?.response?.data
            let message = `Failed to ${isEditing ? 'update' : 'create'} project`
            if (responseData) {
                if (typeof responseData.message === 'string' && responseData.message !== '[object Object]') {
                    message = responseData.message
                }
                // Custom DRF handler puts field errors under "errors"
                const fieldErrors = responseData.errors
                if (fieldErrors && typeof fieldErrors === 'object') {
                    const firstKey = Object.keys(fieldErrors)[0]
                    if (firstKey) {
                        const fieldError = Array.isArray(fieldErrors[firstKey])
                            ? fieldErrors[firstKey][0]
                            : fieldErrors[firstKey]
                        message = `${firstKey}: ${fieldError}`
                    }
                } else if (typeof responseData.detail === 'string') {
                    message = responseData.detail
                }
            }
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of your project.'
                            : 'Fill in the details to create a new construction project.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g. 3 Bedroom House - Harare"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                            id="location"
                            placeholder="e.g. 123 Main Street, Harare"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget (USD) *</Label>
                        <Input
                            id="budget"
                            type="number"
                            placeholder="e.g. 50000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLANNING">Planning</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Engagement Tier</Label>
                            <Select value={engagementTier} onValueChange={(v) => setEngagementTier(v as Project['engagement_tier'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DIT">DIT - Do It Together</SelectItem>
                                    <SelectItem value="DIFY">DIFY - Do It For You</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pin Location on Map</Label>
                        <div className="h-[250px] rounded-md overflow-hidden border">
                            <LocationPicker
                                onLocationSelect={(lat, lng, address) => {
                                    setLatitude(lat)
                                    setLongitude(lng)
                                    if (address && !location) {
                                        setLocation(address)
                                    }
                                }}
                                initialLocation={
                                    latitude && longitude
                                        ? { lat: latitude, lng: longitude }
                                        : undefined
                                }
                                searchLocation={location}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Project' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

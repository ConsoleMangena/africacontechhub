import { Icon } from '@/components/ui/material-icon'
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
    // Advanced brief fields
    const [buildingType, setBuildingType] = useState('RESIDENTIAL')
    const [useCase, setUseCase] = useState('single_family')
    const [occupants, setOccupants] = useState('4')
    const [bedrooms, setBedrooms] = useState('3')
    const [bathrooms, setBathrooms] = useState('2')
    const [floors, setFloors] = useState('1')
    const [hasGarage, setHasGarage] = useState('yes')
    const [parkingSpaces, setParkingSpaces] = useState('1')
    const [lotSize, setLotSize] = useState('')
    const [footprint, setFootprint] = useState('')
    const [preferredStyle, setPreferredStyle] = useState('modern')
    const [roofType, setRoofType] = useState('gable')
    const [specialSpaces, setSpecialSpaces] = useState('Home office, outdoor living area')
    const [sustainability, setSustainability] = useState('Solar-ready roof, rainwater harvesting, natural ventilation')
    const [accessibility, setAccessibility] = useState('')
    const [timeline, setTimeline] = useState('6_12')
    const [budgetFlex, setBudgetFlex] = useState('balanced')
    const [constraints, setConstraints] = useState('')
    const [siteNotes, setSiteNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(0)

    const steps = [
        { key: 'basics', label: 'Project basics' },
        { key: 'program', label: 'Rooms & program' },
        { key: 'design', label: 'Style & constraints' },
        { key: 'review', label: 'Review' },
    ]

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
                setBuildingType(project.building_type || 'RESIDENTIAL')
                setUseCase(project.use_case || 'single_family')
                setOccupants(project.occupants?.toString() || '4')
                setBedrooms(project.bedrooms?.toString() || '3')
                setBathrooms(project.bathrooms?.toString() || '2')
                setFloors(project.floors?.toString() || '1')
                setHasGarage(project.has_garage === false ? 'no' : 'yes')
                setParkingSpaces(project.parking_spaces?.toString() || '1')
                setLotSize(project.lot_size || '')
                setFootprint(project.footprint || '')
                setPreferredStyle(project.preferred_style || 'modern')
                setRoofType(project.roof_type || 'gable')
                setSpecialSpaces(project.special_spaces || 'Home office, outdoor living area')
                setSustainability(project.sustainability || 'Solar-ready roof, rainwater harvesting, natural ventilation')
                setAccessibility(project.accessibility || '')
                setTimeline(project.timeline || '6_12')
                setBudgetFlex(project.budget_flex || 'balanced')
                setConstraints(project.constraints || '')
                setSiteNotes(project.site_notes || '')
            } else {
                setTitle('')
                setLocation('')
                setBudget('')
                setStatus('PLANNING')
                setEngagementTier('DIT')
                setLatitude(undefined)
                setLongitude(undefined)
                setBuildingType('RESIDENTIAL')
                setUseCase('single_family')
                setOccupants('4')
                setBedrooms('3')
                setBathrooms('2')
                setFloors('1')
                setHasGarage('yes')
                setParkingSpaces('1')
                setLotSize('')
                setFootprint('')
                setPreferredStyle('modern')
                setRoofType('gable')
                setSpecialSpaces('Home office, outdoor living area')
                setSustainability('Solar-ready roof, rainwater harvesting, natural ventilation')
                setAccessibility('')
                setTimeline('6_12')
                setBudgetFlex('balanced')
                setConstraints('')
                setSiteNotes('')
            }
            setStep(0)
        }
    }, [open, project])

    const timelineLabel = (value: string) => {
        switch (value) {
            case 'asap': return 'ASAP / now'
            case '0_3': return '0-3 months'
            case '3_6': return '3-6 months'
            case '6_12': return '6-12 months'
            case '12_plus': return '12+ months'
            default: return 'Unknown'
        }
    }

    const budgetFlexLabel = (value: string) => {
        switch (value) {
            case 'strict': return 'Strict — must stay within budget'
            case 'balanced': return 'Balanced — optimize value vs cost'
            case 'flex': return 'Flexible for better outcomes'
            default: return 'Unknown'
        }
    }

    // Build a single design brief string for the AI agent and backend persistence
    const buildAIBrief = () => {
        const items = [
            `Building type: ${buildingType.replace('_', ' ')}`,
            `Use case: ${useCase.replace('_', ' ')}`,
            `Occupants: ${occupants || 'n/a'}`,
            `Bedrooms: ${bedrooms || 'n/a'}, Bathrooms: ${bathrooms || 'n/a'}, Floors: ${floors || 'n/a'}`,
            `Garage: ${hasGarage === 'yes' ? 'Yes' : 'No'}, Parking: ${parkingSpaces || 'n/a'}`,
            lotSize ? `Lot size: ${lotSize}` : null,
            footprint ? `Desired footprint: ${footprint}` : null,
            `Style: ${preferredStyle}, Roof: ${roofType}`,
            specialSpaces ? `Special spaces: ${specialSpaces}` : null,
            sustainability ? `Sustainability: ${sustainability}` : null,
            accessibility ? `Accessibility: ${accessibility}` : null,
            siteNotes ? `Site/context: ${siteNotes}` : null,
            constraints ? `Constraints: ${constraints}` : null,
            `Timeline: ${timelineLabel(timeline)}, Budget flexibility: ${budgetFlexLabel(budgetFlex)}`,
        ].filter(Boolean)
        return items.join(' | ')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !location.trim() || !budget.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            const aiBrief = buildAIBrief()
            const baseData: Partial<Project> = {
                title: title.trim(),
                location: location.trim(),
                budget,
                status: isEditing ? project.status : 'PLANNING',
                engagement_tier: engagementTier,
                ai_brief: aiBrief,
                building_type: buildingType,
                use_case: useCase,
                occupants: occupants ? Number(occupants) : null,
                bedrooms: bedrooms ? Number(bedrooms) : null,
                bathrooms: bathrooms ? Number(bathrooms) : null,
                floors: floors ? Number(floors) : null,
                has_garage: hasGarage === 'yes',
                parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
                lot_size: lotSize || null,
                footprint: footprint || null,
                preferred_style: preferredStyle,
                roof_type: roofType,
                special_spaces: specialSpaces || null,
                sustainability: sustainability || null,
                accessibility: accessibility || null,
                site_notes: siteNotes || null,
                constraints: constraints || null,
                timeline,
                budget_flex: budgetFlex,
            }

            // Only include lat/lng if they are set (round to 6 decimal places for backend DecimalField)
            if (latitude !== undefined) baseData.latitude = latitude.toFixed(6)
            if (longitude !== undefined) baseData.longitude = longitude.toFixed(6)

            const attemptSave = async (payload: Partial<Project>) => {
                if (isEditing) {
                    await builderApi.updateProject(project.id, payload)
                    toast.success('Project updated successfully')
                } else {
                    await builderApi.createProject(payload)
                    toast.success('Project created successfully')
                }
            }

            try {
                await attemptSave(baseData)
            } catch (error: any) {
                // If backend rejects ai_brief (unknown field), retry without it
                const responseData = error?.response?.data
                const hasAIBriefError = responseData && (responseData.ai_brief || responseData?.errors?.ai_brief)
                const is400 = error?.response?.status === 400
                if (is400 && hasAIBriefError) {
                    const { ai_brief, ...fallback } = baseData
                    await attemptSave(fallback)
                } else {
                    throw error
                }
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

    const handleNext = () => {
        // Gate required fields on step 0
        if (step === 0) {
            if (!title.trim() || !location.trim() || !budget.trim()) {
                toast.error('Please complete the required basics first')
                return
            }
        }
        if (step < steps.length - 1) {
            setStep((s) => s + 1)
        }
    }

    const handleBack = () => {
        if (step > 0) setStep((s) => s - 1)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent
                className="w-[98vw] max-w-[1200px] h-[90vh] sm:h-[85vh] lg:h-[80vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="flex items-start gap-3">
                    <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                            <Icon name="smart_toy" className="h-6 w-6" />
                        </div>
                    </div>
                    <DialogHeader className="flex-1">
                    <DialogTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of your project.'
                            : 'Answer a few guided steps to capture your project details.'}
                    </DialogDescription>
                    </DialogHeader>
                </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-slate-900 transition-all duration-500 shadow-none border-none"
                                            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        Step {step + 1} / {steps.length}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                                    {steps.map((s, idx) => (
                                        <div
                                            key={s.key}
                                            className={`rounded-md border px-2.5 py-2 transition-all duration-200 ${idx === step ? 'border-slate-900 bg-slate-900 text-white shadow-none font-bold' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                                        >
                                            {s.label}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {step === 0 && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Status</Label>
                                                    <div className="flex items-center gap-2 h-10 rounded-md border border-input bg-muted/50 px-3 py-2">
                                                        <Icon name="lock" className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Planning</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Projects start in Planning. Initiate from the project page when ready.
                                                    </p>
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
                                                <div className="h-[220px] rounded-md overflow-hidden border">
                                                    <LocationPicker
                                                        onLocationSelect={(lat, lng, address) => {
                                                            setLatitude(lat)
                                                            setLongitude(lng)
                                                            if (address && address !== location) {
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
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Building Type</Label>
                                                    <Select value={buildingType} onValueChange={setBuildingType}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                                                            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                                                            <SelectItem value="MIXED_USE">Mixed-use</SelectItem>
                                                            <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                                                            <SelectItem value="PUBLIC">Public / Civic</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Use Case</Label>
                                                    <Select value={useCase} onValueChange={setUseCase}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="single_family">Single family</SelectItem>
                                                            <SelectItem value="multi_family">Multi-family</SelectItem>
                                                            <SelectItem value="office">Office</SelectItem>
                                                            <SelectItem value="retail">Retail</SelectItem>
                                                            <SelectItem value="hospitality">Hospitality / Lodge</SelectItem>
                                                            <SelectItem value="education">Education</SelectItem>
                                                            <SelectItem value="healthcare">Healthcare / Clinic</SelectItem>
                                                            <SelectItem value="warehouse">Warehouse / Light industrial</SelectItem>
                                                            <SelectItem value="community">Community / Church / Public hall</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Occupants (people)</Label>
                                                    <Input type="number" min="1" value={occupants} onChange={(e) => setOccupants(e.target.value)} />
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                                                    <div className="space-y-1">
                                                        <Label>{buildingType === 'RESIDENTIAL' ? 'Bedrooms' : 'Units/Offices'}</Label>
                                                        <Input type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label>{buildingType === 'RESIDENTIAL' ? 'Bathrooms' : 'Restrooms'}</Label>
                                                        <Input type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label>Floors</Label>
                                                        <Input type="number" min="1" value={floors} onChange={(e) => setFloors(e.target.value)} />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Garage</Label>
                                                    <Select value={hasGarage} onValueChange={setHasGarage}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes">Yes</SelectItem>
                                                            <SelectItem value="no">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Parking spaces</Label>
                                                    <Input type="number" min="0" value={parkingSpaces} onChange={(e) => setParkingSpaces(e.target.value)} />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Lot size / Site area</Label>
                                                    <Input placeholder="e.g. 800 m², 1 acre" value={lotSize} onChange={(e) => setLotSize(e.target.value)} />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Desired footprint</Label>
                                                    <Input placeholder="e.g. 180 m² building footprint" value={footprint} onChange={(e) => setFootprint(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Style</Label>
                                                    <Select value={preferredStyle} onValueChange={setPreferredStyle}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="modern">Modern</SelectItem>
                                                            <SelectItem value="contemporary">Contemporary</SelectItem>
                                                            <SelectItem value="traditional">Traditional</SelectItem>
                                                            <SelectItem value="minimalist">Minimalist</SelectItem>
                                                            <SelectItem value="industrial">Industrial</SelectItem>
                                                            <SelectItem value="african_vernacular">African vernacular</SelectItem>
                                                            <SelectItem value="colonial">Colonial</SelectItem>
                                                            <SelectItem value="custom">Custom / Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Roof type</Label>
                                                    <Select value={roofType} onValueChange={setRoofType}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="gable">Gable</SelectItem>
                                                            <SelectItem value="hip">Hip</SelectItem>
                                                            <SelectItem value="flat">Flat / parapet</SelectItem>
                                                            <SelectItem value="shed">Mono-pitch</SelectItem>
                                                            <SelectItem value="custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label>Special spaces</Label>
                                                    <Input
                                                        placeholder="Home office, prayer room, playroom, outdoor kitchen, pool, staff quarters"
                                                        value={specialSpaces}
                                                        onChange={(e) => setSpecialSpaces(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label>Sustainability & efficiency goals</Label>
                                                    <Input
                                                        placeholder="Solar-ready, battery backup, cross-ventilation, water harvesting, insulation"
                                                        value={sustainability}
                                                        onChange={(e) => setSustainability(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label>Accessibility / Inclusivity</Label>
                                                    <Input
                                                        placeholder="Step-free entry, wider doors, ground-floor bedroom, universal design"
                                                        value={accessibility}
                                                        onChange={(e) => setAccessibility(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label>Site context</Label>
                                                    <Input
                                                        placeholder="Slope, soil type, prevailing winds, sun orientation, nearby roads/noise"
                                                        value={siteNotes}
                                                        onChange={(e) => setSiteNotes(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label>Constraints & approvals</Label>
                                                    <Input
                                                        placeholder="Zoning limits, height limits, HOA rules, SI 56 compliance notes"
                                                        value={constraints}
                                                        onChange={(e) => setConstraints(e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Timeline</Label>
                                                    <Select value={timeline} onValueChange={setTimeline}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="asap">ASAP / now</SelectItem>
                                                            <SelectItem value="0_3">0-3 months</SelectItem>
                                                            <SelectItem value="3_6">3-6 months</SelectItem>
                                                            <SelectItem value="6_12">6-12 months</SelectItem>
                                                            <SelectItem value="12_plus">12+ months</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label>Budget flexibility</Label>
                                                    <Select value={budgetFlex} onValueChange={setBudgetFlex}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="strict">Strict</SelectItem>
                                                            <SelectItem value="balanced">Balanced</SelectItem>
                                                            <SelectItem value="flex">Flexible</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold">Project summary</h4>
                                                    <span className="text-xs text-muted-foreground">Review your inputs</span>
                                                </div>
                                                <div className="rounded-md border bg-background p-3 text-sm leading-relaxed text-muted-foreground">
                                                    {buildAIBrief()}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1">
                                                    <p className="font-semibold">Basics</p>
                                                    <p className="text-muted-foreground">{title || 'Untitled'} — {location || 'No location'}, Budget: {budget ? `$${budget}` : 'n/a'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold">Status & Tier</p>
                                                    <p className="text-muted-foreground">{status} · {engagementTier}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => onOpenChange(false)}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            {step > 0 && (
                                                <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                                                    Back
                                                </Button>
                                            )}
                                        </div>

                                        {step < steps.length - 1 ? (
                                            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                                                Next
                                            </Button>
                                        ) : (
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting && <Icon name="progress_activity" className="mr-2 h-4 w-4 animate-spin" />}
                                                {isEditing ? 'Update Project' : 'Create Project'}
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </form>
                            </div>
            </DialogContent>
        </Dialog>
    )
}

import { Icon } from '@/components/ui/material-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Project, ProjectDashboard } from '@/types/api'
import { builderApi } from '@/services/api'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Route } from '@/routes/_authenticated/builder'
import { toast } from 'sonner'
import { ActionCenter, ESignaturesPending } from './action-center'
import { LiveCameras } from './live-cameras'
import { EscrowRelease } from './escrow-release'
import { JitCapitalScheduler, GroupBuyAggregator, ActOfGodValidator, MaterialDetective } from './premium-widgets'

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface DitDashboardProps {
    project: Project
}

const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-700', icon: 'schedule' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700', icon: 'schedule' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-700', icon: 'schedule' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: 'check_circle' },
}

function ProjectMap({ lat, lng }: { lat: number; lng: number }) {
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        if (!mapRef.current) {
            const map = L.map(containerRef.current).setView([lat, lng], 13)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map)

            L.marker([lat, lng]).addTo(map)
            mapRef.current = map
        } else {
            mapRef.current.setView([lat, lng], 13)
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    layer.remove()
                }
            })
            L.marker([lat, lng]).addTo(mapRef.current)
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [lat, lng])

    return <div ref={containerRef} className="h-full min-h-[250px] w-full rounded-lg" />
}

export function DitDashboard({ project }: DitDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIconName = statusConfig[project.status].icon
    const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null)

    const fetchDashboard = () => {
        builderApi.getProjectDashboard(project.id)
            .then(res => setDashboard(res.data))
            .catch(() => {})
    }

    useEffect(() => { fetchDashboard() }, [project.id])

    const handleRequestValidation = () => {
        toast.success('Validation request sent to your DzeNhare consultant.')
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-5">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-blue-50/80 to-indigo-50/50 px-5 py-3 border border-indigo-200/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="icon" onClick={() => navigate({ to: '/builder' })} className="h-8 w-8 rounded-lg hover:bg-white border-indigo-200/60 text-indigo-700">
                        <Icon name="arrow_back" size={14} />
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                            {project.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            DIT Dashboard · The Guided Co-Pilot
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 relative z-10">
                    <Badge variant="outline" className="bg-white/80 text-indigo-700 border-indigo-200 px-2.5 py-0.5 text-xs rounded-md">
                        <Icon name="group" size={12} className="mr-1.5" />
                        DIT
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} px-2.5 py-0.5 text-xs rounded-md border-0`}>
                        <Icon name={StatusIconName} size={12} className="mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            {/* Compact Stats Row */}
            <div className="grid gap-4 grid-cols-3">
                <Card className="relative overflow-hidden border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600" />
                    <CardContent className="p-4">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold font-display tracking-tight text-foreground">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md mt-1 -ml-2"
                            onClick={handleRequestValidation}
                        >
                            Validate
                        </Button>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600" />
                    <CardContent className="p-4">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                        <span className="text-xl font-bold font-display tracking-tight text-foreground">
                            {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </span>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
                    <CardContent className="p-4">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                        <span className="text-sm font-semibold text-foreground line-clamp-2">
                            {project.location}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Map + Sidebar — balanced 3/2 split */}
            <div className="grid gap-5 lg:grid-cols-5 items-stretch">
                {/* Location Map */}
                <Card className="lg:col-span-3 border-border/60 bg-card flex flex-col">
                    <CardHeader className="pb-2 flex-none">
                        <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                            <Icon name="location_on" size={16} className="text-primary" />
                            Project Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 flex-1 flex flex-col">
                        {project.latitude && project.longitude ? (
                            <div className="rounded-lg overflow-hidden border border-border/60 flex-1 relative min-h-[250px]">
                                <div className="absolute inset-0">
                                    <ProjectMap lat={Number(project.latitude)} lng={Number(project.longitude)} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Icon name="location_on" size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="text-xs">No location coordinates set.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Cards — compact stack */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Consultant Card */}
                    <Card className="border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon name="chat" size={16} className="text-indigo-600" />
                                <span className="text-sm font-semibold font-display">Your Consultant</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                    JD
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">John Doe</div>
                                    <div className="text-xs text-muted-foreground">Senior QS</div>
                                </div>
                            </div>
                            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-xs h-8">
                                <Icon name="chat" size={12} className="mr-1.5" />
                                Chat with Consultant
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Compliance */}
                    <Card className="border-border/60 bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon name="check_circle" size={16} className="text-primary" />
                                <span className="text-sm font-semibold font-display">Compliance</span>
                            </div>
                            <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${project.si56_verified ? 'bg-green-50 border-green-200' : 'bg-muted/50 border-border/60'}`}>
                                <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${project.si56_verified ? 'bg-green-100' : 'bg-muted'}`}>
                                    {project.si56_verified ? (
                                        <Icon name="check_circle" size={14} className="text-green-600" />
                                    ) : (
                                        <Icon name="schedule" size={14} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-foreground">
                                        {project.si56_verified ? 'SI 56 Verified' : 'Verification Pending'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {project.si56_verified
                                            ? 'Complies with SI 56 of 2025.'
                                            : 'Verification is in progress.'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Project Tools — contextual by status */}
            {(project.status === 'IN_PROGRESS' || project.status === 'PLANNING') && (
                <div className="space-y-5">
                    {/* Always show Action Center and E-Signatures for active/planning projects */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ActionCenter unverifiedUpdates={dashboard?.unverified_updates || []} />
                        <div className="space-y-5">
                            <ESignaturesPending requests={dashboard?.esignature_requests} projectId={project.id} />
                        </div>
                    </div>

                    {project.status === 'IN_PROGRESS' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <LiveCameras cameras={dashboard?.site_cameras} projectId={project.id} onDataChange={fetchDashboard} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <EscrowRelease milestones={dashboard?.escrow_milestones} projectId={project.id} onDataChange={fetchDashboard} />
                                <ActOfGodValidator events={dashboard?.weather_events} projectId={project.id} onDataChange={fetchDashboard} />
                                <MaterialDetective audits={dashboard?.material_audits} projectId={project.id} onManage={() => navigate({ to: `/builder/project/${project.id}/materials` })} />
                            </div>
                        </>
                    )}

                    {project.status === 'PLANNING' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <JitCapitalScheduler schedule={dashboard?.capital_schedule} projectId={project.id} onDataChange={fetchDashboard} />
                            <GroupBuyAggregator />
                            <MaterialDetective audits={dashboard?.material_audits} projectId={project.id} onManage={() => navigate({ to: `/builder/project/${project.id}/materials` })} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

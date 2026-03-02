import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { MapPin, DollarSign, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowLeft, PhoneCall, Lock, CreditCard } from 'lucide-react'
import { Project } from '@/types/api'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Route } from '@/routes/_authenticated/builder'

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface DifyDashboardProps {
    project: Project
}

const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-700', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-700', icon: Clock },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-700', icon: Clock },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
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

    return <div ref={containerRef} className="h-[250px] w-full" />
}

export function DifyDashboard({ project }: DifyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIcon = statusConfig[project.status].icon

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 via-emerald-50/80 to-teal-50/50 px-5 py-3.5 border border-teal-200/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="icon" onClick={() => navigate({ to: '/builder' })} className="h-8 w-8 rounded-lg hover:bg-white border-teal-200/60 text-teal-700">
                        <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                            {project.title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            DIFY Dashboard · The Autopilot Service
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 relative z-10">
                    <Badge variant="outline" className="bg-white/80 text-teal-700 border-teal-200 px-2.5 py-0.5 text-xs rounded-md">
                        <ShieldCheck className="w-3 h-3 mr-1.5" />
                        DIFY
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} px-2.5 py-0.5 text-xs rounded-md border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            {/* Managed Notice */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-200/60">
                <div className="h-9 w-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Managed by DzeNhare</p>
                    <p className="text-xs text-muted-foreground">Our experts manage the critical path and budget. You have view-only access.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Budget (Managed)</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold font-display tracking-tight text-foreground">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Managed project budget</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-display tracking-tight text-foreground">
                            {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Project start date</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-semibold text-foreground truncate">
                            {project.location}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Project site</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Location Map */}
                <Card className="lg:col-span-4 border-border/60 bg-card">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Project Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.latitude && project.longitude ? (
                            <div className="rounded-lg overflow-hidden border border-border/60">
                                <ProjectMap lat={Number(project.latitude)} lng={Number(project.longitude)} />
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No location coordinates set.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Cards */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Priority Support */}
                    <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                                <PhoneCall className="h-4 w-4 text-amber-600" />
                                Priority Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-3">Need immediate assistance? Use the dedicated channel.</p>
                            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm">
                                <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                                Panic Button
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Escrow Status */}
                    <Card className="border-border/60 bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                Escrow Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/60 mb-3">
                                <span className="text-xs font-medium text-muted-foreground">Funds Held</span>
                                <span className="text-sm font-bold text-green-600">$45,000.00</span>
                            </div>
                            <Button variant="outline" size="sm" className="w-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-lg">
                                View Transactions
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Compliance */}
                    <Card className="border-border/60 bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${project.si56_verified ? 'bg-green-50 border-green-200' : 'bg-muted/50 border-border/60'}`}>
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${project.si56_verified ? 'bg-green-100' : 'bg-muted'}`}>
                                    {project.si56_verified ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        {project.si56_verified ? 'SI 56 Verified' : 'Verification Pending'}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
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
        </div>
    )
}

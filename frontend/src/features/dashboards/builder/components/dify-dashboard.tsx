import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MapPin, DollarSign, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowLeft, PhoneCall, Lock } from 'lucide-react'
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
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: Clock },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
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

    return <div ref={containerRef} className="h-[300px] w-full rounded-md border" />
}

export function DifyDashboard({ project }: DifyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIcon = statusConfig[project.status].icon

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/builder' })}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground">DIFY Dashboard - The Autopilot Service</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        DIFY
                    </Badge>
                    <Badge className={statusConfig[project.status].className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            <Alert className="bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <AlertTitle className="text-teal-900 dark:text-teal-300">Managed by DzeNhare</AlertTitle>
                <AlertDescription className="text-teal-700 dark:text-teal-400">
                    This project is on Autopilot. Our experts are managing the critical path and budget. You have view-only access to ensure data integrity.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-lg bg-card border shadow-sm space-y-2 opacity-90">
                            <div className="flex items-center justify-between text-muted-foreground text-sm">
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Budget (Managed)
                                </div>
                                <Lock className="h-3 w-3" />
                            </div>
                            <div className="text-3xl font-bold">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="p-6 rounded-lg bg-card border shadow-sm space-y-2">
                            <div className="flex items-center text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Created
                            </div>
                            <div className="text-xl font-semibold">
                                {format(new Date(project.created_at), 'MMM d, yyyy')}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Location
                        </h3>
                        <p className="text-muted-foreground">{project.location}</p>

                        {project.latitude && project.longitude && (
                            <ProjectMap lat={Number(project.latitude)} lng={Number(project.longitude)} />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Panic Button */}
                    <div className="p-4 rounded-lg border bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 shadow-sm space-y-4">
                        <h3 className="font-semibold text-amber-900 dark:text-amber-300">Priority Support</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400">Need immediate assistance? Use the dedicated channel.</p>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white">
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Panic Button
                        </Button>
                    </div>

                    {/* Escrow Status */}
                    <div className="p-4 rounded-lg border bg-card shadow-sm space-y-4">
                        <h3 className="font-semibold">Escrow Status</h3>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <span className="text-sm">Funds Held</span>
                            <span className="font-bold text-green-600">$45,000.00</span>
                        </div>
                        <Button variant="outline" className="w-full">View Transactions</Button>
                    </div>

                    {/* Compliance */}
                    <div className="p-4 rounded-lg border bg-card shadow-sm space-y-4">
                        <h3 className="font-semibold">Compliance</h3>
                        <div className={`flex items-start p-3 rounded-md border ${project.si56_verified ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-800'}`}>
                            {project.si56_verified ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-green-900 dark:text-green-300">SI 56 Verified</div>
                                        <div className="text-sm text-green-700 dark:text-green-400 mt-1">This project complies with SI 56 of 2025 regulations.</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-300">Verification Pending</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">SI 56 compliance verification is in progress.</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

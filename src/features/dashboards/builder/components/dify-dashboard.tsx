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
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800', icon: Clock },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800', icon: Clock },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
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

    return <div ref={containerRef} className="h-[300px] w-full" />
}

export function DifyDashboard({ project }: DifyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIcon = statusConfig[project.status].icon

    return (
        <div className="space-y-6 w-full p-6 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4 flex-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/builder' })} className="hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{project.title}</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">DIFY Dashboard - The Autopilot Service</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-teal-300 shadow-sm px-3 py-1">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        DIFY
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} shadow-sm px-3 py-1`}>
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            <Alert className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-teal-200 rounded-xl shadow-sm">
                <div className="p-1.5 rounded-lg bg-teal-200">
                    <ShieldCheck className="h-4 w-4 text-teal-700" />
                </div>
                <AlertTitle className="text-teal-900 font-semibold">Managed by DzeNhare</AlertTitle>
                <AlertDescription className="text-teal-800">
                    This project is on Autopilot. Our experts are managing the critical path and budget. You have view-only access to ensure data integrity.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Budget (Managed)</span>
                                </div>
                                <div className="p-1.5 rounded-md bg-gray-200">
                                    <Lock className="h-3 w-3 text-gray-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="group p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Created</span>
                            </div>
                            <div className="text-xl font-semibold text-gray-900">
                                {format(new Date(project.created_at), 'MMM d, yyyy')}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* Location */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                        </div>
                        <div className="pl-12">
                            <p className="text-gray-700 text-base font-medium mb-4">{project.location}</p>

                            {project.latitude && project.longitude && (
                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                                    <ProjectMap lat={Number(project.latitude)} lng={Number(project.longitude)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Panic Button */}
                    <div className="p-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-amber-900 mb-2 text-base">Priority Support</h3>
                        <p className="text-sm text-amber-700 mb-4">Need immediate assistance? Use the dedicated channel.</p>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-10 shadow-sm">
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Panic Button
                        </Button>
                    </div>

                    {/* Escrow Status */}
                    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-900 mb-4 text-base">Escrow Status</h3>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200 mb-3">
                            <span className="text-sm font-medium text-gray-700">Funds Held</span>
                            <span className="font-bold text-green-600 text-lg">$45,000.00</span>
                        </div>
                        <Button variant="outline" className="w-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-lg h-10">View Transactions</Button>
                    </div>

                    {/* Compliance */}
                    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-900 mb-4 text-base">Compliance</h3>
                        <div className={`flex items-start p-4 rounded-lg border ${project.si56_verified ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200'}`}>
                            {project.si56_verified ? (
                                <>
                                    <div className="p-2 rounded-lg bg-green-200 mr-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-700" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-green-900">SI 56 Verified</div>
                                        <div className="text-sm text-green-700 mt-1">This project complies with SI 56 of 2025 regulations.</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 rounded-lg bg-gray-200 mr-3">
                                        <Clock className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Verification Pending</div>
                                        <div className="text-sm text-gray-600 mt-1">SI 56 compliance verification is in progress.</div>
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

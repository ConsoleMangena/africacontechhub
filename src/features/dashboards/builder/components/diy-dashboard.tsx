import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, DollarSign, Calendar, CheckCircle2, Clock, Hammer, ArrowLeft } from 'lucide-react'
import { Project } from '@/types/api'
import { format } from 'date-fns'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Route } from '@/routes/_authenticated/builder'
import { CostCalculator } from './cost-calculator'
import { ProjectRoadmap } from './project-roadmap'

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface DiyDashboardProps {
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

export function DiyDashboard({ project }: DiyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIcon = statusConfig[project.status].icon
    const [isCostCalculatorOpen, setIsCostCalculatorOpen] = useState(false)
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false)

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
                        <p className="text-sm text-gray-500 mt-1 font-medium">DIY Dashboard - The Free Toolkit</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-300 shadow-sm px-3 py-1">
                        <Hammer className="w-3.5 h-3.5 mr-1.5" />
                        DIY
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} shadow-sm px-3 py-1`}>
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-green-100">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Budget</span>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="group p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-200">
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

                    {/* Tools */}
                    <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-900 mb-4 text-base">DIY Tools</h3>
                        <div className="space-y-2.5">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-11 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors rounded-lg"
                                onClick={() => setIsCostCalculatorOpen(true)}
                            >
                                <div className="p-1.5 rounded-md bg-green-100 mr-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                ROM Calculator
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start h-11 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors rounded-lg"
                                onClick={() => setIsRoadmapOpen(true)}
                            >
                                <div className="p-1.5 rounded-md bg-green-100 mr-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                </div>
                                Project Roadmap
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Calculator Dialog */}
            <CostCalculator
                open={isCostCalculatorOpen}
                onOpenChange={setIsCostCalculatorOpen}
                projectBudget={parseFloat(project.budget)}
            />

            {/* Project Roadmap Dialog */}
            <ProjectRoadmap
                open={isRoadmapOpen}
                onOpenChange={setIsRoadmapOpen}
                project={project}
            />
        </div>
    )
}

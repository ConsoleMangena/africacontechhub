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

export function DiyDashboard({ project }: DiyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIcon = statusConfig[project.status].icon
    const [isCostCalculatorOpen, setIsCostCalculatorOpen] = useState(false)

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/builder' })}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground">DIY Dashboard - The Free Toolkit</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
                        <Hammer className="w-3 h-3 mr-1" />
                        DIY
                    </Badge>
                    <Badge className={statusConfig[project.status].className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-lg bg-card border shadow-sm space-y-2">
                            <div className="flex items-center justify-between text-muted-foreground text-sm">
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Budget
                                </div>
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

                    {/* Tools */}
                    <div className="p-4 rounded-lg border bg-card shadow-sm space-y-4">
                        <h3 className="font-semibold">DIY Tools</h3>
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsCostCalculatorOpen(true)}
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                ROM Calculator
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
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
        </div>
    )
}

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
import { aiApi, builderApi } from '@/services/api'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Route } from '@/routes/_authenticated/builder'
import { LiveCameras } from './live-cameras'
import { EscrowRelease } from './escrow-release'
import { ActOfGodValidator } from './premium-widgets'

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
    PLANNING: { label: 'Planning', className: 'bg-slate-100 text-slate-900', icon: 'schedule' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-slate-900 text-white', icon: 'schedule' },
    ON_HOLD: { label: 'On Hold', className: 'bg-slate-50 text-slate-400', icon: 'pause_circle' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-700', icon: 'check_circle' },
}

const displayValue = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') return 'Not specified'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return value
}

const toIntString = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return 'Not specified'
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed.toString() : 'Not specified'
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

    return <div ref={containerRef} className="h-[250px] sm:h-[350px] w-full rounded-lg" />
}

type SiteIntelRow = {
    aspect: string;
    finding: string;
    risk: string;
    recommendation: string;
}

export function DifyDashboard({ project }: DifyDashboardProps) {
    const navigate = Route.useNavigate()
    const StatusIconName = statusConfig[project.status].icon
    const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null)
    const [siteIntel, setSiteIntel] = useState<{ rows: SiteIntelRow[]; summary?: string; savedAt?: string } | null>(null)

    const fetchDashboard = () => {
        builderApi.getProjectDashboard(project.id)
            .then(res => setDashboard(res.data))
            .catch(() => {})
    }

    useEffect(() => { fetchDashboard() }, [project.id])

    useEffect(() => {
        const loadSiteIntel = async () => {
            try {
                const res = await aiApi.getSiteIntel(project.id)
                if (res.data?.rows?.length) {
                    setSiteIntel({ rows: res.data.rows, summary: res.data.summary, savedAt: res.data.created_at })
                } else {
                    setSiteIntel(null)
                }
            } catch (err) {
                console.error('Failed to load site intel', err)
                setSiteIntel(null)
            }
        }

        loadSiteIntel()
        const handler = (e: any) => {
            if (e?.detail?.projectId === project.id) loadSiteIntel()
        }
        window.addEventListener('site-intel-updated', handler)
        return () => window.removeEventListener('site-intel-updated', handler)
    }, [project.id])

    const exportSiteIntelCsv = () => {
        if (!siteIntel?.rows?.length) return
        const header = ['Aspect', 'Finding', 'Risk', 'Recommendation']
        const lines = [header.join(',')]
        siteIntel.rows.forEach(r => {
            const row = [r.aspect, r.finding, r.risk, r.recommendation].map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
            lines.push(row)
        })
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${project.title || 'site-intel'}-site-intel.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="w-full space-y-5">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-muted/40 px-5 py-3 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="icon" onClick={() => navigate({ to: '/builder' })} className="h-8 w-8 rounded-lg hover:bg-slate-100 border-slate-200 text-slate-600 shrink-0">
                        <Icon name="arrow_back" size={14} />
                    </Button>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-foreground line-clamp-1">
                            {project.title}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            DIFY Dashboard · The Autopilot Service
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 relative z-10 w-full sm:w-auto">
                    <Badge variant="outline" className="flex-1 sm:flex-none justify-center bg-white/70 text-foreground border-border px-2.5 py-0.5 text-[10px] sm:text-xs rounded-md">
                        <Icon name="gpp_good" size={12} className="mr-1.5" />
                        DIFY
                    </Badge>
                    <Badge className={`flex-1 sm:flex-none justify-center ${statusConfig[project.status].className} px-2.5 py-0.5 text-[10px] sm:text-xs rounded-md border`}> 
                        <Icon name={StatusIconName} size={12} className="mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>


            {/* Compact Stats Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Icon name="attach_money" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-display tracking-tight text-slate-900">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Icon name="calendar_today" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</p>
                        </div>
                        <span className="text-2xl font-bold font-display tracking-tight text-slate-900">
                            {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Icon name="location_on" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</p>
                        </div>
                        <span className="text-base font-bold text-slate-900 line-clamp-2">
                            {project.location || 'Not specified'}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Icon name="credit_card" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Escrow</p>
                        </div>
                        <span className="text-2xl font-bold font-display tracking-tight text-slate-900">
                            $45,000
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Funds held in escrow</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-none">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Icon name="check_circle" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compliance</p>
                        </div>
                        <span className="text-base font-bold text-slate-900">
                            {project.si56_verified ? 'SI 56 Verified' : 'Pending Verification'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            {project.si56_verified ? 'Complies with SI 56 of 2025.' : 'Verification in progress.'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Location Map */}
            <Card className="border-border/60 bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold font-display flex items-center gap-2 text-slate-900">
                        <Icon name="location_on" size={16} className="text-slate-400" />
                        Project Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    {project.latitude && project.longitude ? (
                        <div className="rounded-lg overflow-hidden border border-border/60 h-[250px] sm:h-[350px] isolate">
                            <ProjectMap lat={Number(project.latitude)} lng={Number(project.longitude)} />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Icon name="location_on" size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="text-xs">No location coordinates set.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Construction Tools */}
            {project.status === 'IN_PROGRESS' && (
                <div className="space-y-5">
                    <div className="flex items-center gap-2 pt-2">
                        <Icon name="construction" size={16} className="text-muted-foreground" />
                        <h3 className="text-sm font-semibold font-display text-muted-foreground uppercase tracking-wider">Construction Tools</h3>
                    </div>
                    <LiveCameras cameras={dashboard?.site_cameras} projectId={project.id} onDataChange={fetchDashboard} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <EscrowRelease milestones={dashboard?.escrow_milestones} projectId={project.id} onDataChange={fetchDashboard} />
                        <ActOfGodValidator events={dashboard?.weather_events} projectId={project.id} onDataChange={fetchDashboard} />
                    </div>
                </div>
            )}
        </div>
    )
}


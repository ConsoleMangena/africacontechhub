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
    PLANNING: { label: 'Planning', className: 'bg-muted text-foreground', icon: 'schedule' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-muted text-foreground', icon: 'schedule' },
    ON_HOLD: { label: 'On Hold', className: 'bg-muted text-foreground', icon: 'pause_circle' },
    COMPLETED: { label: 'Completed', className: 'bg-muted text-foreground', icon: 'check_circle' },
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

    return <div ref={containerRef} className="h-full min-h-[250px] w-full rounded-lg" />
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
        <div className="w-full max-w-7xl mx-auto space-y-5">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-muted/40 px-5 py-3 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" size="icon" onClick={() => navigate({ to: '/builder' })} className="h-8 w-8 rounded-lg hover:bg-white border-teal-200/60 text-teal-700">
                        <Icon name="arrow_back" size={14} />
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
                    <Badge variant="outline" className="bg-white/70 text-foreground border-border px-2.5 py-0.5 text-xs rounded-md">
                        <Icon name="gpp_good" size={12} className="mr-1.5" />
                        DIFY
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} px-2.5 py-0.5 text-xs rounded-md border`}> 
                        <Icon name={StatusIconName} size={12} className="mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>


            {/* Compact Stats Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-border/60 bg-gradient-to-br from-teal-50/50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                                <Icon name="attach_money" size={16} className="text-teal-600" />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Budget (Managed)</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                            <Icon name="lock" size={12} className="text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-gradient-to-br from-slate-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Icon name="calendar_today" size={16} className="text-slate-600" />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Created</p>
                        </div>
                        <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                            {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-gradient-to-br from-emerald-50/50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Icon name="location_on" size={16} className="text-emerald-600" />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
                        </div>
                        <span className="text-base font-semibold text-foreground line-clamp-2">
                            {project.location || 'Not specified'}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-gradient-to-br from-green-50/50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Icon name="credit_card" size={16} className="text-green-600" />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Escrow</p>
                        </div>
                        <span className="text-2xl font-bold font-display tracking-tight text-green-600">
                            $45,000
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">Funds held in escrow</p>
                    </CardContent>
                </Card>
                <Card className={`border-border/60 ${project.si56_verified ? 'bg-gradient-to-br from-green-50/50 to-white' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${project.si56_verified ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <Icon name="check_circle" size={16} className={project.si56_verified ? 'text-green-600' : 'text-slate-500'} />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Compliance</p>
                        </div>
                        <span className="text-base font-semibold text-foreground">
                            {project.si56_verified ? 'SI 56 Verified' : 'Pending Verification'}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {project.si56_verified ? 'Complies with SI 56 of 2025.' : 'Verification is in progress.'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {project.ai_brief && (
                <Card className="border-border/60 bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                            <Icon name="auto_awesome" size={16} className="text-primary" />
                            Project Brief
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground whitespace-pre-line">
                        {project.ai_brief}
                    </CardContent>
                </Card>
            )}

            {/* Project Facts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/60 bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display">Program</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Building Type</p>
                            <p className="text-foreground">{displayValue(project.building_type)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Use Case</p>
                            <p className="text-foreground">{displayValue(project.use_case)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Occupants</p>
                            <p className="text-foreground">{toIntString(project.occupants)}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-[11px] uppercase text-muted-foreground font-semibold">Beds</p>
                                <p className="text-foreground">{toIntString(project.bedrooms)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-muted-foreground font-semibold">Baths</p>
                                <p className="text-foreground">{toIntString(project.bathrooms)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-muted-foreground font-semibold">Floors</p>
                                <p className="text-foreground">{toIntString(project.floors)}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Garage</p>
                            <p className="text-foreground">{displayValue(project.has_garage)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Parking Spaces</p>
                            <p className="text-foreground">{toIntString(project.parking_spaces)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display">Site & Specs</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Lot Size</p>
                            <p className="text-foreground">{displayValue(project.lot_size)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Footprint</p>
                            <p className="text-foreground">{displayValue(project.footprint)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Preferred Style</p>
                            <p className="text-foreground">{displayValue(project.preferred_style)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Roof Type</p>
                            <p className="text-foreground">{displayValue(project.roof_type)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Special Spaces</p>
                            <p className="text-foreground">{displayValue(project.special_spaces)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Sustainability</p>
                            <p className="text-foreground">{displayValue(project.sustainability)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Accessibility</p>
                            <p className="text-foreground">{displayValue(project.accessibility)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Timeline</p>
                            <p className="text-foreground">{displayValue(project.timeline)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Budget Flexibility</p>
                            <p className="text-foreground">{displayValue(project.budget_flex)}</p>
                        </div>
                        <div className="col-span-2 border-t border-border/40 pt-3 mt-1">
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Site Notes</p>
                            <p className="text-foreground whitespace-pre-line">{displayValue(project.site_notes)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold">Constraints</p>
                            <p className="text-foreground whitespace-pre-line">{displayValue(project.constraints)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/60 bg-card">
                <CardHeader className="pb-2 flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                        <Icon name="explore" size={16} className="text-primary" />
                        Site Intel
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Get terrain, soil, flood, wind, and logistics considerations for this site. Uses the AI assistant with your project location and notes.
                    </p>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground">
                        <div>Location: <span className="text-foreground font-medium">{displayValue(project.location)}</span></div>
                        {project.latitude && project.longitude && (
                            <div>Coordinates: <span className="text-foreground font-medium">{project.latitude}, {project.longitude}</span></div>
                        )}
                        {project.site_notes && (
                            <div>Notes: <span className="text-foreground font-medium">{project.site_notes}</span></div>
                        )}
                        {siteIntel?.savedAt && (
                            <div className="text-[11px] text-muted-foreground mt-1">Last updated: {new Date(siteIntel.savedAt).toLocaleString()}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-fit"
                            onClick={() => window.dispatchEvent(new Event('ai:site-intel'))}
                        >
                            <Icon name="psychology" size={14} className="mr-2" />
                            Ask AI for site intel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!siteIntel?.rows?.length}
                            className="w-fit"
                            onClick={exportSiteIntelCsv}
                        >
                            <Icon name="download" size={14} className="mr-2" />
                            Export CSV
                        </Button>
                    </div>

                    {siteIntel?.rows?.length ? (
                        <div className="overflow-hidden border border-border/60 rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/80 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Aspect</th>
                                        <th className="px-4 py-3 text-left font-semibold">Finding</th>
                                        <th className="px-4 py-3 text-left font-semibold">Risk</th>
                                        <th className="px-4 py-3 text-left font-semibold">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {siteIntel.rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 align-top font-semibold text-foreground">{row.aspect || '-'}</td>
                                            <td className="px-4 py-3 align-top text-muted-foreground">{row.finding || '-'}</td>
                                            <td className="px-4 py-3 align-top">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                  row.risk?.toLowerCase().includes('high') ? 'bg-red-100 text-red-700' :
                                                  row.risk?.toLowerCase().includes('medium') ? 'bg-amber-100 text-amber-700' :
                                                  row.risk?.toLowerCase().includes('low') ? 'bg-green-100 text-green-700' :
                                                  'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {row.risk || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-top text-muted-foreground">{row.recommendation || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border border-dashed border-border/60">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                                <Icon name="explore" size={20} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">No site intel yet</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Click "Ask AI for site intel" to generate insights</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="border-border/60 bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2">
                        <Icon name="location_on" size={16} className="text-primary" />
                        Project Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    {project.latitude && project.longitude ? (
                        <div className="rounded-lg overflow-hidden border border-border/60 h-[350px] isolate">
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


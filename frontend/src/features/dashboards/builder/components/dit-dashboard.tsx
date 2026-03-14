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

export function DitDashboard({ project }: DitDashboardProps) {
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

    const handleRequestValidation = () => {
        toast.success('Validation request sent to your Dzenhare consultant.')
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-5">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-xl bg-muted/40 px-5 py-3 border border-border flex items-center justify-between gap-4">
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
                    <Badge variant="outline" className="bg-white/70 text-foreground border-border px-2.5 py-0.5 text-xs rounded-md">
                        <Icon name="group" size={12} className="mr-1.5" />
                        DIT
                    </Badge>
                    <Badge className={`${statusConfig[project.status].className} px-2.5 py-0.5 text-xs rounded-md border`}>
                        <Icon name={StatusIconName} size={12} className="mr-1.5" />
                        {statusConfig[project.status].label}
                    </Badge>
                </div>
            </div>

            {/* Compact Stats Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card className="border-border/60 bg-gradient-to-br from-indigo-50/50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Icon name="attach_money" size={16} className="text-indigo-600" />
                            </div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Budget</p>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md border border-indigo-100 flex items-center justify-center gap-1.5 transition-colors"
                            onClick={handleRequestValidation}
                        >
                            <Icon name="verified" size={14} />
                            Request Validation
                        </Button>
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
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/60 bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display">Site Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground min-h-[72px] whitespace-pre-line">
                        {displayValue(project.site_notes)}
                    </CardContent>
                </Card>
                <Card className="border-border/60 bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold font-display">Constraints</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground min-h-[72px] whitespace-pre-line">
                        {displayValue(project.constraints)}
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
                        Pull terrain, soil, flood, climate, and logistics considerations for this site using the AI assistant with your project details.
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
                    <div className="flex items-center gap-3 mt-1">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1 sm:flex-none h-9 px-4 font-semibold flex items-center justify-center transition-all active:scale-[0.98]"
                            onClick={() => window.dispatchEvent(new Event('ai:site-intel'))}
                        >
                            <Icon name="psychology" size={16} className="mr-2 -ml-1" />
                            Ask AI for site intel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!siteIntel?.rows?.length}
                            className="flex-1 sm:flex-none h-9 px-4 font-semibold flex items-center justify-center gap-2 border-border/80 hover:bg-accent transition-all active:scale-[0.98]"
                            onClick={exportSiteIntelCsv}
                        >
                            <Icon name="download" size={16} />
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/material-icon'
import { adminApi } from '@/services/api'
import { Route as ProjectDetailsRoute } from '@/routes/_authenticated/admin/projects.$projectId'
import { useQuery } from '@tanstack/react-query'

function formatMoney(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

export function AdminProjectDetails() {
  const { projectId } = ProjectDetailsRoute.useParams() as { projectId: string }
  const id = Number(projectId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: async () => (await adminApi.getProject(id)).data,
    enabled: Number.isFinite(id),
    staleTime: 30_000,
  })

  if (isLoading) return <Loading fullPage text="Loading project..." />
  if (!Number.isFinite(id)) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
            <CardDescription>Invalid project id.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Could not load project</CardTitle>
            <CardDescription>Try refreshing the page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const owner = data.owner ?? {}
  const architect = data.architect ?? null
  const program = data.program ?? {}
  const flags = data.flags ?? {}

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon name="folder_open" className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-display tracking-tight truncate">{data.title}</h1>
          <p className="text-sm text-muted-foreground truncate">{data.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="info" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              Overview
            </CardTitle>
            <CardDescription className="text-xs">Core project details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-[10px] font-bold">
                {String(data.status || '—').replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Engagement</span>
              <span className="text-xs font-semibold">{data.engagement_tier || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-xs font-extrabold tabular-nums">{formatMoney(Number(data.budget || 0))}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">SI56 verified</span>
              <span className="text-xs font-semibold">{flags.si56_verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Budget signed</span>
              <span className="text-xs font-semibold">{flags.is_budget_signed ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="person" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              People
            </CardTitle>
            <CardDescription className="text-xs">Owner and assigned architect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Owner</p>
              <p className="mt-1 text-sm font-semibold">{owner.name || '—'}</p>
              <p className="text-xs text-muted-foreground">{owner.email || '—'}</p>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Architect</p>
              {architect ? (
                <>
                  <p className="mt-1 text-sm font-semibold">{architect.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{architect.email || '—'}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Not assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="description" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              Brief
            </CardTitle>
            <CardDescription className="text-xs">User-provided summary.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data.ai_brief ? <div className="whitespace-pre-wrap">{data.ai_brief}</div> : <span>—</span>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Icon name="tune" className="h-3.5 w-3.5 text-slate-400" />
            </div>
            Program details
          </CardTitle>
          <CardDescription className="text-xs">Captured requirements and constraints.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ['Building type', program.building_type],
            ['Use case', program.use_case],
            ['Occupants', program.occupants],
            ['Bedrooms', program.bedrooms],
            ['Bathrooms', program.bathrooms],
            ['Floors', program.floors],
            ['Has garage', program.has_garage],
            ['Parking spaces', program.parking_spaces],
            ['Lot size', program.lot_size],
            ['Footprint', program.footprint],
            ['Preferred style', program.preferred_style],
            ['Roof type', program.roof_type],
            ['Timeline', program.timeline],
            ['Budget flex', program.budget_flex],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg border border-border/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</p>
              <p className="mt-1 text-sm font-semibold">{v === null || v === undefined || v === '' ? '—' : String(v)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


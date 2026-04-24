import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function AdminUserDetails({ userId }: { userId: number }) {
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'PAGE_VIEW' | 'CLICK' | 'ACTION' | 'OTHER'>('ALL')

  const userQuery = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => (await adminApi.getUser(userId)).data,
  })
  const user = userQuery.data
  const isUserLoading = userQuery.isLoading

  const activityQuery = useQuery({
    queryKey: ['admin-user-activity', userId, eventTypeFilter],
    queryFn: async () => {
      const params: any = { limit: 300 }
      if (eventTypeFilter !== 'ALL') params.event_type = eventTypeFilter
      return (await adminApi.getUserActivity(userId, params)).data
    },
    refetchInterval: 15_000,
  })
  const activity = activityQuery.data
  const isActivityLoading = activityQuery.isLoading

  const summary = useMemo(() => {
    const list = activity ?? []
    const total = list.length
    const pageViews = list.filter((e: any) => e.event_type === 'PAGE_VIEW').length
    const lastSeen = list[0]?.created_at
    return { total, pageViews, lastSeen }
  }, [activity])

  if (isUserLoading) return <Loading fullPage text="Loading user..." />
  if (userQuery.isError) {
    const msg =
      (userQuery.error as any)?.response?.data?.error ||
      (userQuery.error as any)?.message ||
      'Failed to load user'
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
            <Icon name="error" className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">User not available</h1>
            <p className="text-sm text-muted-foreground">{msg}</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 font-bold text-[11px] w-fit">
          <Link to="/admin/users">Back to users</Link>
        </Button>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
            <Icon name="person_off" className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">User not found</h1>
            <p className="text-sm text-muted-foreground">This user may have been deleted.</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 font-bold text-[11px] w-fit">
          <Link to="/admin/users">Back to users</Link>
        </Button>
      </div>
    )
  }

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : 'Unnamed User'

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
            <Icon name="person" className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground truncate">
              {fullName}
            </h1>
            <p className="text-[13px] text-muted-foreground font-medium truncate">{user.email}</p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="h-9 font-bold text-[11px]">
          <Link to="/admin/users">Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <Icon name="badge" className="h-4 w-4 text-slate-400" />
              Account Details
            </CardTitle>
            <CardDescription className="text-xs">Everything we know about this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">Role</span>
              <Badge variant="outline" className="text-[10px] font-bold">
                {user.profile?.role ?? user.role ?? '—'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">Status</span>
              <Badge className={user.is_active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}>
                {user.is_active ? 'Active' : 'Suspended'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">Approved</span>
              <span className="text-sm font-semibold">{user.profile?.is_approved ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">Joined</span>
              <span className="text-sm font-semibold tabular-nums">{formatDateTime(user.date_joined)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">Last login</span>
              <span className="text-sm font-semibold tabular-nums">{formatDateTime(user.last_login)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                  <Icon name="history" className="h-4 w-4 text-slate-400" />
                  Activity Log
                </CardTitle>
                <CardDescription className="text-xs">
                  {isActivityLoading ? 'Loading…' : `${summary.total} events • ${summary.pageViews} page views`}
                  {summary.lastSeen ? ` • Last seen ${formatDateTime(summary.lastSeen)}` : ''}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={eventTypeFilter} onValueChange={(v) => setEventTypeFilter(v as any)}>
                  <SelectTrigger className="h-9 w-[160px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All events</SelectItem>
                    <SelectItem value="PAGE_VIEW">Page views</SelectItem>
                    <SelectItem value="CLICK">Clicks</SelectItem>
                    <SelectItem value="ACTION">Actions</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[11px] font-bold"
                  onClick={() => {
                    void activityQuery.refetch()
                  }}
                  title="Refresh"
                >
                  <Icon name="refresh" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isActivityLoading ? (
              <div className="py-10">
                <Loading fullPage={false} text="Loading activity..." />
              </div>
            ) : (activity ?? []).length === 0 ? (
              <div className="text-center py-12 bg-muted/20 border-t border-border/40">
                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Icon name="history" className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No activity captured yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Once the user navigates around, their page views will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 border-t border-border/40">
                {(activity ?? []).map((e: any) => (
                  <div key={e.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      <Icon name={e.event_type === 'PAGE_VIEW' ? 'visibility' : 'info'} className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {e.event_type_display || e.event_type}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {e.path || e.title || '—'}
                        </span>
                      </div>
                      {e.referrer ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          Referrer: {e.referrer}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 tabular-nums">
                      {formatDateTime(e.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


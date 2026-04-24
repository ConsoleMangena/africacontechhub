import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Route as AuditLogRoute } from '@/routes/_authenticated/admin/audit-log'

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

export function AdminAuditLog() {
  const navigate = useNavigate()
  const { userId } = AuditLogRoute.useSearch() as { userId?: number }
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'ALL' | 'ADMIN' | 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER'>('ALL')
  const [includeEmpty, setIncludeEmpty] = useState<'NO' | 'YES'>('NO')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-log', search, role, includeEmpty],
    queryFn: async () => {
      const params: any = { limit: 500 }
      if (search.trim()) params.search = search.trim()
      if (role !== 'ALL') params.role = role
      if (includeEmpty === 'YES') params.include_empty = true
      return (await adminApi.getAuditLog(params)).data
    },
    refetchInterval: 15_000,
  })

  const rows = data?.results ?? []
  const summary = data?.summary ?? { users_with_activity: 0, total_events: 0, total_page_views: 0 }

  const top = useMemo(() => {
    const mostActive = [...rows].sort((a, b) => (b.total_events ?? 0) - (a.total_events ?? 0)).slice(0, 1)[0]
    return { mostActive }
  }, [rows])

  if (isLoading) return <Loading fullPage text="Loading audit log..." />

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon name="travel_explore" className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground">User activity across the system (one entry per user).</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Users with activity</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{summary.users_with_activity ?? 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">At least 1 event</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total events</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{summary.total_events ?? 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">All event types</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Page views</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{summary.total_page_views ?? 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Navigation activity</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Most active</p>
          <p className="mt-1 text-sm font-extrabold tracking-tight text-slate-900 truncate">{top.mostActive?.name ?? '—'}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1 tabular-nums">{top.mostActive ? `${top.mostActive.total_events} events` : '—'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <Card className="border-border/60 shadow-sm lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/50 focus-visible:bg-white"
              />
            </div>

            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="h-9 w-full sm:w-[160px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="BUILDER">Builder</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
              </SelectContent>
            </Select>

            <Select value={includeEmpty} onValueChange={(v) => setIncludeEmpty(v as any)}>
              <SelectTrigger className="h-9 w-full sm:w-[180px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">Only users with activity</SelectItem>
                <SelectItem value="YES">Include empty users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardTitle className="sr-only">Filters</CardTitle>
          <CardDescription className="sr-only">Filter audit log</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-xl border-t border-border/40 overflow-x-auto no-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[240px]">User</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[260px]">Email</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[150px]">Role</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[160px]">Last seen</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[140px]">Page views</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[140px]">Events</TableHead>
                  <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[110px]">
                    <div className="flex justify-end">Actions</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Icon name="history" className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">No users match your filters.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r: any) => (
                    <TableRow key={r.user_id} className="hover:bg-muted/20">
                      <TableCell className="px-4 py-3 align-middle">
                        <button
                          className="text-[13px] font-semibold text-indigo-700 hover:underline text-left"
                          onClick={() => navigate({ to: '/admin/audit-log', search: (prev) => ({ ...prev, userId: r.user_id }) })}
                        >
                          {r.name || 'Unnamed User'}
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <span className="text-[12px] text-muted-foreground">{r.email}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <Badge variant="outline" className="text-[10px] font-bold">{r.role}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <span className="text-[11px] text-muted-foreground tabular-nums">{formatDateTime(r.last_seen)}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-right tabular-nums font-semibold">
                        {r.page_views ?? 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-right tabular-nums font-semibold">
                        {r.total_events ?? 0}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View user activity"
                          onClick={() => navigate({ to: '/admin/audit-log', search: (prev) => ({ ...prev, userId: r.user_id }) })}
                        >
                          <Icon name="visibility" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon name="visibility" className="h-3.5 w-3.5 text-slate-400" />
                </div>
                User Activity
              </CardTitle>
              <CardDescription className="text-xs">
                {userId ? `Viewing user #${userId}` : 'Select a user to view their activity'}
              </CardDescription>
            </div>
            {userId ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-bold"
                onClick={() => navigate({ to: '/admin/audit-log', search: (prev) => ({ ...prev, userId: undefined }) })}
              >
                <Icon name="close" className="h-4 w-4 mr-1.5" />
                Close
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {userId ? (
            <InlineUserActivity userId={userId} />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Icon name="touch_app" className="h-7 w-7 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">Click a user name or the eye icon.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

function InlineUserActivity({ userId }: { userId: number }) {
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | 'PAGE_VIEW' | 'CLICK' | 'ACTION' | 'OTHER'>('ALL')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<'10' | '25' | '50'>('25')

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => (await adminApi.getUser(userId)).data,
  })

  const activityQuery = useQuery({
    queryKey: ['admin-user-activity', userId, eventTypeFilter],
    queryFn: async () => {
      const params: any = { limit: 300 }
      if (eventTypeFilter !== 'ALL') params.event_type = eventTypeFilter
      return (await adminApi.getUserActivity(userId, params)).data
    },
  })

  if (isUserLoading) return <Loading fullPage={false} text="Loading user..." />
  if (!user) return null

  const activity = activityQuery.data ?? []
  const total = activity.length
  const size = Number(pageSize)
  const totalPages = Math.max(1, Math.ceil(total / size))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIdx = (safePage - 1) * size
  const endIdx = Math.min(total, startIdx + size)
  const items = activity.slice(startIdx, endIdx)

  // Reset pagination when context changes
  useEffect(() => {
    setPage(1)
  }, [userId, eventTypeFilter, pageSize])

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{user.email}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {(user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}`.trim() : 'Unnamed User'}
          </p>
        </div>
        <Select value={eventTypeFilter} onValueChange={(v) => setEventTypeFilter(v as any)}>
          <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PAGE_VIEW">Page views</SelectItem>
            <SelectItem value="CLICK">Clicks</SelectItem>
            <SelectItem value="ACTION">Actions</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        {activityQuery.isLoading ? (
          <div className="py-8">
            <Loading fullPage={false} text="Loading activity..." />
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/20">
            <p className="text-xs font-medium">No activity recorded for this user yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((e: any) => (
              <div key={e.id} className="flex items-start gap-2 px-3 py-2">
                <div className="h-7 w-7 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={e.event_type === 'PAGE_VIEW' ? 'visibility' : 'info'} className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold">{e.event_type_display || e.event_type}</Badge>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{formatDateTime(e.created_at)}</span>
                  </div>
                  <p className="text-[12px] font-medium truncate">{e.path || e.title || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              Showing {startIdx + 1}-{endIdx} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                <SelectTrigger className="h-8 w-[110px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-muted-foreground tabular-nums">
              Page {safePage} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px]"
                disabled={safePage <= 1}
                onClick={() => setPage(1)}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title="Previous"
              >
                <Icon name="chevron_left" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title="Next"
              >
                <Icon name="chevron_right" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px]"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                Last
              </Button>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            <Button asChild variant="link" className="px-0 text-[11px]">
              <Link to="/admin/users/$userId" params={{ userId: String(userId) }}>
                Open full details
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


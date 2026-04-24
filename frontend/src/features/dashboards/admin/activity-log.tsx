import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { useState } from 'react'

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
}

const actionConfig: Record<string, { icon: string; color: string; bg: string }> = {
    USER_CREATED: { icon: 'person_add', color: 'text-slate-900', bg: 'bg-slate-100' },
    USER_DELETED: { icon: 'person_remove', color: 'text-slate-500', bg: 'bg-slate-50' },
    USER_ROLE_CHANGED: { icon: 'swap_horiz', color: 'text-slate-900', bg: 'bg-slate-100' },
    USER_TOGGLED: { icon: 'toggle_on', color: 'text-slate-900', bg: 'bg-slate-100' },
    REQUEST_APPROVED: { icon: 'check_circle', color: 'text-white', bg: 'bg-slate-900' },
    REQUEST_REJECTED: { icon: 'cancel', color: 'text-slate-500', bg: 'bg-slate-100' },
    SETTINGS_CHANGED: { icon: 'settings', color: 'text-slate-900', bg: 'bg-slate-100' },
    DOCUMENT_UPLOADED: { icon: 'upload_file', color: 'text-slate-900', bg: 'bg-slate-100' },
    DOCUMENT_DELETED: { icon: 'delete', color: 'text-slate-500', bg: 'bg-slate-100' },
    OTHER: { icon: 'info', color: 'text-slate-400', bg: 'bg-slate-50' },
}

export function AdminActivityLog() {
    const [actionFilter, setActionFilter] = useState('ALL')

    const { data, isLoading } = useQuery({
        queryKey: ['admin-activity-log', actionFilter],
        queryFn: async () => {
            const params: any = { limit: 200 }
            if (actionFilter && actionFilter !== 'ALL') params.action = actionFilter
            return (await adminApi.getActivityLog(params)).data
        },
        refetchInterval: 15_000,
    })

    if (isLoading) return <Loading fullPage text="Loading activity log..." />

    const logs = data ?? []

    return (
        <div className="w-full space-y-6">
            {/* Filter */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <Icon name="filter_list" className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                System Audit Log
                            </CardTitle>
                            <CardDescription className="text-xs">{logs.length} log entr{logs.length !== 1 ? 'ies' : 'y'}</CardDescription>
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="All actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                <SelectItem value="USER_ROLE_CHANGED">Role Changes</SelectItem>
                                <SelectItem value="USER_TOGGLED">User Toggled</SelectItem>
                                <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                                <SelectItem value="REQUEST_APPROVED">Approved Requests</SelectItem>
                                <SelectItem value="REQUEST_REJECTED">Rejected Requests</SelectItem>
                                <SelectItem value="SETTINGS_CHANGED">Settings Changed</SelectItem>
                                <SelectItem value="DOCUMENT_UPLOADED">Document Uploads</SelectItem>
                                <SelectItem value="DOCUMENT_DELETED">Document Deletions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 border-t border-border/40">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <Icon name="history" className="h-5 w-5 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No activity logged yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Admin actions will appear here as they occur.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {logs.map((entry: any) => {
                                const cfg = actionConfig[entry.action] || actionConfig.OTHER
                                return (
                                    <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                                        <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon name={cfg.icon} className={`h-4 w-4 ${cfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-semibold">{entry.actor_name || entry.actor_email}</span>
                                                <Badge className={`${cfg.bg} ${cfg.color} text-[10px]`}>
                                                    {entry.action_display}
                                                </Badge>
                                                {entry.target_label && (
                                                    <span className="text-xs text-muted-foreground">
                                                        — {entry.target_label}
                                                    </span>
                                                )}
                                            </div>
                                            {entry.detail && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{entry.detail}</p>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                                            {timeAgo(entry.created_at)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

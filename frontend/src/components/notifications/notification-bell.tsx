import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/material-icon'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { apiClient } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  action_url: string | null
  created_at: string
}

interface PaginatedResponse<T> {
  results: T[]
  count: number
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  // Polling every 30 seconds for real-time feel
  const { data: pagination } = useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/notifications/')
      return res.data
    },
    refetchInterval: 30000,
  })

  const notifications = pagination?.results || []

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.post(`/api/v1/notifications/${id}/mark_read/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/v1/notifications/mark_all_read/')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-600 shrink-0"
        >
          <Icon name="notifications" size={18} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 rounded-2xl shadow-xl overflow-hidden border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h4 className="font-bold text-slate-900">Notifications</h4>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="h-7 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900"
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Icon name="notifications_off" size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-900">All caught up</p>
              <p className="text-xs text-slate-500">You have no notifications.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 bg-white">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markRead.mutate(notif.id)
                    if (notif.action_url) {
                      window.location.href = notif.action_url
                      setOpen(false)
                    }
                  }}
                  className={cn(
                    "relative p-4 transition-colors cursor-pointer group hover:bg-slate-50",
                    !notif.read ? "bg-slate-50/80" : "bg-white"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border",
                        !notif.read ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                      )}>
                        <Icon 
                          name={
                            notif.type === 'budget' ? 'payments' :
                            notif.type === 'procurement' ? 'local_shipping' :
                            notif.type === 'team' ? 'group' :
                            notif.type === 'design' ? 'architecture' :
                            'info'
                          } 
                          size={14} 
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold mb-1 leading-none",
                        !notif.read ? "text-slate-900" : "text-slate-600"
                      )}>
                        {notif.title}
                      </p>
                      <p className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        !notif.read ? "text-slate-600 font-medium" : "text-slate-500"
                      )}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2">
                        {new Date(notif.created_at).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

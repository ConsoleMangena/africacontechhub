import { Icon } from '@/components/ui/material-icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface Notification {
  id: number
  type: 'team' | 'budget' | 'procurement' | 'design' | 'status' | 'general'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  onClear: (id: number) => void
}

const NOTIFICATION_ICONS: Record<Notification['type'], { icon: string; color: string }> = {
  team: { icon: 'groups', color: 'text-emerald-600 bg-emerald-50' },
  budget: { icon: 'receipt_long', color: 'text-blue-600 bg-blue-50' },
  procurement: { icon: 'inventory_2', color: 'text-violet-600 bg-violet-50' },
  design: { icon: 'architecture', color: 'text-indigo-600 bg-indigo-50' },
  status: { icon: 'info', color: 'text-amber-600 bg-amber-50' },
  general: { icon: 'notifications', color: 'text-slate-600 bg-slate-50' },
}

export function NotificationCenter({ notifications, onMarkAsRead, onMarkAllAsRead, onClear }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Icon name="notifications" size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={onMarkAllAsRead} className="text-xs h-7">
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Icon name="notifications_off" size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const iconConfig = NOTIFICATION_ICONS[notification.type]
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer',
                        !notification.read && 'bg-blue-50/30'
                      )}
                      onClick={() => !notification.read && onMarkAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', iconConfig.color)}>
                          <Icon name={iconConfig.icon} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm text-slate-900">{notification.title}</p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-slate-400">{formatTimestamp(notification.timestamp)}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onClear(notification.id)
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

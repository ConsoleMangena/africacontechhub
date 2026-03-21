import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ActivityEvent {
  id: number
  type: 'team' | 'budget' | 'procurement' | 'design' | 'status' | 'document' | 'general'
  action: string
  description: string
  user: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  activities: ActivityEvent[]
  maxItems?: number
}

const ACTIVITY_CONFIG: Record<ActivityEvent['type'], { icon: string; color: string }> = {
  team: { icon: 'group_add', color: 'text-emerald-600 bg-emerald-50' },
  budget: { icon: 'edit_note', color: 'text-blue-600 bg-blue-50' },
  procurement: { icon: 'shopping_cart', color: 'text-violet-600 bg-violet-50' },
  design: { icon: 'draw', color: 'text-indigo-600 bg-indigo-50' },
  status: { icon: 'update', color: 'text-amber-600 bg-amber-50' },
  document: { icon: 'upload_file', color: 'text-purple-600 bg-purple-50' },
  general: { icon: 'info', color: 'text-slate-600 bg-slate-50' },
}

export function ActivityFeed({ activities, maxItems = 20 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  const formatTimestamp = (timestamp: string): string => {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const groupByDate = (activities: ActivityEvent[]) => {
    const groups: Record<string, ActivityEvent[]> = {}
    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(activity)
    })
    return groups
  }

  const groupedActivities = groupByDate(displayedActivities)

  return (
    <Card className="rounded-xl sm:rounded-2xl">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icon name="history" size={18} className="text-blue-600 sm:hidden" />
          <Icon name="history" size={20} className="text-blue-600 hidden sm:block" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {displayedActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Icon name="event_busy" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedActivities).map(([date, events]) => (
              <div key={date}>
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 sm:mb-3 sticky top-0 bg-white py-1">
                  {date}
                </h3>
                <div className="space-y-2 sm:space-y-3 relative before:absolute before:left-4 sm:before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
                  {events.map((activity, idx) => {
                    const config = ACTIVITY_CONFIG[activity.type]
                    return (
                      <div key={activity.id} className="relative flex gap-2 sm:gap-3 group">
                        {/* Icon */}
                        <div className={cn(
                          'h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white z-10',
                          config.color
                        )}>
                          <Icon name={config.icon} size={14} className="sm:hidden" />
                          <Icon name={config.icon} size={16} className="hidden sm:block" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                                {activity.action}
                              </p>
                              <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 line-clamp-2">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-slate-200 flex items-center justify-center">
                                <Icon name="person" size={10} className="text-slate-600 sm:hidden" />
                                <Icon name="person" size={12} className="text-slate-600 hidden sm:block" />
                              </div>
                              <span className="text-[10px] sm:text-xs text-slate-500">{activity.user}</span>
                            </div>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0">
                                {Object.keys(activity.metadata).length} detail{Object.keys(activity.metadata).length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

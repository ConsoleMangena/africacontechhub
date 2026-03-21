import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Milestone {
  id: number
  name: string
  description?: string
  targetDate: string
  completedDate?: string
  completed: boolean
  category: 'design' | 'budget' | 'procurement' | 'construction' | 'other'
}

interface MilestoneTrackerProps {
  milestones: Milestone[]
  onToggleComplete?: (id: number) => void
  readOnly?: boolean
}

const MILESTONE_ICONS: Record<Milestone['category'], { icon: string; color: string }> = {
  design: { icon: 'architecture', color: 'text-indigo-600 bg-indigo-50' },
  budget: { icon: 'receipt_long', color: 'text-emerald-600 bg-emerald-50' },
  procurement: { icon: 'inventory_2', color: 'text-violet-600 bg-violet-50' },
  construction: { icon: 'engineering', color: 'text-amber-600 bg-amber-50' },
  other: { icon: 'flag', color: 'text-slate-600 bg-slate-50' },
}

export function MilestoneTracker({ milestones, onToggleComplete, readOnly = false }: MilestoneTrackerProps) {
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  })

  const completedCount = milestones.filter(m => m.completed).length
  const totalCount = milestones.length
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue = (targetDate: string, completed: boolean) => {
    if (completed) return false
    return new Date(targetDate) < new Date()
  }

  return (
    <Card className="rounded-xl sm:rounded-2xl">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Icon name="emoji_events" size={18} className="text-amber-600 sm:hidden" />
            <Icon name="emoji_events" size={20} className="text-amber-600 hidden sm:block" />
            <span className="hidden xs:inline">Project </span>Milestones
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600">
              {completedCount}/{totalCount}
            </span>
            <div className="w-16 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {milestones.length === 0 ? (
          <div className="py-6 sm:py-8 text-center text-slate-400">
            <Icon name="flag" size={28} className="mx-auto mb-2 opacity-40 sm:hidden" />
            <Icon name="flag" size={32} className="mx-auto mb-2 opacity-40 hidden sm:block" />
            <p className="text-sm">No milestones defined yet</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {sortedMilestones.map((milestone, idx) => {
              const iconConfig = MILESTONE_ICONS[milestone.category]
              const overdue = isOverdue(milestone.targetDate, milestone.completed)
              
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    'group rounded-lg border-2 p-3 transition-all',
                    milestone.completed 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : overdue 
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md'
                  )}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${idx * 50}ms both`
                  }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Checkbox/Status Icon */}
                    <button
                      onClick={() => !readOnly && onToggleComplete?.(milestone.id)}
                      disabled={readOnly}
                      className={cn(
                        'shrink-0 transition-all mt-0.5',
                        readOnly && 'cursor-default'
                      )}
                    >
                      <Icon
                        name={milestone.completed ? 'check_circle' : 'radio_button_unchecked'}
                        size={22}
                        className={cn(
                          'transition-colors sm:hidden',
                          milestone.completed 
                            ? 'text-emerald-500' 
                            : overdue 
                              ? 'text-red-400 hover:text-red-500'
                              : 'text-slate-300 hover:text-blue-500'
                        )}
                      />
                      <Icon
                        name={milestone.completed ? 'check_circle' : 'radio_button_unchecked'}
                        size={24}
                        className={cn(
                          'transition-colors hidden sm:block',
                          milestone.completed 
                            ? 'text-emerald-500' 
                            : overdue 
                              ? 'text-red-400 hover:text-red-500'
                              : 'text-slate-300 hover:text-blue-500'
                        )}
                      />
                    </button>

                    {/* Category Icon */}
                    <div className={cn('h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0', iconConfig.color)}>
                      <Icon name={iconConfig.icon} size={16} className="sm:hidden" />
                      <Icon name={iconConfig.icon} size={18} className="hidden sm:block" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <p className={cn(
                          'font-semibold text-xs sm:text-sm',
                          milestone.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                        )}>
                          {milestone.name}
                        </p>
                        {milestone.completed ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0 shrink-0">
                            <Icon name="check" size={10} className="mr-0.5" />
                            Done
                          </Badge>
                        ) : overdue ? (
                          <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0 shrink-0">
                            <Icon name="warning" size={10} className="mr-0.5" />
                            Overdue
                          </Badge>
                        ) : null}
                      </div>
                      
                      {milestone.description && (
                        <p className="text-xs text-slate-600 mb-2">{milestone.description}</p>
                      )}
                      
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-[10px] sm:text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Icon name="calendar_today" size={11} />
                          <span>Target: {formatDate(milestone.targetDate)}</span>
                        </div>
                        {milestone.completedDate && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Icon name="check" size={11} />
                            <span>Done: {formatDate(milestone.completedDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  )
}

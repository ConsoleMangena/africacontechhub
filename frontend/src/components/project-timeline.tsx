import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BOQScheduleTask } from '@/types/api'

interface ProjectTimelineProps {
  tasks: BOQScheduleTask[]
  projectStartDate?: string
  projectEndDate?: string
}

export function ProjectTimeline({ tasks, projectStartDate, projectEndDate }: ProjectTimelineProps) {
  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : 0
    const dateB = b.start_date ? new Date(b.start_date).getTime() : 0
    return dateA - dateB
  })

  // Calculate project duration
  const getProjectDates = () => {
    if (projectStartDate && projectEndDate) {
      return { start: new Date(projectStartDate), end: new Date(projectEndDate) }
    }
    if (tasks.length === 0) return null
    
    const dates = tasks
      .filter(t => t.start_date || t.end_date)
      .flatMap(t => [t.start_date, t.end_date].filter(Boolean) as string[])
      .map(d => new Date(d))
    
    if (dates.length === 0) return null
    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    }
  }

  const projectDates = getProjectDates()
  
  const getTaskPosition = (task: BOQScheduleTask) => {
    if (!projectDates || !task.start_date) return { left: 0, width: 0 }
    
    const projectDuration = projectDates.end.getTime() - projectDates.start.getTime()
    const taskStart = new Date(task.start_date).getTime()
    const taskEnd = task.end_date ? new Date(task.end_date).getTime() : taskStart + (task.days || 1) * 86400000
    
    const left = ((taskStart - projectDates.start.getTime()) / projectDuration) * 100
    const width = ((taskEnd - taskStart) / projectDuration) * 100
    
    return { left: Math.max(0, left), width: Math.max(2, width) }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!projectDates) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          <Icon name="event_note" size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No timeline data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="timeline" size={20} className="text-blue-600" />
            Project Timeline
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Icon name="calendar_today" size={14} />
              {formatDate(projectDates.start)}
            </div>
            <Icon name="arrow_forward" size={12} />
            <div className="flex items-center gap-1">
              <Icon name="event" size={14} />
              {formatDate(projectDates.end)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Timeline Header - Months */}
        <div className="relative h-8 border-b border-slate-200">
          <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            {Array.from({ length: 6 }).map((_, i) => {
              const date = new Date(projectDates.start)
              date.setMonth(date.getMonth() + i)
              return (
                <span key={i} className="flex-1 text-center">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              )
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {sortedTasks.map((task, idx) => {
            const position = getTaskPosition(task)
            const colors = [
              'bg-blue-500',
              'bg-emerald-500',
              'bg-violet-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-indigo-500',
            ]
            const color = colors[idx % colors.length]
            
            return (
              <div key={task.id} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {task.task_description || task.wbs || `Task ${idx + 1}`}
                    </p>
                    {task.predecessor && (
                      <p className="text-[10px] text-slate-400">Depends on: {task.predecessor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    {task.days && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {task.days}d
                      </Badge>
                    )}
                    {task.est_cost && (
                      <span className="font-semibold tabular-nums">
                        ${Number(task.est_cost).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Gantt Bar */}
                <div className="relative h-6 bg-slate-50 rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'absolute h-full rounded transition-all group-hover:opacity-80',
                      color
                    )}
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                    }}
                  >
                    <div className="h-full flex items-center justify-center text-white text-[9px] font-semibold px-2">
                      {position.width > 15 && (task.wbs || '')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-slate-300" />
            <span>Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

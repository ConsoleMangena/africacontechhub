import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HealthIndicatorProps {
  label: string
  status: 'good' | 'warning' | 'critical'
  value: string
  icon: string
  details?: string
}

interface ProjectHealthDashboardProps {
  budgetUtilization: number
  tasksCompleted: number
  totalTasks: number
  teamAssigned: number
  teamPending: number
  procurementDelivered: number
  totalProcurement: number
}

function HealthIndicator({ label, status, value, icon, details }: HealthIndicatorProps) {
  const statusConfig = {
    good: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn('rounded-lg border-2 p-2.5 sm:p-3 transition-all hover:shadow-md', config.bg, config.border)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn('h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white flex items-center justify-center shrink-0', config.icon)}>
          <Icon name={icon} size={18} className="sm:hidden" />
          <Icon name={icon} size={20} className="hidden sm:block" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
            <Badge className={cn('text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0', config.badge)}>
              {status === 'good' ? 'On Track' : status === 'warning' ? 'Attention' : 'Critical'}
            </Badge>
          </div>
          <p className={cn('text-base sm:text-lg font-bold', config.text)}>{value}</p>
          {details && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">{details}</p>}
        </div>
      </div>
    </div>
  )
}

export function ProjectHealthDashboard({
  budgetUtilization,
  tasksCompleted,
  totalTasks,
  teamAssigned,
  teamPending,
  procurementDelivered,
  totalProcurement,
}: ProjectHealthDashboardProps) {
  // Determine budget status
  const budgetStatus = budgetUtilization > 90 ? 'critical' : budgetUtilization > 75 ? 'warning' : 'good'
  
  // Determine schedule status
  const schedulePercent = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0
  const scheduleStatus = schedulePercent < 50 ? 'warning' : schedulePercent < 80 ? 'good' : 'good'
  
  // Determine team status
  const teamStatus = teamPending > 3 ? 'warning' : teamPending > 0 ? 'good' : 'good'
  
  // Determine procurement status
  const procurementPercent = totalProcurement > 0 ? (procurementDelivered / totalProcurement) * 100 : 0
  const procurementStatus = procurementPercent < 50 ? 'warning' : procurementPercent < 80 ? 'good' : 'good'

  // Overall health score
  const healthScore = [budgetStatus, scheduleStatus, teamStatus, procurementStatus].filter(s => s === 'good').length
  const overallStatus = healthScore >= 3 ? 'good' : healthScore >= 2 ? 'warning' : 'critical'

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Icon name="health_and_safety" size={18} className="text-blue-600 sm:hidden" />
            <Icon name="health_and_safety" size={20} className="text-blue-600 hidden sm:block" />
            Project Health
          </CardTitle>
          <Badge className={cn(
            'text-xs px-3 py-1',
            overallStatus === 'good' ? 'bg-emerald-100 text-emerald-700' :
            overallStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          )}>
            {overallStatus === 'good' ? '✓ Healthy' : overallStatus === 'warning' ? '⚠ Needs Attention' : '⚠ Critical'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-3 sm:px-6">
        <HealthIndicator
          label="Budget"
          status={budgetStatus}
          value={`${budgetUtilization.toFixed(1)}% Used`}
          icon="account_balance_wallet"
          details={budgetUtilization > 90 ? 'Approaching budget limit' : 'Within budget'}
        />
        
        <HealthIndicator
          label="Schedule"
          status={scheduleStatus}
          value={`${tasksCompleted}/${totalTasks} Tasks`}
          icon="schedule"
          details={`${schedulePercent.toFixed(0)}% complete`}
        />
        
        <HealthIndicator
          label="Team"
          status={teamStatus}
          value={`${teamAssigned} Active`}
          icon="groups"
          details={teamPending > 0 ? `${teamPending} pending assignment` : 'All assigned'}
        />
        
        <HealthIndicator
          label="Procurement"
          status={procurementStatus}
          value={`${procurementDelivered}/${totalProcurement} Delivered`}
          icon="inventory_2"
          details={`${procurementPercent.toFixed(0)}% complete`}
        />
      </CardContent>
    </Card>
  )
}

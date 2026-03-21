import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectTeam } from '@/types/api'

interface DIFYProgressDashboardProps {
  project: Project
  team?: ProjectTeam[]
  budgetSigned?: boolean
  procurementCount?: number
  drawingsCount?: number
}

const PHASES = [
  { key: 'design', label: 'Design & Planning', icon: 'architecture', color: 'indigo' },
  { key: 'budget', label: 'Budget Approval', icon: 'receipt_long', color: 'emerald' },
  { key: 'procurement', label: 'Procurement', icon: 'inventory_2', color: 'violet' },
  { key: 'construction', label: 'Construction', icon: 'engineering', color: 'amber' },
]

export function DIFYProgressDashboard({ 
  project, 
  team = [], 
  budgetSigned = false,
  procurementCount = 0,
  drawingsCount = 0
}: DIFYProgressDashboardProps) {
  
  // Determine current phase based on project data
  const getCurrentPhase = () => {
    if (project.status === 'COMPLETED') return 4
    if (procurementCount > 0) return 3
    if (budgetSigned) return 2
    if (drawingsCount > 0) return 1
    return 0
  }

  const currentPhaseIndex = getCurrentPhase()
  const sqbTeam = team.filter(t => t.status === 'assigned')

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Icon name="support_agent" size={18} className="text-purple-600 sm:hidden" />
                <Icon name="support_agent" size={20} className="text-purple-600 hidden sm:block" />
                <span className="hidden xs:inline">DIFY </span>Project Management
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">SQB is managing your project end-to-end</p>
            </div>
            <Badge className="bg-purple-600 text-white text-[10px] sm:text-xs shrink-0">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          {/* Progress Timeline */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Project Phase</p>
            <div className="relative">
              {/* Progress bar background */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />
              <div 
                className="absolute top-5 left-0 h-1 bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentPhaseIndex / (PHASES.length - 1)) * 100}%` }}
              />
              
              {/* Phase steps */}
              <div className="relative flex justify-between">
                {PHASES.map((phase, idx) => {
                  const isComplete = idx < currentPhaseIndex
                  const isCurrent = idx === currentPhaseIndex
                  const colorMap: Record<string, string> = {
                    indigo: 'bg-indigo-500',
                    emerald: 'bg-emerald-500',
                    violet: 'bg-violet-500',
                    amber: 'bg-amber-500',
                  }
                  
                  return (
                    <div key={phase.key} className="flex flex-col items-center gap-1 sm:gap-2 relative z-10">
                      <div className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        isComplete || isCurrent 
                          ? `${colorMap[phase.color]} border-${phase.color}-500 text-white shadow-lg` 
                          : 'bg-white border-slate-300 text-slate-400'
                      )}>
                        <Icon name={isComplete ? 'check' : phase.icon} size={14} className="sm:hidden" />
                        <Icon name={isComplete ? 'check' : phase.icon} size={18} className="hidden sm:block" />
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          'text-[8px] sm:text-[10px] font-semibold max-w-[60px] sm:max-w-[80px] leading-tight',
                          isCurrent ? 'text-purple-700' : isComplete ? 'text-slate-700' : 'text-slate-400'
                        )}>
                          {phase.label}
                        </p>
                        {isCurrent && (
                          <Badge className="mt-1 bg-purple-100 text-purple-700 text-[8px] px-1 py-0">Current</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SQB Team Section */}
          {sqbTeam.length > 0 && (
            <div className="pt-3 border-t border-purple-100">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Your SQB Team</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sqbTeam.map(member => (
                  <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <Icon name="person" size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{member.full_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 border-t border-purple-100">
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200">
              <p className="text-base sm:text-lg font-bold text-slate-900">{drawingsCount}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">Drawings</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200">
              <p className="text-base sm:text-lg font-bold text-slate-900">{procurementCount}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">Procured</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-white border border-slate-200">
              <p className="text-base sm:text-lg font-bold text-slate-900">{sqbTeam.length}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">Team</p>
            </div>
          </div>

          {/* Contact SQB */}
          <div className="pt-3 border-t border-purple-100">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Icon name="chat" size={16} className="mr-2" />
              Contact Your Project Manager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="upcoming" size={16} className="text-amber-600" />
            What's Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentPhaseIndex === 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="circle" size={8} className="text-indigo-500 mt-1.5" />
                <p className="text-slate-700">SQB team is working on your design and initial plans</p>
              </div>
            )}
            {currentPhaseIndex === 1 && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="circle" size={8} className="text-emerald-500 mt-1.5" />
                <p className="text-slate-700">Budget preparation and cost estimation in progress</p>
              </div>
            )}
            {currentPhaseIndex === 2 && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="circle" size={8} className="text-violet-500 mt-1.5" />
                <p className="text-slate-700">Materials and services procurement underway</p>
              </div>
            )}
            {currentPhaseIndex === 3 && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="circle" size={8} className="text-amber-500 mt-1.5" />
                <p className="text-slate-700">Construction phase - regular updates will be provided</p>
              </div>
            )}
            {currentPhaseIndex === 4 && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="check_circle" size={16} className="text-emerald-500" />
                <p className="text-slate-700 font-semibold">Project completed! 🎉</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

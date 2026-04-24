import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  onClick: () => void
  disabled?: boolean
}

interface QuickActionsPanelProps {
  projectId: number | null
  onAddTask?: () => void
  onAddInvoice?: () => void
  onUploadPhoto?: () => void
  onAddDocument?: () => void
  onAddTeamMember?: () => void
  onCreateProcurement?: () => void
  isDIFY?: boolean
}

export function QuickActionsPanel({
  projectId,
  onAddTask,
  onAddInvoice,
  onUploadPhoto,
  onAddDocument,
  onAddTeamMember,
  onCreateProcurement,
  isDIFY = false,
}: QuickActionsPanelProps) {
  const actions: QuickAction[] = [
    {
      id: 'task',
      label: 'Add Task',
      icon: 'add_task',
      color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
      onClick: () => onAddTask?.(),
      disabled: isDIFY,
    },
    {
      id: 'procurement',
      label: 'New Request',
      icon: 'shopping_cart',
      color: 'hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200',
      onClick: () => onCreateProcurement?.(),
      disabled: isDIFY,
    },
    {
      id: 'team',
      label: 'Add Team',
      icon: 'person_add',
      color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200',
      onClick: () => onAddTeamMember?.(),
      disabled: isDIFY,
    },
    {
      id: 'photo',
      label: 'Upload Photo',
      icon: 'camera_alt',
      color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200',
      onClick: () => onUploadPhoto?.(),
    },
    {
      id: 'document',
      label: 'Add Document',
      icon: 'upload_file',
      color: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200',
      onClick: () => onAddDocument?.(),
    },
    {
      id: 'invoice',
      label: 'New Invoice',
      icon: 'receipt',
      color: 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200',
      onClick: () => onAddInvoice?.(),
      disabled: isDIFY,
    },
  ]

  const enabledActions = actions.filter(a => !a.disabled)

  return (
    <Card className="rounded-xl sm:rounded-2xl">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icon name="bolt" size={18} className="text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {!projectId ? (
          <div className="py-6 text-center text-slate-400">
            <Icon name="info" size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">Select a project to see actions</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-1.5 sm:gap-2">
            {enabledActions.map((action, idx) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'h-auto flex-col gap-1 sm:gap-2 py-2 sm:py-3 transition-all rounded-lg sm:rounded-xl',
                  action.color,
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  animation: `slideIn 0.3s ease-out ${idx * 50}ms both`
                }}
              >
                <Icon name={action.icon} size={18} className="sm:hidden" />
                <Icon name={action.icon} size={20} className="hidden sm:block" />
                <span className="text-[10px] sm:text-xs font-semibold leading-tight text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
        
        {isDIFY && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
              <Icon name="info" size={12} />
              Some actions disabled for DIFY projects
            </p>
          </div>
        )}
      </CardContent>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Card>
  )
}

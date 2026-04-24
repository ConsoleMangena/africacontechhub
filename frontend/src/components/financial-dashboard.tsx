import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BudgetSheets, MaterialRequest } from '@/types/api'

interface FinancialDashboardProps {
  budgetSheets: BudgetSheets | null
  procurementRequests: MaterialRequest[]
  projectBudget: number
}

export function FinancialDashboard({ budgetSheets, procurementRequests, projectBudget }: FinancialDashboardProps) {
  const budgetTotal = budgetSheets?.budget_meta?.gross_total ? Number(budgetSheets.budget_meta.gross_total) : 0
  
  // Calculate actual spending from procurement
  const actualSpent = procurementRequests.reduce((sum, req) => {
    const qty = Number(req.quantity_requested || 0)
    const price = Number(req.price_at_request || 0)
    return sum + (qty * price)
  }, 0)

  const remaining = budgetTotal - actualSpent
  const percentSpent = budgetTotal > 0 ? (actualSpent / budgetTotal) * 100 : 0
  const variance = budgetTotal - projectBudget
  const variancePercent = projectBudget > 0 ? (variance / projectBudget) * 100 : 0

  // Category breakdown
  const categories = [
    { 
      key: 'building_items', 
      label: 'Building Materials', 
      value: budgetSheets?.building_items?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0,
      color: 'emerald',
      icon: 'construction'
    },
    { 
      key: 'professional_fees', 
      label: 'Professional Fees', 
      value: budgetSheets?.professional_fees?.reduce((s, i) => s + Number(i.estimated_fee || 0), 0) || 0,
      color: 'purple',
      icon: 'badge'
    },
    { 
      key: 'labour_costs', 
      label: 'Labour', 
      value: budgetSheets?.labour_costs?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0,
      color: 'blue',
      icon: 'engineering'
    },
    { 
      key: 'machine_plants', 
      label: 'Plant & Equipment', 
      value: budgetSheets?.machine_plants?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0,
      color: 'amber',
      icon: 'precision_manufacturing'
    },
    { 
      key: 'admin_expenses', 
      label: 'Admin & Expenses', 
      value: budgetSheets?.admin_expenses?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0,
      color: 'slate',
      icon: 'receipt_long'
    },
  ].filter(c => c.value > 0)

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  }

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Icon name="account_balance_wallet" size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Budget</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums">
                  ${budgetTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Icon name="payments" size={20} className="text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Spent</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums">
                  ${actualSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-violet-600 font-semibold">{percentSpent.toFixed(1)}% of budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon name="savings" size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Remaining</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums">
                  ${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">{(100 - percentSpent).toFixed(1)}% available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                variance >= 0 ? 'bg-emerald-50' : 'bg-red-50'
              )}>
                <Icon 
                  name={variance >= 0 ? 'trending_down' : 'trending_up'} 
                  size={20} 
                  className={variance >= 0 ? 'text-emerald-600' : 'text-red-600'} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Variance</p>
                <p className={cn(
                  'text-xl font-bold tabular-nums',
                  variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {variance >= 0 ? '-' : '+'}${Math.abs(variance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className={cn(
                  'text-[10px] font-semibold',
                  variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {Math.abs(variancePercent).toFixed(1)}% {variance >= 0 ? 'under' : 'over'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="pie_chart" size={18} className="text-blue-600" />
            Budget Breakdown by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => {
            const percent = budgetTotal > 0 ? (category.value / budgetTotal) * 100 : 0
            const colors = colorMap[category.color]
            
            return (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', colors.bg)}>
                      <Icon name={category.icon} size={14} className={colors.text} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      ${category.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-slate-500">{percent.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.text.replace('text-', 'bg-'))}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Cash Flow Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="show_chart" size={18} className="text-blue-600" />
            Spending Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Budget Utilization</span>
                <span className="font-bold text-slate-900">{percentSpent.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    percentSpent > 90 ? 'bg-red-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(percentSpent, 100)}%` }}
                />
              </div>
              {percentSpent > 90 && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  <Icon name="warning" size={14} />
                  <span className="font-semibold">Budget nearing limit</span>
                </div>
              )}
            </div>

            {/* Procurement Status */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Procurement Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['PENDING', 'APPROVED', 'ORDERED', 'DELIVERED', 'CANCELLED'].map(status => {
                  const count = procurementRequests.filter(r => r.status === status).length
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
                    APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
                    ORDERED: 'bg-violet-50 text-violet-700 border-violet-200',
                    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    CANCELLED: 'bg-slate-50 text-slate-600 border-slate-200',
                  }
                  return (
                    <div key={status} className={cn('rounded-lg border p-2 text-center', statusColors[status])}>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide">{status}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

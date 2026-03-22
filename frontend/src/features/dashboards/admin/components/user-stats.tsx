import { Progress } from '@/components/ui/progress'
import { Icon } from '@/components/ui/material-icon'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

const ROLE_CONFIG: Record<string, { label: string; dotColor: string; barColor: string }> = {
    BUILDER: { label: 'Builders', dotColor: 'bg-blue-500', barColor: '[&>div]:bg-blue-500' },
    CONTRACTOR: { label: 'Contractors', dotColor: 'bg-emerald-500', barColor: '[&>div]:bg-emerald-500' },
    SUPPLIER: { label: 'Suppliers', dotColor: 'bg-amber-500', barColor: '[&>div]:bg-amber-500' },
    ADMIN: { label: 'Administrators', dotColor: 'bg-purple-500', barColor: '[&>div]:bg-purple-500' },
}

export function UserStats() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => {
            const res = await adminApi.getMetrics()
            return res.data
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const distribution: { role: string; count: number }[] = metrics?.user_distribution ?? []
    const totalUsers = distribution.reduce((sum, d) => sum + d.count, 0) || 1

    return (
        <div className='space-y-4'>
            {distribution.map((item) => {
                const cfg = ROLE_CONFIG[item.role] || { label: item.role, dotColor: 'bg-gray-400', barColor: '' }
                const percentage = (item.count / totalUsers) * 100
                return (
                    <div key={item.role} className='space-y-1.5'>
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotColor}`} />
                                <span className='text-xs font-medium text-foreground'>{cfg.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className='text-xs text-muted-foreground font-medium tabular-nums'>{item.count.toLocaleString()}</span>
                                <span className='text-[10px] text-muted-foreground/70 font-medium tabular-nums w-10 text-right'>
                                    {percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <Progress value={percentage} className={`h-2 rounded-full ${cfg.barColor}`} />
                    </div>
                )
            })}
            {distribution.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No user data available</p>
            )}
        </div>
    )
}

import { Icon } from '@/components/ui/material-icon'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export function SystemOverview() {
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

    const overview = metrics?.system_overview ?? {}

    const cards = [
        {
            title: 'Avg Project Budget',
            value: `$${(overview.avg_project_budget ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: 'account_balance',
            description: 'Across all projects',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Total Projects',
            value: overview.total_projects ?? 0,
            icon: 'folder',
            description: 'All-time project count',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'New Users (30d)',
            value: overview.new_users_30d ?? 0,
            icon: 'person_add',
            description: 'Registered in last 30 days',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            title: 'Pending Requests',
            value: overview.pending_requests ?? 0,
            icon: 'pending_actions',
            description: 'Awaiting admin review',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
    ]

    return (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {cards.map((card, index) => (
                <div key={index} className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</p>
                        <div className={`h-8 w-8 rounded-lg ${card.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                            <Icon name={card.icon} className={`h-4 w-4 ${card.iconColor}`} />
                        </div>
                    </div>
                    <p className='text-xl font-bold font-display tracking-tight text-foreground'>{card.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{card.description}</p>
                </div>
            ))}
        </div>
    )
}

import { Icon } from '@/components/ui/material-icon'
const metrics = [
    {
        title: 'Avg Project Value',
        value: '$79,500',
        change: '+12.5%',
        positive: true,
        description: 'Across all active projects',
    },
    {
        title: 'Platform Uptime',
        value: '99.98%',
        change: '+0.02%',
        positive: true,
        description: 'Last 30 days',
    },
    {
        title: 'User Satisfaction',
        value: '4.7/5.0',
        change: '+0.3',
        positive: true,
        description: 'Based on ratings',
    },
    {
        title: 'Avg Response Time',
        value: '1.2s',
        change: '-0.3s',
        positive: true,
        description: 'API performance',
    },
]

export function SystemOverview() {
    return (
        <div className='grid gap-3 sm:grid-cols-2'>
            {metrics.map((metric, index) => (
                <div key={index} className="p-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.title}</p>
                    <div className='flex items-baseline justify-between mt-1.5'>
                        <span className='text-xl font-bold font-display tracking-tight text-foreground'>{metric.value}</span>
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.positive ? <Icon name="trending_up" className="h-3 w-3" /> : <Icon name="trending_down" className="h-3 w-3" />}
                            {metric.change}
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{metric.description}</p>
                </div>
            ))}
        </div>
    )
}

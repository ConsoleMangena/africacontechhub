import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

const metrics = [
    {
        title: 'Average Project Value',
        value: '$79,500',
        change: '+12.5%',
        description: 'Across all active projects',
    },
    {
        title: 'Platform Uptime',
        value: '99.98%',
        change: '+0.02%',
        description: 'Last 30 days',
    },
    {
        title: 'User Satisfaction',
        value: '4.7/5.0',
        change: '+0.3',
        description: 'Based on ratings',
    },
    {
        title: 'Average Response Time',
        value: '1.2s',
        change: '-0.3s',
        description: 'API performance',
    },
]

export function SystemOverview() {
    return (
        <div className='grid gap-4 sm:grid-cols-2'>
            {metrics.map((metric, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className='text-base'>{metric.title}</CardTitle>
                        <CardDescription>{metric.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-baseline justify-between'>
                            <span className='text-3xl font-bold'>{metric.value}</span>
                            <span className='text-sm text-green-600'>{metric.change}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

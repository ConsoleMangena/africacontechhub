import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const metrics = [
    {
        name: 'On-Time Delivery Rate',
        value: 94.5,
        description: 'Percentage of orders delivered on schedule',
    },
    {
        name: 'Quality Score',
        value: 96.2,
        description: 'Based on customer feedback and defect rates',
    },
    {
        name: 'Response Time',
        value: 88.0,
        description: 'Average quote turnaround time',
    },
    {
        name: 'Customer Satisfaction',
        value: 92.8,
        description: 'Overall contractor satisfaction rating',
    },
]

export function PerformanceMetrics() {
    return (
        <div className='grid gap-4 sm:grid-cols-2'>
            {metrics.map((metric, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{metric.name}</CardTitle>
                        <CardDescription>{metric.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-3xl font-bold'>{metric.value}%</span>
                                <span className='text-sm text-muted-foreground'>
                                    {metric.value >= 90 ? 'Excellent' : metric.value >= 80 ? 'Good' : 'Needs Improvement'}
                                </span>
                            </div>
                            <Progress value={metric.value} className='h-2' />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

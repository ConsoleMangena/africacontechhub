import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Icon } from '@/components/ui/material-icon'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export function TransactionVolume() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => {
            const res = await adminApi.getMetrics()
            return res.data
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const rawVolume: { month: string; signups: number; projects: number; ai_messages: number }[] = metrics?.monthly_volume ?? []

    // Format month labels (e.g. "2026-01" → "Jan")
    const chartData = rawVolume.map((item) => {
        const [year, mon] = item.month.split('-')
        const label = new Date(Number(year), Number(mon) - 1).toLocaleString('default', { month: 'short' })
        return { month: label, signups: item.signups, projects: item.projects, ai_messages: item.ai_messages }
    })

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Icon name="bar_chart" className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No activity data yet</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width='100%' height={300}>
            <BarChart data={chartData} barGap={2}>
                <XAxis
                    dataKey='month'
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                />
                <Bar
                    dataKey='signups'
                    name='User Signups'
                    fill='#6366f1'
                    radius={[3, 3, 0, 0]}
                />
                <Bar
                    dataKey='projects'
                    name='Projects Created'
                    fill='#10b981'
                    radius={[3, 3, 0, 0]}
                />
                <Bar
                    dataKey='ai_messages'
                    name='AI Messages'
                    fill='#a5b4fc'
                    radius={[3, 3, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

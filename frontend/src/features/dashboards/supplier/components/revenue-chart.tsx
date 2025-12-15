import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
    { month: 'Jan', revenue: 125000 },
    { month: 'Feb', revenue: 138000 },
    { month: 'Mar', revenue: 142000 },
    { month: 'Apr', revenue: 148000 },
    { month: 'May', revenue: 155000 },
    { month: 'Jun', revenue: 156240 },
]

export function RevenueChart() {
    return (
        <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey='month'
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    direction='ltr'
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Bar
                    dataKey='revenue'
                    fill='hsl(var(--primary))'
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

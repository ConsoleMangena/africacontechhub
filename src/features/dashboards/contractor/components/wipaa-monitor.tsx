import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts'

const data = [
    {
        project: 'Project A',
        billed: 45000,
        earned: 42000,
    },
    {
        project: 'Project B',
        billed: 62000,
        earned: 65000,
    },
    {
        project: 'Project C',
        billed: 38000,
        earned: 41000,
    },
    {
        project: 'Project D',
        billed: 52000,
        earned: 50000,
    },
]

export function WIPAAMonitor() {
    return (
        <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey='project'
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
                <Legend />
                <Bar
                    dataKey='billed'
                    fill='hsl(var(--primary))'
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey='earned'
                    fill='hsl(var(--muted-foreground))'
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

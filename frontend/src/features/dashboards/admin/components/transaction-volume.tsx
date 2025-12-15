import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts'

const data = [
    {
        month: 'Jan',
        escrow: 450000,
        payments: 380000,
    },
    {
        month: 'Feb',
        escrow: 520000,
        payments: 445000,
    },
    {
        month: 'Mar',
        escrow: 580000,
        payments: 520000,
    },
    {
        month: 'Apr',
        escrow: 620000,
        payments: 580000,
    },
    {
        month: 'May',
        escrow: 680000,
        payments: 625000,
    },
    {
        month: 'Jun',
        escrow: 720000,
        payments: 680000,
    },
]

export function TransactionVolume() {
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
                <Legend />
                <Bar
                    dataKey='escrow'
                    fill='hsl(var(--primary))'
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey='payments'
                    fill='hsl(var(--muted-foreground))'
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

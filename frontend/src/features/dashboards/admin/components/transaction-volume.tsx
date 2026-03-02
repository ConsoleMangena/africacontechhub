import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
    { month: 'Jan', escrow: 450000, payments: 380000 },
    { month: 'Feb', escrow: 520000, payments: 445000 },
    { month: 'Mar', escrow: 580000, payments: 520000 },
    { month: 'Apr', escrow: 620000, payments: 580000 },
    { month: 'May', escrow: 680000, payments: 625000 },
    { month: 'Jun', escrow: 720000, payments: 680000 },
]

export function TransactionVolume() {
    return (
        <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data} barGap={2}>
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
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
                <Bar
                    dataKey='escrow'
                    name='Escrow'
                    fill='#6366f1'
                    radius={[3, 3, 0, 0]}
                />
                <Bar
                    dataKey='payments'
                    name='Payments'
                    fill='#a5b4fc'
                    radius={[3, 3, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

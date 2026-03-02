import { Progress } from '@/components/ui/progress'

const userTypes = [
    {
        type: 'Aspirational Builders',
        count: 1245,
        percentage: 43.7,
        color: 'text-blue-600',
        dotColor: 'bg-blue-500',
    },
    {
        type: 'Professional Contractors',
        count: 892,
        percentage: 31.3,
        color: 'text-green-600',
        dotColor: 'bg-green-500',
    },
    {
        type: 'Material Suppliers',
        count: 710,
        percentage: 25.0,
        color: 'text-amber-600',
        dotColor: 'bg-amber-500',
    },
]

export function UserStats() {
    return (
        <div className='space-y-5'>
            {userTypes.map((user, index) => (
                <div key={index} className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${user.dotColor}`} />
                            <span className='text-xs font-medium text-foreground'>{user.type}</span>
                        </div>
                        <span className='text-xs text-muted-foreground font-medium tabular-nums'>{user.count.toLocaleString()}</span>
                    </div>
                    <Progress value={user.percentage} className='h-1.5' />
                    <p className='text-muted-foreground text-[11px] text-right tabular-nums'>
                        {user.percentage.toFixed(1)}%
                    </p>
                </div>
            ))}
        </div>
    )
}

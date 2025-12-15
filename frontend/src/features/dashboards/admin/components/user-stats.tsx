import { Progress } from '@/components/ui/progress'

const userTypes = [
    {
        type: 'Aspirational Builders',
        count: 1245,
        percentage: 43.7,
        color: 'bg-blue-500',
    },
    {
        type: 'Professional Contractors',
        count: 892,
        percentage: 31.3,
        color: 'bg-green-500',
    },
    {
        type: 'Material Suppliers',
        count: 710,
        percentage: 25.0,
        color: 'bg-orange-500',
    },
]

export function UserStats() {
    return (
        <div className='space-y-6'>
            {userTypes.map((user, index) => (
                <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>{user.type}</span>
                        <span className='text-sm text-muted-foreground'>{user.count} users</span>
                    </div>
                    <div className='space-y-1'>
                        <Progress value={user.percentage} className='h-2' />
                        <p className='text-muted-foreground text-xs text-right'>
                            {user.percentage.toFixed(1)}% of total users
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

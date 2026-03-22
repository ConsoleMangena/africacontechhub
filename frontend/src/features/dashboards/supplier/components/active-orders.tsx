import { Icon } from '@/components/ui/material-icon'
const orders = [
    {
        id: 'ORD-2401',
        item: 'Cement - 100 bags',
        contractor: 'BuildCo Zimbabwe',
        status: 'in-transit',
        amount: '$4,200',
        delivery: 'Today, 2:00 PM',
    },
    {
        id: 'ORD-2402',
        item: 'Steel Bars - 200 units',
        contractor: 'Prime Contractors',
        status: 'pending',
        amount: '$8,500',
        delivery: 'Tomorrow, 10:00 AM',
    },
    {
        id: 'ORD-2403',
        item: 'Roofing Sheets - 50 pcs',
        contractor: 'Harare Builders Ltd',
        status: 'completed',
        amount: '$3,600',
        delivery: 'Delivered',
    },
    {
        id: 'ORD-2404',
        item: 'Paint - 80 liters',
        contractor: 'BuildCo Zimbabwe',
        status: 'pending',
        amount: '$1,280',
        delivery: 'Jan 30, 9:00 AM',
    },
]

export function ActiveOrders() {
    return (
        <div className='space-y-6'>
            {orders.map((order) => (
                <div key={order.id} className='flex items-start gap-4'>
                    {order.status === 'completed' ? (
                        <Icon name="check_circle" className='h-5 w-5 text-slate-400 mt-0.5' />
                    ) : order.status === 'in-transit' ? (
                        <Icon name="local_shipping" className='h-5 w-5 text-slate-400 mt-0.5' />
                    ) : (
                        <Icon name="schedule" className='h-5 w-5 text-slate-400 mt-0.5' />
                    )}
                    <div className='flex-1 space-y-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm font-bold text-slate-900 truncate'>{order.item}</p>
                            <span className='font-bold text-sm text-slate-900'>{order.amount}</span>
                        </div>
                        <p className='text-slate-500 text-[11px] font-medium'>{order.contractor} • {order.delivery}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

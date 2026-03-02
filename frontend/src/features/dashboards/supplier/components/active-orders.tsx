import { Truck, CheckCircle2, Clock } from 'lucide-react'

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
                        <CheckCircle2 className='h-5 w-5 text-green-600 mt-0.5' />
                    ) : order.status === 'in-transit' ? (
                        <Truck className='h-5 w-5 text-blue-600 mt-0.5' />
                    ) : (
                        <Clock className='h-5 w-5 text-orange-600 mt-0.5' />
                    )}
                    <div className='flex-1 space-y-1'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium leading-none'>{order.item}</p>
                            <span className='font-medium text-sm'>{order.amount}</span>
                        </div>
                        <p className='text-muted-foreground text-xs'>{order.contractor}</p>
                        <p className='text-muted-foreground text-xs'>{order.delivery}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

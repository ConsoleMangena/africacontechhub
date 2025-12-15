import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePaymentMethods } from './hooks/use-billing'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default function BillingPage() {
    const { data: paymentMethods, isLoading } = usePaymentMethods()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <h1 className='text-3xl font-bold tracking-tight'>Billing</h1>
                <p className='text-muted-foreground mt-1'>
                    Manage your payment methods
                </p>
            </div>

            {/* Payment Methods */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>Manage your payment information</CardDescription>
                        </div>
                        <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Payment Method
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            Loading payment methods...
                        </div>
                    ) : paymentMethods && paymentMethods.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Card</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentMethods.map((method) => (
                                    <TableRow key={method.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-3'>
                                                <Avatar className='h-10 w-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600'>
                                                    <AvatarFallback className='rounded-md bg-transparent'>
                                                        <CreditCard className='h-5 w-5 text-white' />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className='font-medium'>{method.card_brand} •••• {method.last_four}</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {method.is_default ? 'Default payment method' : 'Secondary method'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
                                        </TableCell>
                                        <TableCell>
                                            {method.is_default ? (
                                                <span className='text-green-600 font-medium'>Default</span>
                                            ) : (
                                                <Button variant='link' size='sm' className='h-auto p-0'>
                                                    Set as default
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button variant='ghost' size='icon'>
                                                <Trash2 className='h-4 w-4 text-destructive' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className='text-center py-12'>
                            <Avatar className='mx-auto h-16 w-16 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 mb-4'>
                                <AvatarFallback className='rounded-md bg-transparent'>
                                    <CreditCard className='h-8 w-8 text-white' />
                                </AvatarFallback>
                            </Avatar>
                            <h3 className='text-lg font-semibold mb-2'>No payment methods</h3>
                            <p className='text-muted-foreground mb-4'>Add a payment method to get started</p>
                            <Button>
                                <Plus className='mr-2 h-4 w-4' />
                                Add Payment Method
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

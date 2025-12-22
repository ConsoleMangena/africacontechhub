import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2, MapPin, Edit2, Loader2 } from 'lucide-react'
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
import { AddPaymentMethodDialog } from './components/add-payment-method-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const billingAddressSchema = z.object({
    street_address: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postal_code: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
    phone_number: z.string().optional(),
})

type BillingAddressFormData = z.infer<typeof billingAddressSchema>

export default function BillingPage() {
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [addressDialogOpen, setAddressDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const queryClient = useQueryClient()
    
    const { data: paymentMethods, isLoading } = usePaymentMethods()
    
    const { data: billingAddress, isLoading: isLoadingAddress } = useQuery({
        queryKey: ['billing-address'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/api/v1/billing/billing-address/')
                return response.data
            } catch (error: any) {
                if (error.response?.status === 404) {
                    return null
                }
                throw error
            }
        },
    })

    const addressForm = useForm<BillingAddressFormData>({
        resolver: zodResolver(billingAddressSchema),
        defaultValues: {
            street_address: billingAddress?.street_address || '',
            city: billingAddress?.city || '',
            state: billingAddress?.state || '',
            postal_code: billingAddress?.postal_code || '',
            country: billingAddress?.country || 'Zimbabwe',
            phone_number: billingAddress?.phone_number || '',
        },
    })

    // Update form when billing address data changes
    useEffect(() => {
        if (billingAddress) {
            addressForm.reset({
                street_address: billingAddress.street_address || '',
                city: billingAddress.city || '',
                state: billingAddress.state || '',
                postal_code: billingAddress.postal_code || '',
                country: billingAddress.country || 'Zimbabwe',
                phone_number: billingAddress.phone_number || '',
            })
        }
    }, [billingAddress, addressForm])

    const saveAddressMutation = useMutation({
        mutationFn: async (data: BillingAddressFormData) => {
            if (billingAddress) {
                return apiClient.put('/api/v1/billing/billing-address/', data)
            } else {
                return apiClient.post('/api/v1/billing/billing-address/', data)
            }
        },
        onSuccess: () => {
            toast.success('Billing address saved successfully!')
            queryClient.invalidateQueries({ queryKey: ['billing-address'] })
            setAddressDialogOpen(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to save billing address')
        },
    })

    const setDefaultMutation = useMutation({
        mutationFn: async (paymentMethodId: number) => {
            return apiClient.post(`/api/v1/billing/payment-methods/${paymentMethodId}/set_default/`)
        },
        onSuccess: () => {
            toast.success('Default payment method updated!')
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to set default payment method')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (paymentMethodId: number) => {
            return apiClient.delete(`/api/v1/billing/payment-methods/${paymentMethodId}/`)
        },
        onSuccess: () => {
            toast.success('Payment method deleted successfully!')
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete payment method')
        },
    })

    const handleSetDefault = (id: number) => {
        setDefaultMutation.mutate(id)
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            setDeletingId(id)
            deleteMutation.mutate(id, {
                onSettled: () => setDeletingId(null),
            })
        }
    }

    return (
        <div className='space-y-6 w-full p-6 md:p-8 min-h-screen bg-gray-50'>
            {/* Header */}
            <div>
                <h1 className='text-3xl font-bold tracking-tight text-gray-900'>Billing</h1>
                <p className='text-gray-600 mt-1'>
                    Manage your payment methods and billing information
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Methods */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="border-b border-gray-200">
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle className="text-gray-900">Payment Methods</CardTitle>
                                    <CardDescription className="text-gray-600">Manage your payment information</CardDescription>
                                </div>
                                <Button 
                                    onClick={() => setPaymentDialogOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Payment Method
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isLoading ? (
                                <div className='text-center py-8 text-gray-600'>
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Loading payment methods...
                                </div>
                            ) : paymentMethods && paymentMethods.length > 0 ? (
                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className='flex items-center gap-4'>
                                                <div className="p-2 rounded-lg bg-green-100">
                                                    <CreditCard className='h-5 w-5 text-green-600' />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className='font-semibold text-gray-900'>{method.card_brand} •••• {method.last_four}</p>
                                                        {method.is_default && (
                                                            <Badge className="bg-green-100 text-green-700 border-green-200">Default</Badge>
                                                        )}
                                                    </div>
                                                    <p className='text-sm text-gray-600 mt-1'>
                                                        Expires {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!method.is_default && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetDefault(method.id)}
                                                        disabled={setDefaultMutation.isPending}
                                                        className="text-gray-700 hover:text-gray-900"
                                                    >
                                                        Set as default
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(method.id)}
                                                    disabled={deletingId === method.id || deleteMutation.isPending}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deletingId === method.id ? (
                                                        <Loader2 className='h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <Trash2 className='h-4 w-4' />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-12'>
                                    <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-4">
                                        <CreditCard className='h-8 w-8 text-green-600' />
                                    </div>
                                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>No payment methods</h3>
                                    <p className='text-gray-600 mb-4'>Add a payment method to get started</p>
                                    <Button
                                        onClick={() => setPaymentDialogOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Plus className='mr-2 h-4 w-4' />
                                        Add Payment Method
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Billing Address */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="border-b border-gray-200">
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle className="text-gray-900">Billing Address</CardTitle>
                                    <CardDescription className="text-gray-600">Your billing information</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setAddressDialogOpen(true)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isLoadingAddress ? (
                                <div className='text-center py-4 text-gray-600'>
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                </div>
                            ) : billingAddress ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <MapPin className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 text-sm text-gray-700">
                                            <p className="font-medium text-gray-900">{billingAddress.street_address}</p>
                                            <p>{billingAddress.city}, {billingAddress.state}</p>
                                            <p>{billingAddress.postal_code}</p>
                                            <p className="mt-1">{billingAddress.country}</p>
                                            {billingAddress.phone_number && (
                                                <p className="mt-2 text-gray-600">Phone: {billingAddress.phone_number}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='text-center py-8'>
                                    <div className="p-3 rounded-full bg-gray-100 w-fit mx-auto mb-4">
                                        <MapPin className='h-6 w-6 text-gray-400' />
                                    </div>
                                    <p className='text-gray-600 mb-4 text-sm'>No billing address on file</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAddressDialogOpen(true)}
                                        className="w-full"
                                    >
                                        <Plus className='mr-2 h-4 w-4' />
                                        Add Billing Address
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Payment Method Dialog */}
            <AddPaymentMethodDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
            />

            {/* Billing Address Dialog */}
            <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader className="pb-4 border-b border-gray-200">
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                            <div className="p-2 rounded-lg bg-green-100">
                                <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            {billingAddress ? 'Edit Billing Address' : 'Add Billing Address'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            Update your billing address information
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...addressForm}>
                        <form
                            onSubmit={addressForm.handleSubmit((data) => saveAddressMutation.mutate(data))}
                            className="space-y-4 pt-4"
                        >
                            <FormField
                                control={addressForm.control}
                                name="street_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main Street" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={addressForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Harare" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addressForm.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Harare" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={addressForm.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="00000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={addressForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                                                    <SelectItem value="South Africa">South Africa</SelectItem>
                                                    <SelectItem value="Botswana">Botswana</SelectItem>
                                                    <SelectItem value="Namibia">Namibia</SelectItem>
                                                    <SelectItem value="Zambia">Zambia</SelectItem>
                                                    <SelectItem value="Mozambique">Mozambique</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={addressForm.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+263 77 123 4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddressDialogOpen(false)}
                                    disabled={saveAddressMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saveAddressMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {saveAddressMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Address'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

import { Icon } from '@/components/ui/material-icon'
import { Loading } from '@/components/ui/loading'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'

import { usePaymentMethods } from './hooks/use-billing'
import { AddPaymentMethodDialog } from './components/add-payment-method-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
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
    
    const { data: paymentMethods, isLoading, error: paymentMethodsError } = usePaymentMethods()
    
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
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='space-y-6 w-full p-6 md:p-8 min-h-screen bg-gray-50'>
                    {/* Header */}
                    <div>
                        <h1 className='text-2xl font-bold font-display tracking-tight text-foreground'>Billing</h1>
                        <p className='text-sm text-muted-foreground mt-1'>
                            Manage your payment methods and billing information
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Methods — takes up 2 columns */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle>Payment Methods</CardTitle>
                                        <CardDescription>Manage your cards</CardDescription>
                                    </div>
                                    <Button 
                                        onClick={() => setPaymentDialogOpen(true)}
                                        size="sm"
                                        className="h-8 px-3 rounded-md font-semibold flex items-center"
                                    >
                                        <Icon name="add" className='mr-1.5 h-4 w-4 -ml-0.5' />
                                        Add Card
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {paymentMethodsError ? (
                                        <div className='text-center py-8 text-red-600'>
                                            <Icon name="error" className="h-6 w-6 mx-auto mb-2" />
                                            <p className='text-sm'>Failed to load</p>
                                        </div>
                                    ) : isLoading ? (
                                        <Loading className="py-8" text="Fetching methods..." />
                                    ) : paymentMethods && paymentMethods.length > 0 ? (
                                        <div className="space-y-2">
                                            {paymentMethods.map((method) => (
                                                <div
                                                    key={method.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border"
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <Icon name="credit_card" className='h-5 w-5 text-muted-foreground' />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className='font-medium'>{method.card_brand} •••• {method.last_four}</p>
                                                                {method.is_default && (
                                                                    <Badge variant="secondary">Default</Badge>
                                                                )}
                                                            </div>
                                                            <p className='text-xs text-muted-foreground'>
                                                                Expires {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!method.is_default && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-3 text-xs font-medium hover:bg-slate-100"
                                                                onClick={() => handleSetDefault(method.id)}
                                                                disabled={setDefaultMutation.isPending}
                                                            >
                                                                Set Default
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(method.id)}
                                                            disabled={deletingId === method.id}
                                                            className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-destructive flex items-center justify-center shrink-0"
                                                        >
                                                            {deletingId === method.id ? (
                                                                <Loading size={14} text="" />
                                                            ) : (
                                                                <Icon name="delete" className='h-4 w-4' />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-center py-8'>
                                            <Icon name="credit_card" className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                                            <p className='text-sm text-muted-foreground'>No payment methods</p>
                                            <Button
                                                onClick={() => setPaymentDialogOpen(true)}
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                            >
                                                Add Payment Method
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar — Billing Address */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle>Billing Address</CardTitle>
                                        <CardDescription>Your address</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setAddressDialogOpen(true)}
                                    >
                                        <Icon name="edit" className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingAddress ? (
                                        <Loading className="py-4" size={20} text="" />
                                    ) : billingAddress ? (
                                        <div className="text-sm">
                                            <p className="font-medium">{billingAddress.street_address}</p>
                                            <p className="text-muted-foreground">{billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}</p>
                                            <p className="text-muted-foreground">{billingAddress.country}</p>
                                        </div>
                                    ) : (
                                        <div className='text-center py-6 px-4 bg-muted/50 rounded-lg border border-dashed'>
                                            <Icon name="location_off" className='h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50' />
                                            <p className='text-sm text-muted-foreground mb-3 font-medium'>No address on file</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAddressDialogOpen(true)}
                                                className="w-full h-9 font-semibold hover:bg-white"
                                            >
                                                <Icon name="add" className="h-4 w-4 mr-2" />
                                                Add Address
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
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{billingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
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

                                    <div className="flex justify-end gap-2 pt-4">
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
                                        >
                                            {saveAddressMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </Main>
        </>
    )
}


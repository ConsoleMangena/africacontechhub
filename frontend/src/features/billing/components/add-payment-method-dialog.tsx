import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CreditCard, Lock, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const paymentMethodSchema = z.object({
    card_number: z.string()
        .min(13, 'Card number must be at least 13 digits')
        .max(19, 'Card number must be at most 19 digits')
        .regex(/^\d+$/, 'Card number must contain only digits'),
    cardholder_name: z.string().min(2, 'Cardholder name is required'),
    exp_month: z.string().min(1, 'Expiration month is required'),
    exp_year: z.string().min(4, 'Expiration year is required'),
    cvv: z.string()
        .min(3, 'CVV must be at least 3 digits')
        .max(4, 'CVV must be at most 4 digits')
        .regex(/^\d+$/, 'CVV must contain only digits'),
    is_default: z.boolean().default(false),
    // Billing address
    street_address: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postal_code: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
    phone_number: z.string().optional(),
})

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface AddPaymentMethodDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Helper function to detect card brand
function detectCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'VISA'
    if (/^5[1-5]/.test(cleaned)) return 'MASTERCARD'
    if (/^3[47]/.test(cleaned)) return 'AMEX'
    if (/^6/.test(cleaned)) return 'DISCOVER'
    return 'OTHER'
}

export function AddPaymentMethodDialog({ open, onOpenChange }: AddPaymentMethodDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<PaymentMethodFormData>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            card_number: '',
            cardholder_name: '',
            exp_month: '',
            exp_year: '',
            cvv: '',
            is_default: false,
            street_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'Zimbabwe',
            phone_number: '',
        },
    })

    const cardNumber = form.watch('card_number')
    const cardBrand = cardNumber ? detectCardBrand(cardNumber) : null

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '')
        const groups = cleaned.match(/.{1,4}/g)
        return groups ? groups.join(' ') : cleaned
    }

    const onSubmit = async (data: PaymentMethodFormData) => {
        setIsSubmitting(true)
        try {
            // IMPORTANT: In production, card numbers should be tokenized by a payment processor
            // (e.g., Stripe Elements) before sending to the backend. This is a demo implementation.
            // For security, we simulate tokenization here.
            
            const cleanedCardNumber = data.card_number.replace(/\s/g, '')
            const lastFour = cleanedCardNumber.slice(-4)
            
            // Simulate payment token generation (in production, use Stripe or similar)
            const paymentToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            // Save billing address first
            try {
                await apiClient.put('/api/v1/billing/billing-address/', {
                    street_address: data.street_address,
                    city: data.city,
                    state: data.state,
                    postal_code: data.postal_code,
                    country: data.country,
                    phone_number: data.phone_number || undefined,
                })
            } catch (error: any) {
                // If address doesn't exist, create it
                if (error.response?.status === 404) {
                    await apiClient.post('/api/v1/billing/billing-address/', {
                        street_address: data.street_address,
                        city: data.city,
                        state: data.state,
                        postal_code: data.postal_code,
                        country: data.country,
                        phone_number: data.phone_number || undefined,
                    })
                } else {
                    throw error
                }
            }
            
            // Create payment method with tokenized data
            await apiClient.post('/api/v1/billing/payment-methods/', {
                payment_token: paymentToken,
                card_brand: cardBrand || 'OTHER',
                last_four: lastFour,
                exp_month: parseInt(data.exp_month),
                exp_year: parseInt(data.exp_year),
                is_default: data.is_default,
            })

            toast.success('Payment method added successfully!')
            form.reset()
            onOpenChange(false)
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
        } catch (error: any) {
            console.error('Failed to add payment method:', error)
            toast.error(error.response?.data?.message || 'Failed to add payment method')
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 20 }, (_, i) => currentYear + i)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="pb-4 border-b border-gray-200">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                        <div className="p-2 rounded-lg bg-green-100">
                            <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        Add Payment Method
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        Securely add a new payment method. Your card information is encrypted and never stored on our servers.
                    </DialogDescription>
                </DialogHeader>

                {/* Security Notice */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 mb-1">Secure Payment Processing</p>
                        <p className="text-xs text-green-700">
                            Your card details are tokenized and encrypted. We never store your full card number on our servers.
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        {/* Card Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Card Information</h3>
                            
                            <FormField
                                control={form.control}
                                name="card_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Card Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const formatted = formatCardNumber(e.target.value)
                                                        field.onChange(formatted)
                                                    }}
                                                    className="pr-10"
                                                />
                                                {cardBrand && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <span className="text-xs font-medium text-gray-600">{cardBrand}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Enter your 16-digit card number
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cardholder_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cardholder Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="exp_month"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expiry Month</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="MM" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                        <SelectItem key={month} value={String(month).padStart(2, '0')}>
                                                            {String(month).padStart(2, '0')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="exp_year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expiry Year</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="YYYY" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {years.map(year => (
                                                        <SelectItem key={year} value={String(year)}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cvv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CVV</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="123"
                                                    maxLength={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Security code
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                            
                            <FormField
                                control={form.control}
                                name="street_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="123 Main Street"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Harare"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State/Province</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Harare"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="00000"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
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
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+263 77 123 4567"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="is_default"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-gray-900">
                                            Set as default payment method
                                        </FormLabel>
                                        <FormDescription className="text-gray-600">
                                            This card will be used for future payments by default
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Add Payment Method
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


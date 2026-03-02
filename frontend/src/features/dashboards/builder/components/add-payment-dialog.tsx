import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, DollarSign, CreditCard, Smartphone, Wallet } from 'lucide-react'
import { builderApi } from '@/services/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const paymentSchema = z.object({
    milestone: z.number().min(1, 'Please select a milestone'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    payment_method: z.enum(['CASH', 'SWIPE_PAYNOW', 'STRIPE']),
    reference_number: z.string().optional(),
    transaction_id: z.string().optional(),
    notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface AddPaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: number
    projectTitle: string
    milestones: Array<{
        id: number
        name: string
        amount: string
        status: string
        due_date: string
    }>
    preselectedMilestoneId?: number
    onSuccess?: () => void
}

export function AddPaymentDialog({
    open,
    onOpenChange,
    projectId,
    projectTitle,
    milestones,
    preselectedMilestoneId,
    onSuccess,
}: AddPaymentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    // Filter to only show PENDING milestones
    const pendingMilestones = milestones.filter((m) => m.status === 'PENDING')

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            milestone: preselectedMilestoneId,
            amount: '',
            payment_method: 'CASH',
            reference_number: '',
            transaction_id: '',
            notes: '',
        },
    })

    // Update form when preselectedMilestoneId changes or dialog opens
    useEffect(() => {
        if (open && preselectedMilestoneId) {
            form.setValue('milestone', preselectedMilestoneId)
            const milestone = milestones.find(m => m.id === preselectedMilestoneId)
            if (milestone) {
                form.setValue('amount', milestone.amount)
            }
        } else if (open && !preselectedMilestoneId) {
            // Reset form when dialog opens without preselection
            form.reset({
                milestone: undefined,
                amount: '',
                payment_method: 'CASH',
                reference_number: '',
                transaction_id: '',
                notes: '',
            })
        }
    }, [open, preselectedMilestoneId, milestones])

    const selectedMilestoneId = form.watch('milestone')
    const selectedMilestone = pendingMilestones.find((m) => m.id === selectedMilestoneId)
    const paymentMethod = form.watch('payment_method')

    // Auto-fill amount when milestone is selected
    if (selectedMilestone && form.getValues('amount') === '') {
        form.setValue('amount', selectedMilestone.amount)
    }

    const onSubmit = async (data: PaymentFormData) => {
        setIsSubmitting(true)
        try {
            await builderApi.createPayment({
                milestone: data.milestone,
                project: projectId,
                amount: data.amount,
                payment_method: data.payment_method,
                reference_number: data.reference_number || undefined,
                transaction_id: data.transaction_id || undefined,
                notes: data.notes || undefined,
            })

            toast.success('Payment recorded successfully!')
            form.reset()
            onOpenChange(false)
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['escrow-summary'] })
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['milestones'] })
            
            onSuccess?.()
        } catch (error: any) {
            console.error('Failed to record payment:', error)
            toast.error(error.response?.data?.message || 'Failed to record payment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for a milestone in {projectTitle}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="milestone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Milestone *</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a milestone" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {pendingMilestones.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No pending milestones
                                                </SelectItem>
                                            ) : (
                                                pendingMilestones.map((milestone) => (
                                                    <SelectItem
                                                        key={milestone.id}
                                                        value={milestone.id.toString()}
                                                    >
                                                        {milestone.name} - $
                                                        {parseFloat(milestone.amount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the milestone you're paying for
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (USD) *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Payment amount in US Dollars
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Payment Method *</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                        >
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="CASH" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <Wallet className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">Cash</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Physical cash payment
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="SWIPE_PAYNOW" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <Smartphone className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">Swipe/Paynow</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Mobile payment or card swipe
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value="STRIPE" className="sr-only" />
                                                    </FormControl>
                                                    <div className="items-center rounded-md border-2 border-muted p-4 hover:border-accent cursor-pointer transition-all h-full">
                                                        <CreditCard className="mb-3 h-6 w-6 text-muted-foreground" />
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium leading-none">Stripe</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                Online card payment
                                                            </p>
                                                        </div>
                                                    </div>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {paymentMethod === 'CASH' && (
                            <FormField
                                control={form.control}
                                name="reference_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., REC-001" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Optional reference number for cash payment receipt
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {(paymentMethod === 'SWIPE_PAYNOW' || paymentMethod === 'STRIPE') && (
                            <FormField
                                control={form.control}
                                name="transaction_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transaction ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., txn_1234567890" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Transaction ID from payment provider
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about this payment..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional notes about this payment
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || pendingMilestones.length === 0}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Record Payment
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


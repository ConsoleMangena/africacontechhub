import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface SubscriptionPlan {
    id: number
    name: string
    display_name: string
    description: string
    price: string
    max_projects: number
    storage_gb: number
    support_level: string
    features: string[]
    is_active: boolean
}

export interface Subscription {
    id: number
    plan: SubscriptionPlan
    status: string
    start_date: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    cancelled_at: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface PaymentMethod {
    id: number
    card_brand: string
    last_four: string
    exp_month: number
    exp_year: number
    is_default: boolean
    created_at: string
}

export interface Invoice {
    id: number
    invoice_number: string
    status: string
    plan_name: string
    subtotal: string
    tax: string
    total: string
    amount_paid: string
    invoice_date: string
    due_date: string
    paid_at: string | null
    invoice_pdf_url: string | null
    created_at: string
}

// Subscription Plans
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const response = await apiClient.get<SubscriptionPlan[]>('/api/v1/billing/plans/')
            return response.data
        },
        retry: false,
    })
}

// Current Subscription
export function useCurrentSubscription() {
    return useQuery({
        queryKey: ['current-subscription'],
        queryFn: async () => {
            const response = await apiClient.get<Subscription>('/api/v1/billing/subscriptions/current/')
            return response.data
        },
        retry: false,
    })
}

// Payment Methods
export function usePaymentMethods() {
    return useQuery({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            const response = await apiClient.get<PaymentMethod[]>('/api/v1/billing/payment-methods/')
            return response.data
        },
        retry: false,
    })
}

// Invoices
export function useInvoices() {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await apiClient.get<Invoice[]>('/api/v1/billing/invoices/')
            return response.data
        },
        retry: false,
    })
}

// Mutations
export function useUpgradeSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ subscriptionId, planId }: { subscriptionId: number; planId: number }) => {
            const response = await apiClient.post(`/api/v1/billing/subscriptions/${subscriptionId}/upgrade/`, {
                plan_id: planId,
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
        },
    })
}

export function useCancelSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (subscriptionId: number) => {
            const response = await apiClient.post(`/api/v1/billing/subscriptions/${subscriptionId}/cancel/`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
        },
    })
}

export function useReactivateSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (subscriptionId: number) => {
            const response = await apiClient.post(`/api/v1/billing/subscriptions/${subscriptionId}/reactivate/`)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] })
        },
    })
}

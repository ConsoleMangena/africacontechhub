import axios from 'axios';
import {
    Project, Milestone, SiteUpdate, ChangeOrder, Payment,
    ContractorProfile, Bid, WIPAA,
    SupplierProfile, Product, MaterialOrder, Delivery,
    PaginatedResponse
} from '../types/api';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1', // Adjust if your backend URL is different
    headers: {
        'Content-Type': 'application/json',
    },
});

import { supabase } from '../lib/supabase';

// Cache the session to avoid repeated async calls
let cachedSession: string | null = null;

// Update cached session when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session?.access_token || null;
});

// Initialize cached session
supabase.auth.getSession().then(({ data: { session } }) => {
    cachedSession = session?.access_token || null;
});

// Add a request interceptor to inject the Supabase token
api.interceptors.request.use(
    (config) => {
        if (cachedSession) {
            config.headers.Authorization = `Bearer ${cachedSession}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authApi = {
    updateProfile: (data: FormData) => api.patch('/auth/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const legalApi = {
    getLegalDocument: (documentType: 'terms' | 'privacy') => api.get<{
        id: number;
        document_type: string;
        title: string;
        content: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    }>(`/legal-documents/${documentType}/`),
};

export const helpCenterApi = {
    getCategories: () => api.get<{
        categories: Array<{
            id: number;
            name: string;
            slug: string;
            description: string | null;
            icon: string | null;
            order: number;
            is_active: boolean;
            articles: Array<{
                id: number;
                category: number;
                category_name: string;
                title: string;
                slug: string;
                content: string;
                excerpt: string | null;
                order: number;
                is_featured: boolean;
                is_active: boolean;
                views_count: number;
                created_at: string;
                updated_at: string;
            }>;
            articles_count: number;
            created_at: string;
            updated_at: string;
        }>;
    }>('/help-center/categories/'),
    
    getArticles: (params?: { category?: string; featured?: boolean }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.featured) queryParams.append('featured', 'true');
        const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
        return api.get<{
            articles: Array<{
                id: number;
                category: number;
                category_name: string;
                title: string;
                slug: string;
                content: string;
                excerpt: string | null;
                order: number;
                is_featured: boolean;
                is_active: boolean;
                views_count: number;
                created_at: string;
                updated_at: string;
            }>;
        }>(`/help-center/articles/${queryString}`);
    },
    
    getArticle: (slug: string) => api.get<{
        id: number;
        category: number;
        category_name: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string | null;
        order: number;
        is_featured: boolean;
        is_active: boolean;
        views_count: number;
        created_at: string;
        updated_at: string;
    }>(`/help-center/articles/${slug}/`),
    
    getFAQs: (params?: { category?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        const queryString = queryParams.toString() ? '?' + queryParams.toString() : '';
        return api.get<{
            faqs: Array<{
                id: number;
                question: string;
                answer: string;
                category: number | null;
                category_name: string | null;
                category_slug: string | null;
                order: number;
                is_active: boolean;
                views_count: number;
                created_at: string;
                updated_at: string;
            }>;
        }>(`/help-center/faqs/${queryString}`);
    },
    
    getFAQ: (faqId: number) => api.get<{
        id: number;
        question: string;
        answer: string;
        category: number | null;
        category_name: string | null;
        category_slug: string | null;
        order: number;
        is_active: boolean;
        views_count: number;
        created_at: string;
        updated_at: string;
    }>(`/help-center/faqs/${faqId}/`),
};

export const builderApi = {
    getProjects: () => api.get<PaginatedResponse<Project>>('/projects/'),
    getProject: (id: number) => api.get<Project>(`/projects/${id}/`),
    createProject: (data: Partial<Project>) => api.post<Project>('/projects/', data),
    updateProject: (id: number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}/`, data),
    deleteProject: (id: number) => api.delete(`/projects/${id}/`),

    getMilestones: () => api.get<PaginatedResponse<Milestone>>('/milestones/'),
    getProjectMilestones: (projectId: number) => api.get<PaginatedResponse<Milestone>>(`/milestones/?project=${projectId}`),
    createMilestone: (data: Partial<Milestone>) => api.post<Milestone>('/milestones/', data),

    createPayment: (data: {
        milestone: number;
        project: number;
        amount: string;
        payment_method: 'CASH' | 'SWIPE_PAYNOW' | 'STRIPE';
        reference_number?: string;
        transaction_id?: string;
        notes?: string;
    }) => api.post<Payment>('/payments/', data),

    getProjectPayments: (projectId: number) => api.get<PaginatedResponse<Payment>>(`/payments/?project=${projectId}`),

    getAllContractors: () => api.get<{
        contractors: Array<{
            id: number;
            company_name: string;
            license_number: string;
            created_at?: string;
            updated_at?: string;
            user: {
                id: number;
                email: string;
                first_name: string;
                last_name: string;
                phone_number: string | null;
            };
            average_rating?: number | null;
            ratings_count: number;
            completed_projects_count: number;
            projects: string[];
        }>;
    }>('/all-contractors/'),

    getSiteUpdates: () => api.get<PaginatedResponse<SiteUpdate>>('/site-updates/'),
    createSiteUpdate: (data: FormData) => api.post<SiteUpdate>('/site-updates/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    getChangeOrders: () => api.get<PaginatedResponse<ChangeOrder>>('/change-orders/'),
    createChangeOrder: (data: Partial<ChangeOrder>) => api.post<ChangeOrder>('/change-orders/', data),

    getConnections: () => api.get<{
        contractors: Array<{
            id: number;
            company_name: string;
            license_number: string;
            created_at?: string;
            updated_at?: string;
            user: {
                id: number;
                email: string;
                first_name: string;
                last_name: string;
                phone_number: string | null;
            };
            average_rating?: number | null;
            ratings_count: number;
            completed_projects_count: number;
            projects: string[];
        }>;
        suppliers: Array<{
            id: number;
            company_name: string;
            on_time_rate: number;
            defect_rate: number;
            user: {
                id: number;
                email: string;
                first_name: string;
                last_name: string;
                phone_number: string | null;
            };
            orders_count: number;
            projects: string[];
        }>;
    }>('/builder-connections/'),

    getProjectConnections: (projectId: number) => api.get<{
        contractors: Array<{
            id: number;
            company_name: string;
            license_number: string;
            user: {
                id: number;
                email: string;
                first_name: string;
                last_name: string;
                phone_number: string | null;
            };
            bids_count: number;
            latest_bid_status: string | null;
        }>;
        suppliers: Array<{
            id: number;
            company_name: string;
            on_time_rate: number;
            defect_rate: number;
            user: {
                id: number;
                email: string;
                first_name: string;
                last_name: string;
                phone_number: string | null;
            };
            orders_count: number;
            latest_order_status: string | null;
        }>;
    }>(`/projects/${projectId}/connections/`),

    getEscrowSummary: () => api.get<{
        projects: Array<{
            project: {
                id: number;
                title: string;
                location: string;
                status: string;
                budget: string;
            };
            budget: string;
            total_paid: string;
            remaining_balance: string;
            next_payment: {
                milestone_id: number;
                milestone_name: string;
                amount: string;
                due_date: string;
                status: string;
            } | null;
        }>;
    }>('/escrow-summary/'),
};

export const contractorApi = {
    getProfile: () => api.get<ContractorProfile[]>('/contractor-profiles/'), // Should filter by user on backend
    createProfile: (data: Partial<ContractorProfile>) => api.post<ContractorProfile>('/contractor-profiles/', data),

    getBids: () => api.get<PaginatedResponse<Bid>>('/bids/'),
    createBid: (data: Partial<Bid>) => api.post<Bid>('/bids/', data),

    getWIPAA: () => api.get<PaginatedResponse<WIPAA>>('/wipaa/'),
    createWIPAA: (data: Partial<WIPAA>) => api.post<WIPAA>('/wipaa/', data),
};

export const supplierApi = {
    getProfile: () => api.get<SupplierProfile[]>('/supplier-profiles/'),
    createProfile: (data: Partial<SupplierProfile>) => api.post<SupplierProfile>('/supplier-profiles/', data),

    getProducts: () => api.get<PaginatedResponse<Product>>('/products/'),
    createProduct: (data: Partial<Product>) => api.post<Product>('/products/', data),

    getOrders: () => api.get<PaginatedResponse<MaterialOrder>>('/material-orders/'),
    updateOrder: (id: number, data: Partial<MaterialOrder>) => api.patch<MaterialOrder>(`/material-orders/${id}/`, data),

    getDeliveries: () => api.get<PaginatedResponse<Delivery>>('/deliveries/'),
    createDelivery: (data: FormData) => api.post<Delivery>('/deliveries/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;

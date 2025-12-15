import axios from 'axios';
import {
    Project, Milestone, SiteUpdate, ChangeOrder,
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

export const builderApi = {
    getProjects: () => api.get<PaginatedResponse<Project>>('/projects/'),
    getProject: (id: number) => api.get<Project>(`/projects/${id}/`),
    createProject: (data: Partial<Project>) => api.post<Project>('/projects/', data),
    updateProject: (id: number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}/`, data),
    deleteProject: (id: number) => api.delete(`/projects/${id}/`),

    getMilestones: () => api.get<PaginatedResponse<Milestone>>('/milestones/'),
    createMilestone: (data: Partial<Milestone>) => api.post<Milestone>('/milestones/', data),

    getSiteUpdates: () => api.get<PaginatedResponse<SiteUpdate>>('/site-updates/'),
    createSiteUpdate: (data: FormData) => api.post<SiteUpdate>('/site-updates/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    getChangeOrders: () => api.get<PaginatedResponse<ChangeOrder>>('/change-orders/'),
    createChangeOrder: (data: Partial<ChangeOrder>) => api.post<ChangeOrder>('/change-orders/', data),
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

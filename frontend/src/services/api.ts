import axios from 'axios';
import {
    ContractorProfile, Bid, WIPAA,
    SupplierProfile, Product, MaterialOrder, Delivery,
    PaginatedResponse, ProjectDashboard,
    Project, SiteUpdate, EscrowMilestone, CapitalScheduleItem,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera,
    BOQItem, DrawingRequest, DrawingFile, MaterialRequest, ProjectTeam, ProfessionalProfile
} from '../types/api';
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
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

// Initialize cached session (ignore errors so app loads without backend/Supabase)
supabase.auth.getSession().then(
    ({ data: { session } }) => {
        cachedSession = session?.access_token || null;
    },
    () => {
        cachedSession = null;
    }
);

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
    updateProfile: (data: FormData) => api.patch('/auth/me/', data),
    submitAccountRequest: (role: string) => api.post<{ id: number; status: string; message: string }>(
        '/admin/requests/', { role }
    ),
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
    // Projects API
    getProjects: () => api.get<PaginatedResponse<Project>>('/projects/'),
    getProject: (id: number) => api.get<Project>(`/projects/${id}/`),
    createProject: (data: Partial<Project>) => api.post<Project>('/projects/', data),
    updateProject: (id: number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}/`, data),
    deleteProject: (id: number) => api.delete(`/projects/${id}/`),

    // Site Updates API
    getSiteUpdates: () => api.get<PaginatedResponse<SiteUpdate>>('/site-updates/'),

    // Project Dashboard — unified endpoint for all widget data
    getProjectDashboard: (projectId: number) => api.get<ProjectDashboard>(`/projects/${projectId}/dashboard/`),

    // Escrow Milestones CRUD
    createEscrowMilestone: (data: Partial<EscrowMilestone>) => api.post<EscrowMilestone>('/escrow-milestones/', data),
    updateEscrowMilestone: (id: number, data: Partial<EscrowMilestone>) => api.patch<EscrowMilestone>(`/escrow-milestones/${id}/`, data),
    deleteEscrowMilestone: (id: number) => api.delete(`/escrow-milestones/${id}/`),

    // Capital Schedule CRUD
    createCapitalSchedule: (data: Partial<CapitalScheduleItem>) => api.post<CapitalScheduleItem>('/capital-schedules/', data),
    updateCapitalSchedule: (id: number, data: Partial<CapitalScheduleItem>) => api.patch<CapitalScheduleItem>(`/capital-schedules/${id}/`, data),
    deleteCapitalSchedule: (id: number) => api.delete(`/capital-schedules/${id}/`),

    // Material Audits CRUD
    getProjectMaterialAudits: (projectId: number) => api.get<PaginatedResponse<MaterialAudit>>(`/material-audits/?project=${projectId}`),
    createMaterialAudit: (data: Partial<MaterialAudit>) => api.post<MaterialAudit>('/material-audits/', data),
    updateMaterialAudit: (id: number, data: Partial<MaterialAudit>) => api.patch<MaterialAudit>(`/material-audits/${id}/`, data),
    deleteMaterialAudit: (id: number) => api.delete(`/material-audits/${id}/`),

    // Weather Events CRUD
    createWeatherEvent: (data: Partial<WeatherEvent>) => api.post<WeatherEvent>('/weather-events/', data),
    updateWeatherEvent: (id: number, data: Partial<WeatherEvent>) => api.patch<WeatherEvent>(`/weather-events/${id}/`, data),
    deleteWeatherEvent: (id: number) => api.delete(`/weather-events/${id}/`),

    // E-Signature Requests CRUD
    getProjectESignatures: (projectId: number) => api.get<PaginatedResponse<ESignatureRequest>>(`/esignature-requests/?project=${projectId}`),
    createESignatureRequest: (data: Partial<ESignatureRequest>) => api.post<ESignatureRequest>('/esignature-requests/', data),
    updateESignatureRequest: (id: number, data: Partial<ESignatureRequest>) => api.patch<ESignatureRequest>(`/esignature-requests/${id}/`, data),
    deleteESignatureRequest: (id: number) => api.delete(`/esignature-requests/${id}/`),

    // Site Cameras CRUD
    createSiteCamera: (data: Partial<SiteCamera>) => api.post<SiteCamera>('/site-cameras/', data),
    updateSiteCamera: (id: number, data: Partial<SiteCamera>) => api.patch<SiteCamera>(`/site-cameras/${id}/`, data),
    deleteSiteCamera: (id: number) => api.delete(`/site-cameras/${id}/`),

    // BOQ Items CRUD
    getProjectBOQItems: (projectId: number) => api.get<BOQItem[]>(`/boq-items/?project=${projectId}`),
    getAllBOQItems: () => api.get<BOQItem[]>('/boq-items/'),
    createBOQItem: (data: Partial<BOQItem>) => api.post<BOQItem>('/boq-items/', data),
    updateBOQItem: (id: number, data: Partial<BOQItem>) => api.patch<BOQItem>(`/boq-items/${id}/`, data),
    deleteBOQItem: (id: number) => api.delete(`/boq-items/${id}/`),

    // Material Requests
    getProjectMaterialRequests: (projectId: number) => api.get<PaginatedResponse<MaterialRequest>>(`/material-requests/?project=${projectId}`),
    createMaterialRequest: (data: any) => api.post<MaterialRequest>('/material-requests/', data),

    // Drawing Requests
    getProjectDrawingRequests: (projectId: number) => api.get<PaginatedResponse<DrawingRequest>>(`/drawing-requests/?project=${projectId}`),
    createDrawingRequest: (data: Partial<DrawingRequest>) => api.post<DrawingRequest>('/drawing-requests/', data),
    uploadDrawingFile: (data: FormData) => api.post<DrawingFile>('/drawing-files/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteDrawingRequest: (id: number) => api.delete(`/drawing-requests/${id}/`),
    deleteDrawingFile: (id: number) => api.delete(`/drawing-files/${id}/`),

    // Project Team management
    getProjectTeam: (projectId: number) => api.get<PaginatedResponse<ProjectTeam>>(`/project-team/?project=${projectId}`),
    addToTeam: (data: Partial<ProjectTeam>) => api.post<ProjectTeam>('/project-team/', data),
    updateTeamMember: (id: number, data: Partial<ProjectTeam>) => api.patch<ProjectTeam>(`/project-team/${id}/`, data),
    removeFromTeam: (id: number) => api.delete(`/project-team/${id}/`),
    
    // Professional Directory
    getProfessionals: (params?: any) => api.get<PaginatedResponse<ProfessionalProfile>>('/professionals/', { params }),
    getProfessional: (id: number) => api.get<ProfessionalProfile>(`/professionals/${id}/`),
};

export const aiApi = {
    sendMessage: (
        messages: {role: string, content: string}[],
        sessionId?: number,
        image?: string,
        pdf?: string,
        projectId?: number,
    ) => 
        api.post<{
            message: string;
            session_id: number;
            image_url?: string;
            image_prompt?: string;
            preset_id?: number;
            preset_name?: string;
            floor_plans?: any[];
            site_intel?: {
                id: number;
                project: number;
                summary: string;
                rows: any[];
                created_at: string;
            };
            analyse?: {
                summary: string;
                items: Array<{
                    category: string;
                    item_name: string;
                    description: string;
                    unit: string;
                    quantity: number;
                    rate: number;
                    total_amount: number;
                }>;
                compliance_notes: string[];
                recommendations: string[];
            };
        }>('/ai/chat/', { messages, session_id: sessionId, image, pdf, project_id: projectId }),

    /**
     * Stream chat via SSE — returns a ReadableStream.
     * For /draw, /plans, /analyse the backend falls back to a JSON response
     * (non-streaming), so the caller should check content-type.
     */
    sendMessageStream: async (
        messages: {role: string; content: string}[],
        sessionId?: number,
        image?: string,
        pdf?: string,
        projectId?: number,
    ): Promise<Response> => {
        const token = cachedSession;
        return fetch(`${api.defaults.baseURL}/ai/chat/stream/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ messages, session_id: sessionId, image, pdf, project_id: projectId }),
        });
    },
    generateSiteIntel: (projectId: number, prompt?: string) =>
        api.post<{ id: number; project: number; summary: string; rows: any[]; raw_response: string; created_at: string }>(
            '/ai/site-intel/',
            { project_id: projectId, prompt }
        ),
    getSiteIntel: (projectId: number) =>
        api.get<{ id: number; project: number; summary: string; rows: any[]; raw_response: string; created_at: string }>(
            `/ai/site-intel/${projectId}/`
        ),
    generateImage: (prompt: string) =>
        api.post<{ image_url: string; prompt: string }>('/ai/generate-image/', { prompt }),
    getSessions: () => api.get<{id: number, title: string, updated_at: string}[]>('/ai/chat/sessions/'),
    getSessionDetails: (id: number) => api.get<{id: number, title: string, messages: {id: number, role: string, content: string, image_url: string | null, created_at: string}[] }>(`/ai/chat/sessions/${id}/`),
    deleteSession: (id: number) => api.delete(`/ai/chat/sessions/${id}/`),
    submitFeedback: (messageId: number, rating: number, originalPrompt: string, presetId?: number, feedbackText?: string) =>
        api.post<{ success: boolean; created: boolean; rating: number }>('/ai/feedback/', {
            message_id: messageId,
            rating,
            original_prompt: originalPrompt,
            preset_id: presetId,
            feedback_text: feedbackText || '',
        }),
};

export const adminApi = {
    getMetrics: () => api.get('/admin/metrics/'),
    getUsers: () => api.get<any[]>('/admin/users/'),
    updateUser: (id: number, data: any) => api.patch(`/admin/users/${id}/`, data),
    deleteUser: (id: number) => api.delete(`/admin/users/${id}/`),
    getDocuments: () => api.get<any[]>('/ai/knowledge/'),
    getDocumentDetail: (id: number) => api.get<{id: number, content: string, title: string}>(`/ai/knowledge/${id}/`),
    uploadDocument: (data: FormData) => api.post<{success: boolean, id: number}>('/ai/knowledge/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteDocument: (id: number) => api.delete(`/ai/knowledge/${id}/`),
    getInstructions: () => api.get<{instruction_text: string}>('/ai/instructions/'),
    updateInstructions: (instruction_text: string) => api.post<{success: boolean, instruction_text: string}>('/ai/instructions/', { instruction_text }),
    getRequests: () => api.get<any[]>('/admin/requests/'),
    reviewRequest: (id: number, action: 'approve' | 'reject', notes?: string) =>
        api.patch(`/admin/requests/${id}/`, { action, notes }),
    // Style presets
    getStylePresets: () => api.get<any[]>('/ai/style-presets/'),
    createStylePreset: (data: any) => api.post<{success: boolean, id: number}>('/ai/style-presets/', data),
    updateStylePreset: (id: number, data: any) => api.patch(`/ai/style-presets/${id}/`, data),
    deleteStylePreset: (id: number) => api.delete(`/ai/style-presets/${id}/`),
    // AI Analytics
    getAIAnalytics: () => api.get('/admin/ai-analytics/'),
    // BOQ Templates CRUD
    getBOQTemplates: () => api.get<any[]>('/ai/boq-templates/'),
    getBOQTemplate: (id: number) => api.get<any>(`/ai/boq-templates/${id}/`),
    createBOQTemplate: (data: any) => api.post<{success: boolean, id: number}>('/ai/boq-templates/', data),
    updateBOQTemplate: (id: number, data: any) => api.patch(`/ai/boq-templates/${id}/`, data),
    deleteBOQTemplate: (id: number) => api.delete(`/ai/boq-templates/${id}/`),
    // Material Prices CRUD
    getMaterialPrices: (params?: {material?: string, region?: string}) => api.get<any[]>('/ai/material-prices/', { params }),
    createMaterialPrice: (data: any) => api.post<{success: boolean, id: number}>('/ai/material-prices/', data),
    updateMaterialPrice: (id: number, data: any) => api.patch(`/ai/material-prices/${id}/`, data),
    deleteMaterialPrice: (id: number) => api.delete(`/ai/material-prices/${id}/`),
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
    createDelivery: (data: FormData) => api.post<Delivery>('/deliveries/', data),
};

export default api;

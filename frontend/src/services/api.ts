import axios, { type InternalAxiosRequestConfig } from 'axios';
import {
    ContractorProfile, Bid, WIPAA,
    SupplierProfile, Product, MaterialOrder, Delivery,
    PaginatedResponse, ProjectDashboard,
    Project, SiteUpdate, EscrowMilestone, CapitalScheduleItem,
    MaterialAudit, WeatherEvent, ESignatureRequest, SiteCamera,
    BOQBuildingItem, BOQProfessionalFee, BOQAdminExpense, BOQLabourCost,
    BOQMachinePlant, BOQLabourBreakdown, BOQScheduleTask, BOQScheduleMaterial, BudgetSheets,
    DrawingRequest, DrawingFile, MaterialRequest, ProjectTeam, ProfessionalProfile,
    ProjectMilestone, ProjectActivity, UserNotification, ProjectDocument,
} from '../types/api';
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { supabase } from '../lib/supabase';

/** Cached Supabase access token (JWT for Django `Authorization: Bearer …`). */
let cachedSession: string | null = null;

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
    const h = config.headers;
    if (!h) return;
    // axios v1 uses AxiosHeaders — plain assignment can fail to attach the header
    if (typeof (h as { set?: (k: string, v: string) => void }).set === 'function') {
        (h as { set: (k: string, v: string) => void }).set('Authorization', `Bearer ${token}`);
    } else {
        (h as Record<string, string>).Authorization = `Bearer ${token}`;
    }
}

let sessionReadPromise: Promise<string | null> | null = null;

async function getAccessToken(): Promise<string | null> {
    if (cachedSession) return cachedSession;
    if (sessionReadPromise) return sessionReadPromise;
    sessionReadPromise = (async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) { cachedSession = null; return null; }
            cachedSession = session?.access_token ?? null;
            return cachedSession;
        } catch {
            cachedSession = null;
            return null;
        } finally {
            sessionReadPromise = null;
        }
    })();
    return sessionReadPromise;
}

// Update cached session when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session?.access_token || null;
    if (cachedSession) {
        api.defaults.headers.common['Authorization'] = `Bearer ${cachedSession}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
});

// Initialize cached session (ignore errors so app loads without backend/Supabase)
supabase.auth.getSession().then(
    ({ data: { session } }) => {
        cachedSession = session?.access_token || null;
        if (cachedSession) {
            api.defaults.headers.common['Authorization'] = `Bearer ${cachedSession}`;
        }
    },
    () => {
        cachedSession = null;
    }
);

// Inject Supabase JWT on every request (required for builder_dashboard BOQ, projects, etc.)
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getAccessToken();
        if (token) {
            if (!config.headers) config.headers = {};
            setAuthorizationHeader(config, token);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Shared refresh promise — concurrent 401 retries share one refreshSession() call
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        try {
            const { data, error: err } = await supabase.auth.refreshSession();
            if (!err && data.session?.access_token) {
                cachedSession = data.session.access_token;
                return cachedSession;
            }
        } catch { /* fall through */ }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            cachedSession = session?.access_token ?? null;
            return cachedSession;
        } catch { /* ignore */ }
        cachedSession = null;
        return null;
    })().finally(() => { refreshPromise = null; });
    return refreshPromise;
}

// Retry once on 401: refresh Supabase session, then replay the request with a new token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
        if (!original || error.response?.status !== 401 || original._retried) {
            return Promise.reject(error);
        }
        original._retried = true;

        const token = await refreshAccessToken();
        if (token) {
            setAuthorizationHeader(original, token);
            return api(original);
        }
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

    // --- 7-SHEET BUDGET CRUD (preliminary = working; final = signed-off snapshot) ---
    getProjectBudgetSheets: (projectId: number, budget: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BudgetSheets>(`/projects/${projectId}/budget-sheets/`, { params: { budget } }),

    promoteBudgetToFinal: (projectId: number) =>
        api.post<BudgetSheets>(`/projects/${projectId}/budget/promote-to-final/`),

    signFinalBudget: (projectId: number) =>
        api.post<BudgetSheets>(`/projects/${projectId}/budget/sign-final/`, {}),

    /** Use `final` for procurement (signed budget lines). Default `preliminary` for editing working budget. */
    getProjectBOQBuildingItems:  (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQBuildingItem[]>(`/boq-building-items/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQProfessionalFees: (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQProfessionalFee[]>(`/boq-professional-fees/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQAdminExpenses:  (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQAdminExpense[]>(`/boq-admin-expenses/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQLabourCosts:    (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQLabourCost[]>(`/boq-labour-costs/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQMachinePlants:  (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQMachinePlant[]>(`/boq-machine-plants/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQLabourBreakdowns: (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQLabourBreakdown[]>(`/boq-labour-breakdowns/`, { params: { project: projectId, budget_kind: budgetKind } }),
    getProjectBOQScheduleTasks:  (projectId: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.get<BOQScheduleTask[]>(`/boq-schedule-tasks/`, { params: { project: projectId, budget_kind: budgetKind } }),

    createBOQBuildingItem: (data: Partial<BOQBuildingItem>) => api.post<BOQBuildingItem>('/boq-building-items/', data),

    updateBOQBuildingItem: (id: number, data: Partial<BOQBuildingItem>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQBuildingItem>(`/boq-building-items/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQBuildingItem: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-building-items/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQProfessionalFee: (data: Partial<BOQProfessionalFee>) => api.post<BOQProfessionalFee>('/boq-professional-fees/', data),
    updateBOQProfessionalFee: (id: number, data: Partial<BOQProfessionalFee>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQProfessionalFee>(`/boq-professional-fees/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQProfessionalFee: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-professional-fees/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQAdminExpense: (data: Partial<BOQAdminExpense>) => api.post<BOQAdminExpense>('/boq-admin-expenses/', data),
    updateBOQAdminExpense: (id: number, data: Partial<BOQAdminExpense>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQAdminExpense>(`/boq-admin-expenses/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQAdminExpense: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-admin-expenses/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQLabourCost: (data: Partial<BOQLabourCost>) => api.post<BOQLabourCost>('/boq-labour-costs/', data),
    updateBOQLabourCost: (id: number, data: Partial<BOQLabourCost>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQLabourCost>(`/boq-labour-costs/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQLabourCost: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-labour-costs/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQMachinePlant: (data: Partial<BOQMachinePlant>) => api.post<BOQMachinePlant>('/boq-machine-plants/', data),
    updateBOQMachinePlant: (id: number, data: Partial<BOQMachinePlant>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQMachinePlant>(`/boq-machine-plants/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQMachinePlant: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-machine-plants/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQLabourBreakdown: (data: Partial<BOQLabourBreakdown>) => api.post<BOQLabourBreakdown>('/boq-labour-breakdowns/', data),
    updateBOQLabourBreakdown: (id: number, data: Partial<BOQLabourBreakdown>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQLabourBreakdown>(`/boq-labour-breakdowns/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQLabourBreakdown: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-labour-breakdowns/${id}/`, { params: { budget_kind: budgetKind } }),

    createBOQScheduleTask: (data: Partial<BOQScheduleTask>) => api.post<BOQScheduleTask>('/boq-schedule-tasks/', data),
    updateBOQScheduleTask: (id: number, data: Partial<BOQScheduleTask>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQScheduleTask>(`/boq-schedule-tasks/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteBOQScheduleTask: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/boq-schedule-tasks/${id}/`, { params: { budget_kind: budgetKind } }),

    createScheduleMaterial: (data: Partial<BOQScheduleMaterial>) => api.post<BOQScheduleMaterial>('/schedule-materials/', data),
    updateScheduleMaterial: (id: number, data: Partial<BOQScheduleMaterial>, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.patch<BOQScheduleMaterial>(`/schedule-materials/${id}/`, data, { params: { budget_kind: budgetKind } }),
    deleteScheduleMaterial: (id: number, budgetKind: 'preliminary' | 'final' = 'preliminary') =>
        api.delete(`/schedule-materials/${id}/`, { params: { budget_kind: budgetKind } }),

    // Material Requests
    getProjectMaterialRequests: (projectId: number) => api.get<PaginatedResponse<MaterialRequest>>(`/material-requests/?project=${projectId}`),
    createMaterialRequest: (data: any) => api.post<MaterialRequest>('/material-requests/', data),

    // Drawing Requests
    getProjectDrawingRequests: (projectId: number) => api.get<PaginatedResponse<DrawingRequest>>(`/drawing-requests/?project=${projectId}`),
    getAllDrawingRequests: () => api.get<PaginatedResponse<DrawingRequest>>('/drawing-requests/'),
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
    
    // Professional Profiles
    getProfessionals: (params?: { page?: number; search?: string; role?: string }) => 
        api.get<PaginatedResponse<ProfessionalProfile>>('/professionals/', { params }),

    // Milestones
    getProjectMilestones: (projectId: number) => api.get<PaginatedResponse<ProjectMilestone>>(`/project-milestones/?project=${projectId}`),
    createMilestone: (data: Partial<ProjectMilestone>) => api.post<ProjectMilestone>('/project-milestones/', data),
    updateMilestone: (id: number, data: Partial<ProjectMilestone>) => api.patch<ProjectMilestone>(`/project-milestones/${id}/`, data),
    deleteMilestone: (id: number) => api.delete(`/project-milestones/${id}/`),
    toggleMilestone: (id: number) => api.post<ProjectMilestone>(`/project-milestones/${id}/toggle_complete/`),

    // Activities
    getProjectActivities: (projectId: number) => api.get<PaginatedResponse<ProjectActivity>>(`/project-activities/?project=${projectId}`),
    createActivity: (data: Partial<ProjectActivity>) => api.post<ProjectActivity>('/project-activities/', data),

    // Notifications
    getNotifications: () => api.get<PaginatedResponse<UserNotification>>('/notifications/'),
    markNotificationRead: (id: number) => api.post(`/notifications/${id}/mark_read/`),
    markAllNotificationsRead: () => api.post('/notifications/mark_all_read/'),
    deleteNotification: (id: number) => api.delete(`/notifications/${id}/`),

    // Documents
    getProjectDocuments: (projectId: number) => api.get<PaginatedResponse<ProjectDocument>>(`/project-documents/?project=${projectId}`),
    uploadDocument: (formData: FormData) => api.post<ProjectDocument>('/project-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteDocument: (id: number) => api.delete(`/project-documents/${id}/`),
    downloadDocument: (id: number) => api.get(`/project-documents/${id}/`, { responseType: 'blob' }),

    // Floor Plans (served from admin endpoints)
    getFloorPlanCategories: () => api.get<any>('/admin/floor-plan-categories/'),
    getFloorPlans: () => api.get<any>('/admin/floor-plans/'),
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
  getUser: (id: number) => api.get<any>(`/admin/users/${id}/`),
    createUser: (data: any) => api.post('/admin/users/', data),
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
    // Floor Plan CRUD
    getFloorPlanCategories: () => api.get<any>('/admin/floor-plan-categories/'),
    createFloorPlanCategory: (data: any) => api.post('/admin/floor-plan-categories/', data),
    deleteFloorPlanCategory: (id: number) => api.delete(`/admin/floor-plan-categories/${id}/`),
    getFloorPlans: () => api.get<any>('/admin/floor-plans/'),
    createFloorPlan: (data: FormData) => api.post('/admin/floor-plans/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteFloorPlan: (id: number) => api.delete(`/admin/floor-plans/${id}/`),
    // Projects Overview
    getProjects: (params?: { search?: string; status?: string }) => api.get<any>('/admin/projects/', { params }),
    getProject: (id: number) => api.get<any>(`/admin/projects/${id}/`),
    // Billing
    getBilling: () => api.get<any>('/admin/billing/'),
    createInvoice: (data: { user_email: string; customer_name?: string; company_name?: string; subtotal: number; tax?: number; status?: string; due_date?: string }) =>
      api.post('/admin/billing/', data),
    // Finance (Accounting)
    getChartOfAccounts: (params?: { q?: string; type?: string }) =>
      api.get<any[]>('/admin/finance/accounts/', { params }),
    createAccount: (data: { code: string; name: string; account_type: string; description?: string }) =>
      api.post('/admin/finance/accounts/', data),
    getAccountLedger: (id: number, params?: { limit?: number; include_drafts?: boolean }) =>
      api.get<any>(`/admin/finance/accounts/${id}/ledger/`, { params }),
    getJournalEntries: (params?: { status?: string; limit?: number }) =>
      api.get<any[]>('/admin/finance/journal-entries/', { params }),
    createJournalEntry: (data: { entry_date?: string; memo?: string; reference?: string; lines: Array<{ account_id: number; debit?: number; credit?: number; description?: string }> }) =>
      api.post('/admin/finance/journal-entries/', data),
    postJournalEntry: (id: number) =>
      api.post(`/admin/finance/journal-entries/${id}/post/`),
    getFinanceReports: () =>
      api.get<any>('/admin/finance/reports/'),
    // Platform Settings
    getSettings: () => api.get<any>('/admin/settings/'),
    updateSettings: (data: any) => api.patch('/admin/settings/', data),
    // Activity Log
    getActivityLog: (params?: { limit?: number; action?: string }) => api.get<any[]>('/admin/activity-log/', { params }),
  // Audit Log (user activity summary)
  getAuditLog: (params?: { limit?: number; search?: string; role?: string; include_empty?: boolean }) =>
    api.get<{ summary: any; results: any[] }>('/admin/audit-log/', { params }),
  // User activity timeline
  getUserActivity: (id: number, params?: { limit?: number; event_type?: string }) =>
    api.get<any[]>(`/admin/users/${id}/activity/`, { params }),
    // Procurement Oversight
    getProcurementRequests: (params?: { status?: string; category?: string; project?: number }) => 
        api.get<any>('/admin/procurement/', { params }),
    // Building Team (Professionals)
    getAdminProfessionals: (params?: { search?: string; role?: string }) => 
        api.get<any[]>('/admin/professional-profiles/', { params }),
    getAdminProfessional: (id: number) => api.get<any>(`/admin/professional-profiles/${id}/`),
    createAdminProfessional: (data: any) => api.post('/admin/professional-profiles/', data),
    updateAdminProfessional: (id: number, data: any) => api.patch(`/admin/professional-profiles/${id}/`, data),
    deleteAdminProfessional: (id: number) => api.delete(`/admin/professional-profiles/${id}/`),
};

export const activityApi = {
  logEvent: (data: { event_type?: string; path?: string; title?: string; referrer?: string; metadata?: any }) =>
    api.post('/admin/activity/', data),
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

// Helper to extract results from paginated response
export function extractResults<T>(response: { data: PaginatedResponse<T> | T[] }): T[] {
    if (Array.isArray(response.data)) return response.data;
    return response.data.results || [];
}

export default api;

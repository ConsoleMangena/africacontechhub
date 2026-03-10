export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile?: Profile;
}

export interface Profile {
    id: number;
    user: User;
    role: 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER' | 'ADMIN';
    avatar?: string;
    address?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    supabase_id?: string;
    is_approved?: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Builder Dashboard Types
export interface Project {
    id: number;
    owner: number;
    title: string;
    location: string;
    budget: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    si56_verified: boolean;
    latitude?: string;
    longitude?: string;
    engagement_tier: 'DIT' | 'DIFY';
    created_at: string;
    updated_at: string;
}

export interface SiteUpdate {
    id: number;
    project: number;
    description: string;
    image: string;
    geo_location?: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface EscrowMilestone {
    id: number;
    project: number;
    name: string;
    amount: string;
    status: 'completed' | 'pending' | 'locked';
    released: boolean;
    created_at: string;
    updated_at: string;
}

export interface CapitalScheduleItem {
    id: number;
    project: number;
    description: string;
    amount: string;
    due_date: string;
    status: 'paid' | 'upcoming' | 'overdue';
    created_at: string;
    updated_at: string;
}

export interface MaterialAudit {
    id: number;
    project: number;
    material_name: string;
    delivered_qty: string;
    installed_qty: string;
    theoretical_usage: string;
    actual_usage: string;
    unit: string;
    audit_passed: boolean;
    created_at: string;
    updated_at: string;
}

export interface WeatherEvent {
    id: number;
    project: number;
    contractor_claim: string;
    claimed_delay_days: number;
    actual_rainfall_mm: string;
    verdict: 'approved' | 'rejected' | 'pending';
    date: string;
    created_at: string;
    updated_at: string;
}

export interface ESignatureRequest {
    id: number;
    project: number;
    document_type: 'payment_release' | 'variation_order';
    party_name: string;
    amount: string;
    status: 'pending' | 'signed' | 'rejected';
    due_date: string;
    created_at: string;
    updated_at: string;
}

export interface SiteCamera {
    id: number;
    project: number;
    name: string;
    active: boolean;
    recording: boolean;
    stream_url?: string;
    created_at: string;
    updated_at: string;
}

export interface BOQItem {
    id: number;
    project: number;
    category: string;
    item_name: string;
    description: string;
    unit: string;
    quantity: string;
    rate: string;
    total_amount: string;
    labour_rate?: string;
    measurement_formula?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDashboard {
    escrow_milestones: EscrowMilestone[];
    capital_schedule: CapitalScheduleItem[];
    material_audits: MaterialAudit[];
    weather_events: WeatherEvent[];
    esignature_requests: ESignatureRequest[];
    site_cameras: SiteCamera[];
    unverified_updates: SiteUpdate[];
}

// Contractor Dashboard Types
export interface ContractorProfile {
    id: number;
    user: number;
    company_name: string;
    license_number: string;
    created_at: string;
    updated_at: string;
}

export interface Bid {
    id: number;
    project: number;
    contractor: number;
    direct_costs: string;
    overhead: string;
    net_margin: string;
    total_amount: string;
    status: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
    updated_at: string;
}

export interface WIPAA {
    id: number;
    project: number;
    contractor: number;
    period: string;
    costs_incurred: string;
    billed_revenue: string;
    earned_revenue: string;
    over_under_billing?: string;
    created_at: string;
    updated_at: string;
}

// Supplier Dashboard Types
export interface SupplierProfile {
    id: number;
    user: number;
    company_name: string;
    on_time_rate: string;
    defect_rate: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    supplier: number;
    name: string;
    description?: string;
    unit_price: string;
    created_at: string;
    updated_at: string;
}

export interface MaterialOrder {
    id: number;
    project: number;
    supplier: number;
    total_cost: string;
    tco_score?: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    created_at: string;
    updated_at: string;
}

export interface Delivery {
    id: number;
    order: number;
    date: string;
    proof_of_delivery: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

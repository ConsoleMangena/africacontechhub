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
    owner: number; // User ID
    title: string;
    location: string;
    budget: string; // Decimal string
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    si56_verified: boolean;
    latitude?: string;
    longitude?: string;
    engagement_tier: 'DIY' | 'DIT' | 'DIFY';
    created_at: string;
    updated_at: string;
}

export interface Milestone {
    id: number;
    project: number;
    name: string;
    amount: string;
    status: 'PENDING' | 'VERIFIED' | 'PAID';
    due_date: string;
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

export interface ChangeOrder {
    id: number;
    project: number;
    description: string;
    amount: string;
    status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
    created_at: string;
    updated_at: string;
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
    over_under_billing?: string; // Read-only property
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

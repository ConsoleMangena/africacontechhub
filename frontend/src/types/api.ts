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
    has_signature?: boolean;
    signature?: string;
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
    is_budget_signed: boolean;
    latitude?: string;
    longitude?: string;
    engagement_tier: 'DIT' | 'DIFY';
    // Optional project summary generated from form inputs
    ai_brief?: string;
    building_type?: string | null;
    use_case?: string | null;
    occupants?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floors?: number | null;
    has_garage?: boolean | null;
    parking_spaces?: number | null;
    lot_size?: string | null;
    footprint?: string | null;
    preferred_style?: string | null;
    roof_type?: string | null;
    special_spaces?: string | null;
    sustainability?: string | null;
    accessibility?: string | null;
    site_notes?: string | null;
    constraints?: string | null;
    timeline?: string | null;
    budget_flex?: string | null;
    created_at: string;
    updated_at: string;
    architect?: number | null;
    architect_details?: {
        full_name: string;
        email: string;
        phone: string;
        avatar: string | null;
    } | null;
    total_team_count: number;
    team_stats: {
        pending: number;
        assigned: number;
        completed: number;
    };
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

export interface BOQBuildingItem {
    id: number; project: number; budget_version?: number; bill_no?: string; description: string; specification?: string; unit?: string; quantity: string; rate: string; amount: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQProfessionalFee {
    id: number; project: number; discipline?: string; role_scope?: string; basis?: string; rate?: string; estimated_fee: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQAdminExpense {
    id: number; project: number; item_role?: string; description?: string; trips_per_week?: string; total_trips?: string; distance?: string; rate: string; total_cost: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQLabourCost {
    id: number; project: number; phase?: string; trade_role?: string; skill_level?: string; gang_size?: string; duration_weeks?: string; total_man_days?: string; daily_rate: string; total_cost: string; weekly_wage_bill?: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQMachinePlant {
    id: number; project: number; category?: string; machine_item?: string; qty: string; dry_hire_rate?: string; fuel_l_hr?: string; hrs_day?: string; fuel_cost?: string; operator_rate?: string; daily_wet_rate: string; days_rqd?: string; total_cost: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQLabourBreakdown {
    id: number; project: number; phase?: string; trade_role?: string; skill_level?: string; gang_size?: string; duration_weeks?: string; total_man_days?: string; daily_rate: string; total_cost: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQScheduleTask {
    id: number; project: number; wbs?: string; task_description?: string; start_date?: string; end_date?: string; days?: string; predecessor?: string; est_cost?: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BOQScheduleMaterial {
    id: number; project: number; section: string; material_description: string; specification?: string; estimated_qty?: string; is_ai_generated: boolean; created_at: string; updated_at: string;
}
export interface BudgetMeta {
    kind: string;
    signed_at: string | null;
    signed_by_id: number | null;
    signed_by_name?: string;
    author_signature: string;
    /** Snapshot of profile signature (data URL) when signed. */
    signature_image?: string | null;
    is_locked: boolean;
    version_id: number | null;
    /** Sum of all line amounts (USD). */
    gross_total?: string;
}

export interface BudgetSheets {
    building_items: BOQBuildingItem[];
    professional_fees: BOQProfessionalFee[];
    admin_expenses: BOQAdminExpense[];
    labour_costs: BOQLabourCost[];
    machine_plants: BOQMachinePlant[];
    labour_breakdowns: BOQLabourBreakdown[];
    schedule_tasks: BOQScheduleTask[];
    schedule_materials: BOQScheduleMaterial[];
    budget_meta?: BudgetMeta;
}

export interface ProjectDashboard {
    escrow_milestones: EscrowMilestone[];
    capital_schedule: CapitalScheduleItem[];
    material_audits: MaterialAudit[];
    weather_events: WeatherEvent[];
    esignature_requests: ESignatureRequest[];
    site_cameras: SiteCamera[];
    unverified_updates: SiteUpdate[];
    contractors?: any[];
    suppliers?: any[];
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

export interface MaterialRequest {
    id: number;
    project: number;
    boq_item?: number;
    content_type?: number;
    object_id?: number;
    procurement_category: 'MATERIAL' | 'LABOUR' | 'PLANT' | 'PROFESSIONAL' | 'ADMIN' | 'OTHER';
    material_name: string;
    quantity_requested: string;
    unit: string;
    procurement_method: 'SELF' | 'GROUP_BUY';
    price_at_request: string;
    transport_cost: string;
    group_buy_deduction: string;
    total_calculated_cost: string;
    status: 'PENDING' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface DrawingFile {
    id: number;
    request: number;
    file: string;
    original_name: string;
    file_type: string;
    file_size: string;
    created_at: string;
    updated_at: string;
}

export interface DrawingRequest {
    id: number;
    project: number;
    drawing_type: 'floor_plan' | 'elevation' | 'section' | '3d_render' | 'blueprint';
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    files: DrawingFile[];
    created_at: string;
    updated_at: string;
}
export interface ProjectTeam {
    id: number;
    project: number;
    user: number;
    role: 'architect' | 'structural_engineer' | 'contractor' | 'project_manager' | 'quantity_surveyor' | 'electrician' | 'plumber' | 'mason' | 'carpenter' | 'painter' | 'roofer' | 'tiler';
    status: 'pending' | 'assigned' | 'completed';
    notes: string;
    user_details?: {
        full_name: string;
        email: string;
        phone: string;
        avatar: string | null;
    };
    full_name: string;
    created_at: string;
}
export interface ProfessionalProfile {
    id: number;
    user: number;
    user_details?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
        avatar?: string;
        phone_number?: string;
    };
    role: 'architect' | 'structural_engineer' | 'contractor' | 'project_manager' | 'quantity_surveyor' | 'electrician' | 'plumber' | 'mason' | 'carpenter' | 'painter' | 'roofer' | 'tiler';
    company_name: string;
    location: string;
    experience_years: number;
    bio: string;
    hourly_rate?: string;
    availability: 'available' | 'busy' | 'unavailable';
    is_verified: boolean;
    specialties: string[];
    certifications: string[];
    average_rating: string;
    completed_projects_count: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectMilestone {
    id: number;
    project: number;
    name: string;
    description?: string;
    category: 'design' | 'budget' | 'procurement' | 'construction' | 'other';
    target_date: string;
    completed: boolean;
    completed_date?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectActivity {
    id: number;
    project: number;
    user: number | null;
    user_name: string;
    type: 'team' | 'budget' | 'procurement' | 'design' | 'status' | 'document' | 'general';
    action: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface UserNotification {
    id: number;
    user: number;
    project?: number;
    type: 'team' | 'budget' | 'procurement' | 'design' | 'status' | 'general';
    title: string;
    message: string;
    read: boolean;
    action_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectDocument {
    id: number;
    project: number;
    name: string;
    type: 'contract' | 'permit' | 'invoice' | 'insurance' | 'warranty' | 'other';
    file: string;
    file_size: number;
    uploaded_by: number | null;
    uploaded_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface FloorPlanCategory {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface FloorPlanDataset {
    id: number;
    title: string;
    description: string;
    image: string;
    category: number;
    category_name?: string;
    created_at: string;
    updated_at: string;
}

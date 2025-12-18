import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { 
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    PhotoIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon,
    VideoCameraIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    BuildingOfficeIcon,
    HomeIcon,
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    StarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    XCircleIcon,
    BellIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    CogIcon,
    CubeIcon,
    BookOpenIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Contractor {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    rating: number;
    experience: string;
    specialties: string[];
    profile_image: string;
    license_number: string;
    insurance_status: string;
    location: string;
}

interface ProjectUpdate {
    id: number;
    title: string;
    description: string;
    date: string;
    images: string[];
    contractor_id: number;
    milestone_id: number;
    status: 'completed' | 'in_progress' | 'pending';
    progress_percentage: number;
}

interface Milestone {
    id: number;
    title: string;
    description: string;
    due_date: string;
    status: 'completed' | 'in_progress' | 'pending' | 'overdue';
    progress_percentage: number;
    contractor_notes: string;
    client_approval_required: boolean;
    documents: string[];
}

interface Document {
    id: number;
    name: string;
    type: 'contract' | 'permit' | 'invoice' | 'photo' | 'report' | 'other';
    uploaded_by: 'client' | 'contractor';
    upload_date: string;
    size: string;
    url: string;
    category: string;
}

interface Props {
    contractor: Contractor;
    projectUpdates: ProjectUpdate[];
    milestones: Milestone[];
    documents: Document[];
    projectStats: {
        total_milestones: number;
        completed_milestones: number;
        in_progress_milestones: number;
        pending_milestones: number;
        overdue_milestones: number;
        total_updates: number;
        total_documents: number;
    };
}

export default function DITDashboard({ contractor, projectUpdates, milestones, documents, projectStats }: Props) {
    const [activeTab, setActiveTab] = useState('initiation');
    
    // Mock data from The Aspiring Builder's Blueprint
    const projectVision = {
        purpose: "Create a modern, energy-efficient family home",
        objectives: [
            "Complete within a $500,000 budget",
            "Achieve LEED Silver certification",
            "Move-in ready by Q3 2026"
        ],
        stakeholders: ["John Smith (Owner)", "Sarah Lee (Architect)", "DIT Construction"],
        constraints: ["Budget cap: $500k", "Must preserve existing oak tree on site"]
    };

    const feasibility = {
        technical: { score: 90, status: 'Feasible' },
        financial: { score: 75, status: 'Viable' },
        legal: { score: 100, status: 'Approved' },
        market: { score: 85, status: 'Strong Demand' },
        risk: { score: 60, status: 'Moderate Risk' }
    };

    const permits = [
        { name: 'Building Permit', authority: 'City Building Dept.', submitted: '2025-01-15', status: 'Approved', approved: '2025-02-01' },
        { name: 'Electrical Permit', authority: 'City Electrical Board', submitted: '2025-02-10', status: 'In Review', approved: null },
        { name: 'Plumbing Permit', authority: 'County Health', submitted: '2025-02-12', status: 'Submitted', approved: null }
    ];

    const bids = [
        { contractor: 'Smith Construction', total: 485000, duration: '6 months', inclusions: 'Full warranty, LEED support' },
        { contractor: 'BuildRight Co.', total: 462000, duration: '7 months', inclusions: 'Basic warranty' },
        { contractor: 'Elite Builders', total: 510000, duration: '5.5 months', inclusions: 'Premium finishes, 2-year warranty' }
    ];

    const ganttTasks = [
        { name: 'Site Prep', start: 'Mar 1', end: 'Mar 15', progress: 100 },
        { name: 'Foundation', start: 'Mar 16', end: 'Apr 10', progress: 100 },
        { name: 'Framing', start: 'Apr 11', end: 'May 20', progress: 60 },
        { name: 'Roofing', start: 'May 15', end: 'Jun 5', progress: 0 },
        { name: 'MEP Rough-in', start: 'May 25', end: 'Jun 20', progress: 0 },
        { name: 'Insulation & Drywall', start: 'Jun 10', end: 'Jul 10', progress: 0 },
        { name: 'Finishes', start: 'Jul 1', end: 'Aug 15', progress: 0 }
    ];

    const handoverItems = [
        'Keys & Access Codes',
        'Certificate of Occupancy',
        'As-Built Drawings',
        'Warranty Documents',
        'O&M Manuals',
        'Subcontractor Contact List',
        'Final Lien Waivers'
    ];

    // NEW FEATURES DATA
    const preliminaryBudget = {
        hardCosts: 325000,
        softCosts: 50000,
        sitePrep: 60000,
        contingency: 40000,
        total: 475000
    };

    const siteAnalysis = [
        { item: 'Topography & Soil Stability', status: '✅ Completed', notes: 'Geotechnical report approved' },
        { item: 'Utilities Assessment', status: '✅ Completed', notes: 'All utilities accessible' },
        { item: 'Zoning Compliance', status: '✅ Verified', notes: 'R-2 zoning confirmed' },
        { item: 'Environmental Factors', status: '⚠️ In Progress', notes: 'Tree preservation plan pending' },
        { item: 'Site Accessibility', status: '✅ Confirmed', notes: 'Adequate road access' }
    ];

    const deliveryMethods = [
        { method: 'Design-Bid-Build (DBB)', pros: 'Competitive pricing', cons: 'Slower delivery, design-construction separation' },
        { method: 'Design-Build (DB)', pros: 'Faster, single accountability', cons: 'Less upfront price competition' },
        { method: 'CM at Risk (CMAR)', pros: 'Early cost input, GMP guarantee', cons: 'Multiple contracts to manage' }
    ];

    const designTeam = [
        { name: 'Sarah Lee', role: 'Architect', status: '✅ Hired', credentials: 'Licensed, 10+ years experience' },
        { name: 'Mike Chen', role: 'Structural Engineer', status: '✅ Hired', credentials: 'PE Licensed, LEED AP' },
        { name: 'Lisa Rodriguez', role: 'MEP Engineer', status: '✅ Hired', credentials: 'Professional Engineer' }
    ];

    const preConstructionChecklist = [
        { task: 'Finalize design plans', status: '✅ Complete' },
        { task: 'Submit permits', status: '✅ Complete' },
        { task: 'Secure funding', status: '✅ Complete' },
        { task: 'Final site survey', status: '✅ Complete' },
        { task: 'Develop project schedule', status: '✅ Complete' },
        { task: 'Finalize material list', status: '⚠️ In Progress' },
        { task: 'Plan site logistics', status: '✅ Complete' }
    ];

    const detailedBudget = [
        { category: 'Concrete', budgeted: 45000, actual: 42000, variance: '+$3,000' },
        { category: 'Framing', budgeted: 85000, actual: 92000, variance: '-$7,000' },
        { category: 'Roofing', budgeted: 28000, actual: 0, variance: '$0' },
        { category: 'MEP', budgeted: 65000, actual: 15000, variance: '+$50,000' },
        { category: 'Finishes', budgeted: 120000, actual: 0, variance: '$0' }
    ];

    const changeOrders = [
        { id: 1, description: 'Upgrade kitchen countertops to quartz', cost: 3500, status: 'Approved', date: '2025-04-10' },
        { id: 2, description: 'Add extra electrical outlet in garage', cost: 450, status: 'Pending', date: '2025-04-15' }
    ];

    const qualityInspections = [
        { phase: 'Foundation', status: '✅ Passed', date: '2025-03-20' },
        { phase: 'Framing', status: '✅ Passed', date: '2025-04-25' },
        { phase: 'MEP Rough-in', status: '📅 Scheduled', date: '2025-05-28' },
        { phase: 'Insulation & Drywall', status: '⏳ Pending', date: '2025-06-15' },
        { phase: 'Finishes', status: '⏳ Pending', date: '2025-07-20' }
    ];

    const safetyProgram = [
        { item: 'Safety Manual', status: '✅ Implemented' },
        { item: 'Toolbox Talks', status: '✅ Weekly (12 completed)' },
        { item: 'Hazard Assessment', status: '✅ Site-specific completed' },
        { item: 'PPE Compliance', status: '✅ 100% adherence' },
        { item: 'Incident Reporting', status: '✅ Zero incidents' }
    ];

    const weeklyReport = {
        completed: 'Foundation poured, framing 60% complete',
        planned: 'Complete framing, begin roofing prep',
        schedule: 'On track',
        budget: 'Within 2% of budget',
        issues: 'Minor weather delay (1 day)',
        decisions: 'Kitchen cabinet selection needed'
    };

    const riskLog = [
        { risk: 'Weather delays', likelihood: 'Medium', impact: 'High', mitigation: 'Buffer days in schedule' },
        { risk: 'Material cost increases', likelihood: 'Low', impact: 'Medium', mitigation: 'Fixed-price contracts' },
        { risk: 'Labor shortage', likelihood: 'Medium', impact: 'Medium', mitigation: 'Backup subcontractors identified' }
    ];

    const rfiLog = [
        { id: 1, question: 'Clarify window placement on east wall', status: 'Answered', date: '2025-03-10' },
        { id: 2, question: 'Confirm HVAC duct routing in basement', status: 'Pending', date: '2025-04-05' }
    ];

    const submittalLog = [
        { item: 'Tile samples', status: '✅ Approved', date: '2025-03-15' },
        { item: 'Window specifications', status: '✅ Approved', date: '2025-03-20' },
        { item: 'Paint colors', status: '⏳ Pending', date: '2025-04-10' }
    ];

    const warrantyManual = [
        { section: 'HVAC System', warranty: '5 years parts, 2 years labor' },
        { section: 'Roofing', warranty: '25 years materials' },
        { section: 'Appliances', warranty: '1 year manufacturer' },
        { section: 'Workmanship', warranty: '1 year comprehensive' }
    ];

    const followUpSchedule = [
        { check: '30-Day Follow-up', date: '2025-09-15', status: '📅 Scheduled' },
        { check: '6-Month Follow-up', date: '2026-02-15', status: '⏳ Pending' },
        { check: '11-Month Warranty Check', date: '2026-07-15', status: '⏳ Pending' }
    ];

    const [punchListItems, setPunchListItems] = useState([
        { id: 1, location: 'Kitchen', description: 'Cabinet door misaligned', responsible: 'Carpenter', completed: false },
        { id: 2, location: 'Master Bath', description: 'Grout cracking near shower', responsible: 'Tile Contractor', completed: true },
        { id: 3, location: 'Living Room', description: 'Touch-up paint needed on baseboard', responsible: 'Painter', completed: false }
    ]);

    const togglePunchItem = (id: number) => {
        setPunchListItems(punchListItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };
    const [isMilestonesExpanded, setIsMilestonesExpanded] = useState(false);
    const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
    const [isUpdatesExpanded, setIsUpdatesExpanded] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [callDetails, setCallDetails] = useState({
        date: '',
        time: '',
        duration: '30',
        type: 'video',
        notes: ''
    });
    const [messageDetails, setMessageDetails] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getDocumentTypeIcon = (type: string) => {
        switch (type) {
            case 'contract': return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
            case 'permit': return <ShieldCheckIcon className="w-4 h-4 text-green-600" />;
            case 'invoice': return <CurrencyDollarIcon className="w-4 h-4 text-purple-600" />;
            case 'photo': return <PhotoIcon className="w-4 h-4 text-pink-600" />;
            case 'report': return <ChartBarIcon className="w-4 h-4 text-orange-600" />;
            default: return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getDocumentTypeColor = (type: string) => {
        switch (type) {
            case 'contract': return 'bg-blue-50 border-blue-200';
            case 'permit': return 'bg-green-50 border-green-200';
            case 'invoice': return 'bg-purple-50 border-purple-200';
            case 'photo': return 'bg-pink-50 border-pink-200';
            case 'report': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getDayDetails = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        
        // Project milestones and activities
        const activities = [];
        
        // Foundation milestone
        if (day === 15 && month === today.getMonth()) {
            activities.push({
                type: 'milestone',
                title: 'Foundation Complete',
                description: 'Foundation work completed and inspected',
                status: isPast ? 'completed' : 'upcoming',
                time: '9:00 AM',
                contractor: 'Foundation Team'
            });
        }
        
        // Framing review
        if (day === 22 && month === today.getMonth()) {
            activities.push({
                type: 'review',
                title: 'Framing Progress Review',
                description: 'Review framing progress with contractor',
                status: isPast ? 'completed' : 'upcoming',
                time: '2:00 PM',
                contractor: 'Framing Team'
            });
        }
        
        // Roofing start
        if (day === 28 && month === today.getMonth()) {
            activities.push({
                type: 'milestone',
                title: 'Roofing Work Begins',
                description: 'Roofing materials delivery and work start',
                status: isPast ? 'completed' : 'upcoming',
                time: '8:00 AM',
                contractor: 'Roofing Team'
            });
        }
        
        // Regular work days (Monday-Friday)
        if (date.getDay() >= 1 && date.getDay() <= 5 && !isPast) {
            if (day >= 1 && day <= 14) {
                activities.push({
                    type: 'work',
                    title: 'Foundation Work',
                    description: 'Foundation construction and preparation',
                    status: 'in_progress',
                    time: '8:00 AM - 5:00 PM',
                    contractor: 'Foundation Team'
                });
            } else if (day >= 15 && day <= 27) {
                activities.push({
                    type: 'work',
                    title: 'Framing Work',
                    description: 'Structural framing and wall construction',
                    status: 'in_progress',
                    time: '8:00 AM - 5:00 PM',
                    contractor: 'Framing Team'
                });
            } else if (day >= 28) {
                activities.push({
                    type: 'work',
                    title: 'Roofing Work',
                    description: 'Roof installation and weatherproofing',
                    status: 'in_progress',
                    time: '8:00 AM - 5:00 PM',
                    contractor: 'Roofing Team'
                });
            }
        }
        
        // Weekend activities
        if (date.getDay() === 0 || date.getDay() === 6) {
            if (!isPast) {
                activities.push({
                    type: 'rest',
                    title: 'Weekend - No Work',
                    description: 'Construction site closed for weekend',
                    status: 'scheduled',
                    time: 'All Day',
                    contractor: 'N/A'
                });
            }
        }
        
        return {
            date: date,
            day: day,
            month: month,
            year: year,
            isToday: isToday,
            isPast: isPast,
            activities: activities,
            formattedDate: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
    };

    const handleDayClick = (date: Date) => {
        const dayDetails = getDayDetails(date);
        setSelectedDay(dayDetails);
        setShowDayModal(true);
    };

    return (
        <>
        
            <Helmet><title>DIT Dashboard - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to="/aspirational-builder" 
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Back</span>
                                </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">DIT Dashboard</h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    Do It Together - Your dedicated construction partner
                                </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setShowCallModal(true)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <VideoCameraIcon className="w-5 h-5" />
                                    <span>Schedule Call</span>
                                </button>
                                <button 
                                    onClick={() => setShowMessageModal(true)}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    <span>Message</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Contractor Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-gray-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{contractor.name}</h2>
                                        <p className="text-lg text-gray-600">{contractor.company}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="flex items-center space-x-1">
                                                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium text-gray-700">{contractor.rating}/5</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{contractor.experience}</span>
                                            <span className="text-sm text-gray-500">{contractor.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-600">Licensed & Insured</span>
                                        </div>
                                        <p className="text-sm text-gray-500">License: {contractor.license_number}</p>
                                        <p className="text-sm text-gray-500">Insurance: {contractor.insurance_status}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Specialties</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {contractor.specialties.map((specialty, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{contractor.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{contractor.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Gantt Chart & Calendar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Gantt Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
                                <div className="flex items-center space-x-2">
                                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-gray-500">Gantt Chart</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Timeline Header */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>Task</span>
                                    <div className="flex space-x-8">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                        <span>May</span>
                                        <span>Jun</span>
                                    </div>
                                </div>
                                
                                {/* Timeline Items */}
                                <div className="space-y-3">
                                    {/* Foundation */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Foundation</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute left-0 top-0 h-full w-3/4 bg-green-500 rounded flex items-center justify-center">
                                                <span className="text-xs text-white font-medium">✓</span>
                                            </div>
                                            <div className="absolute right-0 top-0 h-full w-1/4 bg-blue-200 rounded-r"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$45,000</div>
                                    </div>
                                    
                                    {/* Framing */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Framing</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute left-1/4 top-0 h-full w-1/2 bg-blue-500 rounded flex items-center justify-center">
                                                <span className="text-xs text-white font-medium">50%</span>
                                            </div>
                                            <div className="absolute right-0 top-0 h-full w-1/4 bg-gray-200 rounded-r"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$38,000</div>
                                    </div>
                                    
                                    {/* Roofing */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Roofing</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute left-3/4 top-0 h-full w-1/4 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$28,000</div>
                                    </div>
                                    
                                    {/* Electrical */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Electrical</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute left-4/5 top-0 h-full w-1/5 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$15,000</div>
                                    </div>
                                    
                                    {/* Plumbing */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Plumbing</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute left-4/5 top-0 h-full w-1/5 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$12,000</div>
                                    </div>
                                    
                                    {/* Finishing */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-24 text-sm font-medium text-gray-700">Finishing</div>
                                        <div className="flex-1 relative h-6 bg-gray-100 rounded">
                                            <div className="absolute right-0 top-0 h-full w-1/6 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="w-16 text-xs text-gray-500">$25,000</div>
                                    </div>
                                </div>
                                
                                {/* Budget Summary */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-900">Total Budget</span>
                                        <span className="text-lg font-bold text-blue-900">$163,000</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-blue-700">
                                        <span>Spent: $45,000</span>
                                        <span>Remaining: $118,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Project Calendar</h3>
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            
                            {/* Calendar Grid */}
                            <div className="space-y-4">
                                {/* Calendar Header */}
                                <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-500">
                                    <div className="text-center py-2">Sun</div>
                                    <div className="text-center py-2">Mon</div>
                                    <div className="text-center py-2">Tue</div>
                                    <div className="text-center py-2">Wed</div>
                                    <div className="text-center py-2">Thu</div>
                                    <div className="text-center py-2">Fri</div>
                                    <div className="text-center py-2">Sat</div>
                                </div>
                                
                                {/* Calendar Days - Dynamic */}
                                <div className="grid grid-cols-7 gap-1">
                                    {(() => {
                                        const today = new Date();
                                        const currentMonth = today.getMonth();
                                        const currentYear = today.getFullYear();
                                        const firstDay = new Date(currentYear, currentMonth, 1);
                                        const lastDay = new Date(currentYear, currentMonth + 1, 0);
                                        const startDate = new Date(firstDay);
                                        startDate.setDate(startDate.getDate() - firstDay.getDay());
                                        
                                        const days = [];
                                        const currentDate = new Date(startDate);
                                        
                                        // Generate 6 weeks (42 days) to fill the calendar
                                        for (let i = 0; i < 42; i++) {
                                            const isCurrentMonth = currentDate.getMonth() === currentMonth;
                                            const isToday = currentDate.toDateString() === today.toDateString();
                                            const isPast = currentDate < today && !isToday;
                                            
                                            // Project milestones
                                            const day = currentDate.getDate();
                                            const month = currentDate.getMonth();
                                            const year = currentDate.getFullYear();
                                            
                                            let milestone = null;
                                            if (day === 15 && month === currentMonth) {
                                                milestone = { type: 'completed', text: 'Foundation Complete', color: 'bg-green-500' };
                                            } else if (day === 22 && month === currentMonth) {
                                                milestone = { type: 'review', text: 'Framing Review', color: 'bg-blue-500' };
                                            } else if (day === 28 && month === currentMonth) {
                                                milestone = { type: 'upcoming', text: 'Roofing Start', color: 'bg-yellow-500' };
                                            }
                                            
                                            days.push(
                                                <div 
                                                    key={i} 
                                                    onClick={() => handleDayClick(currentDate)}
                                                    className={`h-8 flex items-center justify-center text-sm relative cursor-pointer hover:bg-gray-100 rounded transition-colors ${
                                                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                                    } ${
                                                        isToday ? 'bg-blue-100 rounded-full font-bold' : ''
                                                    } ${
                                                        isPast ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    {day}
                                                    {milestone && (
                                                        <div className={`absolute -top-1 -right-1 w-2 h-2 ${milestone.color} rounded-full`}></div>
                                                    )}
                                                </div>
                                            );
                                            
                                            currentDate.setDate(currentDate.getDate() + 1);
                                        }
                                        
                                        return days;
                                    })()}
                                </div>
                                
                                {/* Important Dates */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-700">Foundation Complete - {new Date().getDate() > 15 ? 'Completed' : `${new Date().toLocaleDateString('en-US', { month: 'short' })} 15`}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-700">Framing Progress Review - {new Date().getDate() > 22 ? 'Completed' : `${new Date().toLocaleDateString('en-US', { month: 'short' })} 22`}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-700">Roofing Start - {new Date().getDate() > 28 ? 'Completed' : `${new Date().toLocaleDateString('en-US', { month: 'short' })} 28`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Milestones</p>
                                    <p className="text-2xl font-bold text-gray-900">{projectStats.total_milestones}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{projectStats.completed_milestones}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">{projectStats.in_progress_milestones}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-gray-900">{projectStats.total_documents}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Phase Navigation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                {[
                                    { id: 'initiation', name: 'Initiation & Feasibility', icon: ClipboardDocumentListIcon, number: '1' },
                                    { id: 'design', name: 'Design & Pre-Construction', icon: HomeIcon, number: '2' },
                                    { id: 'procurement', name: 'Procurement & Bidding', icon: CurrencyDollarIcon, number: '3' },
                                    { id: 'construction', name: 'Construction', icon: WrenchScrewdriverIcon, number: '4' },
                                    { id: 'closeout', name: 'Closeout & Handover', icon: CheckCircleIcon, number: '5' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                                            activeTab === tab.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {tab.number}
                                        </span>
                                        <tab.icon className="w-4 h-4 mr-2" />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        
                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'initiation' && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                                            <span className="font-bold">1</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Project Initiation & Feasibility</h3>
                                            <p className="text-gray-600">Establish project foundation and validate feasibility</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Vision */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                    <EyeIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Project Vision & Goals</h3>
                                            </div>
                        <div className="space-y-4">
                                                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                                                    <p className="text-sm font-medium text-gray-900 mb-1">Purpose</p>
                                                    <p className="text-sm text-gray-700">{projectVision.purpose}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm font-medium text-gray-900 mb-2">Key Objectives</p>
                                                    <ul className="space-y-1">
                                                        {projectVision.objectives.map((obj, i) => (
                                                            <li key={i} className="flex items-start text-sm text-gray-700">
                                                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                                {obj}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="bg-white rounded-lg p-3">
                                                        <p className="text-xs font-medium text-gray-900 mb-1">Stakeholders</p>
                                                        <p className="text-xs text-gray-600">{projectVision.stakeholders.join(', ')}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3">
                                                        <p className="text-xs font-medium text-gray-900 mb-1">Constraints</p>
                                                        <p className="text-xs text-gray-600">{projectVision.constraints.join('; ')}</p>
                                                    </div>
                                                </div>
                                </div>
                            </div>
                            
                                        {/* Feasibility */}
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Feasibility Assessment</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(feasibility).map(([key, val]) => (
                                                    <div key={key} className="bg-white rounded-lg p-4 border border-gray-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="capitalize font-medium text-gray-900">{key}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                val.score >= 80 ? 'bg-green-100 text-green-800' :
                                                                val.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {val.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                                <div
                                                                    className={`h-3 rounded-full transition-all duration-500 ${
                                                                        val.score >= 80 ? 'bg-green-500' :
                                                                        val.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                    style={{ width: `${val.score}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 min-w-[3rem]">{val.score}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Preliminary Budget */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Preliminary Budget</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                                                        <p className="text-xs text-gray-600 mb-1">Hard Costs (68%)</p>
                                                        <p className="font-bold text-lg text-gray-900">${preliminaryBudget.hardCosts.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                                                        <p className="text-xs text-gray-600 mb-1">Soft Costs (11%)</p>
                                                        <p className="font-bold text-lg text-gray-900">${preliminaryBudget.softCosts.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                                                        <p className="text-xs text-gray-600 mb-1">Site Prep (13%)</p>
                                                        <p className="font-bold text-lg text-gray-900">${preliminaryBudget.sitePrep.toLocaleString()}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                                                        <p className="text-xs text-gray-600 mb-1">Contingency (8%)</p>
                                                        <p className="font-bold text-lg text-gray-900">${preliminaryBudget.contingency.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white">
                                                    <p className="text-green-100 text-sm mb-1">Total Project Budget</p>
                                                    <p className="font-bold text-2xl">${preliminaryBudget.total.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Site Analysis */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg border border-indigo-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                                    <HomeIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Site Analysis</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {siteAnalysis.map((item, i) => (
                                                    <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-gray-900 text-sm">{item.item}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                item.status.includes('⚠️') 
                                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600">{item.notes}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Project Delivery Methods */}
                                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-lg border border-gray-200 p-6 lg:col-span-2 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-6">
                                                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                                                    <UserGroupIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Project Delivery Methods</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {deliveryMethods.map((method, i) => (
                                                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                                                        <h4 className="font-bold text-gray-900 mb-3 text-center">{method.method}</h4>
                                                        <div className="space-y-3">
                                                            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                                                                <p className="text-xs font-medium text-green-800 mb-1">Advantages</p>
                                                                <p className="text-sm text-green-700">{method.pros}</p>
                                                            </div>
                                                            <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-500">
                                                                <p className="text-xs font-medium text-red-800 mb-1">Considerations</p>
                                                                <p className="text-sm text-red-700">{method.cons}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'design' && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4">
                                            <span className="font-bold">2</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Design & Pre-Construction</h3>
                                            <p className="text-gray-600">Develop detailed plans and prepare for construction</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Design Team Selection */}
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                                                    <UserGroupIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Design Team</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {designTeam.map((member, i) => (
                                                    <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 hover:border-purple-300 transition-all duration-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-bold text-gray-900">{member.name}</div>
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                                {member.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-purple-600 font-medium mb-1">{member.role}</div>
                                                        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">{member.credentials}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pre-Construction Master Checklist */}
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                    <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900">Pre-Construction Checklist</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {preConstructionChecklist.map((task, i) => (
                                                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            {task.status.includes('⚠️') ? (
                                                                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                                </div>
                                                            ) : (
                                                                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-900">{task.task}</span>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            task.status.includes('⚠️') 
                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Permit Tracker */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5" /> Permit Application Tracker</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="p-2 text-left">Permit</th>
                                                            <th className="p-2 text-left">Status</th>
                                                            <th className="p-2 text-left">Submitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {permits.map((p, i) => (
                                                            <tr key={i} className="border-b">
                                                                <td className="p-2">{p.name}</td>
                                                                <td className="p-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                                        p.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                        p.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {p.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2">{p.submitted}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Detailed Budget */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5" /> Detailed Budget vs Actual</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="p-2 text-left">Category</th>
                                                            <th className="p-2 text-right">Budgeted</th>
                                                            <th className="p-2 text-right">Actual</th>
                                                            <th className="p-2 text-right">Variance</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {detailedBudget.map((item, i) => (
                                                            <tr key={i} className="border-b">
                                                                <td className="p-2">{item.category}</td>
                                                                <td className="p-2 text-right">${item.budgeted.toLocaleString()}</td>
                                                                <td className="p-2 text-right">${item.actual.toLocaleString()}</td>
                                                                <td className={`p-2 text-right font-medium ${item.variance.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {item.variance}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'procurement' && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mr-4">
                                            <span className="font-bold">3</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Procurement & Bidding</h3>
                                            <p className="text-gray-600">Source materials and select contractors</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Bid Comparison */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5" /> Bid Comparison</h3>
                                            <div className="space-y-3">
                                                {bids.map((bid, i) => (
                                                    <div key={i} className="border rounded-lg p-3 hover:bg-gray-50">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold">{bid.contractor}</h4>
                                                                <p className="text-sm text-gray-600">{bid.inclusions}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-lg">${bid.total.toLocaleString()}</div>
                                                                <div className="text-xs text-gray-500">{bid.duration}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Material Procurement */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CubeIcon className="w-5 h-5" /> Material Procurement Tracker</h3>
                                            <div className="space-y-3">
                                                <div className="border rounded-lg p-3">
                                                    <div className="font-bold">Windows</div>
                                                    <div className="text-sm text-gray-600">Ordered - Due Jun 10</div>
                                                    <div className="text-xs text-green-600">✅ Inspected</div>
                                                </div>
                                                <div className="border rounded-lg p-3">
                                                    <div className="font-bold">Tile</div>
                                                    <div className="text-sm text-gray-600">Ordered - Due May 25</div>
                                                    <div className="text-xs text-yellow-600">⏳ Awaiting Delivery</div>
                                                </div>
                                                <div className="border rounded-lg p-3">
                                                    <div className="font-bold">HVAC Units</div>
                                                    <div className="text-sm text-gray-600">Not Ordered</div>
                                                    <div className="text-xs text-red-600">⚠️ Long Lead Time</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Submittal Log */}
                                        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5" /> Submittal Log</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {submittalLog.map((item, i) => (
                                                    <div key={i} className="border rounded-lg p-3">
                                                        <div className="font-bold">{item.item}</div>
                                                        <div className={`text-sm font-medium mt-1 ${
                                                            item.status.includes('✅') ? 'text-green-600' : 
                                                            item.status.includes('⏳') ? 'text-yellow-600' : 'text-gray-600'
                                                        }`}>
                                                            {item.status}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{item.date}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* RFI Log */}
                                        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><DocumentTextIcon className="w-5 h-5" /> RFI (Request for Information) Log</h3>
                                            <div className="space-y-3">
                                                {rfiLog.map((rfi, i) => (
                                                    <div key={i} className="border rounded-lg p-3">
                                                        <div className="font-bold">RFI #{rfi.id}</div>
                                                        <div className="text-sm text-gray-600 mb-2">{rfi.question}</div>
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-sm font-medium ${
                                                                rfi.status === 'Answered' ? 'text-green-600' : 'text-yellow-600'
                                                            }`}>
                                                                {rfi.status}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{rfi.date}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'construction' && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center mr-4">
                                            <span className="font-bold">4</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Construction & Project Management</h3>
                                            <p className="text-gray-600">Execute construction with real-time monitoring</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Gantt Chart */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5" /> Construction Schedule (Gantt)</h3>
                                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                {ganttTasks.map((task, i) => (
                                                    <div key={i} className="flex items-center space-x-3">
                                                        <div className="w-32 text-sm truncate">{task.name}</div>
                                <div className="flex-1">
                                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                                <div
                                                                    className={`h-3 rounded-full ${
                                                                        task.progress === 100 ? 'bg-green-500' :
                                                                        task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                                                    }`}
                                                                    style={{ width: `${task.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 w-20">{task.progress}%</div>
                                                    </div>
                                                ))}
                                </div>
                            </div>
                            
                                        {/* Change Order Management */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><WrenchScrewdriverIcon className="w-5 h-5" /> Change Order Log</h3>
                                            <div className="space-y-3">
                                                {changeOrders.map((co, i) => (
                                                    <div key={i} className="border rounded-lg p-3">
                                                        <div className="font-bold">CO #{co.id}</div>
                                                        <div className="text-sm text-gray-600 mb-2">{co.description}</div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-lg">${co.cost.toLocaleString()}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                co.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {co.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">{co.date}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quality Control Inspections */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Quality Control Inspections</h3>
                                            <div className="space-y-2">
                                                {qualityInspections.map((inspection, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span>{inspection.phase}</span>
                                                        <span className={`font-medium ${
                                                            inspection.status.includes('✅') ? 'text-green-600' :
                                                            inspection.status.includes('📅') ? 'text-blue-600' : 'text-gray-600'
                                                        }`}>
                                                            {inspection.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Site Safety Program */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5" /> Site Safety Program</h3>
                                            <div className="space-y-2">
                                                {safetyProgram.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span>{item.item}</span>
                                                        <span className="text-green-600 font-medium">{item.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Weekly Progress Report */}
                                        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ClockIcon className="w-5 h-5" /> Weekly Progress Report</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Completed This Week:</strong></p>
                                                    <p>{weeklyReport.completed}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Planned Next Week:</strong></p>
                                                    <p>{weeklyReport.planned}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Schedule Status:</strong></p>
                                                    <p className="font-medium text-green-600">{weeklyReport.schedule}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Budget Status:</strong></p>
                                                    <p className="font-medium">{weeklyReport.budget}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Issues/Risks:</strong></p>
                                                    <p className="text-yellow-600">{weeklyReport.issues}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 mb-1"><strong>Decisions Needed:</strong></p>
                                                    <p className="text-red-600">{weeklyReport.decisions}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Management Log */}
                                        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" /> Risk Management Log</h3>
                                            <div className="space-y-3">
                                                {riskLog.map((risk, i) => (
                                                    <div key={i} className="border rounded-lg p-3">
                                                        <div className="font-bold">{risk.risk}</div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                                            <div>
                                                                <span className="text-gray-600">Likelihood:</span> <span className="font-medium">{risk.likelihood}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Impact:</span> <span className="font-medium">{risk.impact}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-gray-600">Mitigation:</span> <span className="text-sm">{risk.mitigation}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'closeout' && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mr-4">
                                            <span className="font-bold">5</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Closeout & Handover</h3>
                                            <p className="text-gray-600">Complete project and transfer to owner</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Punch List */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><WrenchScrewdriverIcon className="w-5 h-5" /> Punch List</h3>
                                            <div className="space-y-2">
                                                {punchListItems.map(item => (
                                                    <div key={item.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.completed}
                                                            onChange={() => togglePunchItem(item.id)}
                                                            className="mt-1"
                                                        />
                                <div className="flex-1">
                                                            <div className="font-medium">{item.location}</div>
                                                            <div className="text-sm text-gray-600">{item.description}</div>
                                                            <div className="text-xs text-gray-500">Responsible: {item.responsible}</div>
                                </div>
                            </div>
                                                ))}
                        </div>
                    </div>

                                        {/* Final Inspection Checklist */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Final Inspection</h3>
                                            <ul className="space-y-2">
                                                {[
                                                    'Plumbing: Test all fixtures, check for leaks',
                                                    'Electrical: Test all outlets, switches, and fixtures',
                                                    'HVAC: Test heating and cooling systems',
                                                    'Appliances: Verify all appliances are installed and operational',
                                                    'Doors & Windows: Check for proper operation and locking',
                                                    'Finishes: Inspect for any final touch-ups needed'
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-center space-x-2">
                                                        <span className="text-green-500">✓</span>
                                                        <span className="text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Project Handover */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><HomeIcon className="w-5 h-5" /> Project Handover</h3>
                                            <ul className="space-y-1">
                                                {handoverItems.map((item, i) => (
                                                    <li key={i} className="flex items-center space-x-2">
                                                        <span className="text-green-500">✓</span>
                                                        <span className="text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Warranty & Maintenance Manual */}
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><BookOpenIcon className="w-5 h-5" /> Warranty & Maintenance Manual</h3>
                                            <div className="space-y-3">
                                                {warrantyManual.map((item, i) => (
                                                    <div key={i} className="border rounded-lg p-3">
                                                        <div className="font-bold">{item.section}</div>
                                                        <div className="text-sm text-gray-600">{item.warranty}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Post-Handover Follow-Up */}
                                        <div className="bg-white rounded-xl shadow p-5 lg:col-span-2">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><PhoneIcon className="w-5 h-5" /> Post-Handover Follow-Up</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {followUpSchedule.map((followUp, i) => (
                                                    <div key={i} className="border rounded-lg p-3 text-center">
                                                        <div className="font-bold text-sm mb-1">{followUp.check}</div>
                                                        <div className="text-xs text-gray-600 mb-2">{followUp.date}</div>
                                                        <div className={`text-xs font-medium ${
                                                            followUp.status.includes('📅') ? 'text-blue-600' : 'text-gray-600'
                                                        }`}>
                                                            {followUp.status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Project Updates */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                        <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsUpdatesExpanded(!isUpdatesExpanded)}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Recent Project Updates</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {projectUpdates.length} updates
                                </span>
                                {isUpdatesExpanded ? (
                                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        
                        {isUpdatesExpanded && (
                            <div className="mt-4 space-y-4">
                                {projectUpdates.map((update) => (
                                    <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <WrenchScrewdriverIcon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{update.title}</h4>
                                                    <p className="text-sm text-gray-600">{update.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{update.date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(update.status)}`}>
                                                {update.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        
                                        {update.images.length > 0 && (
                                            <div className="mt-3">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {update.images.slice(0, 4).map((image, index) => {
                                                        // Determine the correct folder based on the update title
                                                        const getImageFolder = (title: string) => {
                                                            if (title.toLowerCase().includes('foundation')) return 'foundation';
                                                            if (title.toLowerCase().includes('framing')) return 'framing';
                                                            if (title.toLowerCase().includes('delivery') || title.toLowerCase().includes('material')) return 'delivery';
                                                            return 'foundation'; // default fallback
                                                        };
                                                        
                                                        const folder = getImageFolder(update.title);
                                                        const getAltText = (folder: string, index: number) => {
                                                            switch (folder) {
                                                                case 'foundation': return `Foundation work ${index + 1}`;
                                                                case 'framing': return `Framing work ${index + 1}`;
                                                                case 'delivery': return `Material delivery ${index + 1}`;
                                                                default: return `Construction work ${index + 1}`;
                                                            }
                                                        };
                                                        const altText = getAltText(folder, index);
                                                        
                                                        return (
                                                            <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                                                <img 
                                                                    src={`/images/${folder}/${image}`} 
                                                                    alt={altText}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.nextElementSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                                                                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {update.images.length > 4 && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        +{update.images.length - 4} more images
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{update.progress_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${update.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Milestones */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                        <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsMilestonesExpanded(!isMilestonesExpanded)}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {milestones.length} milestones
                                </span>
                                {isMilestonesExpanded ? (
                                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        
                        {isMilestonesExpanded && (
                            <div className="mt-4 space-y-4">
                                {milestones.map((milestone) => (
                                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                                                    <p className="text-sm text-gray-600">{milestone.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Due: {milestone.due_date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                                                {milestone.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        
                                        {milestone.contractor_notes && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                <h5 className="text-sm font-medium text-blue-900 mb-1">Contractor Notes:</h5>
                                                <p className="text-sm text-blue-700">{milestone.contractor_notes}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{milestone.progress_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${milestone.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {milestone.client_approval_required && (
                                            <div className="mt-3 flex items-center space-x-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm text-yellow-700">Client approval required</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                        <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsDocumentsExpanded(!isDocumentsExpanded)}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">Project Documents</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {documents.length} documents
                                </span>
                                {isDocumentsExpanded ? (
                                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        
                        {isDocumentsExpanded && (
                            <div className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {documents.map((document) => (
                                        <div key={document.id} className={`border rounded-lg p-4 ${getDocumentTypeColor(document.type)}`}>
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getDocumentTypeIcon(document.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">{document.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{document.category}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {document.uploaded_by === 'contractor' ? 'By Contractor' : 'By You'} • {document.upload_date}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{document.size}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center space-x-2">
                                                <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1">
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                    <span>Download</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Communication & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowCallModal(true)}
                                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <VideoCameraIcon className="w-5 h-5" />
                                    <span>Schedule Video Call</span>
                                </button>
                                <button 
                                    onClick={() => setShowMessageModal(true)}
                                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    <span>Send Message</span>
                                </button>
                                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                                    <CalendarIcon className="w-5 h-5" />
                                    <span>Schedule Site Visit</span>
                                </button>
                                <button className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    <span>Request Document</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Notices & Alerts</h3>
                                <div className="flex items-center space-x-2">
                                    <BellIcon className="w-5 h-5 text-orange-600" />
                                    <span className="text-sm text-gray-500">3 new notices</span>
                                    </div>
                                </div>
                            
                            <div className="space-y-2">
                                {/* High Priority Notice */}
                                <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <ExclamationCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium text-red-900">Weather Delay Alert</h4>
                                        <p className="text-xs text-red-700 mt-0.5 leading-tight">
                                            Heavy rain forecasted. Framing may be delayed 1-2 days.
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">2h ago</p>
                                    </div>
                                </div>
                                
                                {/* Medium Priority Notice */}
                                <div className="flex items-start space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium text-yellow-900">Material Delivery Update</h4>
                                        <p className="text-xs text-yellow-700 mt-0.5 leading-tight">
                                            Lumber delivery moved from March 20th to 22nd.
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1">4h ago</p>
                                    </div>
                                </div>
                                
                                {/* Low Priority Notice */}
                                <div className="flex items-start space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium text-blue-900">Progress Update</h4>
                                        <p className="text-xs text-blue-700 mt-0.5 leading-tight">
                                            Foundation completed ahead of schedule.
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">1d ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Call Modal */}
            {showCallModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Schedule Call</h2>
                                    <p className="text-gray-600 mt-2">Schedule a call with {contractor.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowCallModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircleIcon className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Date & Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                                        <input
                                            type="date"
                                            value={callDetails.date}
                                            onChange={(e) => setCallDetails({...callDetails, date: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                                        <input
                                            type="time"
                                            value={callDetails.time}
                                            onChange={(e) => setCallDetails({...callDetails, time: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Call Type & Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Call Type</label>
                                        <select
                                            value={callDetails.type}
                                            onChange={(e) => setCallDetails({...callDetails, type: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="video">Video Call</option>
                                            <option value="audio">Audio Call</option>
                                            <option value="phone">Phone Call</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                                        <select
                                            value={callDetails.duration}
                                            onChange={(e) => setCallDetails({...callDetails, duration: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">1 hour</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes (Optional)</label>
                                    <textarea
                                        value={callDetails.notes}
                                        onChange={(e) => setCallDetails({...callDetails, notes: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="What would you like to discuss during the call?"
                                    />
                                </div>

                                {/* Call Summary */}
                                {callDetails.date && callDetails.time && (
                                    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="text-lg font-semibold text-blue-900 mb-2">Call Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-blue-800">Date:</span>
                                                <span className="ml-2 text-blue-700">{new Date(callDetails.date).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-blue-800">Time:</span>
                                                <span className="ml-2 text-blue-700">{callDetails.time}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-blue-800">Type:</span>
                                                <span className="ml-2 text-blue-700 capitalize">{callDetails.type} Call</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-blue-800">Duration:</span>
                                                <span className="ml-2 text-blue-700">{callDetails.duration} minutes</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowCallModal(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert('Call scheduled successfully! You will receive a confirmation email shortly.');
                                            setShowCallModal(false);
                                            setCallDetails({
                                                date: '',
                                                time: '',
                                                duration: '30',
                                                type: 'video',
                                                notes: ''
                                            });
                                        }}
                                        disabled={!callDetails.date || !callDetails.time}
                                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                                            !callDetails.date || !callDetails.time
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        Schedule Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Send Message</h2>
                                    <p className="text-gray-600 mt-2">Send a message to {contractor.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowMessageModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircleIcon className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={messageDetails.subject}
                                        onChange={(e) => setMessageDetails({...messageDetails, subject: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter message subject"
                                    />
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        value={messageDetails.priority}
                                        onChange={(e) => setMessageDetails({...messageDetails, priority: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        value={messageDetails.message}
                                        onChange={(e) => setMessageDetails({...messageDetails, message: e.target.value})}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Type your message here..."
                                    />
                                </div>

                                {/* Message Preview */}
                                {messageDetails.subject && messageDetails.message && (
                                    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                                        <h4 className="text-lg font-semibold text-green-900 mb-2">Message Preview</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-medium text-green-800">To:</span>
                                                <span className="ml-2 text-green-700">{contractor.name} ({contractor.email})</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-green-800">Subject:</span>
                                                <span className="ml-2 text-green-700">{messageDetails.subject}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-green-800">Priority:</span>
                                                <span className="ml-2 text-green-700 capitalize">{messageDetails.priority}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowMessageModal(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert('Message sent successfully! You will receive a confirmation email shortly.');
                                            setShowMessageModal(false);
                                            setMessageDetails({
                                                subject: '',
                                                message: '',
                                                priority: 'normal'
                                            });
                                        }}
                                        disabled={!messageDetails.subject || !messageDetails.message}
                                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                                            !messageDetails.subject || !messageDetails.message
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Day Details Modal */}
            {showDayModal && selectedDay && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{selectedDay.formattedDate}</h2>
                                    <p className="text-gray-600 mt-2">
                                        {selectedDay.isToday ? 'Today' : selectedDay.isPast ? 'Past Date' : 'Upcoming Date'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDayModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircleIcon className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Activities */}
                            <div className="space-y-6">
                                {selectedDay.activities.length > 0 ? (
                                    selectedDay.activities.map((activity, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                    activity.type === 'milestone' ? 'bg-green-100' :
                                                    activity.type === 'review' ? 'bg-blue-100' :
                                                    activity.type === 'work' ? 'bg-orange-100' :
                                                    'bg-gray-100'
                                                }`}>
                                                    {activity.type === 'milestone' ? (
                                                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                                    ) : activity.type === 'review' ? (
                                                        <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                                                    ) : activity.type === 'work' ? (
                                                        <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600" />
                                                    ) : (
                                                        <ClockIcon className="w-6 h-6 text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                                                    <p className="text-gray-600 mt-1">{activity.description}</p>
                                                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <ClockIcon className="w-4 h-4" />
                                                            <span>{activity.time}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <UserGroupIcon className="w-4 h-4" />
                                                            <span>{activity.contractor}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            activity.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {activity.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Scheduled</h3>
                                        <p className="text-gray-500">
                                            {selectedDay.isPast 
                                                ? 'No activities were scheduled for this day.' 
                                                : 'No activities are scheduled for this day.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end mt-8">
                                <button
                                    onClick={() => setShowDayModal(false)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        
        </>
    );
}

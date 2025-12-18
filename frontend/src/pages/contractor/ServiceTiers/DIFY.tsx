import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  StarIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CogIcon,
  PhotoIcon,
  BellIcon,
  EyeIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CubeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface DIFYProps {
  tier?: any;
  title?: string;
  description?: string;
  features?: any;
  pricing?: any;
  concierge_services?: any;
}

export default function DIFY({ title = "DIFY Dashboard", description = "Visual Project Management & Updates" }: DIFYProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUpdateDetails, setSelectedUpdateDetails] = useState(null);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);

  // Mock data based on DIT page but presented graphically
  const projectOverview = {
    name: "Modern Family Home - Smith Residence",
    status: "In Progress",
    completion: 65,
    startDate: "March 1, 2025",
    expectedCompletion: "August 15, 2025",
    budget: 475000,
    spent: 285000,
    phase: "Construction & Project Management"
  };

  const phaseProgress = [
    { name: 'Initiation & Feasibility', progress: 100, color: 'bg-green-500', status: 'Complete' },
    { name: 'Design & Pre-Construction', progress: 100, color: 'bg-green-500', status: 'Complete' },
    { name: 'Procurement & Bidding', progress: 100, color: 'bg-green-500', status: 'Complete' },
    { name: 'Construction', progress: 60, color: 'bg-blue-500', status: 'In Progress' },
    { name: 'Closeout & Handover', progress: 0, color: 'bg-gray-300', status: 'Pending' }
  ];

  const budgetBreakdown = [
    { category: 'Hard Costs', budgeted: 325000, spent: 195000, percentage: 68 },
    { category: 'Soft Costs', budgeted: 50000, spent: 35000, percentage: 11 },
    { category: 'Site Prep', budgeted: 60000, spent: 55000, percentage: 13 },
    { category: 'Contingency', budgeted: 40000, spent: 0, percentage: 8 }
  ];

  const constructionTeam = {
    company: {
      name: "Elite Construction Partners",
      logo: "/images/company-logo.png",
      contact: "+263 4 123-4567",
      email: "info@elitecp.com",
      address: "123 Builder St, Construction City, CC 12345"
    },
    projectManager: {
      name: "Sarah Johnson",
      role: "Senior Project Manager",
      phone: "+263 77 123-4501",
      email: "sarah.j@elitecp.com",
      avatar: "/images/team/sarah.jpg",
      experience: "12 years"
    },
    teamMembers: [
      { name: "Mike Rodriguez", role: "Site Supervisor", section: "Overall Site Management", phone: "+263 77 123-4502", status: "On Site" },
      { name: "David Chen", role: "Electrical Foreman", section: "Electrical Systems", phone: "+263 77 123-4503", status: "On Site" },
      { name: "Lisa Thompson", role: "Plumbing Supervisor", section: "Plumbing & HVAC", phone: "+263 77 123-4504", status: "On Site" },
      { name: "James Wilson", role: "Framing Lead", section: "Structural Framing", phone: "+263 77 123-4505", status: "Complete" },
      { name: "Maria Garcia", role: "Finishing Specialist", section: "Interior Finishes", phone: "+263 77 123-4506", status: "Scheduled" }
    ]
  };

  const clientUpdates = [
    {
      id: 1,
      date: "2025-10-28",
      time: "2:30 PM",
      type: "progress",
      title: "Framing 60% Complete",
      description: "Main structure framing is progressing well. All load-bearing walls are in place.",
      images: ["/images/progress/framing-1.jpg", "/images/progress/framing-2.jpg"],
      responsible: "Mike Rodriguez"
    },
    {
      id: 2,
      date: "2025-10-27",
      time: "10:15 AM",
      type: "milestone",
      title: "Foundation Inspection Passed",
      description: "City inspector approved the foundation work. Ready to proceed with framing.",
      images: ["/images/progress/foundation-complete.jpg"],
      responsible: "Sarah Johnson"
    },
    {
      id: 3,
      date: "2025-10-25",
      time: "4:45 PM",
      type: "delivery",
      title: "Windows Delivered",
      description: "All windows have been delivered and are stored securely on site.",
      images: ["/images/progress/windows-delivery.jpg"],
      responsible: "David Chen"
    },
    {
      id: 4,
      date: "2025-10-24",
      time: "9:00 AM",
      type: "issue",
      title: "Weather Delay - 1 Day",
      description: "Heavy rain caused a 1-day delay. Work will resume tomorrow morning.",
      images: [],
      responsible: "Mike Rodriguez"
    }
  ];

  const upcomingTasks = [
    { task: "Complete Framing", date: "Nov 5, 2025", responsible: "Mike Rodriguez", priority: "High" },
    { task: "Begin Roofing", date: "Nov 8, 2025", responsible: "James Wilson", priority: "High" },
    { task: "MEP Rough-in", date: "Nov 12, 2025", responsible: "David Chen", priority: "Medium" },
    { task: "Insulation Install", date: "Nov 20, 2025", responsible: "Lisa Thompson", priority: "Medium" }
  ];

  const bimViews = [
    { name: "Exterior Front", image: "/images/bim/exterior-front.jpg", description: "Main entrance and facade" },
    { name: "Exterior Back", image: "/images/bim/exterior-back.jpg", description: "Backyard and patio area" },
    { name: "Living Room", image: "/images/bim/living-room.jpg", description: "Open concept living space" },
    { name: "Kitchen", image: "/images/bim/kitchen.jpg", description: "Modern kitchen with island" },
    { name: "Master Bedroom", image: "/images/bim/master-bedroom.jpg", description: "Master suite with walk-in closet" },
    { name: "Floor Plan", image: "/images/bim/floor-plan.jpg", description: "Complete floor layout" }
  ];

  // Project Stage Content - Detailed data from DIT Dashboard
  const stageContent = {
    initiation: {
      title: "Initiation & Feasibility",
      description: "Establish project foundation and validate feasibility",
      projectVision: {
        purpose: "Create a modern, energy-efficient family home",
        objectives: [
          "Complete within a $500,000 budget",
          "Achieve LEED Silver certification",
          "Move-in ready by Q3 2026"
        ],
        stakeholders: ["John Smith (Owner)", "Sarah Lee (Architect)", "DIT Construction"],
        constraints: ["Budget cap: $500k", "Must preserve existing oak tree on site"]
      },
      feasibility: {
        technical: { score: 90, status: 'Feasible' },
        financial: { score: 75, status: 'Viable' },
        legal: { score: 100, status: 'Approved' },
        market: { score: 85, status: 'Strong Demand' },
        risk: { score: 60, status: 'Moderate Risk' }
      },
      preliminaryBudget: {
        hardCosts: 325000,
        softCosts: 50000,
        sitePrep: 60000,
        contingency: 40000,
        total: 475000
      },
      siteAnalysis: [
        { item: 'Topography & Soil Stability', status: '✅ Completed', notes: 'Geotechnical report approved' },
        { item: 'Utilities Assessment', status: '✅ Completed', notes: 'All utilities accessible' },
        { item: 'Zoning Compliance', status: '✅ Verified', notes: 'R-2 zoning confirmed' },
        { item: 'Environmental Factors', status: '⚠️ In Progress', notes: 'Tree preservation plan pending' },
        { item: 'Site Accessibility', status: '✅ Confirmed', notes: 'Adequate road access' }
      ],
      deliveryMethods: [
        { method: 'Design-Bid-Build (DBB)', pros: 'Competitive pricing', cons: 'Slower delivery, design-construction separation' },
        { method: 'Design-Build (DB)', pros: 'Faster, single accountability', cons: 'Less upfront price competition' },
        { method: 'CM at Risk (CMAR)', pros: 'Early cost input, GMP guarantee', cons: 'Multiple contracts to manage' }
      ]
    },
    design: {
      title: "Design & Pre-Construction",
      description: "Develop detailed plans and prepare for construction",
      designTeam: [
        { name: 'Sarah Lee', role: 'Architect', status: '✅ Hired', credentials: 'Licensed, 10+ years experience' },
        { name: 'Mike Chen', role: 'Structural Engineer', status: '✅ Hired', credentials: 'PE Licensed, LEED AP' },
        { name: 'Lisa Rodriguez', role: 'MEP Engineer', status: '✅ Hired', credentials: 'Professional Engineer' }
      ],
      preConstructionChecklist: [
        { task: 'Finalize design plans', status: '✅ Complete' },
        { task: 'Submit permits', status: '✅ Complete' },
        { task: 'Secure funding', status: '✅ Complete' },
        { task: 'Final site survey', status: '✅ Complete' },
        { task: 'Develop project schedule', status: '✅ Complete' },
        { task: 'Finalize material list', status: '⚠️ In Progress' },
        { task: 'Plan site logistics', status: '✅ Complete' }
      ],
      permits: [
        { name: 'Building Permit', authority: 'City Building Dept.', submitted: '2025-01-15', status: 'Approved', approved: '2025-02-01' },
        { name: 'Electrical Permit', authority: 'City Electrical Board', submitted: '2025-02-10', status: 'In Review', approved: null }
      ],
      detailedBudget: [
        { category: 'Concrete', budgeted: 45000, actual: 42000, variance: '+$3,000' },
        { category: 'Framing', budgeted: 85000, actual: 92000, variance: '-$7,000' },
        { category: 'Roofing', budgeted: 28000, actual: 0, variance: '$0' },
        { category: 'MEP', budgeted: 65000, actual: 15000, variance: '+$50,000' },
        { category: 'Finishes', budgeted: 120000, actual: 0, variance: '$0' }
      ]
    },
    procurement: {
      title: "Procurement & Bidding",
      description: "Source materials and select contractors",
      bids: [
        { contractor: 'Smith Construction', total: 485000, duration: '6 months', inclusions: 'Full warranty, LEED support' },
        { contractor: 'BuildRight Co.', total: 462000, duration: '7 months', inclusions: 'Basic warranty' },
        { contractor: 'Elite Builders', total: 510000, duration: '5.5 months', inclusions: 'Premium finishes, 2-year warranty' }
      ],
      submittalLog: [
        { item: 'Tile samples', status: '✅ Approved', date: '2025-03-15' },
        { item: 'Window specifications', status: '✅ Approved', date: '2025-03-20' },
        { item: 'Paint colors', status: '⏳ Pending', date: '2025-04-10' }
      ],
      rfiLog: [
        { id: 1, question: 'Clarify window placement on east wall', status: 'Answered', date: '2025-03-10' },
        { id: 2, question: 'Confirm HVAC duct routing in basement', status: 'Pending', date: '2025-04-05' }
      ]
    },
    construction: {
      title: "Construction & Project Management",
      description: "Execute construction with real-time monitoring",
      ganttTasks: [
        { name: 'Site Prep', start: 'Mar 1', end: 'Mar 15', progress: 100 },
        { name: 'Foundation', start: 'Mar 16', end: 'Apr 10', progress: 100 },
        { name: 'Framing', start: 'Apr 11', end: 'May 20', progress: 60 },
        { name: 'Roofing', start: 'May 15', end: 'Jun 5', progress: 0 },
        { name: 'MEP Rough-in', start: 'May 25', end: 'Jun 20', progress: 0 },
        { name: 'Insulation & Drywall', start: 'Jun 10', end: 'Jul 10', progress: 0 },
        { name: 'Finishes', start: 'Jul 1', end: 'Aug 15', progress: 0 }
      ],
      qualityInspections: [
        { phase: 'Foundation', status: '✅ Passed', date: '2025-03-20' },
        { phase: 'Framing', status: '✅ Passed', date: '2025-04-25' },
        { phase: 'MEP Rough-in', status: '📅 Scheduled', date: '2025-05-28' },
        { phase: 'Insulation & Drywall', status: '⏳ Pending', date: '2025-06-15' },
        { phase: 'Finishes', status: '⏳ Pending', date: '2025-07-20' }
      ],
      safetyProgram: [
        { item: 'Safety Manual', status: '✅ Implemented' },
        { item: 'Toolbox Talks', status: '✅ Weekly (12 completed)' },
        { item: 'Hazard Assessment', status: '✅ Site-specific completed' },
        { item: 'PPE Compliance', status: '✅ 100% adherence' },
        { item: 'Incident Reporting', status: '✅ Zero incidents' }
      ],
      changeOrders: [
        { id: 1, description: 'Upgrade kitchen countertops to quartz', cost: 3500, status: 'Approved', date: '2025-04-10' },
        { id: 2, description: 'Add extra electrical outlet in garage', cost: 450, status: 'Pending', date: '2025-04-15' }
      ],
      weeklyReport: {
        completed: 'Foundation poured, framing 60% complete',
        planned: 'Complete framing, begin roofing prep',
        schedule: 'On track',
        budget: 'Within 2% of budget',
        issues: 'Minor weather delay (1 day)',
        decisions: 'Kitchen cabinet selection needed'
      },
      riskLog: [
        { risk: 'Weather delays', likelihood: 'Medium', impact: 'High', mitigation: 'Buffer days in schedule' },
        { risk: 'Material cost increases', likelihood: 'Low', impact: 'Medium', mitigation: 'Fixed-price contracts' },
        { risk: 'Labor shortage', likelihood: 'Medium', impact: 'Medium', mitigation: 'Backup subcontractors identified' }
      ]
    },
    closeout: {
      title: "Closeout & Handover",
      description: "Final inspections, client walkthrough, and project handover",
      handoverItems: [
        'Keys & Access Codes',
        'Certificate of Occupancy',
        'As-Built Drawings',
        'Warranty Documents',
        'O&M Manuals',
        'Subcontractor Contact List',
        'Final Lien Waivers'
      ],
      punchListItems: [
        { id: 1, location: 'Kitchen', description: 'Cabinet door misaligned', responsible: 'Carpenter', completed: false },
        { id: 2, location: 'Master Bath', description: 'Grout cracking near shower', responsible: 'Tile Contractor', completed: true },
        { id: 3, location: 'Living Room', description: 'Touch-up paint needed on baseboard', responsible: 'Painter', completed: false }
      ],
      warrantyManual: [
        { section: 'HVAC System', warranty: '5 years parts, 2 years labor' },
        { section: 'Roofing', warranty: '25 years materials' },
        { section: 'Appliances', warranty: '1 year manufacturer' },
        { section: 'Workmanship', warranty: '1 year comprehensive' }
      ],
      followUpSchedule: [
        { check: '30-Day Follow-up', date: '2025-09-15', status: '📅 Scheduled' },
        { check: '6-Month Follow-up', date: '2026-02-15', status: '⏳ Pending' },
        { check: '11-Month Warranty Check', date: '2026-07-15', status: '⏳ Pending' }
      ]
    }
  };

  // Detailed Updates Data for Modal
  const detailedUpdates = {
    framing: {
      id: 'framing',
      title: 'Framing 60% Complete',
      type: 'progress',
      date: 'October 28, 2025',
      time: '2:30 PM',
      status: 'In Progress',
      completion: 60,
      description: 'Structural framing work is progressing well. The main floor framing is complete, and we have started on the second floor. All load-bearing walls are in place and inspected.',
      details: [
        'Main floor framing: 100% complete',
        'Second floor framing: 40% complete',
        'Roof trusses: Scheduled for next week',
        'Load-bearing wall inspection: Passed'
      ],
      responsible: 'Mike Rodriguez - Lead Framer',
      nextSteps: 'Complete second floor framing by November 2nd, then install roof trusses.',
      images: ['/images/updates/framing.jpg', '/images/updates/structure.jpg'],
      impact: 'On schedule - no delays expected'
    },
    foundation: {
      id: 'foundation',
      title: 'Foundation Inspection Passed',
      type: 'milestone',
      date: 'October 27, 2025',
      time: '10:15 AM',
      status: 'Complete',
      completion: 100,
      description: 'Foundation inspection completed successfully with no issues found. All concrete work meets building code requirements and structural specifications.',
      details: [
        'Concrete strength test: Passed (4,000 PSI)',
        'Rebar placement: Approved',
        'Waterproofing membrane: Installed and inspected',
        'Drainage system: Functional and tested'
      ],
      responsible: 'City Building Inspector - John Smith',
      nextSteps: 'Foundation work is complete. Ready to proceed with framing.',
      images: ['/images/updates/foundation.jpeg'],
      impact: 'Project ahead of schedule by 2 days'
    },
    windows: {
      id: 'windows',
      title: 'Windows Delivered',
      type: 'delivery',
      date: 'October 25, 2025',
      time: '4:45 PM',
      status: 'Complete',
      completion: 100,
      description: 'All windows and doors have been delivered to the job site. Quality inspection completed - all units match specifications and are in excellent condition.',
      details: [
        'Total units delivered: 24 windows, 3 doors',
        'Quality inspection: All units approved',
        'Storage: Secured in weather-protected area',
        'Installation: Scheduled for November 5-8'
      ],
      responsible: 'Premium Windows & Doors Co.',
      nextSteps: 'Windows will be installed once framing is complete.',
      images: ['/images/updates/windows.jpeg'],
      impact: 'Delivery on time - installation can proceed as planned'
    }
  };

  // Handle update click to show modal
  const handleUpdateClick = (updateId: keyof typeof detailedUpdates) => {
    setSelectedUpdateDetails(detailedUpdates[updateId]);
    setShowUpdateModal(true);
  };

  // Advanced Analytics Data
  const affinityDiagram = {
    categories: [
      {
        name: "Foundation Issues",
        items: ["Soil testing", "Drainage problems", "Foundation cracks", "Settlement issues"],
        color: "bg-red-100 border-red-300"
      },
      {
        name: "Material Delays",
        items: ["Supplier issues", "Weather delays", "Transportation problems", "Quality control"],
        color: "bg-yellow-100 border-yellow-300"
      },
      {
        name: "Labor Challenges",
        items: ["Skill shortages", "Scheduling conflicts", "Safety concerns", "Training needs"],
        color: "bg-blue-100 border-blue-300"
      },
      {
        name: "Communication",
        items: ["Client updates", "Team coordination", "Permit approvals", "Inspection scheduling"],
        color: "bg-green-100 border-green-300"
      }
    ]
  };

  const ganttData = [
    { task: "Site Preparation", start: 1, duration: 10, progress: 100, color: "bg-green-500" },
    { task: "Foundation Work", start: 8, duration: 15, progress: 100, color: "bg-green-500" },
    { task: "Framing", start: 20, duration: 20, progress: 60, color: "bg-blue-500" },
    { task: "Roofing", start: 35, duration: 10, progress: 0, color: "bg-gray-300" },
    { task: "MEP Rough-in", start: 40, duration: 15, progress: 0, color: "bg-gray-300" },
    { task: "Insulation & Drywall", start: 50, duration: 12, progress: 0, color: "bg-gray-300" },
    { task: "Interior Finishes", start: 58, duration: 18, progress: 0, color: "bg-gray-300" },
    { task: "Final Inspections", start: 72, duration: 5, progress: 0, color: "bg-gray-300" }
  ];

  const burndownData = [
    { week: "Week 1", planned: 100, actual: 100 },
    { week: "Week 2", planned: 90, actual: 92 },
    { week: "Week 3", planned: 80, actual: 85 },
    { week: "Week 4", planned: 70, actual: 75 },
    { week: "Week 5", planned: 60, actual: 68 },
    { week: "Week 6", planned: 50, actual: 58 },
    { week: "Week 7", planned: 40, actual: 45 },
    { week: "Week 8", planned: 30, actual: 35 },
    { week: "Week 9", planned: 20, actual: 25 },
    { week: "Week 10", planned: 10, actual: 15 },
    { week: "Week 11", planned: 0, actual: 5 }
  ];

  const causeEffectData = {
    problem: "Project Delay",
    categories: [
      {
        name: "Materials",
        causes: ["Late delivery", "Quality issues", "Wrong specifications", "Supplier problems"]
      },
      {
        name: "Methods",
        causes: ["Poor planning", "Inadequate procedures", "Lack of standards", "Communication gaps"]
      },
      {
        name: "Manpower",
        causes: ["Skill shortage", "Absenteeism", "Inadequate training", "Low motivation"]
      },
      {
        name: "Machines",
        causes: ["Equipment failure", "Maintenance issues", "Outdated tools", "Capacity constraints"]
      },
      {
        name: "Environment",
        causes: ["Weather conditions", "Site constraints", "Regulatory changes", "Safety concerns"]
      },
      {
        name: "Measurement",
        causes: ["Inaccurate estimates", "Poor monitoring", "Lack of metrics", "Data quality issues"]
      }
    ]
  };

  const cfdData = [
    { stage: "To Do", count: 12, color: "bg-gray-400" },
    { stage: "In Progress", count: 8, color: "bg-blue-500" },
    { stage: "Review", count: 3, color: "bg-yellow-500" },
    { stage: "Done", count: 25, color: "bg-green-500" }
  ];

  return (

    <>
      <Helmet><title>{title} - The Central Hub</title></Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link to="/contractor-suite" className="flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to Suite
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600">{description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-purple-600">
                  <SparklesIcon className="w-5 h-5 mr-1" />
                  <span className="font-medium">Premium Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Project Overview Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-2">{projectOverview.name}</h2>
                <p className="text-purple-100 mb-4">Started: {projectOverview.startDate} • Expected: {projectOverview.expectedCompletion}</p>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <span className="text-sm">Current Phase</span>
                    <p className="font-semibold">{projectOverview.phase}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <span className="text-sm">Status</span>
                    <p className="font-semibold">{projectOverview.status}</p>
                  </div>
                </div>

                {/* Quick Updates */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-purple-100 mb-3">Recent Updates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                      onClick={() => handleUpdateClick('framing')}
                      className="bg-white bg-opacity-15 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-opacity-25 transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm font-medium">Framing 60% Complete</span>
                    </div>
                    <div
                      onClick={() => handleUpdateClick('foundation')}
                      className="bg-white bg-opacity-15 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-opacity-25 transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">Foundation Inspection Passed</span>
                    </div>
                    <div
                      onClick={() => handleUpdateClick('windows')}
                      className="bg-white bg-opacity-15 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-opacity-25 transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium">Windows Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white bg-opacity-20 rounded-full mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{projectOverview.completion}%</div>
                    <div className="text-sm">Complete</div>
                  </div>
                </div>
                <p className="text-purple-100">Overall Progress</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Project Overview', icon: ChartBarIcon },
                  { id: 'initiation', name: 'Initiation & Feasibility', icon: ClipboardDocumentListIcon },
                  { id: 'design', name: 'Design & Pre-Construction', icon: HomeIcon },
                  { id: 'procurement', name: 'Procurement & Bidding', icon: CurrencyDollarIcon },
                  { id: 'construction', name: 'Construction', icon: WrenchScrewdriverIcon },
                  { id: 'closeout', name: 'Closeout & Handover', icon: CheckCircleIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Phase Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Phases Progress</h3>
                <div className="space-y-4">
                  {phaseProgress.map((phase, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{phase.name}</span>
                          <span className="text-sm text-gray-600">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${phase.color} transition-all duration-500`}
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${phase.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        phase.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {phase.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Budget Overview</h3>
                  <div className="space-y-4">
                    {budgetBreakdown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{item.category}</span>
                          <span className="text-sm text-gray-600">
                            ${item.spent.toLocaleString()} / ${item.budgeted.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(item.spent / item.budgeted) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Spent</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ${projectOverview.spent.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      of ${projectOverview.budget.toLocaleString()} budget ({Math.round((projectOverview.spent / projectOverview.budget) * 100)}%)
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Tasks</h3>
                  <div className="space-y-4">
                    {upcomingTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{task.task}</div>
                          <div className="text-sm text-gray-600">{task.responsible}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{task.date}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Analytics - Collapsible */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <button
                  onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CogIcon className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Advanced Analytics</h3>
                  </div>
                  {isAnalyticsExpanded ? (
                    <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {isAnalyticsExpanded && (
                  <div className="border-t border-gray-200 p-6 space-y-8">
                    {/* Affinity Diagram */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Affinity Diagram - Issue Categorization</h4>
                      <p className="text-gray-600 mb-6">Grouped project issues and challenges by category for better analysis</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {affinityDiagram.categories.map((category, index) => (
                          <div key={index} className={`${category.color} rounded-lg p-4 border-2`}>
                            <h5 className="font-bold text-gray-900 mb-3 text-center text-sm">{category.name}</h5>
                            <div className="space-y-2">
                              {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="bg-white rounded-lg p-2 text-xs text-gray-700 shadow-sm">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gantt Chart */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Gantt Chart - Project Timeline</h4>
                      <p className="text-gray-600 mb-6">Visual timeline showing task dependencies and progress</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          {/* Timeline Header */}
                          <div className="flex mb-4">
                            <div className="w-40 text-sm font-medium text-gray-700">Tasks</div>
                            <div className="flex-1 grid grid-cols-20 gap-1 text-xs text-gray-500">
                              {Array.from({ length: 20 }, (_, i) => (
                                <div key={i} className="text-center">W{i + 1}</div>
                              ))}
                            </div>
                          </div>
                          {/* Gantt Bars */}
                          <div className="space-y-2">
                            {ganttData.map((task, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-40 text-sm font-medium text-gray-900 pr-4">{task.task}</div>
                                <div className="flex-1 grid grid-cols-20 gap-1 h-6">
                                  {Array.from({ length: 20 }, (_, i) => {
                                    const isInRange = i >= task.start - 1 && i < task.start + task.duration - 1;
                                    const progressWidth = Math.min(task.progress, 100);
                                    const isProgress = isInRange && ((i - task.start + 1) / task.duration) * 100 <= progressWidth;

                                    return (
                                      <div key={i} className="relative">
                                        {isInRange && (
                                          <div className={`h-4 rounded ${isProgress ? task.color : 'bg-gray-200'} border border-gray-300`}></div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Burndown/Burnup Chart and CFD */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Burndown Chart</h4>
                        <p className="text-gray-600 mb-4">Remaining work vs. time</p>
                        <div className="space-y-3">
                          {burndownData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 w-16">{data?.week}</span>
                              <div className="flex-1 mx-3">
                                <div className="flex space-x-2">
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">Planned</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${data?.planned}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">Actual</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${data?.actual}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right w-12">
                                <div className="text-xs text-blue-600">{data?.planned}%</div>
                                <div className="text-xs text-red-600">{data?.actual}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cumulative Flow Diagram */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Cumulative Flow Diagram</h4>
                        <p className="text-gray-600 mb-4">Work items by stage</p>
                        <div className="space-y-3">
                          {cfdData.map((stage, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded ${stage.color}`}></div>
                                <span className="font-medium text-gray-900 text-sm">{stage.stage}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${stage.color} transition-all duration-500`}
                                    style={{ width: `${(stage.count / 48) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 w-6">{stage.count}</span>
                              </div>
                            </div>
                          ))}
                          <div className="pt-3 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900 text-sm">Total Items</span>
                              <span className="text-lg font-bold text-purple-600">
                                {cfdData.reduce((sum, stage) => sum + stage.count, 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cause-and-Effect Diagram (Fishbone) */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Cause-and-Effect Diagram (Fishbone)</h4>
                      <p className="text-gray-600 mb-6">Root cause analysis for: <strong>{causeEffectData.problem}</strong></p>

                      <div className="relative bg-white rounded-xl p-6 min-h-80 border border-gray-200">
                        {/* Main Problem (Fish Head) */}
                        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3 text-center">
                            <div className="font-bold text-red-800 text-sm">{causeEffectData.problem}</div>
                          </div>
                        </div>

                        {/* Main Spine */}
                        <div className="absolute top-1/2 left-6 right-28 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>

                        {/* Categories and Causes */}
                        <div className="grid grid-cols-2 gap-6 h-full">
                          {/* Top Categories */}
                          <div className="space-y-6">
                            {causeEffectData.categories.slice(0, 3).map((category, index) => (
                              <div key={index} className="relative">
                                <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 text-center">
                                  <div className="font-semibold text-blue-800 text-sm">{category.name}</div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  {category.causes.map((cause, causeIndex) => (
                                    <div key={causeIndex} className="bg-gray-100 rounded p-2 text-xs text-gray-700">
                                      {cause}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Bottom Categories */}
                          <div className="space-y-6">
                            {causeEffectData.categories.slice(3).map((category, index) => (
                              <div key={index} className="relative">
                                <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                                  <div className="font-semibold text-green-800 text-sm">{category.name}</div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  {category.causes.map((cause, causeIndex) => (
                                    <div key={causeIndex} className="bg-gray-100 rounded p-2 text-xs text-gray-700">
                                      {cause}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* House Overview */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">House Overview - 3D Visualization</h3>
                <p className="text-gray-600 mb-8">
                  Explore your future home with our 3D visualization. See exactly how your house will look when completed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bimViews.map((view, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                      <div className="aspect-video relative overflow-hidden">
                        {/* Real BIM Preview Images */}
                        {view.name === "Exterior Front" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/frontelevation.jpg"
                              alt="Front Elevation"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              3D Model
                            </div>
                            <div className="absolute top-2 left-2 bg-blue-500 text-white rounded px-2 py-1 text-xs font-medium">
                              Front Elevation
                            </div>
                          </div>
                        )}
                        {view.name === "Exterior Back" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/backelevation.jpg"
                              alt="Back Elevation"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              3D Model
                            </div>
                            <div className="absolute top-2 left-2 bg-green-500 text-white rounded px-2 py-1 text-xs font-medium">
                              Back Elevation
                            </div>
                          </div>
                        )}
                        {view.name === "Living Room" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/livingspac.jpg"
                              alt="Living Space"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              Interior
                            </div>
                            <div className="absolute top-2 left-2 bg-orange-500 text-white rounded px-2 py-1 text-xs font-medium">
                              Living Space
                            </div>
                          </div>
                        )}
                        {view.name === "Kitchen" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/kitchendesign.jpg"
                              alt="Kitchen Design"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              Interior
                            </div>
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded px-2 py-1 text-xs font-medium">
                              Kitchen Design
                            </div>
                          </div>
                        )}
                        {view.name === "Master Bedroom" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/mastersuite.jpg"
                              alt="Master Suite"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              Interior
                            </div>
                            <div className="absolute top-2 left-2 bg-purple-500 text-white rounded px-2 py-1 text-xs font-medium">
                              Master Suite
                            </div>
                          </div>
                        )}
                        {view.name === "Floor Plan" && (
                          <div className="relative w-full h-full">
                            <img
                              src="/images/preview/floorplan.jpg"
                              alt="Floor Plan"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded px-2 py-1 text-xs">
                              Blueprint
                            </div>
                            <div className="absolute top-2 left-2 bg-gray-600 text-white rounded px-2 py-1 text-xs font-medium">
                              Floor Plan
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <EyeIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-1">{view.name}</h4>
                        <p className="text-sm text-gray-600">{view.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Features */}
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Interactive Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">360° Views</div>
                        <div className="text-sm text-gray-600">Explore every angle</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <CogIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Material Options</div>
                        <div className="text-sm text-gray-600">See different finishes</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Progress Overlay</div>
                        <div className="text-sm text-gray-600">Track construction progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'initiation' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stageContent.initiation.title}</h3>
                    <p className="text-gray-600">{stageContent.initiation.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Vision & Goals */}
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
                        <p className="text-sm text-gray-700">{stageContent.initiation.projectVision.purpose}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Key Objectives</p>
                        <ul className="space-y-1">
                          {stageContent.initiation.projectVision.objectives.map((obj, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-center">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Key Stakeholders</p>
                        <div className="flex flex-wrap gap-2">
                          {stageContent.initiation.projectVision.stakeholders.map((stakeholder, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {stakeholder}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feasibility Assessment */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Feasibility Assessment</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(stageContent.initiation.feasibility).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
                            <p className="text-xs text-gray-600">{value.status}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${value.score >= 80 ? 'bg-green-500' :
                                  value.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${value.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{value.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preliminary Budget */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Preliminary Budget</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(stageContent.initiation.preliminaryBudget).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {key === 'hardCosts' ? 'Hard Costs' :
                              key === 'softCosts' ? 'Soft Costs' :
                                key === 'sitePrep' ? 'Site Prep' :
                                  key}
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            ${typeof value === 'number' ? value.toLocaleString() : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Site Analysis */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                        <MapPinIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Site Analysis</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.initiation.siteAnalysis.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">{item.item}</p>
                            <span className="text-sm">{item.status}</span>
                          </div>
                          <p className="text-xs text-gray-600">{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Methods */}
                <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Project Delivery Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stageContent.initiation.deliveryMethods.map((method, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{method.method}</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-green-700">Pros:</p>
                            <p className="text-xs text-gray-600">{method.pros}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-700">Cons:</p>
                            <p className="text-xs text-gray-600">{method.cons}</p>
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
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stageContent.design.title}</h3>
                    <p className="text-gray-600">{stageContent.design.description}</p>
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
                      {stageContent.design.designTeam.map((member, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 hover:border-purple-300 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-gray-900">{member.name}</div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              {member.status}
                            </span>
                          </div>
                          <div className="text-sm text-purple-600 font-medium mb-1">{member.role}</div>
                          <div className="text-xs text-gray-600">{member.credentials}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-Construction Checklist */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Pre-Construction Checklist</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.design.preConstructionChecklist.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm mr-2">{item.status}</span>
                            <p className="text-sm font-medium text-gray-900">{item.task}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permits */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Permit Applications</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.design.permits.map((permit, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{permit.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${permit.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              permit.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                              {permit.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{permit.authority}</div>
                          <div className="text-xs text-gray-500">
                            Submitted: {permit.submitted}
                            {permit.approved && ` • Approved: ${permit.approved}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Budget Planning */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Detailed Budget Planning</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.design.detailedBudget.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{item.category}</p>
                            <span className={`text-sm font-bold ${item.variance.includes('+') ? 'text-green-600' :
                              item.variance.includes('-') ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                              {item.variance}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Budgeted: ${item.budgeted.toLocaleString()}</span>
                            <span>Actual: ${item.actual.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stageContent.procurement.title}</h3>
                    <p className="text-gray-600">{stageContent.procurement.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bid Comparison */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Bid Comparison</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.procurement.bids.map((bid, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{bid.contractor}</h4>
                              <p className="text-sm text-gray-600">{bid.inclusions}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-green-600">${bid.total.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{bid.duration}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submittal Log */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Submittal Log</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.procurement.submittalLog.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.item}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                          <span className="text-sm">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RFI Log */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">RFI Management</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.procurement.rfiLog.map((rfi, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-600">RFI #{rfi.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rfi.status === 'Answered' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                              }`}>
                              {rfi.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{rfi.question}</p>
                          <p className="text-xs text-gray-500">{rfi.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction Company */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Construction Company</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center">
                      <BuildingOfficeIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{constructionTeam.company.name}</h4>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          {constructionTeam.company.contact}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {constructionTeam.company.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {constructionTeam.company.address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h5 className="font-bold text-gray-900 mb-3">Project Manager</h5>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">SJ</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{constructionTeam.projectManager.name}</div>
                        <div className="text-sm text-gray-600">{constructionTeam.projectManager.role}</div>
                        <div className="text-sm text-gray-600">{constructionTeam.projectManager.experience} experience</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {constructionTeam.projectManager.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        {constructionTeam.projectManager.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Construction Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {constructionTeam.teamMembers.map((member, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'On Site' ? 'bg-green-100 text-green-800' :
                          member.status === 'Complete' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {member.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-purple-600 font-medium">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.section}</p>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          {member.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'construction' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stageContent.construction.title}</h3>
                    <p className="text-gray-600">{stageContent.construction.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Construction Schedule (Gantt) */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                        <CalendarDaysIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Construction Schedule (Gantt)</h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {stageContent.construction.ganttTasks.map((task, i) => (
                        <div key={i} className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900 text-sm">{task.name}</div>
                            <span className="text-xs text-gray-500">{task.start} - {task.end}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${task.progress === 100 ? 'bg-green-500' :
                                task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{task.progress}% Complete</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quality Inspections */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Quality Inspections</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.construction.qualityInspections.map((inspection, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{inspection.phase}</p>
                            <p className="text-xs text-gray-500">{inspection.date}</p>
                          </div>
                          <span className="text-sm">{inspection.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Program */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Safety Program</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.construction.safetyProgram.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{item.item}</p>
                          <span className="text-sm">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Change Orders */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Change Orders</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.construction.changeOrders.map((order, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-600">CO #{order.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{order.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-green-600">${order.cost.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{order.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weekly Report */}
                <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Progress Report</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Completed This Week</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.completed}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Planned Next Week</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.planned}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Schedule Status</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.schedule}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Budget Status</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.budget}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Issues</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.issues}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Decisions Needed</h4>
                      <p className="text-sm text-gray-700">{stageContent.construction.weeklyReport.decisions}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Log */}
                <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Management</h3>
                  <div className="space-y-4">
                    {stageContent.construction.riskLog.map((risk, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{risk.risk}</h4>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                              risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {risk.likelihood} Likelihood
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.impact === 'High' ? 'bg-red-100 text-red-800' :
                              risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {risk.impact} Impact
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'closeout' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stageContent.closeout.title}</h3>
                    <p className="text-gray-600">{stageContent.closeout.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Handover Items */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg border border-indigo-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Handover Items</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.closeout.handoverItems.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <p className="text-sm font-medium text-gray-900">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Punch List */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Punch List Items</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.closeout.punchListItems.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-yellow-600">#{item.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {item.completed ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-900">{item.location}</p>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                          <p className="text-xs text-gray-500">Responsible: {item.responsible}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warranty Manual */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Warranty Manual</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.closeout.warrantyManual.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{item.section}</p>
                          <p className="text-sm text-gray-600">{item.warranty}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow-up Schedule */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <CalendarDaysIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">Follow-up Schedule</h3>
                    </div>
                    <div className="space-y-3">
                      {stageContent.closeout.followUpSchedule.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.check}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                          <span className="text-sm">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Update Details Modal */}
          {showUpdateModal && selectedUpdateDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${selectedUpdateDetails.type === 'progress' ? 'bg-orange-400' :
                      selectedUpdateDetails.type === 'milestone' ? 'bg-green-400' :
                        'bg-blue-400'
                      }`}></div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUpdateDetails.title}</h2>
                  </div>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Status and Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUpdateDetails.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        selectedUpdateDetails.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedUpdateDetails.status}
                      </span>
                      {selectedUpdateDetails.type === 'progress' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedUpdateDetails.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{selectedUpdateDetails.completion}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{selectedUpdateDetails.date}</div>
                      <div>{selectedUpdateDetails.time}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedUpdateDetails.description}</p>
                  </div>

                  {/* Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <ul className="space-y-2">
                      {selectedUpdateDetails.details.map((detail, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Images */}
                  {selectedUpdateDetails.images && selectedUpdateDetails.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUpdateDetails.images.map((image, index) => (
                          <div key={index} className="aspect-video rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={image}
                              alt={`${selectedUpdateDetails.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Responsible Person */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsible</h3>
                    <p className="text-gray-700">{selectedUpdateDetails.responsible}</p>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
                    <p className="text-gray-700">{selectedUpdateDetails.nextSteps}</p>
                  </div>

                  {/* Impact */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Impact</h3>
                    <p className={`font-medium ${selectedUpdateDetails.impact.includes('ahead') ? 'text-green-700' :
                      selectedUpdateDetails.impact.includes('delay') ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                      {selectedUpdateDetails.impact}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>

  );
};
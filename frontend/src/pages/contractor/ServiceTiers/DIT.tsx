import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ClockIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  PhoneIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface DITProps {
  tier?: any;
  title?: string;
  description?: string;
  features?: any;
  pricing?: any;
  consultation_includes?: any;
}

export default function DIT({
  title = "DIT Dashboard",
  description = "Your journey from Vision to Keys Handover",
  tier = {},
  features = [],
  pricing = {},
  consultation_includes = []
}: DITProps) {
  const [activePhase, setActivePhase] = useState('all');
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

  const phases = [
    { id: 'phase1', label: 'Initiation & Feasibility', color: 'bg-blue-100 text-blue-800' },
    { id: 'phase2', label: 'Design & Pre-Construction', color: 'bg-purple-100 text-purple-800' },
    { id: 'phase3', label: 'Procurement & Bidding', color: 'bg-green-100 text-green-800' },
    { id: 'phase4', label: 'Construction', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'phase5', label: 'Closeout & Handover', color: 'bg-red-100 text-red-800' }
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

  return (
    <>

      <Helmet><title>{`${title} - The Central Hub`}</title></Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <div className="flex items-center text-blue-600">
                  <StarIcon className="w-5 h-5 mr-1" />
                  <span className="font-medium">Popular Choice</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <WrenchScrewdriverIcon className="w-4 h-4" />
              <span>Professional Project Management</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Project
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Management Solution</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From vision to keys handover - manage every aspect of your construction project with our comprehensive DIT Dashboard.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/service-tiers/dit/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center text-lg"
              >
                <CalendarDaysIcon className="w-6 h-6 mr-3" />
                Launch DIT Dashboard
              </Link>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-lg">
                View Demo
              </button>
            </div>
          </div>

          {/* Project Phases Overview */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">5-Phase Project Management</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our systematic approach guides you through every stage of your construction project
              </p>
            </div>

            {/* Phase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${activePhase === phase.id || activePhase === 'all'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  onClick={() => setActivePhase(phase.id)}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${activePhase === phase.id || activePhase === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">{phase.label}</h4>
                    <div className={`w-full h-2 rounded-full ${activePhase === phase.id || activePhase === 'all'
                        ? 'bg-blue-200'
                        : 'bg-gray-200'
                      }`}>
                      <div className={`h-2 rounded-full transition-all duration-300 ${activePhase === phase.id || activePhase === 'all'
                          ? 'bg-blue-600 w-full'
                          : 'bg-gray-400 w-0'
                        }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg shadow-sm border p-2 flex gap-2">
                <button
                  onClick={() => setActivePhase('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activePhase === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  View All Phases
                </button>
                <button
                  onClick={() => setActivePhase('phase1')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activePhase !== 'all'
                      ? 'bg-gray-100 text-gray-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  Focus Mode
                </button>
              </div>
            </div>
          </div>

          {/* Phase Content */}
          <div className="space-y-12">
            {/* Phase 1: Project Initiation & Feasibility */}
            {(activePhase === 'all' || activePhase === 'phase1') && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
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
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${val.score >= 80 ? 'bg-green-100 text-green-800' :
                                val.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {val.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${val.score >= 80 ? 'bg-green-500' :
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
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status.includes('⚠️')
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

            {/* Phase 2: Design & Pre-Construction */}
            {(activePhase === 'all' || activePhase === 'phase2') && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
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
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.status.includes('⚠️')
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
                                <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'Approved' ? 'bg-green-100 text-green-800' :
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

            {/* Phase 3: Procurement & Bidding */}
            {(activePhase === 'all' || activePhase === 'phase3') && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
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
                          <div className={`text-sm font-medium mt-1 ${item.status.includes('✅') ? 'text-green-600' :
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
                            <span className={`text-sm font-medium ${rfi.status === 'Answered' ? 'text-green-600' : 'text-yellow-600'
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

            {/* Phase 4: Construction & Project Management */}
            {(activePhase === 'all' || activePhase === 'phase4') && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
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
                                className={`h-3 rounded-full ${task.progress === 100 ? 'bg-green-500' :
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
                            <span className={`px-2 py-1 rounded-full text-xs ${co.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                          <span className={`font-medium ${inspection.status.includes('✅') ? 'text-green-600' :
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

            {/* Phase 5: Closeout & Handover */}
            {(activePhase === 'all' || activePhase === 'phase5') && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
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
                          <div className={`text-xs font-medium ${followUp.status.includes('📅') ? 'text-blue-600' : 'text-gray-600'
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
      </div>

    </>
  );
};
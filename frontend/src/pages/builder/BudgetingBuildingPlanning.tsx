import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { 
    ClipboardDocumentListIcon,
    HomeIcon,
    SparklesIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    UsersIcon,
    CalculatorIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    tasks: string[];
    estimatedTime: string;
    estimatedCost: string;
    requirements: string[];
    tips: string[];
    completed: boolean;
}

export default function BudgetingBuildingPlanning() {
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);

    const roadmapSteps: RoadmapStep[] = [
        {
            id: 'budget-financing',
            title: 'Budget Planning & Financing',
            description: 'Develop comprehensive budget and secure financing',
            tasks: [
                'Create detailed cost breakdown',
                'Identify financing options',
                'Apply for construction loans',
                'Set up project bank account',
                'Establish payment schedules'
            ],
            estimatedTime: '2-4 weeks',
            estimatedCost: 'Variable',
            requirements: [
                'Detailed cost estimates',
                'Proof of income and assets',
                'Bank statements and credit history',
                'Construction loan applications'
            ],
            tips: [
                'Direct Costs: Expenses directly tied to the physical construction, such as materials, labor, and equipment.',
                'Indirect Costs: Costs not directly related to a specific construction activity, including administrative expenses, insurance, and permits.',
                'Contingency Fund: A portion of the budget set aside to cover unexpected costs and changes.',
                'Profit Margin: The amount of profit the construction company aims to make.'
            ],
            completed: completedSteps.includes('budget-financing')
        },
        {
            id: 'budget-engineering',
            title: 'Budget Engineering',
            description: 'At its core, construction budgeting is the process of estimating and allocating the financial resources required to complete a construction project. It\'s more than just a simple tally of expected costs; it\'s a comprehensive financial plan that outlines all anticipated expenses.',
            tasks: [
                'Labor',
                'Material',
                'Equipment',
                'Subcontractor Costs'
            ],
            estimatedTime: '2-4 weeks',
            estimatedCost: 'Variable',
            requirements: [
                'All working drawings',
                'Professional Quantity Surveyor/Artisan'
            ],
            tips: [
                'Materials: physical components required to complete the project, such as concrete, steel, lumber, drywall, wiring, and pipes. Accurately estimating this category requires a detailed material takeoff (MTO), which is a comprehensive list of all materials and their quantities derived from the construction plans.',
                'Labor: This represents the wages, benefits, and payroll taxes for all on-site personnel directly involved in the construction work, from general laborers to skilled tradespeople and their supervisors.',
                'Equipment: This includes the cost of purchasing or, more commonly, renting the heavy machinery and tools necessary for the project, such as excavators, cranes, and scaffolding. This category should also account for associated costs like fuel, delivery, and routine maintenance.',
                'Subcontractor Costs: In most projects, specialized work is performed by subcontractors. The payments made to these firms for their services—such as electrical, plumbing, HVAC, and roofing—are considered direct costs, as they are tied directly to specific construction activities.'
            ],
            completed: completedSteps.includes('budget-engineering')
        },
        {
            id: 'building-planning',
            title: 'Building Planning',
            description: 'Building planning is the comprehensive and critical process that takes place before any physical construction begins. It involves creating a detailed roadmap that defines the project\'s goals, scope, design, budget, and timeline to guide the entire build from start to finish.',
            tasks: [
                'Procurement',
                'Project Timeline',
                'Productivity Monitoring',
                'Risk Mitigation Plan'
            ],
            estimatedTime: '2-4 weeks',
            estimatedCost: 'Variable',
            requirements: [
                'All working drawings',
                'Material Schedule',
                'Take Off List',
                'Labor Breakdown'
            ],
            tips: [
                'Procurement: Issue purchase orders for materials and equipment, track procurement spending against the budget.',
                'Project Timeline: a calendar of events; it demands a strategic approach to planning, sequencing, and monitoring work.',
                'Productivity Monitoring: A detailed and formally approved project scope statement.(Progress Report) Track all project costs (labor, materials, invoices) against the budget',
                'Risk Mitigation Plan: Construction risks are potential events or circumstances that can negatively impact a project\'s outcome.'
            ],
            completed: completedSteps.includes('building-planning')
        }
    ];

    const totalSteps = roadmapSteps.length;
    const completedCount = completedSteps.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    const toggleStepCompletion = (stepId: string) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(completedSteps.filter(id => id !== stepId));
        } else {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    return (
        <>
        
            <Helmet><title>Budgeting & Building Planning - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                {/* Header */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link 
                                    to="/aspirational-builder"
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center mb-4"
                                >
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    Back to Aspirational Builder Portal
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">Budgeting & Building Planning</h1>
                                <p className="text-gray-600 mt-2">Your step-by-step guide to building in Zimbabwe</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{completedCount}/{totalSteps}</div>
                                <div className="text-sm text-gray-600">Steps Completed</div>
                                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Current Phase Steps */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Budgeting & Building Planning</h2>
                            <p className="text-xl text-gray-600">Execute the main construction work with quality control</p>
                        </div>

                        <div className="space-y-6">
                            {roadmapSteps.map((step, index) => (
                                <div key={step.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => toggleStepCompletion(step.id)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        step.completed
                                                            ? 'bg-green-500 border-green-500 text-white'
                                                            : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                                >
                                                    {step.completed && <CheckCircleIcon className="w-4 h-4" />}
                                                </button>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                                                    <p className="text-gray-600">{step.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-1" />
                                                    {step.estimatedTime}
                                                </div>
                                                <div className="flex items-center">
                                                    <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                    {step.estimatedCost}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-blue-600" />
                                                    Tasks
                                                </h4>
                                                <ul className="space-y-2">
                                                    {step.tasks.map((task, taskIndex) => (
                                                        <li key={taskIndex} className="flex items-start">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700">{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-green-600" />
                                                    Requirements
                                                </h4>
                                                <ul className="space-y-2">
                                                    {step.requirements.map((requirement, reqIndex) => (
                                                        <li key={reqIndex} className="flex items-start">
                                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700">{requirement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                                                    Pro Tips
                                                </h4>
                                                {(step.id === 'budget-engineering' || step.id === 'budget-financing') ? (
                                                    <Link 
                                                        to="/sqb-tool" 
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                                                    >
                                                        <SparklesIcon className="w-4 h-4" />
                                                        <span>SQB Tool</span>
                                                    </Link>
                                                ) : (
                                                    <Link 
                                                        to="/resources" 
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                    >
                                                        <span>Resource Hub</span>
                                                        <ArrowRightIcon className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                            <ul className="space-y-2">
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="flex items-start">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Compact Upload Button for Budget Planning */}
                                        {step.id === 'budget-financing' && (
                                            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <CloudArrowUpIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 text-sm">Upload Financial Documents</h5>
                                                        <p className="text-xs text-gray-600">Upload budget plans & financing docs</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Upload
                                                </button>
                                            </div>
                                        )}

                                        {/* Compact Upload Button for Budget Engineering */}
                                        {step.id === 'budget-engineering' && (
                                            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <CloudArrowUpIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 text-sm">Upload Engineering Documents</h5>
                                                        <p className="text-xs text-gray-600">Upload drawings & quantity surveys</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Upload
                                                </button>
                                            </div>
                                        )}

                                        {/* Compact Upload Button for Building Planning */}
                                        {step.id === 'building-planning' && (
                                            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <CloudArrowUpIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 text-sm">Upload Planning Documents</h5>
                                                        <p className="text-xs text-gray-600">Upload schedules & risk plans</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Upload
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Essential Tools & Resources */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <button
                                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                                className="flex items-center justify-center mx-auto space-x-2 text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                                <span>Essential Tools & Resources</span>
                                {isToolsExpanded ? (
                                    <ChevronUpIcon className="w-8 h-8" />
                                ) : (
                                    <ChevronDownIcon className="w-8 h-8" />
                                )}
                            </button>
                            <p className="text-xl text-gray-600 mt-4">Everything you need to build your dream home</p>
                        </div>
                        
                        {isToolsExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Directory</h3>
                                <p className="text-gray-600 mb-4">Searchable directory of vetted architects, engineers, and builders with reviews</p>
                                <Link to="/professional-directory" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                    Browse Directory
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <CalculatorIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cost Calculator</h3>
                                <p className="text-gray-600 mb-4">Interactive tool for creating preliminary budgets and cost estimates</p>
                                <Link to="/cost-calculator" className="text-green-600 hover:text-green-700 font-medium flex items-center">
                                    Calculate Costs
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                                    <MapPinIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Diaspora Guide</h3>
                                <p className="text-gray-600 mb-4">Dedicated resources for managing remote projects and avoiding scams</p>
                                <Link to="/diaspora-guide" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                                    Read Guide
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bulk Purchasing</h3>
                                <p className="text-gray-600 mb-4">Join or create groups for collective material purchasing at discounted rates</p>
                                <Link to="/bulk-purchasing" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                                    Join Groups
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">S.Q.B Tool (Premium)</h3>
                                <p className="text-gray-600 mb-4">Concierge service providing fully managed, personalized digital roadmap</p>
                                <Link to="/sqb-tool" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                                    Learn More
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                    <ClockIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Tiers</h3>
                                <p className="text-gray-600 mb-4">Choose from DIY, DIT, or DIFY service levels based on your needs</p>
                                <Link to="/service-tiers" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                                    View Tiers
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Building Journey?</h2>
                        <p className="text-xl text-blue-100 mb-8">Join thousands of successful builders who have used our roadmap to build their dream homes.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/construction-roadmap"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <ClipboardDocumentListIcon className="w-5 h-5" />
                                <span>Start Roadmap</span>
                            </Link>
                            <Link 
                                to="/cost-calculator"
                                className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
                            >
                                <CalculatorIcon className="w-5 h-5" />
                                <span>Calculate Costs</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        
        </>
    );
}

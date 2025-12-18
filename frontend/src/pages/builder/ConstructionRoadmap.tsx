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

export default function ConstructionRoadmap() {
    const [currentPhase, setCurrentPhase] = useState<'pre-construction' | 'the-build' | 'finishing'>('pre-construction');
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);

    const roadmapSteps: Record<string, RoadmapStep[]> = {
        'pre-construction': [
            {
                id: 'land-acquisition',
                title: 'Land Acquisition & Title Verification',
                description: 'Secure your building plot and verify all legal documentation',
                tasks: [
                    'Research and identify suitable land',
                    'Verify title deeds and ownership',
                    'Check for any encumbrances or disputes',
                    'Obtain land survey and boundary beacons',
                    'Complete land purchase transaction'
                ],
                estimatedTime: '2-4 weeks',
                estimatedCost: '$5,000 - $50,000',
                requirements: [
                    'Valid ID and proof of residence',
                    'Bank statements for financing',
                    'Legal representation',
                    'Land surveyor services'
                ],
                tips: [
                    'Always verify title deeds at the Deeds Registry',
                    'Check for any outstanding rates or taxes',
                    'Ensure access roads are properly defined',
                    'Consider future development in the area'
                ],
                completed: completedSteps.includes('land-acquisition')
            },
            {
                id: 'council-approvals',
                title: 'Council Approvals & Permits',
                description: 'Obtain all necessary approvals from local authorities',
                tasks: [
                    'Submit building plans to council',
                    'Pay application fees',
                    'Attend site inspections',
                    'Obtain building permit',
                    'Register with relevant authorities'
                ],
                estimatedTime: '4-8 weeks',
                estimatedCost: '$500 - $2,000',
                requirements: [
                    'Architectural plans',
                    'Structural engineering drawings',
                    'Site plan and location plan',
                    'Application forms and fees'
                ],
                tips: [
                    'Start the approval process early',
                    'Ensure plans comply with local building codes',
                    'Maintain good relationships with council officials',
                    'Keep copies of all submitted documents'
                ],
                completed: completedSteps.includes('council-approvals')
            },
            {
                id: 'architectural-plans',
                title: 'Architectural Plans & Designs',
                description: 'Develop detailed architectural and structural plans',
                tasks: [
                    'Hire qualified architect',
                    'Develop initial concept designs',
                    'Create detailed architectural plans',
                    'Obtain structural engineering drawings',
                    'Finalize all construction documents'
                ],
                estimatedTime: '6-12 weeks',
                estimatedCost: '$3,000 - $15,000',
                requirements: [
                    'Qualified architect registration',
                    'Structural engineer services',
                    'Site survey and measurements',
                    'Client requirements and preferences'
                ],
                tips: [
                    'Choose an architect with local experience',
                    'Ensure plans are detailed and comprehensive',
                    'Consider future expansion possibilities',
                    'Review plans thoroughly before approval'
                ],
                completed: completedSteps.includes('architectural-plans')
            },
        ],
        'the-build': [
            {
                id: 'foundation',
                title: 'Foundation & Structure',
                description: 'Build the foundation and main structural elements',
                tasks: [
                    'Site preparation and excavation',
                    'Foundation construction',
                    'Structural framework',
                    'Roof structure installation',
                    'Initial weatherproofing'
                ],
                estimatedTime: '8-12 weeks',
                estimatedCost: '$15,000 - $40,000',
                requirements: [
                    'Excavation equipment',
                    'Concrete and reinforcement',
                    'Structural materials',
                    'Qualified contractors'
                ],
                tips: [
                    'Ensure proper drainage around foundation',
                    'Use quality materials for structure',
                    'Regular inspections during construction',
                    'Maintain construction schedule'
                ],
                completed: completedSteps.includes('foundation')
            },
            {
                id: 'roofing',
                title: 'Roofing & Weatherproofing',
                description: 'Install roof and ensure weather protection',
                tasks: [
                    'Roof structure completion',
                    'Roof covering installation',
                    'Gutter and drainage systems',
                    'Weatherproofing measures',
                    'Roof insulation'
                ],
                estimatedTime: '2-4 weeks',
                estimatedCost: '$5,000 - $15,000',
                requirements: [
                    'Roofing materials',
                    'Insulation materials',
                    'Gutter systems',
                    'Weatherproofing products'
                ],
                tips: [
                    'Choose appropriate roofing material for climate',
                    'Ensure proper ventilation',
                    'Install quality gutters',
                    'Check for leaks after installation'
                ],
                completed: completedSteps.includes('roofing')
            },
            {
                id: 'electrical-plumbing',
                title: 'Electrical & Plumbing',
                description: 'Install electrical and plumbing systems',
                tasks: [
                    'Electrical wiring installation',
                    'Plumbing system installation',
                    'HVAC system setup',
                    'System testing and commissioning',
                    'Safety inspections'
                ],
                estimatedTime: '4-6 weeks',
                estimatedCost: '$8,000 - $20,000',
                requirements: [
                    'Licensed electricians',
                    'Licensed plumbers',
                    'Electrical and plumbing materials',
                    'Safety equipment'
                ],
                tips: [
                    'Use licensed professionals only',
                    'Plan for future electrical needs',
                    'Ensure proper water pressure',
                    'Test all systems thoroughly'
                ],
                completed: completedSteps.includes('electrical-plumbing')
            },
            {
                id: 'quality-control',
                title: 'Quality Control & Inspections',
                description: 'Regular inspections and quality assurance',
                tasks: [
                    'Regular site inspections',
                    'Quality control checks',
                    'Safety compliance verification',
                    'Progress documentation',
                    'Issue identification and resolution'
                ],
                estimatedTime: 'Ongoing',
                estimatedCost: '$1,000 - $3,000',
                requirements: [
                    'Inspector services',
                    'Quality control tools',
                    'Documentation systems',
                    'Safety equipment'
                ],
                tips: [
                    'Schedule regular inspections',
                    'Document all issues and resolutions',
                    'Maintain safety standards',
                    'Keep detailed progress records'
                ],
                completed: completedSteps.includes('quality-control')
            }
        ],
        'finishing': [
            {
                id: 'interior-finishes',
                title: 'Interior Finishes & Fixtures',
                description: 'Complete interior finishing work',
                tasks: [
                    'Flooring installation',
                    'Wall finishes and painting',
                    'Ceiling installation',
                    'Interior fixtures installation',
                    'Final interior touches'
                ],
                estimatedTime: '6-10 weeks',
                estimatedCost: '$10,000 - $25,000',
                requirements: [
                    'Flooring materials',
                    'Paint and finishes',
                    'Interior fixtures',
                    'Skilled finishing contractors'
                ],
                tips: [
                    'Choose durable materials',
                    'Plan lighting carefully',
                    'Consider maintenance requirements',
                    'Ensure proper ventilation'
                ],
                completed: completedSteps.includes('interior-finishes')
            },
            {
                id: 'painting-decoration',
                title: 'Painting & Decoration',
                description: 'Final painting and decorative work',
                tasks: [
                    'Surface preparation',
                    'Primer application',
                    'Paint application',
                    'Decorative finishes',
                    'Final touch-ups'
                ],
                estimatedTime: '2-4 weeks',
                estimatedCost: '$2,000 - $8,000',
                requirements: [
                    'Quality paint products',
                    'Painting tools and equipment',
                    'Surface preparation materials',
                    'Skilled painters'
                ],
                tips: [
                    'Use quality paint products',
                    'Proper surface preparation is key',
                    'Consider color schemes carefully',
                    'Allow proper drying time'
                ],
                completed: completedSteps.includes('painting-decoration')
            },
            {
                id: 'final-inspections',
                title: 'Final Inspections & Certificates',
                description: 'Complete final inspections and obtain certificates',
                tasks: [
                    'Final building inspection',
                    'Electrical safety inspection',
                    'Plumbing inspection',
                    'Occupancy certificate application',
                    'Documentation completion'
                ],
                estimatedTime: '2-4 weeks',
                estimatedCost: '$500 - $1,500',
                requirements: [
                    'Building inspection reports',
                    'Safety certificates',
                    'Compliance documentation',
                    'Application fees'
                ],
                tips: [
                    'Schedule inspections early',
                    'Ensure all systems are working',
                    'Have all documentation ready',
                    'Follow up on any issues promptly'
                ],
                completed: completedSteps.includes('final-inspections')
            },
            {
                id: 'handover',
                title: 'Handover & Documentation',
                description: 'Final handover and documentation',
                tasks: [
                    'Final walkthrough',
                    'Documentation handover',
                    'Warranty information',
                    'Maintenance instructions',
                    'Key handover'
                ],
                estimatedTime: '1 week',
                estimatedCost: '$200 - $500',
                requirements: [
                    'All completion certificates',
                    'Warranty documents',
                    'Maintenance manuals',
                    'Key sets and access codes'
                ],
                tips: [
                    'Conduct thorough final walkthrough',
                    'Ensure all warranties are documented',
                    'Provide maintenance schedules',
                    'Keep copies of all documents'
                ],
                completed: completedSteps.includes('handover')
            }
        ]
    };

    const currentSteps = roadmapSteps[currentPhase];
    const totalSteps = Object.values(roadmapSteps).flat().length;
    const completedCount = completedSteps.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    const toggleStepCompletion = (stepId: string) => {
        if (completedSteps.includes(stepId)) {
            setCompletedSteps(completedSteps.filter(id => id !== stepId));
        } else {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    const getPhaseIcon = (phase: string) => {
        switch (phase) {
            case 'pre-construction':
                return <ClipboardDocumentListIcon className="w-6 h-6" />;
            case 'the-build':
                return <WrenchScrewdriverIcon className="w-6 h-6" />;
            case 'finishing':
                return <SparklesIcon className="w-6 h-6" />;
            default:
                return <HomeIcon className="w-6 h-6" />;
        }
    };

    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case 'pre-construction':
                return 'blue';
            case 'the-build':
                return 'green';
            case 'finishing':
                return 'purple';
            default:
                return 'gray';
        }
    };

    return (
        <>
        
            <Helmet><title>Construction Roadmap - Aspirational Builder Portal - The Central Hub</title></Helmet>
            
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
                                <h1 className="text-3xl font-bold text-gray-900">Construction Roadmap</h1>
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
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                {currentPhase === 'pre-construction' && 'Drafting & Designing'}
                                {currentPhase === 'the-build' && 'The Build Phase'}
                                {currentPhase === 'finishing' && 'Finishing Phase'}
                            </h2>
                            <p className="text-xl text-gray-600">
                                {currentPhase === 'pre-construction' && 'Plan, permit, and prepare for your construction project'}
                                {currentPhase === 'the-build' && 'Execute the main construction work with quality control'}
                                {currentPhase === 'finishing' && 'Complete the final touches and obtain all certificates'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {currentSteps.map((step, index) => (
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
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                                                Pro Tips
                                            </h4>
                                            <ul className="space-y-2">
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="flex items-start">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Compact Upload Button for Council Approvals */}
                                        {step.id === 'council-approvals' && (
                                            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <CloudArrowUpIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 text-sm">Upload Permits & Approvals</h5>
                                                        <p className="text-xs text-gray-600">Upload your council documents</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Upload
                                                </button>
                                            </div>
                                        )}

                                        {/* Compact Upload Button for Land Acquisition */}
                                        {step.id === 'land-acquisition' && (
                                            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <CloudArrowUpIcon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 text-sm">Upload Land Documents</h5>
                                                        <p className="text-xs text-gray-600">Upload title deeds, surveys & legal docs</p>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                    Upload
                                                </button>
                                            </div>
                                        )}

                                        {/* SQB Tool Button for Architectural Plans */}
                                        {step.id === 'architectural-plans' && (
                                            <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                            <SparklesIcon className="w-5 h-5 mr-2 text-red-600" />
                                                            S.Q.B Tool (Premium)
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            Create your own detailed architectural plans with our AI-powered design tool
                                                        </p>
                                                    </div>
                                                    <Link 
                                                        to="/sqb-tool"
                                                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
                                                    >
                                                        <SparklesIcon className="w-5 h-5" />
                                                        <span>Start Designing</span>
                                                    </Link>
                                                </div>
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

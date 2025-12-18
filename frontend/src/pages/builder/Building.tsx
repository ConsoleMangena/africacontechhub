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
    ChevronUpIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

interface ProjectStep {
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

export default function Building() {
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);
    const [activeBuildSection, setActiveBuildSection] = useState<string | null>(null);

    const buildingSteps: ProjectStep[] = [
        {
            id: 'foundation-structure',
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
            completed: false
        },
        {
            id: 'roofing-weatherproofing',
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
            completed: false
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
            completed: false
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
            completed: false
        }
    ];

    const toggleStepCompletion = (stepId: string) => {
        setCompletedSteps(prev => 
            prev.includes(stepId) 
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        );
    };

    const completedCount = completedSteps.length;
    const totalSteps = buildingSteps.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    return (
        <>
        
            <Helmet><title>Building - The Central Hub - The Central Hub</title></Helmet>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Building</h1>
                            <p className="text-xl text-gray-600">Final touches and completion</p>
                        </div>
                    </div>
                </section>

                {/* Project Dashboard */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Project Overview */}
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
                                                <p className="text-gray-600">Active Construction</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                <ChartBarIcon className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                                                <p className="text-gray-600">{Math.round(progressPercentage)}% Complete</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <ClockIcon className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                                                <p className="text-gray-600">14-22 weeks remaining</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
                                                <p className="text-gray-600">$29,000 - $78,000</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Details */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Details</h2>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <UserGroupIcon className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Project Owner</h3>
                                            <p className="text-gray-600">John & Jane Smith</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Contact:</span>
                                            <p className="text-gray-900">+263 77 123 4567</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Email:</span>
                                            <p className="text-gray-900">john.smith@email.com</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Address:</span>
                                            <p className="text-gray-900">123 Main Street, Harare</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Progress Report */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Progress Report</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Project Timeline Bar Chart */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Timeline</h3>
                                <div className="space-y-6">
                                    {/* Y-axis labels and bars */}
                                    <div className="relative">
                                        {/* Y-axis */}
                                        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
                                            <span>200</span>
                                            <span>150</span>
                                            <span>100</span>
                                            <span>50</span>
                                            <span>0</span>
                                        </div>
                                        
                                        {/* Chart area */}
                                        <div className="ml-12 space-y-4">
                                            {/* Category 1 Bar */}
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">Category 1</div>
                                                <div className="flex-1 relative">
                                                    <div className="bg-blue-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '100px'}}>
                                                        100
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Category 2 Bar */}
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">Category 2</div>
                                                <div className="flex-1 relative">
                                                    <div className="bg-green-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '130px'}}>
                                                        130
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Category 3 Bar */}
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">Category 3</div>
                                                <div className="flex-1 relative">
                                                    <div className="bg-orange-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '70px'}}>
                                                        70
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Category 4 Bar */}
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">Category 4</div>
                                                <div className="flex-1 relative">
                                                    <div className="bg-purple-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '160px'}}>
                                                        160
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Category 5 Bar */}
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20 text-sm text-gray-600">Category 5</div>
                                                <div className="flex-1 relative">
                                                    <div className="bg-red-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '90px'}}>
                                                        90
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* X-axis */}
                                    <div className="ml-12 border-t border-gray-300 pt-2">
                                        <div className="text-center text-sm text-gray-600">Project Categories</div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-gray-600">Category 1</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-gray-600">Category 2</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                        <span className="text-gray-600">Category 3</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                                        <span className="text-gray-600">Category 4</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        <span className="text-gray-600">Category 5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Gantt Chart */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Calendar</h3>
                                <div className="space-y-4">
                                    {/* Delivery Of Material */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 text-sm text-gray-600">Delivery Of Material</div>
                                        <div className="flex-1">
                                            <div className="bg-blue-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '200px'}}>
                                                Date 12
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Labour */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 text-sm text-gray-600">Labour</div>
                                        <div className="flex-1">
                                            <div className="bg-gray-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '60px'}}>
                                                Date 3
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Sub Contractors */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 text-sm text-gray-600">Sub Contractors</div>
                                        <div className="flex-1">
                                            <div className="bg-orange-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '80px'}}>
                                                Date 22
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Equipment Stage */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 text-sm text-gray-600">Equipment Stage</div>
                                        <div className="flex-1">
                                            <div className="bg-yellow-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium" style={{width: '100px'}}>
                                                Date 19
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-gray-600">Delivery Of Material</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-gray-500 rounded"></div>
                                        <span className="text-gray-600">Labour</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                        <span className="text-gray-600">Sub Contractors</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                        <span className="text-gray-600">Equipment Stage</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Project Progress Images */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Project Progress Gallery</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <WrenchScrewdriverIcon className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-orange-800">Foundation Work</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">Initial Construction</h4>
                                        <p className="text-sm text-gray-600">Workers building foundation and lower walls on site</p>
                                        <div className="mt-2 text-xs text-gray-500">Week 1-2</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <BuildingOfficeIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-blue-800">Structural Work</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">Framing Phase</h4>
                                        <p className="text-sm text-gray-600">Installing wooden joists and structural framework</p>
                                        <div className="mt-2 text-xs text-gray-500">Week 3-4</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <DocumentTextIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-800">Concrete Work</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">Concrete Pouring</h4>
                                        <p className="text-sm text-gray-600">Setting up formwork and pouring concrete columns</p>
                                        <div className="mt-2 text-xs text-gray-500">Week 5-6</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPinIcon className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-green-800">Aerial View</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1">Site Overview</h4>
                                        <p className="text-sm text-gray-600">Complete building footprint with structural progress</p>
                                        <div className="mt-2 text-xs text-gray-500">Week 7-8</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Build Phase */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">The Build Phase</h2>
                        
                        <div className="space-y-4">
                            {/* Site Establishment */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'site-establishment' ? null : 'site-establishment')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <MapPinIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Site Establishment</h3>
                                    </div>
                                    {activeBuildSection === 'site-establishment' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'site-establishment' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">85% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Completed Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Site survey and marking</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Access road construction</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Utility connections</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Remaining Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Security fencing installation</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Ensure proper drainage around the site to prevent water accumulation</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Install temporary security measures before permanent fencing</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Coordinate with utility companies early to avoid delays</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Foundations (Substructure) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'foundations' ? null : 'foundations')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Foundations (Substructure)</h3>
                                    </div>
                                    {activeBuildSection === 'foundations' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'foundations' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">60% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '60%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Completed Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Excavation completed</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Footings poured</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">In Progress</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Foundation walls construction</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Waterproofing application</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Use quality concrete mix and ensure proper curing time</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Apply waterproofing membrane before backfilling</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Install proper drainage systems around foundation</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Walls (Superstructure) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'walls' ? null : 'walls')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Walls (Superstructure)</h3>
                                    </div>
                                    {activeBuildSection === 'walls' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'walls' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">30% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '30%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Completed Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                            <span>Ground floor walls</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Upcoming Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>First floor walls</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Window openings</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Use proper mortar mix and maintain consistent joint thickness</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Install lintels above window and door openings</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Check wall alignment and plumbness regularly</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Roof */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'roof' ? null : 'roof')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <HomeIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Roof</h3>
                                    </div>
                                    {activeBuildSection === 'roof' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'roof' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">0% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Planned Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Roof truss installation</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Roof covering</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Awaiting wall completion</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Choose roofing material based on local climate conditions</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Ensure proper ventilation to prevent moisture buildup</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Install quality gutters and downspouts for water management</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Internal & External Finishes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'finishes' ? null : 'finishes')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                            <SparklesIcon className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Internal & External Finishes</h3>
                                    </div>
                                    {activeBuildSection === 'finishes' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'finishes' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">0% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-pink-600 h-2 rounded-full" style={{width: '0%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Planned Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Plastering and painting</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Flooring installation</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Awaiting structural completion</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Use quality paint and primer for long-lasting finishes</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Allow proper drying time between coats</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Choose flooring materials suitable for each room's use</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mechanical (Electrical, Plumbing, HVAC) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'mechanical' ? null : 'mechanical')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Mechanical (Electrical, Plumbing, HVAC)</h3>
                                    </div>
                                    {activeBuildSection === 'mechanical' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'mechanical' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">0% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-indigo-600 h-2 rounded-full" style={{width: '0%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Planned Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Electrical wiring</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Plumbing installation</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Awaiting wall completion</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Use licensed professionals for all electrical and plumbing work</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Plan for future electrical needs and install extra outlets</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Test all systems thoroughly before closing walls</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Final Accounting & Handover */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setActiveBuildSection(activeBuildSection === 'handover' ? null : 'handover')}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                            <DocumentTextIcon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Final Accounting & Handover</h3>
                                    </div>
                                    {activeBuildSection === 'handover' ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                
                                {activeBuildSection === 'handover' && (
                                    <div className="px-6 pb-6 border-t border-gray-200">
                                        <div className="pt-4">
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                                    <span className="text-sm text-gray-600">0% Complete</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-red-600 h-2 rounded-full" style={{width: '0%'}}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Planned Tasks</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Final inspections</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Documentation preparation</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                                                    <ul className="space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                                                            <span>Awaiting project completion</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className="font-medium text-gray-900 mb-3">Pro Tips</h4>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Keep detailed records of all work completed and materials used</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Schedule final inspections well in advance to avoid delays</span>
                                                    </li>
                                                    <li className="flex items-start space-x-2">
                                                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span>Prepare all warranties and maintenance documentation for handover</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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

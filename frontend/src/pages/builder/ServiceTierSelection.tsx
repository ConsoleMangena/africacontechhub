import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { 
    WrenchScrewdriverIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

export default function ServiceTierSelection() {
    const ditFeatures = [
        'Complete project lifecycle management',
        'Vision to keys handover tracking',
        'Feasibility analysis & permits',
        'Bid management & contractor selection',
        'Gantt chart scheduling',
        'Punch list management',
        'Document management',
        'Stakeholder collaboration'
    ];

    const difyFeatures = [
        'Visual project updates & timeline',
        'Real-time progress tracking',
        'Photo & video documentation',
        'Interactive project dashboard',
        'Client communication portal',
        'Milestone tracking',
        'Analytics & reporting',
        'Mobile-friendly interface'
    ];

    return (
        <>
        
            <Helmet><title>Contractor Suite - Choose Your Service Tier - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-6">
                            <WrenchScrewdriverIcon className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Contractor Suite
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose your service tier to access the tools you need to manage your construction projects
                        </p>
                    </div>

                    {/* Service Tier Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* DIT Card */}
                        <Link to="/contractor-suite/dit" className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="px-4 py-2 bg-blue-100 rounded-full">
                                        <span className="text-blue-800 font-semibold text-sm">DIT</span>
                                    </div>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    DIT Dashboard
                                </h2>
                                <p className="text-gray-600 mb-6 text-lg">
                                    Your journey from <span className="font-semibold text-gray-900">Vision to Keys Handover</span>
                                </p>
                                
                                <div className="space-y-3 mb-6">
                                    {ditFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-center text-gray-700">
                                            <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <span className="text-blue-600 font-semibold group-hover:text-blue-700">
                                        Access DIT Dashboard
                                    </span>
                                    <ArrowRightIcon className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* DIFY Card */}
                        <Link to="/contractor-suite?tier=dify" className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <SparklesIcon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="px-4 py-2 bg-purple-100 rounded-full">
                                        <span className="text-purple-800 font-semibold text-sm">DIFY</span>
                                    </div>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    DIFY Dashboard
                                </h2>
                                <p className="text-gray-600 mb-6 text-lg">
                                    <span className="font-semibold text-gray-900">Visual Project Management</span> & Updates
                                </p>
                                
                                <div className="space-y-3 mb-6">
                                    {difyFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-center text-gray-700">
                                            <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <span className="text-purple-600 font-semibold group-hover:text-purple-700">
                                        Access DIFY Dashboard
                                    </span>
                                    <ArrowRightIcon className="w-5 h-5 text-purple-600 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Comparison Section */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Which Service Tier is Right for You?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                                    Choose DIT if you need:
                                </h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>Complete project lifecycle management from start to finish</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>Detailed planning, feasibility, and permit tracking</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>Comprehensive bid and contractor management</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        <span>Full project documentation and handover process</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-purple-600 mb-3 flex items-center">
                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                    Choose DIFY if you need:
                                </h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Visual, easy-to-understand project updates</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Real-time progress tracking and photo documentation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Client-friendly communication and reporting</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-purple-500 mr-2">•</span>
                                        <span>Mobile-optimized interface for on-the-go access</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link 
                            to="/" 
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <HomeIcon className="h-5 w-5 mr-2" />
                            Back to Home
                        </Link>
                    </div>
                </main>
            </div>
        
        </>
    );
}

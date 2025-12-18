import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { 
    ArrowLeftIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    UserGroupIcon,
    BanknotesIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

interface GuideSection {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    content: {
        subtitle: string;
        items: string[];
        tips?: string[];
        warnings?: string[];
    }[];
}

export default function DiasporaGuide() {
    const [activeSection, setActiveSection] = useState('overview');

    const guideSections: GuideSection[] = [
        {
            id: 'overview',
            title: 'Diaspora Guide Overview',
            description: 'Essential information for managing construction projects remotely',
            icon: GlobeAltIcon,
            content: [
                {
                    subtitle: 'Why This Guide Matters',
                    items: [
                        'Many Zimbabweans in the diaspora want to build homes back home',
                        'Remote project management requires special considerations',
                        'Avoiding common pitfalls and scams is crucial',
                        'Proper planning ensures successful project completion'
                    ],
                    tips: [
                        'Start planning at least 6 months before construction begins',
                        'Build relationships with local professionals early',
                        'Use technology to stay connected and monitor progress'
                    ]
                }
            ]
        },
        {
            id: 'planning',
            title: 'Pre-Construction Planning',
            description: 'Critical planning steps before breaking ground',
            icon: DocumentTextIcon,
            content: [
                {
                    subtitle: 'Legal and Documentation Requirements',
                    items: [
                        'Ensure you have valid Zimbabwean ID or passport',
                        'Verify land title deeds and ownership',
                        'Power of Attorney for local representation',
                        'Bank account setup for project financing',
                        'Tax clearance certificates if applicable'
                    ],
                    warnings: [
                        'Never send money without proper documentation',
                        'Verify all legal documents with authorities',
                        'Keep copies of all important documents'
                    ]
                },
                {
                    subtitle: 'Financial Planning',
                    items: [
                        'Set up dedicated project bank account',
                        'Consider currency exchange rates and timing',
                        'Plan for inflation and price fluctuations',
                        'Budget for unexpected costs (20% contingency)',
                        'Research financing options and requirements'
                    ],
                    tips: [
                        'Use reputable money transfer services',
                        'Consider forward contracts for currency hedging',
                        'Keep detailed financial records'
                    ]
                }
            ]
        },
        {
            id: 'team-building',
            title: 'Building Your Team',
            description: 'Assembling the right professionals for your project',
            icon: UserGroupIcon,
            content: [
                {
                    subtitle: 'Key Team Members',
                    items: [
                        'Architect: Design and planning oversight',
                        'Project Manager: Day-to-day coordination',
                        'Structural Engineer: Technical oversight',
                        'Quantity Surveyor: Cost control and monitoring',
                        'Local Representative: On-ground coordination'
                    ],
                    tips: [
                        'Interview multiple candidates before selecting',
                        'Check references and previous work',
                        'Ensure all team members are properly licensed',
                        'Establish clear communication protocols'
                    ]
                },
                {
                    subtitle: 'Local Representative Options',
                    items: [
                        'Family member or trusted friend',
                        'Professional project manager',
                        'Construction company with project management',
                        'The Central Hub Concierge Service'
                    ],
                    warnings: [
                        'Choose someone you trust completely',
                        'Ensure they have construction knowledge',
                        'Set clear expectations and boundaries',
                        'Regular communication is essential'
                    ]
                }
            ]
        },
        {
            id: 'communication',
            title: 'Communication & Monitoring',
            description: 'Staying connected and monitoring progress',
            icon: PhoneIcon,
            content: [
                {
                    subtitle: 'Communication Tools',
                    items: [
                        'WhatsApp groups for daily updates',
                        'Video calls for site visits and meetings',
                        'Project management software (Asana, Trello)',
                        'Cloud storage for documents and photos',
                        'Regular scheduled check-ins'
                    ],
                    tips: [
                        'Set up group chats with all stakeholders',
                        'Use video calls for important decisions',
                        'Document all communications',
                        'Establish response time expectations'
                    ]
                },
                {
                    subtitle: 'Progress Monitoring',
                    items: [
                        'Weekly progress reports with photos',
                        'Milestone-based payment schedules',
                        'Regular site visits by your representative',
                        'Third-party inspections at key stages',
                        'Documentation of all work completed'
                    ],
                    warnings: [
                        'Never pay for work not completed',
                        'Verify progress with photos and reports',
                        'Be suspicious of excuses for delays',
                        'Trust your instincts if something seems wrong'
                    ]
                }
            ]
        },
        {
            id: 'scam-prevention',
            title: 'Scam Prevention',
            description: 'Protecting yourself from common construction scams',
            icon: ShieldCheckIcon,
            content: [
                {
                    subtitle: 'Common Scam Types',
                    items: [
                        'Fake contractors with stolen credentials',
                        'Inflated material costs and kickbacks',
                        'Substandard work with premium pricing',
                        'Disappearing contractors after payment',
                        'Fake material suppliers and deliveries'
                    ],
                    warnings: [
                        'Never pay full amount upfront',
                        'Verify all credentials and licenses',
                        'Get multiple quotes for comparison',
                        'Use escrow services for large payments'
                    ]
                },
                {
                    subtitle: 'Red Flags to Watch For',
                    items: [
                        'Pressure to make quick decisions',
                        'Unusually low or high quotes',
                        'Reluctance to provide references',
                        'Requests for cash payments only',
                        'Poor communication or evasiveness'
                    ],
                    tips: [
                        'Trust your instincts',
                        'Do thorough background checks',
                        'Ask for detailed written contracts',
                        'Never pay without seeing progress'
                    ]
                }
            ]
        },
        {
            id: 'payment-strategies',
            title: 'Payment Strategies',
            description: 'Safe and effective payment methods',
            icon: BanknotesIcon,
            content: [
                {
                    subtitle: 'Payment Methods',
                    items: [
                        'Bank transfers to project account',
                        'Escrow services for large payments',
                        'Milestone-based payment schedules',
                        'Material purchase directly by you',
                        'Labor-only payments to contractors'
                    ],
                    tips: [
                        'Never pay cash for large amounts',
                        'Use traceable payment methods',
                        'Keep detailed payment records',
                        'Consider payment protection services'
                    ]
                },
                {
                    subtitle: 'Payment Schedule Example',
                    items: [
                        '10% - Project start and mobilization',
                        '20% - Foundation completion',
                        '20% - Structure completion',
                        '20% - Roof and weatherproofing',
                        '20% - Services installation',
                        '10% - Final completion and handover'
                    ],
                    warnings: [
                        'Never pay more than work completed',
                        'Withhold final payment until satisfied',
                        'Get receipts for all payments',
                        'Document all payment agreements'
                    ]
                }
            ]
        },
        {
            id: 'technology',
            title: 'Technology Solutions',
            description: 'Using technology to manage your project',
            icon: HomeIcon,
            content: [
                {
                    subtitle: 'Project Management Tools',
                    items: [
                        'The Central Hub platform for contractor management',
                        'Video conferencing for site meetings',
                        'Cloud storage for document sharing',
                        'Mobile apps for progress tracking',
                        'Financial tracking and budgeting tools'
                    ],
                    tips: [
                        'Choose user-friendly platforms',
                        'Train your local team on tools',
                        'Backup all important data',
                        'Use secure communication channels'
                    ]
                },
                {
                    subtitle: 'Remote Monitoring',
                    items: [
                        'Security cameras for site monitoring',
                        'Drone photography for progress updates',
                        'Satellite imagery for site verification',
                        'Mobile banking for payment management',
                        'Digital document signing platforms'
                    ],
                    warnings: [
                        'Ensure internet connectivity at site',
                        'Protect sensitive information',
                        'Use secure networks only',
                        'Regularly update security software'
                    ]
                }
            ]
        }
    ];

    const currentSection = guideSections.find(section => section.id === activeSection);

    return (
        <>
        
            <Helmet><title>Diaspora Guide - Aspirational Builder Portal - The Central Hub</title></Helmet>
            
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
                                <h1 className="text-3xl font-bold text-gray-900">Diaspora Guide</h1>
                                <p className="text-gray-600 mt-2">Dedicated resources for managing remote projects and avoiding scams</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">7</div>
                                <div className="text-sm text-gray-600">Guide Sections</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Guide Sections</h2>
                                <nav className="space-y-2">
                                    {guideSections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <section.icon className="w-5 h-5 mr-3" />
                                                <div>
                                                    <div className="font-medium text-sm">{section.title}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                {currentSection && (
                                    <div>
                                        <div className="flex items-center mb-6">
                                            <currentSection.icon className="w-8 h-8 text-blue-600 mr-3" />
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
                                                <p className="text-gray-600">{currentSection.description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {currentSection.content.map((content, index) => (
                                                <div key={index}>
                                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.subtitle}</h2>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                                                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                                                                Key Points
                                                            </h3>
                                                            <ul className="space-y-2">
                                                                {content.items.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="flex items-start">
                                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                                        <span className="text-gray-700">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {content.tips && (
                                                            <div className="p-4 bg-green-50 rounded-lg">
                                                                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                                                                    <InformationCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                                                                    Pro Tips
                                                                </h3>
                                                                <ul className="space-y-2">
                                                                    {content.tips.map((tip, tipIndex) => (
                                                                        <li key={tipIndex} className="flex items-start">
                                                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                                            <span className="text-green-800 text-sm">{tip}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {content.warnings && (
                                                            <div className="p-4 bg-red-50 rounded-lg">
                                                                <h3 className="font-medium text-red-900 mb-3 flex items-center">
                                                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                                                                    Important Warnings
                                                                </h3>
                                                                <ul className="space-y-2">
                                                                    {content.warnings.map((warning, warningIndex) => (
                                                                        <li key={warningIndex} className="flex items-start">
                                                                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                                            <span className="text-red-800 text-sm">{warning}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Additional Resources */}
                                        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Additional Resources</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center p-3 bg-white rounded-lg">
                                                    <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-3" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Legal Templates</div>
                                                        <div className="text-sm text-gray-600">Contracts and agreements</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center p-3 bg-white rounded-lg">
                                                    <PhoneIcon className="w-6 h-6 text-blue-600 mr-3" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Support Hotline</div>
                                                        <div className="text-sm text-gray-600">+263 77 123 4567</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center p-3 bg-white rounded-lg">
                                                    <EnvelopeIcon className="w-6 h-6 text-blue-600 mr-3" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Email Support</div>
                                                        <div className="text-sm text-gray-600">diaspora@dzenhare.co.zw</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center p-3 bg-white rounded-lg">
                                                    <UserGroupIcon className="w-6 h-6 text-blue-600 mr-3" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Community Forum</div>
                                                        <div className="text-sm text-gray-600">Connect with others</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    );
}

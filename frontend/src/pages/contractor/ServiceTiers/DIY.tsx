import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ChartBarIcon,
    FolderIcon,
    EnvelopeIcon,
    WrenchScrewdriverIcon,
    CalendarDaysIcon,
    ReceiptPercentIcon,
    StarIcon,
    ArrowRightIcon,
    PhoneIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'

interface DIYProps {
    tier?: any
    title?: string
    description?: string
    features?: string[]
    pricing?: any
    limitations?: string[]
}

export default function DIY({
    tier = {},
    title = 'DIY Service',
    description = 'Do It Yourself - Self Service Tools',
    features = [],
    pricing = {},
    limitations = []
}: DIYProps) {
    const [selectedPlan, setSelectedPlan] = useState('monthly')

    return (
        <>

            <Helmet><title>{title} - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                                <div className="flex items-center text-green-600">
                                    <StarIcon className="w-5 h-5 mr-1" />
                                    <span className="font-medium">Free Tier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                            <span>Self-Service Tools</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Perfect for
                            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Independent Contractors</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Get started with our free DIY tools and manage your projects independently.
                            Perfect for contractors who prefer to handle everything themselves.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link to="/diy-service" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center">
                                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                                Start DIY Projects
                            </Link>
                            <button className="bg-white text-green-600 border border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 flex items-center">
                                <PhoneIcon className="w-5 h-5 mr-2" />
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">{feature}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple Pricing</h3>
                            <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="bg-green-50 rounded-xl border-2 border-green-200 p-8 text-center">
                                <div className="mb-6">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">DIY Plan</h4>
                                    <p className="text-gray-600 mb-4">Perfect for getting started</p>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl font-bold text-green-600">Free</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8 text-left">
                                    {features.slice(0, 6).map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/diy-service" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium inline-block text-center">
                                    Start DIY Projects
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Limitations */}
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-8 mb-16">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-yellow-800 mb-4">DIY Limitations</h3>
                                <ul className="space-y-2">
                                    {limitations.map((limitation, index) => (
                                        <li key={index} className="flex items-center text-yellow-700">
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                            {limitation}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <UserGroupIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Need More Support?</h3>
                                    <p className="text-gray-600">Upgrade to DIT for expert guidance</p>
                                </div>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Expert consultation calls</li>
                                <li>• Business strategy guidance</li>
                                <li>• Priority support</li>
                            </ul>
                            <Link to="/service-tiers/dit/dashboard" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                Learn More About DIT
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <StarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Want Full Service?</h3>
                                    <p className="text-gray-600">Upgrade to DIFY for complete management</p>
                                </div>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Dedicated project manager</li>
                                <li>• Outsourced accounting</li>
                                <li>• S.Q.B Concierge Service</li>
                            </ul>
                            <Link to="/service-tiers/dify" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                                Learn More About DIFY
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of contractors who started with our free DIY tools
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link to="/diy-service" className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center">
                                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                                Start DIY Projects
                            </Link>
                            <button className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-400 flex items-center">
                                <PhoneIcon className="w-5 h-5 mr-2" />
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

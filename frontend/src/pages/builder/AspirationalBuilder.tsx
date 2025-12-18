import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
    HomeIcon,
    ClipboardDocumentListIcon,
    CalculatorIcon,
    MapPinIcon,
    UsersIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    StarIcon,
    ShieldCheckIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function AspirationalBuilder() {
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);

    return (
        <>

            <Helmet><title>Aspirational Builder Portal - The Central Hub - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">

                {/* Service Model Selection */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'serif' }}>For Aspirational Builders: 'Start Your Building Journey'</h2>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select your service model</h3>
                            <h4 className="text-xl font-bold text-gray-900 mb-4">Tiered Service Model</h4>
                            <p className="text-lg text-gray-600">Choose the level of support that fits your needs</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* DIY - Do It Yourself */}
                            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">DIY - Do It Yourself</h3>
                                <p className="text-gray-600 mb-6">Self-service tools and resources for independent users</p>

                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Access to all basic features</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Self-guided tutorials</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Community support</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Standard templates</span>
                                    </li>
                                </ul>

                                <div className="mt-8">
                                    <Link to="/diy-service" className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block text-center">
                                        Choose DIY
                                    </Link>
                                </div>
                            </div>

                            {/* DIT - Do It Together */}
                            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Popular</span>
                                </div>

                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">DIT - Do It Together</h3>
                                <p className="text-gray-600 mb-6">Guided support with expert consultation and coaching</p>

                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Everything in DIY</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Expert consultation calls</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Personalized guidance</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Priority support</span>
                                    </li>
                                </ul>

                                <div className="mt-8">
                                    <Link to="/service-tiers/dit/dashboard" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center">
                                        Choose DIT
                                    </Link>
                                </div>
                            </div>

                            {/* DIFY - Do It For You */}
                            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">DIFY - Do It For You</h3>
                                <p className="text-gray-600 mb-6">Full-service management with dedicated concierge support</p>

                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Everything in DIT</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Dedicated project manager</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>Full project execution</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="text-gray-400">•</span>
                                        <span>S.Q.B Concierge Service</span>
                                    </li>
                                </ul>

                                <div className="mt-8">
                                    <Link to="/service-tiers/dify" className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block text-center">
                                        Choose DIFY
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Your Guided Path to Building */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <HomeIcon className="w-4 h-4" />
                                <span>Aspirational Builder Portal</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                Your Guided Path to
                                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Building</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                "Your guided, stress-free path to building a quality home." Navigate Zimbabwe's construction landscape with confidence using our comprehensive roadmap and tools.
                            </p>
                        </div>
                    </div>
                </section>

                {/* User Profile Details */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">


                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Profile Info */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-start space-x-6 mb-6">
                                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            T
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Tendai Moyo</h3>
                                            <p className="text-lg text-gray-700 mb-1">Moyo Construction</p>
                                            <p className="text-blue-600 font-medium">General Contractor</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-600">Verified</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-600">Insured</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">
                                        Experienced general contractor specializing in residential construction and renovations. Known for quality work and timely completion.
                                    </p>

                                    <div className="flex items-center space-x-6 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">Harare</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span className="text-gray-600">4.9 (47 reviews)</span>
                                        </div>
                                        <div className="text-gray-600">15 years experience</div>
                                    </div>

                                    <div className="flex items-center space-x-2 mb-6">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Available</span>
                                        <span className="text-gray-600">Within 2 hours</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Residential Construction</span>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Renovations</span>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Project Management</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Zimbabwe Building Contractors Association</li>
                                                <li>• Project Management Professional</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="font-semibold text-gray-900 mb-3">Recent Work</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Modern House - Borrowdale</span>
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Townhouse Complex - Avondale</span>
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Office Renovation - CBD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Contact & Pricing */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-600">+263 77 123 4567</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-600">tendai@moyoconstruction.co.zw</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                                                <a href="#" className="text-blue-600 hover:text-blue-700">www.moyoconstruction.co.zw</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Price Range:</h4>
                                        <p className="text-lg font-semibold text-gray-900">$50 - $100 per hour</p>
                                    </div>

                                    <div className="space-y-3">

                                        <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <Link
                                to="/contractors-directory"
                                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <span>View All Contractors</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Construction Roadmap */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Construction Roadmap</h2>
                            <p className="text-xl text-gray-600">A step-by-step, phase-by-phase interactive guide to building in Zimbabwe</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drafting & Designing</h3>
                                <h4 className="text-lg font-medium text-blue-700 mb-3">Pre-Construction</h4>
                                <p className="text-gray-600 mb-4">Planning, permits, and preparation phase</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Land acquisition & title verification</li>
                                    <li>• Council approvals & permits</li>
                                    <li>• Architectural plans & designs</li>
                                    <li>• Budget planning & financing</li>
                                </ul>
                                <Link to="/construction-roadmap" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                                    Start Phase
                                </Link>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <HomeIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Budgeting & Building Planning</h3>
                                <h4 className="text-lg font-medium text-green-700 mb-3">The Build</h4>
                                <p className="text-gray-600 mb-4">Active construction and project management</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Foundation & structure</li>
                                    <li>• Roofing & weatherproofing</li>
                                    <li>• Electrical & plumbing</li>
                                    <li>• Quality control & inspections</li>
                                </ul>
                                <Link to="/budgeting-building-planning" className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
                                    Start Phase
                                </Link>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Building</h3>
                                <h4 className="text-lg font-medium text-purple-700 mb-3">Finishing</h4>
                                <p className="text-gray-600 mb-4">Final touches and completion</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Interior finishes & fixtures</li>
                                    <li>• Painting & decoration</li>
                                    <li>• Final inspections & certificates</li>
                                    <li>• Handover & documentation</li>
                                </ul>
                                <Link to="/building" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block">
                                    Start Phase
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Features */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <button
                                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                                className="flex items-center justify-center space-x-3 text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors mx-auto"
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

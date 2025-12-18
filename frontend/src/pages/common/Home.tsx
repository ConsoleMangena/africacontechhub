import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { 
    HomeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    ShoppingCartIcon,
    SparklesIcon, 
    ChartBarIcon, 
    UsersIcon, 
    CurrencyDollarIcon,
    ShieldCheckIcon,
    ClockIcon,
    StarIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
    ArrowRightIcon,
    PlayIcon,
    WrenchScrewdriverIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

interface HomeProps {
    // Props will be added as needed for each portal
}

export default function Home({}: HomeProps) {

    return (
        <>
        <AppLayout>
            <Helmet><title>The Central Hub - Zimbabwe's Construction Digital Backbone - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
                {/* Hero Section */}
                <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span>Zimbabwe's Construction Digital Backbone</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                Build with
                                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent"> Confidence</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                                The unified digital ecosystem for Zimbabwe's construction industry. Empowering Aspirational Builders, Contractors, and Material Suppliers with the tools to build securely, efficiently, and profitably.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Four Portal Gateways */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Portal</h2>
                            <p className="text-xl text-gray-600">Four distinct portals designed for your specific needs</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Aspirational Builder Portal */}
                            <Link to="/aspirational-builder" className="group">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <HomeIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Aspirational Builder</h3>
                                    <p className="text-gray-600 mb-4">Your guided, stress-free path to building a quality home</p>
                                    <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                                        <span>Enter Portal</span>
                                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            {/* Contractor Management Suite */}
                            <Link to="/contractor-suite" className="group">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Contractor Suite</h3>
                                    <p className="text-gray-600 mb-4">The command center to eliminate profit fade and scale your business</p>
                                    <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                                        <span>Enter Portal</span>
                                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            {/* Supplier Growth Platform */}
                            <Link to="/supplier-platform" className="group">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <TruckIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Supplier Platform</h3>
                                    <p className="text-gray-600 mb-4">Streamline operations and compete on value, not just price</p>
                                    <div className="flex items-center text-orange-600 font-medium group-hover:text-orange-700">
                                        <span>Enter Portal</span>
                                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            {/* The Central Hub Marketplace */}
                            <Link to="/marketplace" className="group">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <ShoppingCartIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Marketplace</h3>
                                    <p className="text-gray-600 mb-4">Open market for buying and selling construction goods and assets</p>
                                    <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                                        <span>Enter Portal</span>
                                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                            </div>
                            </Link>
                        </div>
                        </div>
                    </section>

                {/* Value Propositions */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Value Propositions</h2>
                            <p className="text-xl text-gray-600">Tailored solutions for every stakeholder in Zimbabwe's construction industry</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <HomeIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">For Aspirational Builders</h3>
                                <p className="text-gray-600 mb-4">"Your guided, stress-free path to building a quality home."</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Construction Roadmap & Cost Calculator</li>
                                    <li>• Professional Directory & Reviews</li>
                                    <li>• Diaspora Guide & Remote Management</li>
                                    <li>• S.Q.B Concierge Service</li>
                                </ul>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">For Builders & Contractors</h3>
                                <p className="text-gray-600 mb-4">"The command center to eliminate profit fade and scale your business."</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Profit Fade Alerts & Dashboard</li>
                                    <li>• Project Management Hub</li>
                                    <li>• Financial Tools & Change Orders</li>
                                    <li>• Subcontractor Management</li>
                                </ul>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                                    <TruckIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">For Material Suppliers</h3>
                                <p className="text-gray-600 mb-4">"The platform to streamline operations and compete on value, not just price."</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Quote-to-Cash Workflow</li>
                                    <li>• Inventory & Supply Chain Management</li>
                                    <li>• Value Engineering Proposals</li>
                                    <li>• TCO Calculator & Analytics</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Tiers */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tiered Service Model</h2>
                            <p className="text-xl text-gray-600">Choose the level of support that fits your needs</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mb-4">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">DIY - Do It Yourself</h3>
                                <p className="text-gray-600 mb-4">Self-service tools and resources for independent users</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Access to all basic features</li>
                                    <li>• Self-guided tutorials</li>
                                    <li>• Community support</li>
                                    <li>• Standard templates</li>
                                </ul>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-blue-200 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Popular</span>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">DIT - Do It Together</h3>
                                <p className="text-gray-600 mb-4">Guided support with expert consultation and coaching</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Everything in DIY</li>
                                    <li>• Expert consultation calls</li>
                                    <li>• Personalized guidance</li>
                                    <li>• Priority support</li>
                                </ul>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">DIFY - Do It For You</h3>
                                <p className="text-gray-600 mb-4">Full-service management with dedicated concierge support</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Everything in DIT</li>
                                    <li>• Dedicated project manager</li>
                                    <li>• Full project execution</li>
                                    <li>• S.Q.B Concierge Service</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-orange-500">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Zimbabwe's Construction Industry?</h2>
                        <p className="text-xl text-blue-100 mb-8">Join the digital revolution that's building Zimbabwe's future, one project at a time.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/aspirational-builder"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <HomeIcon className="w-5 h-5" />
                                <span>Start Building</span>
                            </Link>
                            <Link 
                                to="/contractor-suite"
                                className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                <span>Manage Projects</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
        </>
    );
}
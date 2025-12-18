import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { 
    ArrowLeftIcon,
    StarIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    SparklesIcon,
    CogIcon,
    DocumentTextIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline'

export default function SqbTool() {
    const [selectedPlan, setSelectedPlan] = useState('premium')

    const features = [
        {
            icon: CurrencyDollarIcon,
            title: 'Advanced Financial Management',
            description: 'AI-powered cost estimation, profit margin optimization, and automated invoicing',
            premium: true
        },
        {
            icon: ChartBarIcon,
            title: 'Real-time Analytics Dashboard',
            description: 'Comprehensive project analytics, performance metrics, and predictive insights',
            premium: true
        },
        {
            icon: UserGroupIcon,
            title: 'Concierge Service',
            description: 'Dedicated account manager for project coordination and business growth',
            premium: true
        },
        {
            icon: ShieldCheckIcon,
            title: 'Premium Verification',
            description: 'Enhanced contractor verification, insurance tracking, and compliance monitoring',
            premium: true
        },
        {
            icon: ClockIcon,
            title: 'Priority Support',
            description: '24/7 priority support with dedicated phone and email channels',
            premium: true
        },
        {
            icon: DocumentTextIcon,
            title: 'Advanced Reporting',
            description: 'Custom reports, financial statements, and regulatory compliance documents',
            premium: true
        }
    ]

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 0,
            period: 'month',
            description: 'Essential project management tools',
            features: [
                'Project Management Hub',
                'Basic Financial Tools',
                'Standard Support',
                'Basic Analytics'
            ],
            limitations: [
                'Limited to 3 active projects',
                'Basic reporting only',
                'Email support only'
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 99,
            period: 'month',
            description: 'Advanced features for growing contractors',
            features: [
                'Unlimited Projects',
                'Advanced Financial Tools',
                'Real-time Analytics',
                'Priority Support',
                'Concierge Service',
                'Advanced Reporting'
            ],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 299,
            period: 'month',
            description: 'Full-featured solution for large contractors',
            features: [
                'Everything in Premium',
                'Custom Integrations',
                'Dedicated Account Manager',
                'White-label Options',
                'API Access',
                'Custom Training'
            ]
        }
    ]

    const testimonials = [
        {
            name: 'John Mwangi',
            company: 'Mwangi Construction Ltd',
            rating: 5,
            text: 'The S.Q.B Tool has transformed our business. We\'ve increased our profit margins by 35% and our project completion rate by 50%.'
        },
        {
            name: 'Sarah Kimani',
            company: 'Kimani Builders',
            rating: 5,
            text: 'The concierge service is incredible. They helped us secure 3 major contracts in just 2 months. ROI was immediate.'
        },
        {
            name: 'David Ochieng',
            company: 'Ochieng & Associates',
            rating: 5,
            text: 'The financial management tools are game-changing. We can now accurately predict project costs and optimize our pricing.'
        }
    ]

    return (
        <>
        
            <Helmet><title>S.Q.B Tool (Premium) - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
                                    <h1 className="text-3xl font-bold text-gray-900">S.Q.B Tool (Premium)</h1>
                                    <p className="text-gray-600">Advanced concierge features for deep financial, operational, and strategic management</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-yellow-600">
                                    <StarIcon className="w-5 h-5 mr-1" />
                                    <span className="font-medium">Premium Service</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Premium Service</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Scale Your Business with
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> S.Q.B Tool</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Advanced concierge features for deep financial, operational, and strategic management. 
                            Get dedicated support, AI-powered insights, and premium tools to grow your construction business.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center">
                                <PhoneIcon className="w-5 h-5 mr-2" />
                                Schedule Demo
                            </button>
                            <button className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 flex items-center">
                                <EnvelopeIcon className="w-5 h-5 mr-2" />
                                Contact Sales
                            </button>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    {feature.premium && (
                                        <div className="ml-3 flex items-center text-yellow-600">
                                            <StarIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">Premium</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h3>
                            <p className="text-xl text-gray-600">Flexible pricing to match your business needs</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div 
                                    key={plan.id}
                                    className={`relative rounded-xl border-2 p-6 ${
                                        plan.popular 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="text-center mb-6">
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                                        <p className="text-gray-600 mb-4">{plan.description}</p>
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                            <span className="text-gray-600 ml-1">/{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.limitations && (
                                        <div className="mb-6">
                                            <h5 className="font-medium text-gray-900 mb-2">Limitations:</h5>
                                            <ul className="space-y-2">
                                                {plan.limitations.map((limitation, index) => (
                                                    <li key={index} className="flex items-center text-sm text-gray-600">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                                                        {limitation}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button 
                                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                            plan.popular
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        {plan.id === 'basic' ? 'Current Plan' : 'Choose Plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Premium Users Say</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-gray-600">{testimonial.company}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-3xl font-bold mb-4">Ready to Scale Your Business?</h3>
                        <p className="text-xl mb-8 opacity-90">
                            Join hundreds of contractors who have transformed their businesses with S.Q.B Tool Premium
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center">
                                <CogIcon className="w-5 h-5 mr-2" />
                                Start Free Trial
                            </button>
                            <button className="bg-indigo-500 text-white px-8 py-3 rounded-lg hover:bg-indigo-400 flex items-center">
                                <PhoneIcon className="w-5 h-5 mr-2" />
                                Talk to Sales
                            </button>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <PhoneIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                                <p className="text-gray-600">+254 700 000 000</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <EnvelopeIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                                <p className="text-gray-600">premium@dzenhare.com</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Support Hours</h4>
                                <p className="text-gray-600">24/7 Premium Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    )
}

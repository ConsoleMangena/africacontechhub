import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
    DocumentTextIcon,
    CubeIcon,
    LightBulbIcon,
    CalculatorIcon,
    ChartBarIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    SparklesIcon,
    BuildingOfficeIcon,
    CogIcon,
    UserGroupIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline'

const modules = [
    {
        id: 'quotes',
        title: 'Quote Generator',
        description: 'Create professional quotes with dynamic pricing and markup calculations.',
        icon: 'DocumentTextIcon',
        color: 'blue',
        features: ['Dynamic pricing', 'Markup calculations', 'Material cost tracking', 'Quote templates'],
        link: '/supplier/quotes',
        linkText: 'Generate Quotes'
    },
    {
        id: 'inventory',
        title: 'Inventory Management',
        description: 'Track stock levels, set reorder points, and manage your product catalog.',
        icon: 'CubeIcon',
        color: 'green',
        features: ['Real-time stock tracking', 'Automated reordering', 'Batch management', 'Multi-warehouse support'],
        link: '/supplier/inventory',
        linkText: 'Manage Inventory'
    },
    {
        id: 've-generator',
        title: 'Value Engineering Proposals',
        description: 'Generate value engineering proposals that demonstrate cost savings to clients.',
        icon: 'LightBulbIcon',
        color: 'purple',
        features: ['Cost comparison', 'Alternative products', 'ROI calculations', 'Client presentations'],
        link: '/supplier/ve-generator',
        linkText: 'Create Proposals'
    },
    {
        id: 'tco',
        title: 'TCO Calculator',
        description: 'Calculate total cost of ownership to help clients make informed decisions.',
        icon: 'CalculatorIcon',
        color: 'orange',
        features: ['Lifecycle cost analysis', 'Maintenance projections', 'Energy efficiency', 'Comparison reports'],
        link: '/supplier/tco-calculator',
        linkText: 'Calculate TCO'
    },
    {
        id: 'analytics',
        title: 'Sales Analytics',
        description: 'Track performance metrics, sales trends, and customer insights.',
        icon: 'ChartBarIcon',
        color: 'red',
        features: ['Sales dashboards', 'Customer analytics', 'Product performance', 'Revenue forecasting'],
        link: '/supplier/analytics',
        linkText: 'View Analytics'
    },
    {
        id: 'bulk',
        title: 'Bulk Purchasing',
        description: 'Join bulk purchasing groups to get better prices and increase sales volume.',
        icon: 'ShoppingCartIcon',
        color: 'blue',
        features: ['Group discounts', 'Volume pricing', 'Supplier networks', 'Bid management'],
        link: '/supplier/bulk-purchasing',
        linkText: 'View Groups'
    }
]

const iconMap = {
    DocumentTextIcon,
    CubeIcon,
    LightBulbIcon,
    CalculatorIcon,
    ChartBarIcon,
    ShoppingCartIcon
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-50'
    },
    green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-50'
    },
    purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-50'
    },
    orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-50'
    },
    red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:bg-red-50'
    }
}

export default function SupplierPlatform() {
    return (
        <>
            <Helmet><title>Supplier Platform - The Central Hub</title></Helmet>

            <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <SparklesIcon className="w-4 h-4" />
                        <span>Complete Supplier Solution</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Streamline Your
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Supply Chain</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        From quote generation to inventory management, our platform provides everything
                        suppliers need to optimize operations and increase sales.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">24</p>
                                <p className="text-sm text-gray-600">Active Quotes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CubeIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">156</p>
                                <p className="text-sm text-gray-600">Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">8</p>
                                <p className="text-sm text-gray-600">Bulk Groups</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">$45K</p>
                                <p className="text-sm text-gray-600">This Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Supplier Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module) => {
                            const IconComponent = iconMap[module.icon] || DocumentTextIcon
                            const classes = colorClasses[module.color] || colorClasses.blue

                            return (
                                <>
                                <div
                                    key={module.id}
                                    className={`bg-white rounded-xl shadow-sm border ${classes.border} p-6 ${classes.hover} transition-all duration-200 hover:shadow-md`}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`w-12 h-12 ${classes.bg} rounded-lg flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${classes.text}`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 text-sm">{module.description}</p>

                                    <ul className="space-y-2 mb-4">
                                        {module.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={module.link}
                                        className={`inline-flex items-center ${classes.text} font-medium text-sm`}
                                    >
                                        {module.linkText}
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                                </>
                            )
                        })}
                    </div>
                </div>

                {/* Key Benefits */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-6 text-center">Why Suppliers Choose Us</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="w-7 h-7" />
                            </div>
                            <h4 className="font-semibold mb-2">Increase Sales</h4>
                            <p className="text-purple-100 text-sm">Streamlined quote-to-cash process increases conversion rates</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CubeIcon className="w-7 h-7" />
                            </div>
                            <h4 className="font-semibold mb-2">Optimize Inventory</h4>
                            <p className="text-purple-100 text-sm">Real-time tracking and automated reordering reduce costs</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LightBulbIcon className="w-7 h-7" />
                            </div>
                            <h4 className="font-semibold mb-2">Demonstrate Value</h4>
                            <p className="text-purple-100 text-sm">TCO calculations and value propositions win more deals</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
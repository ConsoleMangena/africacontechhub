import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { 
    ArrowLeftIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    CubeIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ArrowRightIcon,
    EyeIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function Analytics({ metrics = {}, trends = [] }) {
    const [timeRange, setTimeRange] = useState('3months')

    const timeRanges = [
        { id: '1month', name: '1 Month' },
        { id: '3months', name: '3 Months' },
        { id: '6months', name: '6 Months' },
        { id: '1year', name: '1 Year' }
    ]

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`
    }

    return (
        <>
        
            <Helmet><title>Analytics & Insights - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/supplier-platform" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    Back to Platform
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                                    <p className="text-gray-600">Sales performance, inventory optimization, and market trend analysis</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-red-600">
                                    <ChartBarIcon className="w-5 h-5 mr-1" />
                                    <span className="font-medium">Analytics Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Time Range Selector */}
                    <div className="mb-6">
                        <div className="flex space-x-4">
                            {timeRanges.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => setTimeRange(range.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        timeRange === range.id
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {range.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_revenue)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Quotes</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{metrics.total_quotes}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.conversion_rate)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Average Deal Size</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.average_deal_size)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CubeIcon className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Inventory Turnover</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{metrics.inventory_turnover}x</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UserGroupIcon className="h-8 w-8 text-pink-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Customer Satisfaction</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.customer_satisfaction)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trends Chart */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Revenue & Quote Trends</h3>
                            <p className="text-sm text-gray-600">Performance over the selected time period</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {trends.map((trend, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm font-medium text-gray-900">{trend.month}</div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-sm text-gray-600">
                                                    Revenue: <span className="font-medium text-green-600">{formatCurrency(trend.revenue)}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Quotes: <span className="font-medium text-blue-600">{trend.quotes}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Conversions: <span className="font-medium text-purple-600">{trend.conversions}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">
                                                Conversion: {((trend.conversions / trend.quotes) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Top Performing Products</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-green-600">1</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Premium Steel Package</div>
                                                <div className="text-sm text-gray-500">$125,000 revenue</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-green-600 font-medium">+15%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">2</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Concrete Solutions</div>
                                                <div className="text-sm text-gray-500">$98,000 revenue</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-green-600 font-medium">+8%</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-purple-600">3</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Electrical Components</div>
                                                <div className="text-sm text-gray-500">$76,000 revenue</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-green-600 font-medium">+12%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Inventory Alerts</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Steel Beams 12x6</div>
                                                <div className="text-sm text-gray-500">Low stock: 15 units</div>
                                            </div>
                                        </div>
                                        <button className="text-sm text-blue-600 hover:text-blue-700">Reorder</button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Concrete Mix 4000 PSI</div>
                                                <div className="text-sm text-gray-500">Out of stock</div>
                                            </div>
                                        </div>
                                        <button className="text-sm text-red-600 hover:text-red-700">Urgent Reorder</button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Electrical Wire 12 AWG</div>
                                                <div className="text-sm text-gray-500">Stock level: Good</div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-green-600">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recommended Actions</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Increase Quote Follow-up</h4>
                                        <p className="text-sm text-gray-600">Follow up on 12 pending quotes to improve conversion</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CubeIcon className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Restock Critical Items</h4>
                                        <p className="text-sm text-gray-600">Reorder 5 items that are low or out of stock</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <UserGroupIcon className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Customer Satisfaction</h4>
                                        <p className="text-sm text-gray-600">Reach out to 3 customers for feedback</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    )
}

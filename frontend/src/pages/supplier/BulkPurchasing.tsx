import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'

interface Group {
    id: number
    name: string
    description: string
    material_category: string
    location: string
    target_quantity: number
    target_price_per_unit: number
    current_price_per_unit?: number
    min_participants: number
    max_participants: number
    status: string
    order_deadline: string
    delivery_date?: string
    discount_percentage: number
    creator: {
        id: number
        name: string
    }
    members_count?: number
    active_members_count?: number
    total_ordered_quantity?: number
    total_order_value?: number
}

interface BulkPurchasingProps {
    groups?: {
        data: Group[]
        links: any[]
        meta: any
    }
    categories?: Record<string, string>
    popularGroups?: Group[]
    filters?: {
        material_category?: string
        location?: string
        status?: string
        min_discount?: number
        available_spots?: boolean
    }
}

export default function BulkPurchasing({ groups = { data: [], links: [], meta: {} }, categories = {}, popularGroups = [], filters = {} }: BulkPurchasingProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filterForm, setFilterForm] = useState(filters)

    const handleFilterChange = (key: string, value: any) => {
        setFilterForm(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        console.log("Navigate to:", '/bulk-purchasing', filterForm, {
            preserveState: true,
            replace: true
        })
    }

    const clearFilters = () => {
        setFilterForm({})
        console.log("Navigate to:", '/bulk-purchasing', {}, {
            preserveState: true,
            replace: true
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'collecting_orders': return 'bg-blue-100 text-blue-800'
            case 'processing': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Active'
            case 'collecting_orders': return 'Collecting Orders'
            case 'processing': return 'Processing'
            case 'completed': return 'Completed'
            case 'cancelled': return 'Cancelled'
            default: return status
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZW', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <>

            <Helmet><title>Bulk Purchasing - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Bulk Purchasing</h1>
                                <p className="mt-2 text-gray-600">
                                    Join or create groups for collective material purchasing at discounted rates
                                </p>
                            </div>
                            <Link
                                to="/bulk-purchasing/create"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Create Group
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FunnelIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                                    {/* Material Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Material Category
                                        </label>
                                        <select
                                            value={filterForm.material_category || ''}
                                            onChange={(e) => handleFilterChange('material_category', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">All Categories</option>
                                            {Object.entries(categories).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={filterForm.location || ''}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            placeholder="Enter location"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={filterForm.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="collecting_orders">Collecting Orders</option>
                                            <option value="processing">Processing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    {/* Minimum Discount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Discount (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={filterForm.min_discount || ''}
                                            onChange={(e) => handleFilterChange('min_discount', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Available Spots */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="available_spots"
                                            checked={filterForm.available_spots || false}
                                            onChange={(e) => handleFilterChange('available_spots', e.target.checked)}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="available_spots" className="ml-2 text-sm text-gray-700">
                                            Available spots only
                                        </label>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={applyFilters}
                                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Popular Groups */}
                            {popularGroups.length > 0 && (
                                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Groups</h3>
                                    <div className="space-y-3">
                                        {popularGroups.map((group) => (
                                            <Link
                                                key={group.id}
                                                to={`/bulk-purchasing/${group.id}`}
                                                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{group.name}</h4>
                                                        <p className="text-sm text-gray-600">{group.material_category}</p>
                                                    </div>
                                                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search groups..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Groups Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groups.data?.map((group) => (
                                    <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                                                <p className="text-sm text-gray-600">{categories[group.material_category]}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                                                {getStatusText(group.status)}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPinIcon className="w-4 h-4 mr-2" />
                                                {group.location}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <UserGroupIcon className="w-4 h-4 mr-2" />
                                                {group.active_members_count || 0} / {group.max_participants} members
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <ClockIcon className="w-4 h-4 mr-2" />
                                                Deadline: {formatDate(group.order_deadline)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                                                {formatCurrency(group.target_price_per_unit)} per unit
                                            </div>
                                            {group.discount_percentage > 0 && (
                                                <div className="flex items-center text-sm text-green-600">
                                                    <TagIcon className="w-4 h-4 mr-2" />
                                                    {group.discount_percentage}% discount
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Created by {group.creator.name}
                                            </div>
                                            <Link
                                                to={`/bulk-purchasing/${group.id}`}
                                                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                View Details
                                                <ArrowRightIcon className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {groups.links && groups.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {groups.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && console.log("Navigate to:", link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded-lg ${link.active
                                                        ? 'bg-purple-600 text-white'
                                                        : link.url
                                                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Empty State */}
                            {groups.data?.length === 0 && (
                                <div className="text-center py-12">
                                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
                                    <p className="text-gray-600 mb-6">
                                        Try adjusting your filters or create a new group to get started.
                                    </p>
                                    <Link
                                        to="/bulk-purchasing/create"
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        Create Group
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

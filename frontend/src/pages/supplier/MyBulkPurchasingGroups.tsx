import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon,
    ArrowRightIcon,
    PlusIcon,
    EyeIcon
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

interface MyBulkPurchasingGroupsProps {
    groups?: {
        data: Group[]
        links: any[]
        meta: any
    }
    filters?: {
        status?: string
    }
}

export default function MyBulkPurchasingGroups({ groups = { data: [], links: [], meta: {} }, filters = {} }: MyBulkPurchasingGroupsProps) {
    const [filterForm, setFilterForm] = useState(filters)

    const handleFilterChange = (key: string, value: any) => {
        setFilterForm(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        console.log("Navigate to:", '/bulk-purchasing/my-groups', filterForm, {
            preserveState: true,
            replace: true
        })
    }

    const clearFilters = () => {
        setFilterForm({})
        console.log("Navigate to:", '/bulk-purchasing/my-groups', {}, {
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

            <Helmet><title>My Bulk Purchasing Groups - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    to="/bulk-purchasing"
                                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">My Bulk Purchasing Groups</h1>
                                    <p className="mt-2 text-gray-600">
                                        Manage your bulk purchasing groups and orders
                                    </p>
                                </div>
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
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Groups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.data?.map((group) => (
                            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                                        <p className="text-sm text-gray-600 capitalize">{group.material_category}</p>
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
                                        <EyeIcon className="w-4 h-4 mr-1" />
                                        View
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
                                You haven't joined any bulk purchasing groups yet.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    to="/bulk-purchasing"
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Browse Groups
                                </Link>
                                <Link
                                    to="/bulk-purchasing/create"
                                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Create Group
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { 
    ArrowLeftIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UserIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Quotes({ quotes = [] }) {
    const [filter, setFilter] = useState('all')

    const filters = [
        { id: 'all', name: 'All Quotes', count: quotes?.length || 0 },
        { id: 'pending', name: 'Pending', count: quotes?.filter(q => q.status === 'pending').length || 0 },
        { id: 'approved', name: 'Approved', count: quotes?.filter(q => q.status === 'approved').length || 0 },
        { id: 'rejected', name: 'Rejected', count: quotes?.filter(q => q.status === 'rejected').length || 0 },
    ]

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'rejected':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Approved'
            case 'rejected':
                return 'Rejected'
            case 'pending':
                return 'Pending'
            default:
                return status
        }
    }

    const filteredQuotes = quotes?.filter(quote => {
        if (filter === 'all') return true
        return quote.status === filter
    }) || []

    return (
        <>
        
            <Helmet><title>Quote-to-Cash Module - The Central Hub - The Central Hub</title></Helmet>
            
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
                                    <h1 className="text-3xl font-bold text-gray-900">Quote-to-Cash Module</h1>
                                    <p className="text-gray-600">Streamlined workflow from quote templates to client approval, e-signatures, and invoicing</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex space-x-4">
                            {filters.map((filterItem) => (
                                <button
                                    key={filterItem.id}
                                    onClick={() => setFilter(filterItem.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        filter === filterItem.id
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {filterItem.name} ({filterItem.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quotes List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Quotes</h3>
                            <p className="text-sm text-gray-600">Manage your quotes and track their progress</p>
                        </div>
                        
                        {filteredQuotes.length === 0 ? (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all' 
                                        ? 'Get started by creating a new quote.'
                                        : `No ${filter} quotes found.`
                                    }
                                </p>
                                <div className="mt-6">
                                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        New Quote
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredQuotes.map((quote) => (
                                    <div key={quote.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {getStatusIcon(quote.status)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="text-lg font-medium text-gray-900 truncate">
                                                                {quote.quote_number}
                                                            </h4>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                                                                {getStatusText(quote.status)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {quote.client_name} • {quote.project_name}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                            <span className="flex items-center">
                                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                                ${quote.total_amount.toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                                                Created: {quote.created_at}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <ClockIcon className="w-4 h-4 mr-1" />
                                                                Expires: {quote.expires_at}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900 p-2">
                                                        <EyeIcon className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-indigo-600 hover:text-indigo-900 p-2">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900 p-2">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Quotes</dt>
                                        <dd className="text-lg font-medium text-gray-900">{quotes?.length || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {quotes?.filter(q => q.status === 'approved').length || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {quotes?.filter(q => q.status === 'pending').length || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            ${quotes?.reduce((sum, q) => sum + q.total_amount, 0).toLocaleString() || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    )
}

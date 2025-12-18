import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    LightBulbIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UserIcon,
    ArrowRightIcon,
    SparklesIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

interface Proposal {
    id: number | string
    proposal_name: string
    client_name: string
    status: string
    total_value: number
    created_at: string
}

export default function Proposals({ proposals = [] }: { proposals?: Proposal[] }) {
    const [filter, setFilter] = useState('all')

    const filters = [
        { id: 'all', name: 'All Proposals', count: proposals?.length || 0 },
        { id: 'draft', name: 'Draft', count: proposals?.filter(p => p.status === 'draft').length || 0 },
        { id: 'sent', name: 'Sent', count: proposals?.filter(p => p.status === 'sent').length || 0 },
        { id: 'approved', name: 'Approved', count: proposals?.filter(p => p.status === 'approved').length || 0 },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'sent':
                return <ClockIcon className="w-5 h-5 text-blue-500" />
            case 'draft':
                return <PencilIcon className="w-5 h-5 text-gray-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'sent':
                return 'bg-blue-100 text-blue-800'
            case 'draft':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved'
            case 'sent':
                return 'Sent'
            case 'draft':
                return 'Draft'
            default:
                return status
        }
    }

    const filteredProposals = proposals?.filter(proposal => {
        if (filter === 'all') return true
        return proposal.status === filter
    }) || []

    return (
        <>

            <Helmet><title>Value-Add Suite - The Central Hub - The Central Hub</title></Helmet>

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
                                    <h1 className="text-3xl font-bold text-gray-900">Value-Add Suite</h1>
                                    <p className="text-gray-600">VE Proposal Generator and TCO Calculator to create data-backed proposals for premium products</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link to="/supplier-platform/ve-proposal-generator" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Proposal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Value Proposition */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Demonstrate Value Beyond Price</h3>
                            <p className="text-lg text-gray-600 mb-6">
                                Create compelling proposals that showcase the true value of your premium products
                                through data-driven insights and total cost of ownership calculations.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <LightBulbIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">VE Proposal Generator</h4>
                                    <p className="text-sm text-gray-600">Create value-engineered proposals</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <ChartBarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">TCO Calculator</h4>
                                    <p className="text-sm text-gray-600">Calculate total cost of ownership</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">ROI Analysis</h4>
                                    <p className="text-sm text-gray-600">Show return on investment</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex space-x-4">
                            {filters.map((filterItem) => (
                                <button
                                    key={filterItem.id}
                                    onClick={() => setFilter(filterItem.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === filterItem.id
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {filterItem.name} ({filterItem.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Proposals List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Value Proposals</h3>
                            <p className="text-sm text-gray-600">Manage your value-engineered proposals</p>
                        </div>

                        {filteredProposals.length === 0 ? (
                            <div className="text-center py-12">
                                <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all'
                                        ? 'Get started by creating your first value proposal.'
                                        : `No ${filter} proposals found.`
                                    }
                                </p>
                                <div className="mt-6">
                                    <Link to="/supplier-platform/ve-proposal-generator" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        New Proposal
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredProposals.map((proposal) => (
                                    <div key={proposal.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {getStatusIcon(proposal.status)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="text-lg font-medium text-gray-900 truncate">
                                                                {proposal.proposal_name}
                                                            </h4>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                                                                {getStatusText(proposal.status)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {proposal.client_name}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                            <span className="flex items-center">
                                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                                ${proposal.total_value.toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                                                Created: {proposal.created_at}
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

                    {/* Quick Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <LightBulbIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">VE Proposal Generator</h3>
                                    <p className="text-gray-600">Create value-engineered proposals</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Generate compelling proposals that demonstrate the value of your premium products
                                through data-driven insights and cost-benefit analysis.
                            </p>
                            <Link to="/supplier-platform/ve-proposal-generator" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                                Create VE Proposal
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">TCO Calculator</h3>
                                    <p className="text-gray-600">Calculate total cost of ownership</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Demonstrate the true value of your products by calculating total cost of ownership
                                including maintenance, operational costs, and lifecycle benefits.
                            </p>
                            <Link to="/supplier-platform/tco-calculator" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                                Open TCO Calculator
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <LightBulbIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Proposals</dt>
                                        <dd className="text-lg font-medium text-gray-900">{proposals?.length || 0}</dd>
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
                                            {proposals?.filter(p => p.status === 'approved').length || 0}
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
                                            ${proposals?.reduce((sum, p) => sum + p.total_value, 0).toLocaleString() || 0}
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

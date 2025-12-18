import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

// Mock data for change orders
const mockChangeOrders = [
    {
        id: 1,
        title: 'Foundation Material Upgrade',
        change_order_number: 'CO-001',
        project: { title: 'Modern Office Complex' },
        description: 'Upgrade foundation concrete grade from C25 to C30 for increased structural integrity.',
        status: 'approved',
        change_amount: 15000,
        requested_date: '2024-01-15',
        approved_date: '2024-01-18',
        requires_signature: true,
        signed_at: '2024-01-18'
    },
    {
        id: 2,
        title: 'Additional Electrical Outlets',
        change_order_number: 'CO-002',
        project: { title: 'Residential Development' },
        description: 'Add 12 additional electrical outlets per floor as per revised client requirements.',
        status: 'pending_approval',
        change_amount: 8500,
        requested_date: '2024-01-20',
        approved_date: null,
        requires_signature: true,
        signed_at: null
    },
    {
        id: 3,
        title: 'Window Specification Change',
        change_order_number: 'CO-003',
        project: { title: 'Commercial Building' },
        description: 'Change windows from single to double glazed for improved energy efficiency.',
        status: 'rejected',
        change_amount: 25000,
        requested_date: '2024-01-10',
        approved_date: null,
        requires_signature: false,
        signed_at: null
    }
]

export default function ChangeOrders() {
    const [filter, setFilter] = useState('all')
    const [changeOrders] = useState(mockChangeOrders)

    const filters = [
        { id: 'all', name: 'All Orders', count: changeOrders.length },
        { id: 'pending', name: 'Pending', count: changeOrders.filter(co => co.status === 'pending_approval').length },
        { id: 'approved', name: 'Approved', count: changeOrders.filter(co => co.status === 'approved').length },
        { id: 'rejected', name: 'Rejected', count: changeOrders.filter(co => co.status === 'rejected').length },
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'rejected':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            case 'pending_approval':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending_approval':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved'
            case 'rejected': return 'Rejected'
            case 'pending_approval': return 'Pending Approval'
            default: return status
        }
    }

    const filteredOrders = changeOrders.filter(order => {
        if (filter === 'all') return true
        if (filter === 'pending') return order.status === 'pending_approval'
        if (filter === 'approved') return order.status === 'approved'
        if (filter === 'rejected') return order.status === 'rejected'
        return true
    })

    return (
        <>
            <Helmet><title>Change Orders - The Central Hub</title></Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Change Orders</h1>
                        <p className="text-gray-600">Create, send, and track change orders with e-signature integration</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Change Order
                    </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-4">
                    {filters.map((filterItem) => (
                        <button
                            key={filterItem.id}
                            onClick={() => setFilter(filterItem.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === filterItem.id
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {filterItem.name} ({filterItem.count})
                        </button>
                    ))}
                </div>

                {/* Change Orders List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Change Orders</h3>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No change orders</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all'
                                    ? 'Get started by creating a new change order.'
                                    : `No ${filter} change orders found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="text-lg font-medium text-gray-900 truncate">
                                                            {order.title}
                                                        </h4>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Order #{order.change_order_number} • {order.project?.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        {order.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 ml-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    ${order.change_amount?.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Change Amount
                                                </div>
                                            </div>

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

                                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center space-x-4">
                                            <span>Requested: {order.requested_date}</span>
                                            {order.approved_date && (
                                                <span>Approved: {order.approved_date}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {order.requires_signature && !order.signed_at && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Requires Signature
                                                </span>
                                            )}
                                            {order.signed_at && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Signed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DocumentTextIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-lg font-medium text-gray-900">{changeOrders.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {changeOrders.filter(co => co.status === 'approved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <ClockIcon className="h-8 w-8 text-yellow-600" />
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {changeOrders.filter(co => co.status === 'pending_approval').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

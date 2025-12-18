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
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline'

// Mock useForm for now
const useForm = (initialValues: any) => {
    const [data, setData] = useState(initialValues)
    return {
        data,
        setData: (key: string | any, value?: any) => {
            if (typeof key === 'string') {
                setData({ ...data, [key]: value })
            } else {
                setData(key)
            }
        },
        post: (url: string, options?: any) => {
            console.log('Post:', url, data)
            if (options?.onSuccess) options.onSuccess()
        },
        processing: false,
        errors: {} as any
    }
}

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
    supplier_info?: {
        name: string
        contact: string
        email: string
        phone: string
    }
    terms_conditions?: string
    creator: {
        id: number
        name: string
        email: string
    }
    members: Array<{
        id: number
        user: {
            id: number
            name: string
            email: string
        }
        role: string
        status: string
        joined_at: string
    }>
    materials: Array<{
        id: number
        material_name: string
        specifications?: string
        quantity: number
        unit: string
        unit_price: number
        total_price: number
        status: string
        notes?: string
        user: {
            id: number
            name: string
        }
    }>
}

interface Statistics {
    total_members: number
    active_members: number
    total_orders: number
    total_quantity: number
    total_value: number
    average_order_value: number
    completion_percentage: number
}

interface UserMembership {
    id: number
    role: string
    status: string
}

interface BulkPurchasingGroupProps {
    group?: Group
    statistics?: Statistics
    userMembership?: UserMembership | null
}

export default function BulkPurchasingGroup({
    group = { id: 0, name: '', description: '', material_category: '', location: '', target_quantity: 0, target_price_per_unit: 0, min_participants: 0, max_participants: 0, status: '', order_deadline: '', discount_percentage: 0, creator: { id: 0, name: '', email: '' }, members: [], materials: [] },
    statistics = { total_members: 0, active_members: 0, total_orders: 0, total_quantity: 0, total_value: 0, average_order_value: 0, completion_percentage: 0 },
    userMembership = null
}: BulkPurchasingGroupProps) {
    const [showAddMaterial, setShowAddMaterial] = useState(false)
    const [showMembers, setShowMembers] = useState(false)

    const { data: materialData, setData: setMaterialData, post: postMaterial, processing: materialProcessing, errors: materialErrors } = useForm({
        material_name: '',
        specifications: '',
        quantity: '',
        unit: '',
        unit_price: '',
        notes: ''
    })

    const handleAddMaterial = (e: React.FormEvent) => {
        e.preventDefault()
        postMaterial(`/bulk-purchasing/${group.id}/materials`, {
            onSuccess: () => {
                setShowAddMaterial(false)
                setMaterialData({
                    material_name: '',
                    specifications: '',
                    quantity: '',
                    unit: '',
                    unit_price: '',
                    notes: ''
                })
            }
        })
    }

    const handleJoin = () => {
        console.log("POST to:", `/bulk-purchasing/${group.id}/join`)
    }

    const handleLeave = () => {
        console.log("POST to:", `/bulk-purchasing/${group.id}/leave`)
    }

    const handleApproveMember = (memberId: number) => {
        console.log("POST to:", `/bulk-purchasing/${group.id}/members/${memberId}/approve`)
    }

    const handleProcessOrders = () => {
        console.log("POST to:", `/bulk-purchasing/${group.id}/process-orders`)
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

    const isCreator = userMembership?.role === 'creator'
    const isAdmin = userMembership?.role === 'admin'
    const isApprovedMember = userMembership?.status === 'approved'
    const isFull = statistics.active_members >= group.max_participants
    const canJoin = !userMembership && group.status === 'active' && !isFull
    const canLeave = userMembership && userMembership.status === 'approved' && !isCreator

    return (
        <>
            <Helmet><title>{group.name}</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    to="/bulk-purchasing"
                                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                                    <p className="mt-2 text-gray-600">{group.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.status)}`}>
                                    {getStatusText(group.status)}
                                </span>
                                {canJoin && (
                                    <button
                                        onClick={handleJoin}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Join Group
                                    </button>
                                )}
                                {canLeave && (
                                    <button
                                        onClick={handleLeave}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Leave Group
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Group Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPinIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Location:</span>
                                            <span className="ml-2">{group.location}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <TagIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Category:</span>
                                            <span className="ml-2 capitalize">{group.material_category}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CurrencyDollarIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Target Price:</span>
                                            <span className="ml-2">{formatCurrency(group.target_price_per_unit)} per unit</span>
                                        </div>
                                        {group.discount_percentage > 0 && (
                                            <div className="flex items-center text-sm text-green-600">
                                                <TagIcon className="w-4 h-4 mr-3" />
                                                <span className="font-medium">Discount:</span>
                                                <span className="ml-2">{group.discount_percentage}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <UserGroupIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Participants:</span>
                                            <span className="ml-2">{statistics.active_members} / {group.max_participants}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Deadline:</span>
                                            <span className="ml-2">{formatDate(group.order_deadline)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-3" />
                                            <span className="font-medium">Created by:</span>
                                            <span className="ml-2">{group.creator.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {group.supplier_info && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Supplier Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Name:</span>
                                                <p className="text-sm text-gray-600">{group.supplier_info.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Contact:</span>
                                                <p className="text-sm text-gray-600">{group.supplier_info.contact}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Email:</span>
                                                <p className="text-sm text-gray-600">{group.supplier_info.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Phone:</span>
                                                <p className="text-sm text-gray-600">{group.supplier_info.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {group.terms_conditions && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Terms & Conditions</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{group.terms_conditions}</p>
                                    </div>
                                )}
                            </div>

                            {/* Materials */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Materials Ordered</h2>
                                    {isApprovedMember && group.status === 'active' && (
                                        <button
                                            onClick={() => setShowAddMaterial(true)}
                                            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Material
                                        </button>
                                    )}
                                </div>

                                {group.materials.length > 0 ? (
                                    <div className="space-y-3">
                                        {group.materials.map((material) => (
                                            <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{material.material_name}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {material.quantity} {material.unit} × {formatCurrency(material.unit_price)} = {formatCurrency(material.total_price)}
                                                        </p>
                                                        {material.specifications && (
                                                            <p className="text-sm text-gray-500 mt-1">{material.specifications}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-medium text-gray-900">{formatCurrency(material.total_price)}</span>
                                                        <p className="text-sm text-gray-600">by {material.user.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No materials ordered yet</h3>
                                        <p className="text-gray-600">
                                            {isApprovedMember ? 'Add your first material order to get started.' : 'Join the group to start ordering materials.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Add Material Modal */}
                            {showAddMaterial && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Material Order</h3>

                                        <form onSubmit={handleAddMaterial} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Material Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={materialData.material_name}
                                                    onChange={(e) => setMaterialData('material_name', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    required
                                                />
                                                {materialErrors.material_name && <p className="text-sm text-red-600">{materialErrors.material_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Specifications
                                                </label>
                                                <textarea
                                                    value={materialData.specifications}
                                                    onChange={(e) => setMaterialData('specifications', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Quantity *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={materialData.quantity}
                                                        onChange={(e) => setMaterialData('quantity', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        min="1"
                                                        required
                                                    />
                                                    {materialErrors.quantity && <p className="text-sm text-red-600">{materialErrors.quantity}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unit *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={materialData.unit}
                                                        onChange={(e) => setMaterialData('unit', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder="e.g., bags, tons"
                                                        required
                                                    />
                                                    {materialErrors.unit && <p className="text-sm text-red-600">{materialErrors.unit}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={materialData.unit_price}
                                                    onChange={(e) => setMaterialData('unit_price', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    min="0"
                                                    required
                                                />
                                                {materialErrors.unit_price && <p className="text-sm text-red-600">{materialErrors.unit_price}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={materialData.notes}
                                                    onChange={(e) => setMaterialData('notes', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddMaterial(false)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={materialProcessing}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                                >
                                                    {materialProcessing ? 'Adding...' : 'Add Material'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Statistics</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Members</span>
                                        <span className="text-sm font-medium text-gray-900">{statistics.total_members}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Active Members</span>
                                        <span className="text-sm font-medium text-gray-900">{statistics.active_members}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Orders</span>
                                        <span className="text-sm font-medium text-gray-900">{statistics.total_orders}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Quantity</span>
                                        <span className="text-sm font-medium text-gray-900">{statistics.total_quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Value</span>
                                        <span className="text-sm font-medium text-gray-900">{formatCurrency(statistics.total_value)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Order Value</span>
                                        <span className="text-sm font-medium text-gray-900">{formatCurrency(statistics.average_order_value)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">Progress</span>
                                        <span className="text-sm font-medium text-gray-900">{Math.round(statistics.completion_percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${statistics.completion_percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Members */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                                    <button
                                        onClick={() => setShowMembers(!showMembers)}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                        {showMembers ? 'Hide' : 'Show All'}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {group.members.slice(0, showMembers ? group.members.length : 5).map((member) => (
                                        <div key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                                    <p className="text-xs text-gray-500">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {member.status === 'pending' && (isCreator || isAdmin) && (
                                                    <button
                                                        onClick={() => handleApproveMember(member.id)}
                                                        className="p-1 text-green-600 hover:text-green-700"
                                                        title="Approve member"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs ${member.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {member.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            {isCreator && group.status === 'collecting_orders' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Actions</h3>
                                    <button
                                        onClick={handleProcessOrders}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Process Orders
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

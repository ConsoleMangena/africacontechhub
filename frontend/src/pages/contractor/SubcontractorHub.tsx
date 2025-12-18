import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    UserGroupIcon,
    PlusIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    BuildingOfficeIcon
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

interface Contractor {
    id: number
    business_name: string
    specialty: string
    location: string
}

interface Subcontractor {
    id: number
    company_name: string
    contact_person: string
    email: string
    phone: string
    address: string
    specialty: string
    license_number: string
    insurance_provider: string
    insurance_policy_number: string
    insurance_expiry: string
    hourly_rate: number
    status: string
    certifications: string[]
    agreements: string[]
    notes: string
}

interface SubcontractorHubProps {
    contractor?: Contractor
    subcontractors?: {
        subcontractors: Subcontractor[]
        active: Subcontractor[]
        insurance_expiring: Subcontractor[]
        expired_insurance: Subcontractor[]
    }
}

export default function SubcontractorHub({
    contractor = { id: 0, business_name: '', specialty: '', location: '' },
    subcontractors = { subcontractors: [], active: [], insurance_expiring: [], expired_insurance: [] }
}: SubcontractorHubProps) {
    const [showAddSubcontractor, setShowAddSubcontractor] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const { data: subcontractorData, setData: setSubcontractorData, post: postSubcontractor, processing: subcontractorProcessing, errors: subcontractorErrors } = useForm({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        specialty: '',
        license_number: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_expiry: '',
        hourly_rate: '',
        status: 'active',
        certifications: [],
        agreements: [],
        notes: ''
    })

    const handleAddSubcontractor = (e: React.FormEvent) => {
        e.preventDefault()
        postSubcontractor('/project-management/subcontractors', {
            onSuccess: () => {
                setShowAddSubcontractor(false)
                setSubcontractorData({
                    company_name: '',
                    contact_person: '',
                    email: '',
                    phone: '',
                    address: '',
                    specialty: '',
                    license_number: '',
                    insurance_provider: '',
                    insurance_policy_number: '',
                    insurance_expiry: '',
                    hourly_rate: '',
                    status: 'active',
                    certifications: [],
                    agreements: [],
                    notes: ''
                })
            }
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            case 'suspended': return 'bg-yellow-100 text-yellow-800'
            case 'terminated': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Active'
            case 'inactive': return 'Inactive'
            case 'suspended': return 'Suspended'
            case 'terminated': return 'Terminated'
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

    const isInsuranceExpiring = (expiryDate: string) => {
        if (!expiryDate) return false
        const expiry = new Date(expiryDate)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        return expiry <= thirtyDaysFromNow
    }

    const isInsuranceExpired = (expiryDate: string) => {
        if (!expiryDate) return false
        const expiry = new Date(expiryDate)
        const today = new Date()
        return expiry < today
    }

    const filteredSubcontractors = subcontractors.subcontractors.filter(sub => {
        const matchesSearch = sub.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = !statusFilter || sub.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <>

            <Helmet><title>Subcontractor Hub - The Central Hub - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/project-management" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    Back to Projects
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Subcontractor Hub</h1>
                                    <p className="text-gray-600">Manage agreements, track compliance documents, and facilitate communication</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddSubcontractor(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Subcontractor
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Subcontractors</p>
                                    <p className="text-2xl font-bold text-gray-900">{subcontractors.subcontractors.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">{subcontractors.active.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Insurance Expiring</p>
                                    <p className="text-2xl font-bold text-gray-900">{subcontractors.insurance_expiring.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Expired Insurance</p>
                                    <p className="text-2xl font-bold text-gray-900">{subcontractors.expired_insurance.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search subcontractors..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Subcontractors Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubcontractors.map((subcontractor) => (
                            <div key={subcontractor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{subcontractor.company_name}</h3>
                                        <p className="text-sm text-gray-600">{subcontractor.specialty}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subcontractor.status)}`}>
                                        {getStatusText(subcontractor.status)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                                        {subcontractor.contact_person}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                                        {subcontractor.email}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <PhoneIcon className="w-4 h-4 mr-2" />
                                        {subcontractor.phone}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPinIcon className="w-4 h-4 mr-2" />
                                        {subcontractor.address}
                                    </div>
                                    {subcontractor.hourly_rate && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium">Rate:</span>
                                            <span className="ml-2">{formatCurrency(subcontractor.hourly_rate)}/hour</span>
                                        </div>
                                    )}
                                </div>

                                {/* Insurance Status */}
                                {subcontractor.insurance_expiry && (
                                    <div className="mb-4">
                                        {isInsuranceExpired(subcontractor.insurance_expiry) ? (
                                            <div className="flex items-center text-sm text-red-600">
                                                <XCircleIcon className="w-4 h-4 mr-2" />
                                                Insurance Expired ({formatDate(subcontractor.insurance_expiry)})
                                            </div>
                                        ) : isInsuranceExpiring(subcontractor.insurance_expiry) ? (
                                            <div className="flex items-center text-sm text-yellow-600">
                                                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                                Insurance Expiring Soon ({formatDate(subcontractor.insurance_expiry)})
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-sm text-green-600">
                                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                Insurance Valid ({formatDate(subcontractor.insurance_expiry)})
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {subcontractor.certifications?.length || 0} certifications
                                    </div>
                                    <button className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
                                        <EyeIcon className="w-4 h-4 mr-1" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredSubcontractors.length === 0 && (
                        <div className="text-center py-12">
                            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No subcontractors found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'You don\'t have any subcontractors yet. Add your first subcontractor to get started.'
                                }
                            </p>
                            <button
                                onClick={() => setShowAddSubcontractor(true)}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add Subcontractor
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Subcontractor Modal */}
                {showAddSubcontractor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Subcontractor</h3>

                            <form onSubmit={handleAddSubcontractor} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.company_name}
                                            onChange={(e) => setSubcontractorData('company_name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        {subcontractorErrors.company_name && <p className="text-sm text-red-600">{subcontractorErrors.company_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.contact_person}
                                            onChange={(e) => setSubcontractorData('contact_person', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        {subcontractorErrors.contact_person && <p className="text-sm text-red-600">{subcontractorErrors.contact_person}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={subcontractorData.email}
                                            onChange={(e) => setSubcontractorData('email', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        {subcontractorErrors.email && <p className="text-sm text-red-600">{subcontractorErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                        <input
                                            type="tel"
                                            value={subcontractorData.phone}
                                            onChange={(e) => setSubcontractorData('phone', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        {subcontractorErrors.phone && <p className="text-sm text-red-600">{subcontractorErrors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                    <textarea
                                        value={subcontractorData.address}
                                        onChange={(e) => setSubcontractorData('address', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={2}
                                        required
                                    />
                                    {subcontractorErrors.address && <p className="text-sm text-red-600">{subcontractorErrors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.specialty}
                                            onChange={(e) => setSubcontractorData('specialty', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        />
                                        {subcontractorErrors.specialty && <p className="text-sm text-red-600">{subcontractorErrors.specialty}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={subcontractorData.hourly_rate}
                                            onChange={(e) => setSubcontractorData('hourly_rate', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        {subcontractorErrors.hourly_rate && <p className="text-sm text-red-600">{subcontractorErrors.hourly_rate}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.license_number}
                                            onChange={(e) => setSubcontractorData('license_number', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.insurance_provider}
                                            onChange={(e) => setSubcontractorData('insurance_provider', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy Number</label>
                                        <input
                                            type="text"
                                            value={subcontractorData.insurance_policy_number}
                                            onChange={(e) => setSubcontractorData('insurance_policy_number', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                                        <input
                                            type="date"
                                            value={subcontractorData.insurance_expiry}
                                            onChange={(e) => setSubcontractorData('insurance_expiry', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={subcontractorData.notes}
                                        onChange={(e) => setSubcontractorData('notes', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSubcontractor(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={subcontractorProcessing}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {subcontractorProcessing ? 'Adding...' : 'Add Subcontractor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}
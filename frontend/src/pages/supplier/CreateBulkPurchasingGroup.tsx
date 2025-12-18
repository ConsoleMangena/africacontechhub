import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'

import {
    ArrowLeftIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    MapPinIcon,
    TagIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'

interface FormData {
    name: string
    description: string
    material_category: string
    location: string
    target_quantity: string
    target_price_per_unit: string
    min_participants: string
    max_participants: string
    order_deadline: string
    discount_percentage: string
    supplier_info: {
        name: string
        contact: string
        email: string
        phone: string
    }
    terms_conditions: string
}

// Default categories since we don't have a backend
const categories: Record<string, string> = {
    cement: 'Cement & Concrete',
    steel: 'Steel & Rebar',
    bricks: 'Bricks & Blocks',
    timber: 'Timber & Wood',
    roofing: 'Roofing Materials',
    plumbing: 'Plumbing Supplies',
    electrical: 'Electrical Supplies',
    tiles: 'Tiles & Flooring',
    paint: 'Paint & Finishes',
    hardware: 'Hardware & Tools'
}

export default function CreateBulkPurchasingGroup() {
    const navigate = useNavigate()
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
    const [data, setFormData] = useState<FormData>({
        name: '',
        description: '',
        material_category: '',
        location: '',
        target_quantity: '',
        target_price_per_unit: '',
        min_participants: '5',
        max_participants: '50',
        order_deadline: '',
        discount_percentage: '',
        supplier_info: {
            name: '',
            contact: '',
            email: '',
            phone: ''
        },
        terms_conditions: ''
    })

    const setData = (field: keyof FormData | 'supplier_info', value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        // In a real app, this would submit to an API
        console.log('Form submitted:', data)
        setTimeout(() => {
            setProcessing(false)
            navigate('/bulk-purchasing')
        }, 1000)
    }

    const handleSupplierInfoChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            supplier_info: {
                ...prev.supplier_info,
                [field]: value
            }
        }))
    }

    return (
        <>
        
            <Helmet><title>Create Bulk Purchasing Group - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center">
                            <Link
                                to="/bulk-purchasing"
                                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create Bulk Purchasing Group</h1>
                                <p className="mt-2 text-gray-600">
                                    Start a group to purchase materials collectively at discounted rates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <UserGroupIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?.name}
                                        onChange={(e) => console.log('set: name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Cement Bulk Purchase - Harare"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Material Category *
                                    </label>
                                    <select
                                        value={formData?.material_category}
                                        onChange={(e) => console.log('set: material_category', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {Object.entries(categories).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                    {errors.material_category && <p className="mt-1 text-sm text-red-600">{errors.material_category}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData?.description}
                                    onChange={(e) => console.log('set: description', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Describe the group's purpose, materials, and any specific requirements..."
                                    required
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        {/* Location & Quantity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <MapPinIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Location & Quantity</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?.location}
                                        onChange={(e) => console.log('set: location', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Harare, Zimbabwe"
                                        required
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData?.target_quantity}
                                        onChange={(e) => console.log('set: target_quantity', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., 1000"
                                        min="1"
                                        required
                                    />
                                    {errors.target_quantity && <p className="mt-1 text-sm text-red-600">{errors.target_quantity}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <CurrencyDollarIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Price per Unit (USD) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData?.target_price_per_unit}
                                        onChange={(e) => console.log('set: target_price_per_unit', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., 12.50"
                                        min="0"
                                        required
                                    />
                                    {errors.target_price_per_unit && <p className="mt-1 text-sm text-red-600">{errors.target_price_per_unit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Percentage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData?.discount_percentage}
                                        onChange={(e) => console.log('set: discount_percentage', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., 15"
                                        min="0"
                                        max="100"
                                    />
                                    {errors.discount_percentage && <p className="mt-1 text-sm text-red-600">{errors.discount_percentage}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <UserGroupIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Participants *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData?.min_participants}
                                        onChange={(e) => console.log('set: min_participants', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        min="2"
                                        required
                                    />
                                    {errors.min_participants && <p className="mt-1 text-sm text-red-600">{errors.min_participants}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Participants *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData?.max_participants}
                                        onChange={(e) => console.log('set: max_participants', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        min="2"
                                        required
                                    />
                                    {errors.max_participants && <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <CalendarIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Deadline *
                                </label>
                                <input
                                    type="date"
                                    value={formData?.order_deadline}
                                    onChange={(e) => console.log('set: order_deadline', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {errors.order_deadline && <p className="mt-1 text-sm text-red-600">{errors.order_deadline}</p>}
                            </div>
                        </div>

                        {/* Supplier Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <TagIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Supplier Information (Optional)</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?.supplier_info.name}
                                        onChange={(e) => handleSupplierInfoChange('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Supplier company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={formData?.supplier_info.contact}
                                        onChange={(e) => handleSupplierInfoChange('contact', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Contact person name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData?.supplier_info.email}
                                        onChange={(e) => handleSupplierInfoChange('email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="supplier@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData?.supplier_info.phone}
                                        onChange={(e) => handleSupplierInfoChange('phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="+263 xxx xxx xxx"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-6">
                                <DocumentTextIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Terms & Conditions (Optional)</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Terms and Conditions
                                </label>
                                <textarea
                                    value={formData?.terms_conditions}
                                    onChange={(e) => console.log('set: terms_conditions', e.target.value)}
                                    rows={6}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Specify any terms and conditions for this bulk purchase group..."
                                />
                                {errors.terms_conditions && <p className="mt-1 text-sm text-red-600">{errors.terms_conditions}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Link
                                to="/bulk-purchasing"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={false}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        
        </>
    )
}

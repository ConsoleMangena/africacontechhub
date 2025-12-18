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
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    SparklesIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export default function VEProposalGenerator({ templates = [], categories = [] }) {
    const [filter, setFilter] = useState('all')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        estimatedSavings: '',
        targetClient: '',
        projectValue: '',
        timeline: ''
    })

    const filters = [
        { id: 'all', name: 'All Templates', count: templates?.length || 0 },
        { id: 'Structural', name: 'Structural', count: templates?.filter(t => t.category === 'Structural').length || 0 },
        { id: 'Mechanical', name: 'Mechanical', count: templates?.filter(t => t.category === 'Mechanical').length || 0 },
        { id: 'Electrical', name: 'Electrical', count: templates?.filter(t => t.category === 'Electrical').length || 0 },
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        console.log('Creating VE Proposal:', formData)
        setShowCreateForm(false)
        // Reset form
        setFormData({
            name: '',
            description: '',
            category: '',
            estimatedSavings: '',
            targetClient: '',
            projectValue: '',
            timeline: ''
        })
    }

    const filteredTemplates = templates?.filter(template => {
        if (filter === 'all') return true
        return template.category === filter
    }) || []

    return (
        <>
        
            <Helmet><title>VE Proposal Generator - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/supplier-platform/proposals" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    Back to Proposals
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">VE Proposal Generator</h1>
                                    <p className="text-gray-600">Create value-engineered proposals that demonstrate cost savings and benefits</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New VE Proposal
                                </button>
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
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Value Engineering Made Simple</h3>
                            <p className="text-lg text-gray-600 mb-6">
                                Create compelling value-engineered proposals that demonstrate cost savings, 
                                improved performance, and long-term benefits to win more deals.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <LightBulbIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Cost Optimization</h4>
                                    <p className="text-sm text-gray-600">Identify and eliminate unnecessary costs</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <ChartBarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Performance Enhancement</h4>
                                    <p className="text-sm text-gray-600">Improve functionality and efficiency</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Value Demonstration</h4>
                                    <p className="text-sm text-gray-600">Show clear ROI and benefits</p>
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        filter === filterItem.id
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {filterItem.name} ({filterItem.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">VE Proposal Templates</h3>
                            <p className="text-sm text-gray-600">Choose from existing templates or create new value-engineered proposals</p>
                        </div>
                        
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-12">
                                <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all' 
                                        ? 'Get started by creating your first VE proposal template.'
                                        : `No ${filter} templates found.`
                                    }
                                </p>
                                <div className="mt-6">
                                    <button 
                                        onClick={() => setShowCreateForm(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        New VE Proposal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredTemplates.map((template) => (
                                    <div key={template.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <LightBulbIcon className="w-6 h-6 text-purple-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="text-lg font-medium text-gray-900 truncate">
                                                                {template.name}
                                                            </h4>
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                                {template.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {template.description}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                            <span className="flex items-center">
                                                                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                                                {template.estimated_savings}% savings
                                                            </span>
                                                            <span className="flex items-center">
                                                                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                                                                Created: {template.created_at}
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

                    {/* Create Form Modal */}
                    {showCreateForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Create VE Proposal</h3>
                                        <button 
                                            onClick={() => setShowCreateForm(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Proposal Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Enter proposal name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Describe the value engineering proposal"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                required
                                            >
                                                <option value="">Select category</option>
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estimated Savings (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="estimatedSavings"
                                                    value={formData.estimatedSavings}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Project Value ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="projectValue"
                                                    value={formData.projectValue}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateForm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Create Proposal
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        
        </>
    )
}

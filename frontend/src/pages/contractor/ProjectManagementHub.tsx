import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    UsersIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PlusIcon,
    EyeIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface Project {
    id: number
    title: string
    description: string
    type: string
    location: string
    budget_range: string
    timeline: string
    status: string
    estimated_cost: number
    user: {
        id: number
        name: string
    }
    bids: Array<{
        id: number
        status: string
    }>
}

interface Contractor {
    id: number
    business_name: string
    specialty: string
    location: string
}

interface ProjectManagementHubProps {
    projects?: {
        data: Project[]
        links: any[]
        meta: any
    }
    contractor?: Contractor
    message?: string
    requires_auth?: boolean
}

export default function ProjectManagementHub({
    projects = { data: [], links: [], meta: {} },
    contractor = { id: 0, business_name: '', specialty: '', location: '' },
    message = '',
    requires_auth = false
}: ProjectManagementHubProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Show authentication message if required
    if (requires_auth && message) {
        return (
            <>

                <Helmet><title>Project Management Hub - The Central Hub - The Central Hub</title></Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/contractor-suite"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go to Contractor Suite
                        </Link>
                    </div>
                </div>

            </>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'published': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft': return 'Draft'
            case 'published': return 'Published'
            case 'in_progress': return 'In Progress'
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

    const filteredProjects = projects.data?.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = !statusFilter || project.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <>

            <Helmet><title>Project Management Hub - The Central Hub - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/contractor-suite" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowRightIcon className="w-5 h-5 mr-2 rotate-180" />
                                    Back to Suite
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Project Management Hub</h1>
                                    <p className="text-gray-600">Centralized space for job costing, scheduling, document control, and daily logs</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/project-management/analytics"
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                                >
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Analytics
                                </Link>
                                <Link
                                    to="/project-management/subcontractors"
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                                >
                                    <UsersIcon className="w-4 h-4 mr-2" />
                                    Subcontractors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{projects.data?.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.data?.filter(p => p.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.data?.filter(p => p.status === 'in_progress').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(projects.data?.reduce((sum, p) => sum + (p.estimated_cost || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Management Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Link
                            to="/project-management"
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 ml-3">Project Management Hub</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Centralized space per project for job costing, scheduling, document control, and daily logs</p>
                            <div className="flex items-center text-green-600 font-medium">
                                Manage Projects
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </div>
                        </Link>

                        <Link
                            to="#"
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 ml-3">Financial Tools</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Create estimates, manage billable change orders, and generate invoices</p>
                            <div className="flex items-center text-blue-600 font-medium">
                                View Finances
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </div>
                        </Link>

                        <Link
                            to="/project-management/subcontractors"
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <UsersIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 ml-3">Subcontractor Hub</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Manage agreements, track compliance documents, and facilitate communication</p>
                            <div className="flex items-center text-purple-600 font-medium">
                                Manage Team
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </div>
                        </Link>

                        <Link
                            to="#"
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 ml-3">Change Orders</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Create, send, and track change orders with e-signature integration</p>
                            <div className="flex items-center text-orange-600 font-medium">
                                Manage Orders
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </div>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search projects..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                                        <p className="text-sm text-gray-600">{project.type} • {project.location}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {getStatusText(project.status)}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                                        Client: {project.user.name}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                                        Budget: {project.budget_range}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CalendarDaysIcon className="w-4 h-4 mr-2" />
                                        Timeline: {project.timeline}
                                    </div>
                                    {project.estimated_cost && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                                            Est. Cost: {formatCurrency(project.estimated_cost)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {project.bids.length} bid{project.bids.length !== 1 ? 's' : ''}
                                    </div>
                                    <Link
                                        to={`/project-management/${project.id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <EyeIcon className="w-4 h-4 mr-1" />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || statusFilter
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'You don\'t have any active projects yet. Start by bidding on projects in the marketplace.'
                                }
                            </p>
                            <Link
                                to="/marketplace"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                                Browse Marketplace
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {projects.links && projects.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="flex space-x-2">
                                {projects.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && console.log("Navigate to:", link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-2 text-sm rounded-lg ${link.active
                                                ? 'bg-blue-600 text-white'
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
                </div>
            </div>

        </>
    )
}

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    ClockIcon,
    PlusIcon,
    EyeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon
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
}

interface Cost {
    id: number
    cost_category: string
    item_name: string
    description: string
    quantity: number
    unit: string
    unit_cost: number
    total_cost: number
    markup_percentage: number
    selling_price: number
    status: string
    date_incurred: string
    notes: string
}

interface Task {
    id: number
    task_name: string
    description: string
    start_date: string
    end_date: string
    duration_days: number
    priority: string
    status: string
    progress_percentage: number
    assigned_to: number
    dependencies: number[]
    notes: string
    assignedUser?: {
        id: number
        name: string
    }
}

interface Document {
    id: number
    document_name: string
    description: string
    document_type: string
    file_path: string
    file_name: string
    file_extension: string
    file_size: number
    file_size_human?: string
    mime_type: string
    status: string
    uploaded_by: number
    expiry_date: string
    notes: string
    uploadedBy?: {
        id: number
        name: string
    }
}

interface Log {
    id: number
    log_date: string
    start_time: string
    end_time: string
    hours_worked: number
    work_description: string
    materials_used: string
    equipment_used: string
    weather_conditions: string
    issues_encountered: string
    next_steps: string
    photos: string[]
    status: string
    user: {
        id: number
        name: string
    }
}

interface ChangeOrder {
    id: number
    change_order_number: string
    title: string
    description: string
    reason: string
    original_amount: number
    change_amount: number
    new_total_amount: number
    status: string
    requested_date: string
    approved_date: string
    completion_date: string
    requestedBy: {
        id: number
        name: string
    }
    approvedBy?: {
        id: number
        name: string
    }
}

interface Statistics {
    total_costs: number
    total_selling_price: number
    total_profit: number
    profit_margin: number
    tasks_completed: number
    tasks_total: number
    completion_percentage: number
    total_hours_logged: number
    change_orders_count: number
    change_orders_value: number
    overdue_tasks: number
}

interface ProjectDashboardProps {
    project?: Project
    costs?: Cost[]
    schedule?: {
        tasks: Task[]
        overdue_tasks: Task[]
        completed_tasks: Task[]
        in_progress_tasks: Task[]
    }
    documents?: {
        documents: Document[]
        by_type: Record<string, Document[]>
        expired: Document[]
        pending_approval: Document[]
    }
    logs?: {
        logs: Log[]
        total_hours: number
        by_user: Record<string, Log[]>
        pending_approval: Log[]
    }
    change_orders?: {
        change_orders: ChangeOrder[]
        pending: ChangeOrder[]
        approved: ChangeOrder[]
        total_value: number
    }
    statistics?: Statistics
    costCategories?: Record<string, string>
    documentTypes?: Record<string, string>
}

export default function ProjectDashboard({
    project = { id: 0, title: '', type: '', location: '', budget_range: '', timeline: '', status: '', estimated_cost: 0, description: '', user: { id: 0, name: '' } },
    costs = [],
    schedule = { tasks: [], overdue_tasks: [], completed_tasks: [], in_progress_tasks: [] },
    documents = { documents: [], by_type: {}, expired: [], pending_approval: [] },
    logs = { logs: [], total_hours: 0, by_user: {}, pending_approval: [] },
    change_orders = { change_orders: [], pending: [], approved: [], total_value: 0 },
    statistics = { total_costs: 0, total_selling_price: 0, total_profit: 0, profit_margin: 0, tasks_completed: 0, tasks_total: 0, completion_percentage: 0, total_hours_logged: 0, change_orders_count: 0, change_orders_value: 0, overdue_tasks: 0 },
    costCategories = {},
    documentTypes = {}
}: ProjectDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview')
    const [showAddCost, setShowAddCost] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)
    const [showAddLog, setShowAddLog] = useState(false)

    const { data: costData, setData: setCostData, post: postCost, processing: costProcessing, errors: costErrors } = useForm({
        cost_category: '',
        item_name: '',
        description: '',
        quantity: '',
        unit: '',
        unit_cost: '',
        markup_percentage: '',
        status: 'estimated',
        date_incurred: new Date().toISOString().split('T')[0],
        notes: ''
    })

    const { data: taskData, setData: setTaskData, post: postTask, processing: taskProcessing, errors: taskErrors } = useForm({
        task_name: '',
        description: '',
        start_date: '',
        end_date: '',
        duration_days: '',
        priority: 'medium',
        status: 'not_started',
        progress_percentage: 0,
        assigned_to: '',
        dependencies: [],
        notes: ''
    })

    const { data: logData, setData: setLogData, post: postLog, processing: logProcessing, errors: logErrors } = useForm({
        log_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        hours_worked: '',
        work_description: '',
        materials_used: '',
        equipment_used: '',
        weather_conditions: '',
        issues_encountered: '',
        next_steps: '',
        photos: [],
        status: 'draft'
    })

    const handleAddCost = (e: React.FormEvent) => {
        e.preventDefault()
        postCost(`/project-management/${project.id}/costs`, {
            onSuccess: () => {
                setShowAddCost(false)
                setCostData({
                    cost_category: '',
                    item_name: '',
                    description: '',
                    quantity: '',
                    unit: '',
                    unit_cost: '',
                    markup_percentage: '',
                    status: 'estimated',
                    date_incurred: new Date().toISOString().split('T')[0],
                    notes: ''
                })
            }
        })
    }

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        postTask(`/project-management/${project.id}/tasks`, {
            onSuccess: () => {
                setShowAddTask(false)
                setTaskData({
                    task_name: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    duration_days: '',
                    priority: 'medium',
                    status: 'not_started',
                    progress_percentage: 0,
                    assigned_to: '',
                    dependencies: [],
                    notes: ''
                })
            }
        })
    }

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault()
        postLog(`/project-management/${project.id}/logs`, {
            onSuccess: () => {
                setShowAddLog(false)
                setLogData({
                    log_date: new Date().toISOString().split('T')[0],
                    start_time: '',
                    end_time: '',
                    hours_worked: '',
                    work_description: '',
                    materials_used: '',
                    equipment_used: '',
                    weather_conditions: '',
                    issues_encountered: '',
                    next_steps: '',
                    photos: [],
                    status: 'draft'
                })
            }
        })
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'estimated': return 'bg-gray-100 text-gray-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <>

            <Helmet><title>{project.title} - Project Dashboard</title></Helmet>

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
                                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                                    <p className="text-gray-600">{project.type} • {project.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    to={`/project-management/${project.id}/financial-tools`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                >
                                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                                    Financial Tools
                                </Link>
                                <Link
                                    to={`/project-management/${project.id}/analytics`}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                                >
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Analytics
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Project Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Client</h3>
                                <p className="text-gray-900">{project.user.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Budget Range</h3>
                                <p className="text-gray-900">{project.budget_range}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Timeline</h3>
                                <p className="text-gray-900">{project.timeline}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                            <p className="text-gray-900">{project.description}</p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Costs</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total_costs)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.profit_margin.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.tasks_completed}/{statistics.tasks_total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Hours Logged</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.total_hours_logged}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                {[
                                    { id: 'overview', name: 'Overview', icon: ClipboardDocumentListIcon },
                                    { id: 'costs', name: 'Costs', icon: CurrencyDollarIcon },
                                    { id: 'schedule', name: 'Schedule', icon: CalendarDaysIcon },
                                    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
                                    { id: 'logs', name: 'Daily Logs', icon: ClockIcon },
                                    { id: 'change-orders', name: 'Change Orders', icon: WrenchScrewdriverIcon },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 mr-2" />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
                                            <div className="space-y-3">
                                                {schedule.tasks.slice(0, 5).map((task) => (
                                                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{task.task_name}</p>
                                                            <p className="text-sm text-gray-600">{formatDate(task.start_date)} - {formatDate(task.end_date)}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                            <span className="text-sm text-gray-600">{task.progress_percentage}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Costs</h3>
                                            <div className="space-y-3">
                                                {costs.slice(0, 5).map((cost) => (
                                                    <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{cost.item_name}</p>
                                                            <p className="text-sm text-gray-600">{cost.cost_category}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">{formatCurrency(cost.total_cost)}</p>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cost.status)}`}>
                                                                {cost.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Costs Tab */}
                            {activeTab === 'costs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Project Costs</h3>
                                        <button
                                            onClick={() => setShowAddCost(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Cost
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {costs.map((cost) => (
                                                    <tr key={cost.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{cost.item_name}</div>
                                                                <div className="text-sm text-gray-500">{cost.description}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.cost_category}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.quantity} {cost.unit}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(cost.unit_cost)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(cost.total_cost)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cost.status)}`}>
                                                                {cost.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Schedule Tab */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Project Schedule</h3>
                                        <button
                                            onClick={() => setShowAddTask(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Task
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {schedule.tasks.map((task) => (
                                            <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                                                        <p className="text-sm text-gray-600">{task.description}</p>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(task.start_date)} - {formatDate(task.end_date)}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">{task.progress_percentage}%</div>
                                                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${task.progress_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Project Documents</h3>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Upload Document
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {documents.documents.map((doc) => (
                                            <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{doc.document_name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>{doc.document_type}</span>
                                                    <span>{doc.file_size_human}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Daily Logs Tab */}
                            {activeTab === 'logs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Daily Logs</h3>
                                        <button
                                            onClick={() => setShowAddLog(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Log
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {logs.logs.map((log) => (
                                            <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{formatDate(log.log_date)}</h4>
                                                    <span className="text-sm text-gray-500">by {log.user.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{log.work_description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{log.hours_worked} hours</span>
                                                    {log.materials_used && <span>Materials: {log.materials_used}</span>}
                                                    {log.equipment_used && <span>Equipment: {log.equipment_used}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Change Orders Tab */}
                            {activeTab === 'change-orders' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">Change Orders</h3>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Create Change Order
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {change_orders.change_orders.map((order) => (
                                            <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{order.title}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Requested by {order.requestedBy.name}</span>
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency(order.change_amount)} change
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Cost Modal */}
                {showAddCost && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Project Cost</h3>

                            <form onSubmit={handleAddCost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        value={costData.cost_category}
                                        onChange={(e) => setCostData('cost_category', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {Object.entries(costCategories).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                    {costErrors.cost_category && <p className="text-sm text-red-600">{costErrors.cost_category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                    <input
                                        type="text"
                                        value={costData.item_name}
                                        onChange={(e) => setCostData('item_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {costErrors.item_name && <p className="text-sm text-red-600">{costErrors.item_name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={costData.quantity}
                                            onChange={(e) => setCostData('quantity', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {costErrors.quantity && <p className="text-sm text-red-600">{costErrors.quantity}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                                        <input
                                            type="text"
                                            value={costData.unit}
                                            onChange={(e) => setCostData('unit', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {costErrors.unit && <p className="text-sm text-red-600">{costErrors.unit}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={costData.unit_cost}
                                        onChange={(e) => setCostData('unit_cost', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {costErrors.unit_cost && <p className="text-sm text-red-600">{costErrors.unit_cost}</p>}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCost(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={costProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {costProcessing ? 'Adding...' : 'Add Cost'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Task Modal */}
                {showAddTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Project Task</h3>

                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                                    <input
                                        type="text"
                                        value={taskData.task_name}
                                        onChange={(e) => setTaskData('task_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {taskErrors.task_name && <p className="text-sm text-red-600">{taskErrors.task_name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                        <input
                                            type="date"
                                            value={taskData.start_date}
                                            onChange={(e) => setTaskData('start_date', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {taskErrors.start_date && <p className="text-sm text-red-600">{taskErrors.start_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                        <input
                                            type="date"
                                            value={taskData.end_date}
                                            onChange={(e) => setTaskData('end_date', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        {taskErrors.end_date && <p className="text-sm text-red-600">{taskErrors.end_date}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                                    <select
                                        value={taskData.priority}
                                        onChange={(e) => setTaskData('priority', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                    {taskErrors.priority && <p className="text-sm text-red-600">{taskErrors.priority}</p>}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTask(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={taskProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {taskProcessing ? 'Adding...' : 'Add Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Log Modal */}
                {showAddLog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Daily Log</h3>

                            <form onSubmit={handleAddLog} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={logData.log_date}
                                        onChange={(e) => setLogData('log_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {logErrors.log_date && <p className="text-sm text-red-600">{logErrors.log_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Description *</label>
                                    <textarea
                                        value={logData.work_description}
                                        onChange={(e) => setLogData('work_description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        required
                                    />
                                    {logErrors.work_description && <p className="text-sm text-red-600">{logErrors.work_description}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={logData.start_time}
                                            onChange={(e) => setLogData('start_time', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={logData.end_time}
                                            onChange={(e) => setLogData('end_time', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddLog(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={logProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {logProcessing ? 'Adding...' : 'Add Log'}
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

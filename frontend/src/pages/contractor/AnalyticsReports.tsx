import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import {
    ArrowLeftIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    EyeIcon
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
}

interface ProjectStatistics {
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

interface ProjectWithStats {
    project: Project
    statistics: ProjectStatistics
}

interface AnalyticsReportsProps {
    projects?: Project[]
    all_statistics?: ProjectWithStats[]
}

export default function AnalyticsReports({ projects = [], all_statistics = [] }: AnalyticsReportsProps) {
    const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null)
    const [timeRange, setTimeRange] = useState('all')

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

    // Calculate overall statistics
    const overallStats = {
        totalProjects: projects.length,
        totalCosts: all_statistics.reduce((sum, stat) => sum + stat.statistics.total_costs, 0),
        totalProfit: all_statistics.reduce((sum, stat) => sum + stat.statistics.total_profit, 0),
        totalHours: all_statistics.reduce((sum, stat) => sum + stat.statistics.total_hours_logged, 0),
        averageProfitMargin: all_statistics.length > 0
            ? all_statistics.reduce((sum, stat) => sum + stat.statistics.profit_margin, 0) / all_statistics.length
            : 0,
        completedTasks: all_statistics.reduce((sum, stat) => sum + stat.statistics.tasks_completed, 0),
        totalTasks: all_statistics.reduce((sum, stat) => sum + stat.statistics.tasks_total, 0),
        overdueTasks: all_statistics.reduce((sum, stat) => sum + stat.statistics.overdue_tasks, 0),
        changeOrdersValue: all_statistics.reduce((sum, stat) => sum + stat.statistics.change_orders_value, 0),
    }

    return (
        <>

            <Helmet><title>Analytics & Reports - The Central Hub - The Central Hub</title></Helmet>

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
                                    <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                                    <p className="text-gray-600">Track performance, profitability, and project metrics with detailed analytics</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Time</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="365">Last Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Overall Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalProjects}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Profit</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overallStats.totalProfit)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                                    <p className="text-2xl font-bold text-gray-900">{overallStats.averageProfitMargin.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalHours}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Completed Tasks</span>
                                    <span className="text-sm font-bold text-gray-900">{overallStats.completedTasks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Total Tasks</span>
                                    <span className="text-sm font-bold text-gray-900">{overallStats.totalTasks}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${overallStats.totalTasks > 0 ? (overallStats.completedTasks / overallStats.totalTasks) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {overallStats.totalTasks > 0 ? ((overallStats.completedTasks / overallStats.totalTasks) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Overdue Tasks</span>
                                    <span className="text-sm font-bold text-red-600">{overallStats.overdueTasks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Change Orders Value</span>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(overallStats.changeOrdersValue)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Total Costs</span>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(overallStats.totalCosts)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Performance Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Performance</h3>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {all_statistics.map((projectWithStats) => (
                                        <tr key={projectWithStats.project.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{projectWithStats.project.title}</div>
                                                    <div className="text-sm text-gray-500">{projectWithStats.project.type} • {projectWithStats.project.location}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(projectWithStats.project.status)}`}>
                                                    {getStatusText(projectWithStats.project.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${projectWithStats.statistics.completion_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-900">{projectWithStats.statistics.completion_percentage.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(projectWithStats.statistics.total_profit)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {projectWithStats.statistics.profit_margin.toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {projectWithStats.statistics.total_hours_logged}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/project-management/${projectWithStats.project.id}/analytics`}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                                >
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Profitability Chart Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Trends</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Chart visualization would be implemented here</p>
                                <p className="text-sm text-gray-400">Integration with charting library like Chart.js or Recharts</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Projects</h3>
                            <div className="space-y-3">
                                {all_statistics
                                    .sort((a, b) => b.statistics.profit_margin - a.statistics.profit_margin)
                                    .slice(0, 3)
                                    .map((projectWithStats, index) => (
                                        <div key={projectWithStats.project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{projectWithStats.project.title}</p>
                                                    <p className="text-sm text-gray-600">{projectWithStats.statistics.completion_percentage.toFixed(1)}% complete</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-green-600">{projectWithStats.statistics.profit_margin.toFixed(1)}%</p>
                                                <p className="text-sm text-gray-500">margin</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                            <div className="space-y-3">
                                {overallStats.overdueTasks > 0 && (
                                    <div className="flex items-center p-3 bg-red-50 rounded-lg">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-red-900">{overallStats.overdueTasks} Overdue Tasks</p>
                                            <p className="text-sm text-red-600">Review and prioritize delayed tasks</p>
                                        </div>
                                    </div>
                                )}

                                {overallStats.averageProfitMargin < 15 && (
                                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                        <ArrowTrendingDownIcon className="w-5 h-5 text-yellow-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-yellow-900">Low Profit Margins</p>
                                            <p className="text-sm text-yellow-600">Average margin: {overallStats.averageProfitMargin.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                )}

                                {overallStats.totalTasks > 0 && (overallStats.completedTasks / overallStats.totalTasks) < 0.8 && (
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                        <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-blue-900">Task Completion Rate</p>
                                            <p className="text-sm text-blue-600">
                                                {((overallStats.completedTasks / overallStats.totalTasks) * 100).toFixed(1)}% completion rate
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

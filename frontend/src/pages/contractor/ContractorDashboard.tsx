import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UsersIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    EyeIcon,
    PlusIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    BanknotesIcon,
    TruckIcon,
    ShieldCheckIcon,
    BellAlertIcon,
    ChartPieIcon,
    ClipboardDocumentListIcon,
    DocumentDuplicateIcon,
    UserGroupIcon,
    Cog6ToothIcon,
    ArrowRightIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    monthlyRevenue: number;
    profitMargin: number;
    averageProjectValue: number;
    subcontractorsCount: number;
    pendingBids: number;
    changeOrdersPending: number;
}

interface ProfitFadeAlert {
    id: number;
    projectName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    potentialLoss: number;
    recommendedAction: string;
    createdAt: string;
}

interface RecentActivity {
    id: number;
    type: 'project' | 'bid' | 'payment' | 'change_order' | 'subcontractor';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error' | 'info';
}

interface Project {
    id: number;
    name: string;
    client: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed';
    progress: number;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    profitMargin: number;
    riskLevel: 'low' | 'medium' | 'high';
}

export default function ContractorDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        totalRevenue: 2450000,
        monthlyRevenue: 320000,
        profitMargin: 18.5,
        averageProjectValue: 204167,
        subcontractorsCount: 15,
        pendingBids: 3,
        changeOrdersPending: 2
    });

    const [profitFadeAlerts, setProfitFadeAlerts] = useState<ProfitFadeAlert[]>([
        {
            id: 1,
            projectName: "Harare Office Complex",
            severity: 'critical',
            description: "Material costs exceeded budget by 15%",
            potentialLoss: 45000,
            recommendedAction: "Negotiate with suppliers or adjust scope",
            createdAt: "2024-01-15"
        },
        {
            id: 2,
            projectName: "Residential Development",
            severity: 'high',
            description: "Labor hours 20% over estimate",
            potentialLoss: 28000,
            recommendedAction: "Review work processes and optimize scheduling",
            createdAt: "2024-01-14"
        },
        {
            id: 3,
            projectName: "Shopping Mall Renovation",
            severity: 'medium',
            description: "Equipment rental costs increasing",
            potentialLoss: 12000,
            recommendedAction: "Consider purchasing vs renting equipment",
            createdAt: "2024-01-13"
        }
    ]);

    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
        {
            id: 1,
            type: 'project',
            title: 'New Project Started',
            description: 'Harare Office Complex construction began',
            timestamp: '2 hours ago',
            status: 'success'
        },
        {
            id: 2,
            type: 'payment',
            title: 'Payment Received',
            description: 'ZWL 150,000 from ABC Construction Ltd',
            timestamp: '4 hours ago',
            status: 'success'
        },
        {
            id: 3,
            type: 'bid',
            title: 'Bid Submitted',
            description: 'Commercial building project - ZWL 2.5M',
            timestamp: '1 day ago',
            status: 'info'
        },
        {
            id: 4,
            type: 'change_order',
            title: 'Change Order Pending',
            description: 'Additional electrical work - ZWL 25,000',
            timestamp: '2 days ago',
            status: 'warning'
        }
    ]);

    const [projects, setProjects] = useState<Project[]>([
        {
            id: 1,
            name: "Harare Office Complex",
            client: "ABC Development Ltd",
            status: 'active',
            progress: 65,
            budget: 1500000,
            spent: 975000,
            startDate: "2024-01-01",
            endDate: "2024-06-30",
            profitMargin: 12.5,
            riskLevel: 'high'
        },
        {
            id: 2,
            name: "Residential Development",
            client: "XYZ Properties",
            status: 'active',
            progress: 40,
            budget: 800000,
            spent: 320000,
            startDate: "2024-02-15",
            endDate: "2024-08-15",
            profitMargin: 22.3,
            riskLevel: 'medium'
        },
        {
            id: 3,
            name: "Shopping Mall Renovation",
            client: "Retail Holdings",
            status: 'planning',
            progress: 15,
            budget: 600000,
            spent: 90000,
            startDate: "2024-03-01",
            endDate: "2024-09-01",
            profitMargin: 18.7,
            riskLevel: 'low'
        }
    ]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'info': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <>
        
            <Helmet><title>Contractor Dashboard - The Central Hub - The Central Hub</title></Helmet>

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
                                    <h1 className="text-2xl font-bold text-gray-900">Contractor Dashboard</h1>
                                    <p className="text-gray-600">Monitor your business performance and project health</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link to="/post-project" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Project
                                </Link>
                                <Link to="/contractor-dashboard" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center transition-colors">
                                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Profit Fade Alerts */}
                    {profitFadeAlerts.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <BellAlertIcon className="w-5 h-5 mr-2 text-red-500" />
                                    Profit Fade Alerts
                                </h2>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                                    {profitFadeAlerts.length} Active
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profitFadeAlerts.map((alert) => (
                                    <div key={alert.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{alert.projectName}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-red-600">
                                                Potential Loss: ZWL {alert.potentialLoss.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{alert.recommendedAction}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">{alert.createdAt}</span>
                                            <Link to="/project-management" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                Take Action
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">ZWL {stats.monthlyRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <UsersIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Subcontractors</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.subcontractorsCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activities */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                                                    {activity.type === 'project' && <BuildingOfficeIcon className="w-4 h-4" />}
                                                    {activity.type === 'payment' && <BanknotesIcon className="w-4 h-4" />}
                                                    {activity.type === 'bid' && <DocumentTextIcon className="w-4 h-4" />}
                                                    {activity.type === 'change_order' && <DocumentDuplicateIcon className="w-4 h-4" />}
                                                    {activity.type === 'subcontractor' && <UserGroupIcon className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Link to="/project-management" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">Manage Projects</span>
                                    </Link>
                                    <Link to="/project-management/financial-tools" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <BanknotesIcon className="w-5 h-5 text-green-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">Financial Tools</span>
                                    </Link>
                                    <Link to="/project-management/subcontractors" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <UserGroupIcon className="w-5 h-5 text-purple-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">Subcontractors</span>
                                    </Link>
                                    <Link to="/project-management/analytics" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <ChartPieIcon className="w-5 h-5 text-orange-600 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">Analytics</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Project Status Overview */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{project.name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                                                    {project.riskLevel.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">{project.client}</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {project.progress}% Complete
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">ZWL {project.spent.toLocaleString()}</span>
                                                <span className="text-gray-600">of ZWL {project.budget.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    );
}

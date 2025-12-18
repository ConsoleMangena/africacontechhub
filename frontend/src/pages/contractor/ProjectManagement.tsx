import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import {
    ClipboardDocumentListIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    UsersIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon,
    DocumentTextIcon,
    ChartBarIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    Bars3Icon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';

interface Project {
    id: number;
    name: string;
    client: string;
    clientContact: string;
    clientPhone: string;
    clientEmail: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    progress: number;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    projectManager: string;
    teamSize: number;
    riskLevel: 'low' | 'medium' | 'high';
    profitMargin: number;
    lastUpdated: string;
}

interface Task {
    id: number;
    projectId: number;
    name: string;
    description: string;
    assignedTo: string;
    status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    progress: number;
}

export default function ProjectManagement() {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: 1,
            name: "Harare Office Complex",
            client: "ABC Development Ltd",
            clientContact: "John Smith",
            clientPhone: "+263 77 123 4567",
            clientEmail: "john@abcdev.co.zw",
            status: 'active',
            priority: 'high',
            progress: 65,
            budget: 1500000,
            spent: 975000,
            startDate: "2024-01-01",
            endDate: "2024-06-30",
            location: "Harare CBD",
            description: "Construction of a 5-story office complex with modern amenities",
            projectManager: "Mike Johnson",
            teamSize: 12,
            riskLevel: 'high',
            profitMargin: 12.5,
            lastUpdated: "2024-01-15"
        },
        {
            id: 2,
            name: "Residential Development",
            client: "XYZ Properties",
            clientContact: "Sarah Wilson",
            clientPhone: "+263 77 234 5678",
            clientEmail: "sarah@xyzproperties.co.zw",
            status: 'active',
            priority: 'medium',
            progress: 40,
            budget: 800000,
            spent: 320000,
            startDate: "2024-02-15",
            endDate: "2024-08-15",
            location: "Borrowdale",
            description: "Construction of 20 residential units with parking",
            projectManager: "David Brown",
            teamSize: 8,
            riskLevel: 'medium',
            profitMargin: 22.3,
            lastUpdated: "2024-01-14"
        },
        {
            id: 3,
            name: "Shopping Mall Renovation",
            client: "Retail Holdings",
            clientContact: "Robert Taylor",
            clientPhone: "+263 77 345 6789",
            clientEmail: "robert@retailholdings.co.zw",
            status: 'planning',
            priority: 'low',
            progress: 15,
            budget: 600000,
            spent: 90000,
            startDate: "2024-03-01",
            endDate: "2024-09-01",
            location: "Eastgate Mall",
            description: "Complete renovation of existing shopping mall",
            projectManager: "Lisa Davis",
            teamSize: 6,
            riskLevel: 'low',
            profitMargin: 18.7,
            lastUpdated: "2024-01-13"
        }
    ]);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            projectId: 1,
            name: "Foundation Work",
            description: "Complete foundation excavation and concrete work",
            assignedTo: "Construction Team A",
            status: 'completed',
            priority: 'high',
            dueDate: "2024-01-20",
            estimatedHours: 120,
            actualHours: 115,
            progress: 100
        },
        {
            id: 2,
            projectId: 1,
            name: "Structural Framework",
            description: "Erect steel framework for building structure",
            assignedTo: "Steel Team",
            status: 'in_progress',
            priority: 'high',
            dueDate: "2024-02-15",
            estimatedHours: 200,
            actualHours: 150,
            progress: 75
        },
        {
            id: 3,
            projectId: 2,
            name: "Site Preparation",
            description: "Clear and prepare construction site",
            assignedTo: "Site Prep Team",
            status: 'in_progress',
            priority: 'medium',
            dueDate: "2024-02-01",
            estimatedHours: 80,
            actualHours: 60,
            progress: 60
        }
    ]);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'planning': return 'text-blue-600 bg-blue-100';
            case 'on_hold': return 'text-yellow-600 bg-yellow-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
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

    const filteredProjects = projects.filter(project => {
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.client.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    });

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
                                    <h1 className="text-2xl font-bold text-gray-900">Project Management Hub</h1>
                                    <p className="text-gray-600">Manage your projects, tasks, and resources efficiently</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Project
                                </button>
                                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="planning">Planning</option>
                                    <option value="active">Active</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Priority</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Bars3Icon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                                <p className="text-sm text-gray-600">{project.client}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                    {project.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                                    {project.priority.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Progress</span>
                                                <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Budget</p>
                                                    <p className="text-sm font-medium text-gray-900">ZWL {project.budget.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Spent</p>
                                                    <p className="text-sm font-medium text-gray-900">ZWL {project.spent.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Profit Margin</span>
                                                <span className="text-sm font-medium text-green-600">{project.profitMargin}%</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Risk Level</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                                                    {project.riskLevel.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <Link 
                                                to={`/project-details/${project.id}`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                            >
                                                View Details
                                                <ArrowRightIcon className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                        <div className="text-sm text-gray-500">{project.location}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{project.client}</div>
                                                    <div className="text-sm text-gray-500">{project.clientContact}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                        {project.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full" 
                                                                style={{ width: `${project.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-900">{project.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">ZWL {project.budget.toLocaleString()}</div>
                                                    <div className="text-sm text-gray-500">Spent: ZWL {project.spent.toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-600">{project.profitMargin}%</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-700">
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-600 hover:text-gray-700">
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <Link 
                                                            to={`/project-details/${project.id}`}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            Details
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.filter(p => p.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.filter(p => p.riskLevel === 'high').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Budget</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ZWL {projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    );
}

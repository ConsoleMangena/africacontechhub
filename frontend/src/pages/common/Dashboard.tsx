import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
    ChartBarIcon,
    UsersIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    StarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: number;
    successRate: number;
    monthlyGrowth: number;
}

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
}

interface TopContractor {
    id: number;
    name: string;
    rating: number;
    projects: number;
    specialty: string;
    avatar: string;
}

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalEarnings: 0,
        averageRating: 0,
        responseTime: 0,
        successRate: 0,
        monthlyGrowth: 0
    });

    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [topContractors, setTopContractors] = useState<TopContractor[]>([]);
    const [loading, setLoading] = useState(true);

    // Redirect to role-specific dashboard
    useEffect(() => {
        if (!authLoading && user?.profile?.role) {
            const dashboardRoutes: Record<string, string> = {
                'BUILDER': '/builder',
                'CONTRACTOR': '/contractor',
                'SUPPLIER': '/supplier',
            };
            const roleRoute = dashboardRoutes[user.profile.role];
            if (roleRoute) {
                navigate(roleRoute, { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, activitiesResponse, contractorsResponse] = await Promise.all([
                fetch('/api/analytics/dashboard'),
                fetch('/api/realtime/marketplace-activities'),
                fetch('/api/contractors/top-by-category?category=all&limit=5')
            ]);

            const statsData = await statsResponse.json();
            const activitiesData = await activitiesResponse.json();
            const contractorsData = await contractorsResponse.json();

            setStats(statsData.data);
            setRecentActivities(activitiesData.data);
            setTopContractors(contractorsData.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }: {
        title: string;
        value: string | number;
        icon: React.ComponentType<any>;
        change?: string;
        color?: string;
    }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
        <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
            </div>
        </div>
    );

    const ContractorCard = ({ contractor }: { contractor: TopContractor }) => (
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <img
                src={contractor.avatar}
                alt={contractor.name}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{contractor.name}</p>
                <p className="text-xs text-gray-500">{contractor.specialty}</p>
            </div>
            <div className="flex items-center space-x-2">
                <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">{contractor.rating}</span>
                </div>
                <span className="text-xs text-gray-500">{contractor.projects} projects</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <>
                <AppLayout>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </AppLayout>
            </>
        );
    }

    return (
        <>
            <AppLayout>
                <Helmet><title>Dashboard - The Central Hub</title></Helmet>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your projects.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Projects"
                            value={stats.totalProjects}
                            icon={ChartBarIcon}
                            change="+12% from last month"
                            color="blue"
                        />
                        <StatCard
                            title="Active Projects"
                            value={stats.activeProjects}
                            icon={ClockIcon}
                            change="+5% from last month"
                            color="green"
                        />
                        <StatCard
                            title="Total Earnings"
                            value={`$${stats.totalEarnings.toLocaleString()}`}
                            icon={CurrencyDollarIcon}
                            change="+18% from last month"
                            color="emerald"
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${stats.successRate}%`}
                            icon={CheckCircleIcon}
                            change="+3% from last month"
                            color="purple"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activities */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                                    <p className="text-sm text-gray-600">Latest updates from your projects</p>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {recentActivities.map((activity) => (
                                        <ActivityItem key={activity.id} activity={activity} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Contractors */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Top Contractors</h2>
                                    <p className="text-sm text-gray-600">Highest rated professionals</p>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {topContractors.map((contractor) => (
                                        <ContractorCard key={contractor.id} contractor={contractor} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">Ready to start your next project?</h3>
                                    <p className="text-blue-100 mt-2">Post a project and get matched with top contractors</p>
                                </div>
                                <div className="flex space-x-4">
                                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                                        Post Project
                                    </button>
                                    <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                                        Browse Projects
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}

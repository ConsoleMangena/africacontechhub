import React, { useState, useEffect } from 'react';
import { 
    ChartBarIcon, 
    ArrowTrendingUpIcon, 
    UsersIcon, 
    CurrencyDollarIcon,
    ClockIcon,
    EyeIcon,
    StarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface RealTimeStats {
    activeProjects: number;
    totalEarnings: number;
    newBids: number;
    completedProjects: number;
    averageResponseTime: number;
    successRate: number;
    monthlyGrowth: number;
    topPerformingContractors: number;
}

interface MarketActivity {
    id: number;
    type: 'project_created' | 'bid_received' | 'project_completed' | 'contractor_verified';
    title: string;
    description: string;
    timestamp: string;
    value?: number;
    location?: string;
}

export default function RealTimeDashboard() {
    const [stats, setStats] = useState<RealTimeStats>({
        activeProjects: 0,
        totalEarnings: 0,
        newBids: 0,
        completedProjects: 0,
        averageResponseTime: 0,
        successRate: 0,
        monthlyGrowth: 0,
        topPerformingContractors: 0
    });

    const [activities, setActivities] = useState<MarketActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRealTimeData();
        const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchRealTimeData = async () => {
        try {
            const [statsResponse, activitiesResponse] = await Promise.all([
                fetch('/api/analytics/dashboard'),
                fetch('/api/realtime/marketplace-activities')
            ]);

            const statsData = await statsResponse.json();
            const activitiesData = await activitiesResponse.json();

            if (statsData.success) {
                setStats(statsData.data);
            }

            if (activitiesData.success) {
                setActivities(activitiesData.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching real-time data:', error);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <p className={`text-sm mt-1 flex items-center ${
                            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
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

    const ActivityItem = ({ activity }: { activity: MarketActivity }) => {
        const getActivityIcon = (type: string) => {
            switch (type) {
                case 'project_created':
                    return <ChartBarIcon className="w-4 h-4 text-blue-500" />;
                case 'bid_received':
                    return <CurrencyDollarIcon className="w-4 h-4 text-green-500" />;
                case 'project_completed':
                    return <CheckCircleIcon className="w-4 h-4 text-purple-500" />;
                case 'contractor_verified':
                    return <StarIcon className="w-4 h-4 text-yellow-500" />;
                default:
                    return <ClockIcon className="w-4 h-4 text-gray-500" />;
            }
        };

        const getActivityColor = (type: string) => {
            switch (type) {
                case 'project_created':
                    return 'bg-blue-50 border-blue-200';
                case 'bid_received':
                    return 'bg-green-50 border-green-200';
                case 'project_completed':
                    return 'bg-purple-50 border-purple-200';
                case 'contractor_verified':
                    return 'bg-yellow-50 border-yellow-200';
                default:
                    return 'bg-gray-50 border-gray-200';
            }
        };

        return (
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.value && (
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${activity.value.toLocaleString()}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects}
                    icon={ChartBarIcon}
                    change="+12% from last month"
                    color="blue"
                />
                <StatCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings.toLocaleString()}`}
                    icon={CurrencyDollarIcon}
                    change="+18% from last month"
                    color="emerald"
                />
                <StatCard
                    title="New Bids Today"
                    value={stats.newBids}
                    icon={ArrowTrendingUpIcon}
                    change="+5% from yesterday"
                    color="green"
                />
                <StatCard
                    title="Success Rate"
                    value={`${stats.successRate}%`}
                    icon={CheckCircleIcon}
                    change="+3% from last month"
                    color="purple"
                />
            </div>

            {/* Market Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Live Market Activity</h2>
                            <p className="text-sm text-gray-600">Real-time updates from the marketplace</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Live</span>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Response Time</span>
                            <span className="text-sm font-semibold text-gray-900">{stats.averageResponseTime}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Monthly Growth</span>
                            <span className="text-sm font-semibold text-green-600">+{stats.monthlyGrowth}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Top Performing Contractors</span>
                            <span className="text-sm font-semibold text-gray-900">{stats.topPerformingContractors}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Post New Project
                        </button>
                        <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            Browse Contractors
                        </button>
                        <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

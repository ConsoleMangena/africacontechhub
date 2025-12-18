import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import {
    ArrowLeftIcon,
    ChartBarIcon,
    CalculatorIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    SparklesIcon,
    CpuChipIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface Feature {
    id: number
    title: string
    description: string
    icon: string
    color: string
    features: string[]
    link: string
    linkText: string
}

interface Stats {
    accuracy_rate: number
    time_saved: number
    cost_reduction: number
    projects_analyzed: number
}

interface Insight {
    id: number
    type: string
    title: string
    description: string
    confidence: number
    impact: string
    date: string
}

interface AIFeaturesProps {
    features?: Feature[]
    stats?: Stats
    recent_insights?: Insight[]
}

export default function AIFeatures({
    features = [],
    stats = { accuracy_rate: 0, time_saved: 0, cost_reduction: 0, projects_analyzed: 0 },
    recent_insights = []
}: AIFeaturesProps) {
    const getIcon = (iconName: string) => {
        const icons: { [key: string]: any } = {
            ChartBarIcon,
            CalculatorIcon
        }
        return icons[iconName] || ChartBarIcon
    }

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: any } = {
            blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                border: 'border-blue-200',
                hover: 'hover:bg-blue-50',
                button: 'bg-blue-600 hover:bg-blue-700'
            },
            green: {
                bg: 'bg-green-100',
                text: 'text-green-600',
                border: 'border-green-200',
                hover: 'hover:bg-green-50',
                button: 'bg-green-600 hover:bg-green-700'
            }
        }
        return colors[color] || colors.blue
    }

    const getImpactColor = (impact: string) => {
        switch (impact.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'demand_forecast':
                return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
            case 'supplier_risk':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            case 'cost_optimization':
                return <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            default:
                return <LightBulbIcon className="w-5 h-5 text-gray-600" />
        }
    }

    return (
        <AppLayout>
            <Helmet><title>AI Features - The Central Hub - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/contractor-suite" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    Back to Suite
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">AI Features</h1>
                                    <p className="text-gray-600">Intelligent insights and predictions for your construction business</p>
                                </div>
                            </div>
                            <div className="flex items-center text-purple-600">
                                <CpuChipIcon className="w-5 h-5 mr-1" />
                                <span className="font-medium">AI Features</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Powered by Advanced AI</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Intelligent Construction
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Solutions</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Leverage the power of artificial intelligence to predict market trends,
                            optimize costs, and make data-driven decisions for your construction projects.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.accuracy_rate}%</div>
                            <div className="text-sm text-gray-600">Prediction Accuracy</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.time_saved}%</div>
                            <div className="text-sm text-gray-600">Time Saved</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.cost_reduction}%</div>
                            <div className="text-sm text-gray-600">Cost Reduction</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.projects_analyzed.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Projects Analyzed</div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {features.map((feature) => {
                            const IconComponent = getIcon(feature.icon)
                            const colorClasses = getColorClasses(feature.color)

                            return (
                                <div
                                    key={feature.id}
                                    className={`bg-white rounded-xl shadow-sm border ${colorClasses.border} p-8 ${colorClasses.hover} transition-all duration-200 hover:shadow-md`}
                                >
                                    <div className="flex items-center mb-6">
                                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">{feature.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {feature.features.map((featureItem, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                                {featureItem}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={feature.link}
                                        className={`w-full ${colorClasses.button} text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center`}
                                    >
                                        {feature.linkText}
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    {/* Recent Insights */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent AI Insights</h3>
                        <div className="space-y-4">
                            {recent_insights.map((insight) => (
                                <div key={insight.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                                                    {insight.impact} impact
                                                </span>
                                                <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">{new Date(insight.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CpuChipIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced AI Models</h3>
                            <p className="text-gray-600">Machine learning algorithms trained on millions of construction data points</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LightBulbIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                            <p className="text-gray-600">Get instant predictions and recommendations as market conditions change</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data-Driven Decisions</h3>
                            <p className="text-gray-600">Make informed decisions based on comprehensive market analysis and trends</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-3xl font-bold mb-4">Ready to Harness AI Power?</h3>
                        <p className="text-xl mb-8 opacity-90">
                            Start making smarter decisions with AI-powered insights and predictions
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                to="/ai-features/predictive-analytics"
                                className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center"
                            >
                                <ChartBarIcon className="w-5 h-5 mr-2" />
                                View Analytics
                            </Link>
                            <Link
                                to="/ai-features/cost-estimation"
                                className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-400 flex items-center"
                            >
                                <CalculatorIcon className="w-5 h-5 mr-2" />
                                Estimate Costs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
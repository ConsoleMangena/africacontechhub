import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import {
    ArrowLeftIcon,
    CubeIcon,
    BuildingOfficeIcon,
    HomeIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    SparklesIcon,
    ChartBarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface Service {
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
    total_approved: number
    total_funding: number
    avg_approval_time: string
    satisfaction_rate: number
}

interface FinancialServicesProps {
    services?: Service[]
    stats?: Stats
}

export default function FinancialServices({
    services = [],
    stats = { total_approved: 0, total_funding: 0, avg_approval_time: '0 days', satisfaction_rate: 0 }
}: FinancialServicesProps) {
    const getIcon = (iconName: string) => {
        const icons: { [key: string]: any } = {
            CubeIcon,
            BuildingOfficeIcon,
            HomeIcon
        }
        return icons[iconName] || CubeIcon
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
            },
            purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                border: 'border-purple-200',
                hover: 'hover:bg-purple-50',
                button: 'bg-purple-600 hover:bg-purple-700'
            }
        }
        return colors[color] || colors.blue
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <AppLayout>
            <Helmet><title>Financial Services - The Central Hub - The Central Hub</title></Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                                    <h1 className="text-3xl font-bold text-gray-900">Financial Services</h1>
                                    <p className="text-gray-600">Access funding and credit solutions for your construction business</p>
                                </div>
                            </div>
                            <div className="flex items-center text-blue-600">
                                <CurrencyDollarIcon className="w-5 h-5 mr-1" />
                                <span className="font-medium">Financial Services</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Comprehensive Financial Solutions</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Power Your Construction Business
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> with Smart Financing</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            From trade credit for materials to project financing and BNPL options for homeowners,
                            we provide the financial tools you need to grow your business.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total_approved.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Applications Approved</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_funding)}</div>
                            <div className="text-sm text-gray-600">Total Funding Provided</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.avg_approval_time}</div>
                            <div className="text-sm text-gray-600">Average Approval Time</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.satisfaction_rate}%</div>
                            <div className="text-sm text-gray-600">Customer Satisfaction</div>
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {services.map((service) => {
                            const IconComponent = getIcon(service.icon)
                            const colorClasses = getColorClasses(service.color)

                            return (
                                <div
                                    key={service.id}
                                    className={`bg-white rounded-xl shadow-sm border ${colorClasses.border} p-8 ${colorClasses.hover} transition-all duration-200 hover:shadow-md`}
                                >
                                    <div className="flex items-center mb-6">
                                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">{service.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {service.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={service.link}
                                        className={`w-full ${colorClasses.button} text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center`}
                                    >
                                        {service.linkText}
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Trusted</h3>
                            <p className="text-gray-600">Bank-level security with industry-leading encryption and fraud protection</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Rates</h3>
                            <p className="text-gray-600">Best-in-class interest rates and terms tailored to your business needs</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Processing</h3>
                            <p className="text-gray-600">Quick approval and funding to keep your projects moving forward</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of contractors who trust our financial services for their business growth
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                to="/financial-services/trade-credit"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center"
                            >
                                <CubeIcon className="w-5 h-5 mr-2" />
                                Apply for Trade Credit
                            </Link>
                            <Link
                                to="/financial-services/project-financing"
                                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 flex items-center"
                            >
                                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                                Get Project Financing
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
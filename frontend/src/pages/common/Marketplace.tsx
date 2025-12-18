import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    WrenchScrewdriverIcon,
    CubeIcon,
    ArrowRightIcon,
    StarIcon,
    EyeIcon,
    HeartIcon,
    ShoppingCartIcon,
    SparklesIcon,
    ChartBarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'

interface Category {
    id: string
    title: string
    description: string
    icon: string
    color: string
    link: string
    linkText: string
    features: string[]
    stats: {
        total_listings: number
        avg_price: number
        new_this_month: number
    }
}

interface FeaturedListing {
    id: number
    title: string
    category: string
    price: number
    unit: string
    supplier: string
    rating: number
    description: string
}

interface MarketplaceProps {
    categories?: Category[]
    featured_listings?: FeaturedListing[]
}

export default function Marketplace({ categories = [], featured_listings = [] }: MarketplaceProps) {
    const getIcon = (iconName: string) => {
        const icons: { [key: string]: any } = {
            BuildingOfficeIcon,
            WrenchScrewdriverIcon,
            CubeIcon
        }
        return icons[iconName] || BuildingOfficeIcon
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
            orange: {
                bg: 'bg-orange-100',
                text: 'text-orange-600',
                border: 'border-orange-200',
                hover: 'hover:bg-orange-50',
                button: 'bg-orange-600 hover:bg-orange-700'
            }
        }
        return colors[color] || colors.blue
    }

    const formatPrice = (price: number, unit: string = '') => {
        if (unit === 'per foot' || unit === 'per cubic yard' || unit === 'per foot') {
            return `$${price.toFixed(2)} ${unit}`
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <AppLayout>
            <Helmet><title>Marketplace - The Central Hub - The Central Hub</title></Helmet>

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
                                    <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                                    <p className="text-gray-600">Find and purchase real estate, equipment, and materials for your projects</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-blue-600">
                                    <ShoppingCartIcon className="w-5 h-5 mr-1" />
                                    <span className="font-medium">Marketplace</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <SparklesIcon className="w-4 h-4" />
                            <span>Complete Marketplace Solution</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Find Everything You Need
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> for Your Projects</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            From real estate and equipment to building materials, our marketplace
                            connects you with trusted suppliers and quality products.
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {categories.map((category: Category) => {
                            const IconComponent = getIcon(category.icon)
                            const colorClasses = getColorClasses(category.color)

                            return (
                                <div
                                    key={category.id}
                                    className={`bg-white rounded-xl shadow-sm border ${colorClasses.border} p-8 ${colorClasses.hover} transition-all duration-200 hover:shadow-md`}
                                >
                                    <div className="flex items-center mb-6">
                                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">{category.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {category.features.slice(0, 3).map((feature: string, index: number) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                                {feature}
                                            </li>
                                        ))}
                                        {category.features.length > 3 && (
                                            <li className="text-sm text-gray-500">
                                                +{category.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">{category.stats.total_listings}</div>
                                            <div className="text-xs text-gray-500">Listings</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {formatPrice(category.stats.avg_price)}
                                            </div>
                                            <div className="text-xs text-gray-500">Avg Price</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">{category.stats.new_this_month}</div>
                                            <div className="text-xs text-gray-500">New</div>
                                        </div>
                                    </div>

                                    <Link
                                        to={category.link}
                                        className={`w-full ${colorClasses.button} text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center`}
                                    >
                                        {category.linkText}
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    {/* Featured Listings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h3>
                            <p className="text-xl text-gray-600">Handpicked quality products from trusted suppliers</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featured_listings.map((listing: FeaturedListing) => (
                                <div key={listing.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500">{listing.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium text-gray-900">{listing.rating}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h4>
                                    <p className="text-gray-600 text-sm mb-4">{listing.description}</p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-xl font-bold text-gray-900">
                                            {formatPrice(listing.price, listing.unit)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            by {listing.supplier}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link
                                            to={listing.category === 'Real Estate' ? '/marketplace/real-estate' :
                                                listing.category === 'Equipment' ? '/marketplace/machinery-equipment' :
                                                    '/marketplace/building-materials'}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-2" />
                                            View Details
                                        </Link>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <HeartIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BuildingOfficeIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
                            <p className="text-gray-600">All suppliers are verified and rated by our community</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
                            <p className="text-gray-600">Compare prices and find the best deals for your projects</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
                            <p className="text-gray-600">Reviews and ratings from real contractors and suppliers</p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-3xl font-bold mb-4">Ready to Find What You Need?</h3>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of contractors who trust our marketplace for their project needs
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                to="/marketplace/real-estate"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center"
                            >
                                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                                Browse Real Estate
                            </Link>
                            <Link
                                to="/marketplace/machinery-equipment"
                                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 flex items-center"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                                View Equipment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
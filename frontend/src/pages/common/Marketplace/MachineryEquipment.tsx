import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AppLayout from '../../../layouts/AppLayout'
import {
    ArrowLeftIcon,
    WrenchScrewdriverIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    EyeIcon,
    HeartIcon,
    StarIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    CogIcon
} from '@heroicons/react/24/outline'

interface Listing {
    id: number
    title: string
    description: string
    category: string
    price: number
    supplier: string
    rating: number
    status: string
    condition: string
    year: number
    hours?: number
    features: string[]
}

interface MachineryEquipmentProps {
    listings?: Listing[]
    filters?: {
        category: string[]
        condition: string[]
    }
}

export default function MachineryEquipment({ listings = [], filters = { category: [], condition: [] } }: MachineryEquipmentProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFilters, setSelectedFilters] = useState({
        category: '',
        condition: '',
        price_range: ''
    })
    const [sortBy, setSortBy] = useState('newest')

    const handleFilterChange = (filterType: string, value: string) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
    }

    const filteredListings = listings?.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = !selectedFilters.category ||
            listing.category === selectedFilters.category

        const matchesCondition = !selectedFilters.condition ||
            listing.condition === selectedFilters.condition

        return matchesSearch && matchesCategory && matchesCondition
    }) || []

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800'
            case 'rental':
                return 'bg-blue-100 text-blue-800'
            case 'sold':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'New':
                return 'bg-green-100 text-green-800'
            case 'Used - Excellent':
                return 'bg-blue-100 text-blue-800'
            case 'Used - Good':
                return 'bg-yellow-100 text-yellow-800'
            case 'Used - Fair':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <>
            <AppLayout>
                <Helmet><title>Machinery & Equipment - The Central Hub Marketplace - The Central Hub</title></Helmet>

                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <div className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-6">
                                <div className="flex items-center space-x-4">
                                    <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
                                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                        Back to Marketplace
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Machinery & Equipment</h1>
                                        <p className="text-gray-600">Construction equipment, tools, and machinery</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-green-600">
                                        <WrenchScrewdriverIcon className="w-5 h-5 mr-1" />
                                        <span className="font-medium">Equipment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Equipment</label>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Search by equipment name or description..."
                                        />
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={selectedFilters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">All Categories</option>
                                        {filters.category.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Condition Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                                    <select
                                        value={selectedFilters.condition}
                                        onChange={(e) => handleFilterChange('condition', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">All Conditions</option>
                                        {filters.condition.map((condition) => (
                                            <option key={condition} value={condition}>{condition}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {filteredListings.length} Equipment Items Found
                                </h2>
                                <p className="text-gray-600">Browse available machinery and equipment</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="hours">Operating Hours</option>
                                </select>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredListings.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Try adjusting your search criteria or filters.
                                    </p>
                                </div>
                            ) : (
                                filteredListings.map((listing) => (
                                    <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Image Placeholder */}
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400" />
                                        </div>

                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-green-600">{listing.category}</span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                                        {listing.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-medium text-gray-900">{listing.rating}</span>
                                                </div>
                                            </div>

                                            {/* Title and Description */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                                            {/* Equipment Details */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Condition:</span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(listing.condition)}`}>
                                                        {listing.condition}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Year:</span>
                                                    <span className="font-medium">{listing.year}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Hours:</span>
                                                    <span className="font-medium">{listing.hours?.toLocaleString() || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(listing.price)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    by {listing.supplier}
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="mb-4">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Key Features:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {listing.features.slice(0, 3).map((feature, index) => (
                                                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                    {listing.features.length > 3 && (
                                                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                            +{listing.features.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center">
                                                    <EyeIcon className="w-4 h-4 mr-2" />
                                                    View Details
                                                </button>
                                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                    <HeartIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    )
}

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import AppLayout from '../../../layouts/AppLayout'
import {
    ArrowLeftIcon,
    CubeIcon,
    CurrencyDollarIcon,
    EyeIcon,
    HeartIcon,
    StarIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    TruckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Listing {
    id: number
    title: string
    description: string
    category: string
    price: number
    unit: string
    supplier: string
    rating: number
    status: string
    stock: number
    grade: string
    length: string
    features: string[]
}

interface BuildingMaterialsProps {
    listings?: Listing[]
    filters?: {
        category: string[]
        supplier: string[]
    }
}

export default function BuildingMaterials({ listings = [], filters = { category: [], supplier: [] } }: BuildingMaterialsProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFilters, setSelectedFilters] = useState({
        category: '',
        price_range: '',
        supplier: ''
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

        const matchesSupplier = !selectedFilters.supplier ||
            listing.supplier === selectedFilters.supplier

        return matchesSearch && matchesCategory && matchesSupplier
    }) || []

    const formatPrice = (price: number, unit?: string) => {
        if (unit === 'per foot' || unit === 'per cubic yard') {
            return `$${price.toFixed(2)} ${unit}`
        }
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
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800'
            case 'out_of_stock':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStockColor = (stock: number) => {
        if (stock > 50) return 'text-green-600'
        if (stock > 20) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <>
            <AppLayout>
                <Helmet><title>Building Materials - The Central Hub Marketplace - The Central Hub</title></Helmet>

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
                                        <h1 className="text-3xl font-bold text-gray-900">Building Materials</h1>
                                        <p className="text-gray-600">Construction materials, supplies, and components</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-orange-600">
                                        <CubeIcon className="w-5 h-5 mr-1" />
                                        <span className="font-medium">Materials</span>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Search by material name or description..."
                                        />
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={selectedFilters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">All Categories</option>
                                        {filters.category.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Supplier Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                                    <select
                                        value={selectedFilters.supplier}
                                        onChange={(e) => handleFilterChange('supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">All Suppliers</option>
                                        {filters.supplier.map((supplier) => (
                                            <option key={supplier} value={supplier}>{supplier}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {filteredListings.length} Materials Found
                                </h2>
                                <p className="text-gray-600">Browse available building materials and supplies</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="stock">Stock Level</option>
                                </select>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredListings.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Try adjusting your search criteria or filters.
                                    </p>
                                </div>
                            ) : (
                                filteredListings.map((listing) => (
                                    <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Image Placeholder */}
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            <CubeIcon className="w-12 h-12 text-gray-400" />
                                        </div>

                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-orange-600">{listing.category}</span>
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

                                            {/* Material Details */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Grade:</span>
                                                    <span className="font-medium">{listing.grade}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Length:</span>
                                                    <span className="font-medium">{listing.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Stock:</span>
                                                    <span className={`font-medium ${getStockColor(listing.stock)}`}>
                                                        {listing.stock} units
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(listing.price, listing.unit)}
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
                                                <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center">
                                                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                                                    Add to Cart
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

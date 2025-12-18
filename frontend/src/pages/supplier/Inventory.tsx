import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { 
    ArrowLeftIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CubeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    ArrowRightIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Inventory({ inventory = [] }) {
    const [filter, setFilter] = useState('all')

    const filters = [
        { id: 'all', name: 'All Items', count: inventory?.length || 0 },
        { id: 'low_stock', name: 'Low Stock', count: inventory?.filter(item => item.current_stock <= item.min_stock).length || 0 },
        { id: 'out_of_stock', name: 'Out of Stock', count: inventory?.filter(item => item.current_stock === 0).length || 0 },
        { id: 'restock_needed', name: 'Restock Needed', count: inventory?.filter(item => item.current_stock <= item.min_stock * 1.2).length || 0 },
    ]

    const getStockStatus = (item) => {
        if (item.current_stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
        if (item.current_stock <= item.min_stock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon }
        return { status: 'good', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
    }

    const filteredInventory = inventory?.filter(item => {
        if (filter === 'all') return true
        if (filter === 'low_stock') return item.current_stock <= item.min_stock && item.current_stock > 0
        if (filter === 'out_of_stock') return item.current_stock === 0
        if (filter === 'restock_needed') return item.current_stock <= item.min_stock * 1.2
        return true
    }) || []

    return (
        <>
        
            <Helmet><title>Inventory & Supply Chain - The Central Hub - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <Link to="/supplier-platform" className="flex items-center text-gray-600 hover:text-gray-900">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                                    Back to Platform
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Inventory & Supply Chain</h1>
                                    <p className="text-gray-600">Real-time inventory tracking, automated reordering, and Landed Cost Tracking</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex space-x-4">
                            {filters.map((filterItem) => (
                                <button
                                    key={filterItem.id}
                                    onClick={() => setFilter(filterItem.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        filter === filterItem.id
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {filterItem.name} ({filterItem.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inventory List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
                            <p className="text-sm text-gray-600">Track your inventory and manage supply chain</p>
                        </div>
                        
                        {filteredInventory.length === 0 ? (
                            <div className="text-center py-12">
                                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all' 
                                        ? 'Get started by adding your first product.'
                                        : `No ${filter.replace('_', ' ')} items found.`
                                    }
                                </p>
                                <div className="mt-6">
                                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Product
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Restocked</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredInventory.map((item) => {
                                            const stockStatus = getStockStatus(item)
                                            const StatusIcon = stockStatus.icon
                                            
                                            return (
                                                <>
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                    <CubeIcon className="h-6 w-6 text-gray-500" />
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                                                <div className="text-sm text-gray-500">{item.sku}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="text-sm font-medium text-gray-900 mr-2">{item.current_stock}</span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {stockStatus.status === 'out' ? 'Out' : stockStatus.status === 'low' ? 'Low' : 'Good'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">Min: {item.min_stock}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">${item.unit_cost}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.supplier}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.last_restocked}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button className="text-blue-600 hover:text-blue-900">
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                </>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CubeIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                        <dd className="text-lg font-medium text-gray-900">{inventory?.length || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {inventory?.filter(item => item.current_stock <= item.min_stock && item.current_stock > 0).length || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            ${inventory?.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0).toLocaleString() || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Suppliers</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {new Set(inventory?.map(item => item.supplier)).size || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    )
}

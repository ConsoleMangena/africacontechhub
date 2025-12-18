import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import { 
    ArrowLeftIcon,
    CalculatorIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CheckCircleIcon,
    PlusIcon,
    TrashIcon,
    ArrowRightIcon,
    LightBulbIcon,
    SparklesIcon
} from '@heroicons/react/24/outline'

export default function TCOCalculator({ calculations = [] }) {
    const [formData, setFormData] = useState({
        productName: '',
        initialCost: '',
        maintenanceCost: '',
        operationalCost: '',
        disposalCost: '',
        lifespan: '',
        savings: ''
    })

    const [calculationsList, setCalculationsList] = useState(calculations || [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const calculateTCO = () => {
        const initial = parseFloat(formData.initialCost) || 0
        const maintenance = parseFloat(formData.maintenanceCost) || 0
        const operational = parseFloat(formData.operationalCost) || 0
        const disposal = parseFloat(formData.disposalCost) || 0
        const savings = parseFloat(formData.savings) || 0
        
        const totalTCO = initial + maintenance + operational + disposal
        const netTCO = totalTCO - savings
        const roi = savings > 0 ? ((savings / totalTCO) * 100) : 0

        return {
            totalTCO,
            netTCO,
            roi
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const result = calculateTCO()
        
        const newCalculation = {
            id: Date.now(),
            product_name: formData.productName,
            initial_cost: parseFloat(formData.initialCost) || 0,
            maintenance_cost: parseFloat(formData.maintenanceCost) || 0,
            operational_cost: parseFloat(formData.operationalCost) || 0,
            disposal_cost: parseFloat(formData.disposalCost) || 0,
            total_tco: result.totalTCO,
            savings: parseFloat(formData.savings) || 0,
            roi_percentage: result.roi
        }

        setCalculationsList(prev => [newCalculation, ...prev])
        
        // Reset form
        setFormData({
            productName: '',
            initialCost: '',
            maintenanceCost: '',
            operationalCost: '',
            disposalCost: '',
            lifespan: '',
            savings: ''
        })
    }

    const tcoResult = calculateTCO()

    return (
        <>
        
            <Helmet><title>TCO Calculator - The Central Hub - The Central Hub</title></Helmet>
            
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
                                    <h1 className="text-3xl font-bold text-gray-900">TCO Calculator</h1>
                                    <p className="text-gray-600">Total Cost of Ownership calculations to demonstrate value beyond price</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-orange-600">
                                    <CalculatorIcon className="w-5 h-5 mr-1" />
                                    <span className="font-medium">TCO Calculator</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Value Proposition */}
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-8 mb-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Demonstrate True Value</h3>
                            <p className="text-lg text-gray-600 mb-6">
                                Calculate the total cost of ownership to show customers the real value of your products 
                                beyond the initial purchase price.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Complete Cost Analysis</h4>
                                    <p className="text-sm text-gray-600">Include all costs over product lifecycle</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <ChartBarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">ROI Calculations</h4>
                                    <p className="text-sm text-gray-600">Show return on investment</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <LightBulbIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Value Demonstration</h4>
                                    <p className="text-sm text-gray-600">Prove value beyond price</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Calculator Form */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">TCO Calculator</h3>
                                <p className="text-sm text-gray-600">Enter the costs to calculate total cost of ownership</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Initial Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="initialCost"
                                            value={formData.initialCost}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maintenance Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="maintenanceCost"
                                            value={formData.maintenanceCost}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Operational Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="operationalCost"
                                            value={formData.operationalCost}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Disposal Cost ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="disposalCost"
                                            value={formData.disposalCost}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Savings/Benefits ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="savings"
                                        value={formData.savings}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center"
                                >
                                    <CalculatorIcon className="w-5 h-5 mr-2" />
                                    Calculate TCO
                                </button>
                            </form>
                        </div>

                        {/* Results */}
                        <div className="space-y-6">
                            {/* Current Calculation Results */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Current Calculation</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Total TCO:</span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                ${tcoResult.totalTCO.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Net TCO:</span>
                                            <span className="text-lg font-semibold text-gray-900">
                                                ${tcoResult.netTCO.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-gray-600">ROI:</span>
                                            <span className={`text-lg font-semibold ${tcoResult.roi > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tcoResult.roi.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Calculations */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Previous Calculations</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {calculationsList.map((calc) => (
                                        <div key={calc.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{calc.product_name}</h4>
                                                    <p className="text-sm text-gray-600">TCO: ${calc.total_tco.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ROI: {calc.roi_percentage.toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Savings: ${calc.savings.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-8 bg-white rounded-lg shadow p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Why Use TCO Analysis?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Complete Picture</h4>
                                <p className="text-sm text-gray-600">Show all costs, not just initial price</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <ChartBarIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">ROI Demonstration</h4>
                                <p className="text-sm text-gray-600">Prove return on investment</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <LightBulbIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Value Proposition</h4>
                                <p className="text-sm text-gray-600">Justify premium pricing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    )
}

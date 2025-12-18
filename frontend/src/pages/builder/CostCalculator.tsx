import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { 
    ArrowLeftIcon,
    CalculatorIcon,
    CurrencyDollarIcon,
    HomeIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    DocumentTextIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CostBreakdown {
    category: string;
    items: {
        name: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
    }[];
    subtotal: number;
}

interface ProjectDetails {
    projectType: string;
    size: number;
    location: string;
    quality: string;
    features: string[];
}

export default function CostCalculator() {
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
        projectType: 'residential',
        size: 0,
        location: 'harare',
        quality: 'standard',
        features: []
    });

    const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
    const [totalCost, setTotalCost] = useState(0);
    const [contingency, setContingency] = useState(15);
    const [finalTotal, setFinalTotal] = useState(0);

    const projectTypes = [
        { id: 'residential', name: 'Residential House', icon: HomeIcon },
        { id: 'townhouse', name: 'Townhouse', icon: HomeIcon },
        { id: 'apartment', name: 'Apartment', icon: HomeIcon },
        { id: 'commercial', name: 'Commercial Building', icon: WrenchScrewdriverIcon }
    ];

    const locations = [
        { id: 'harare', name: 'Harare', multiplier: 1.0 },
        { id: 'bulawayo', name: 'Bulawayo', multiplier: 0.95 },
        { id: 'gweru', name: 'Gweru', multiplier: 0.90 },
        { id: 'mutare', name: 'Mutare', multiplier: 0.92 },
        { id: 'other', name: 'Other', multiplier: 0.88 }
    ];

    const qualityLevels = [
        { id: 'basic', name: 'Basic', multiplier: 0.8, description: 'Economical materials and finishes' },
        { id: 'standard', name: 'Standard', multiplier: 1.0, description: 'Good quality materials and finishes' },
        { id: 'premium', name: 'Premium', multiplier: 1.3, description: 'High-quality materials and finishes' },
        { id: 'luxury', name: 'Luxury', multiplier: 1.6, description: 'Premium materials and custom finishes' }
    ];

    const features = [
        { id: 'swimming-pool', name: 'Swimming Pool', cost: 15000 },
        { id: 'garage', name: 'Garage (2 cars)', cost: 8000 },
        { id: 'garden', name: 'Landscaped Garden', cost: 5000 },
        { id: 'security', name: 'Security System', cost: 3000 },
        { id: 'solar', name: 'Solar Power System', cost: 12000 },
        { id: 'borehole', name: 'Borehole', cost: 4000 },
        { id: 'fencing', name: 'Perimeter Fencing', cost: 6000 },
        { id: 'pavement', name: 'Paved Driveway', cost: 3000 }
    ];

    const baseCosts = {
        residential: 120, // per sqm
        townhouse: 110,
        apartment: 100,
        commercial: 150
    };

    useEffect(() => {
        calculateCosts();
    }, [projectDetails, contingency]);

    const calculateCosts = () => {
        if (projectDetails.size === 0) {
            setCostBreakdown([]);
            setTotalCost(0);
            setFinalTotal(0);
            return;
        }

        const baseCost = baseCosts[projectDetails.projectType as keyof typeof baseCosts] || 120;
        const locationMultiplier = locations.find(l => l.id === projectDetails.location)?.multiplier || 1.0;
        const qualityMultiplier = qualityLevels.find(q => q.id === projectDetails.quality)?.multiplier || 1.0;
        
        const adjustedBaseCost = baseCost * locationMultiplier * qualityMultiplier;
        const baseTotal = projectDetails.size * adjustedBaseCost;

        const breakdown: CostBreakdown[] = [
            {
                category: 'Foundation & Structure',
                items: [
                    { name: 'Excavation & Foundation', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.25, totalCost: projectDetails.size * adjustedBaseCost * 0.25 },
                    { name: 'Structural Framework', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.30, totalCost: projectDetails.size * adjustedBaseCost * 0.30 },
                    { name: 'Roof Structure', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.15, totalCost: projectDetails.size * adjustedBaseCost * 0.15 }
                ],
                subtotal: projectDetails.size * adjustedBaseCost * 0.70
            },
            {
                category: 'Building Envelope',
                items: [
                    { name: 'Walls & Partitions', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.20, totalCost: projectDetails.size * adjustedBaseCost * 0.20 },
                    { name: 'Windows & Doors', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.10, totalCost: projectDetails.size * adjustedBaseCost * 0.10 }
                ],
                subtotal: projectDetails.size * adjustedBaseCost * 0.30
            },
            {
                category: 'Services & Finishes',
                items: [
                    { name: 'Electrical Installation', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.08, totalCost: projectDetails.size * adjustedBaseCost * 0.08 },
                    { name: 'Plumbing Installation', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.06, totalCost: projectDetails.size * adjustedBaseCost * 0.06 },
                    { name: 'Flooring', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.12, totalCost: projectDetails.size * adjustedBaseCost * 0.12 },
                    { name: 'Painting & Finishes', quantity: projectDetails.size, unit: 'sqm', unitCost: adjustedBaseCost * 0.08, totalCost: projectDetails.size * adjustedBaseCost * 0.08 }
                ],
                subtotal: projectDetails.size * adjustedBaseCost * 0.34
            }
        ];

        const subtotal = breakdown.reduce((sum, category) => sum + category.subtotal, 0);
        const featuresCost = projectDetails.features.reduce((sum, featureId) => {
            const feature = features.find(f => f.id === featureId);
            return sum + (feature?.cost || 0);
        }, 0);

        const total = subtotal + featuresCost;
        const contingencyAmount = total * (contingency / 100);
        const final = total + contingencyAmount;

        setCostBreakdown(breakdown);
        setTotalCost(total);
        setFinalTotal(final);
    };

    const toggleFeature = (featureId: string) => {
        setProjectDetails(prev => ({
            ...prev,
            features: prev.features.includes(featureId)
                ? prev.features.filter(id => id !== featureId)
                : [...prev.features, featureId]
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
        
            <Helmet><title>Cost Calculator - Aspirational Builder Portal - The Central Hub</title></Helmet>
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                {/* Header */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link 
                                    to="/aspirational-builder"
                                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center mb-4"
                                >
                                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                    Back to Aspirational Builder Portal
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">Cost Calculator</h1>
                                <p className="text-gray-600 mt-2">Get accurate cost estimates for your construction project</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{formatCurrency(finalTotal)}</div>
                                <div className="text-sm text-gray-600">Estimated Total Cost</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Project Details Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Details</h2>
                            
                            <div className="space-y-6">
                                {/* Project Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Project Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {projectTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setProjectDetails(prev => ({ ...prev, projectType: type.id }))}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    projectDetails.projectType === type.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <type.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                                <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Size (Square Meters)</label>
                                    <input
                                        type="number"
                                        value={projectDetails.size}
                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, size: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter size in square meters"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <select
                                        value={projectDetails.location}
                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {locations.map(location => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quality Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Quality Level</label>
                                    <div className="space-y-2">
                                        {qualityLevels.map(quality => (
                                            <button
                                                key={quality.id}
                                                onClick={() => setProjectDetails(prev => ({ ...prev, quality: quality.id }))}
                                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                                    projectDetails.quality === quality.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{quality.name}</div>
                                                        <div className="text-sm text-gray-600">{quality.description}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {quality.multiplier}x base cost
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Features */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Additional Features</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {features.map(feature => (
                                            <button
                                                key={feature.id}
                                                onClick={() => toggleFeature(feature.id)}
                                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                                    projectDetails.features.includes(feature.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                                                    <span className="text-sm text-gray-500">{formatCurrency(feature.cost)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Contingency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contingency (%)</label>
                                    <input
                                        type="number"
                                        value={contingency}
                                        onChange={(e) => setContingency(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        max="50"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Recommended: 15-20% for unexpected costs</p>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Breakdown</h2>
                            
                            {costBreakdown.length > 0 ? (
                                <div className="space-y-6">
                                    {costBreakdown.map((category, index) => (
                                        <div key={index}>
                                            <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                                            <div className="space-y-2">
                                                {category.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.quantity} {item.unit} × {formatCurrency(item.unitCost)}</div>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatCurrency(item.totalCost)}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center py-2 font-semibold text-gray-900">
                                                    <span>Subtotal</span>
                                                    <span>{formatCurrency(category.subtotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {projectDetails.features.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Additional Features</h3>
                                            <div className="space-y-2">
                                                {projectDetails.features.map(featureId => {
                                                    const feature = features.find(f => f.id === featureId);
                                                    return feature ? (
                                                        <div key={featureId} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                            <span className="text-sm text-gray-900">{feature.name}</span>
                                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(feature.cost)}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="font-medium text-gray-900">Subtotal</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(totalCost)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="font-medium text-gray-900">Contingency ({contingency}%)</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(totalCost * (contingency / 100))}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-t border-gray-200">
                                            <span className="text-lg font-bold text-gray-900">Total Estimated Cost</span>
                                            <span className="text-lg font-bold text-blue-600">{formatCurrency(finalTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-start">
                                            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Important Notes:</p>
                                                <ul className="space-y-1 text-xs">
                                                    <li>• Costs are estimates and may vary based on actual conditions</li>
                                                    <li>• Prices include materials and labor but exclude permits and fees</li>
                                                    <li>• Get multiple quotes from contractors for accurate pricing</li>
                                                    <li>• Consider inflation and price fluctuations over time</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Project Details</h3>
                                    <p className="text-gray-600">Fill in your project details to see the cost breakdown</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    );
}

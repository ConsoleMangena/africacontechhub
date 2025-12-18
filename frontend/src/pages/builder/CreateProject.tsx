import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    PhotoIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

interface ProjectFormData {
    title: string;
    description: string;
    type: string;
    location: string;
    budget_range: number;
    timeline: string;
    images: File[];
    requirements: string[];
}

interface AIEstimation {
    estimated_cost: number;
    confidence: string;
    factors: string[];
    recommendations: string[];
    risks: string[];
}

export default function CreateProject() {
    const [aiEstimation, setAiEstimation] = useState<AIEstimation | null>(null);
    const [showAiEstimation, setShowAiEstimation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    // Mock post
    const post = (url: string, options?: any) => {
        console.log('Post:', url, formData);
        if (options?.onSuccess) options.onSuccess();
    }

    const [formData, setFormData] = React.useState<ProjectFormData>({
        title: '',
        description: '',
        type: '',
        location: '',
        budget_range: 0,
        timeline: '',
        images: [],
        requirements: []
    });

    const projectTypes = [
        { value: 'residential', label: 'Residential', icon: '🏠' },
        { value: 'commercial', label: 'Commercial', icon: '🏢' },
        { value: 'renovation', label: 'Renovation', icon: '🔨' },
        { value: 'maintenance', label: 'Maintenance', icon: '🔧' }
    ];

    const timelineOptions = [
        { value: '1-2 weeks', label: '1-2 weeks' },
        { value: '1 month', label: '1 month' },
        { value: '2-3 months', label: '2-3 months' },
        { value: '6 months', label: '6 months' },
        { value: '1 year', label: '1 year' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/projects', {
            onSuccess: () => {
                // Handle success
            },
            onError: () => {
                // Handle error
            }
        });
    };

    const handleAiEstimation = async () => {
        if (!formData?.title || !formData?.description || !formData?.type || !formData?.location) {
            alert('Please fill in the basic project details first');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/ai/cost-estimation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData?.title,
                    description: formData?.description,
                    type: formData?.type,
                    location: formData?.location,
                    budget_range: formData?.budget_range
                })
            });

            const result = await response.json();
            if (result.success) {
                setAiEstimation(result.data);
                setShowAiEstimation(true);
            }
        } catch (error) {
            console.error('Error getting AI estimation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log('set: images', Array.from(e.target.files));
        }
    };

    const handleRequirementAdd = (requirement: string) => {
        if (requirement.trim() && !formData?.requirements.includes(requirement.trim())) {
            console.log('set: requirements', [...formData?.requirements, requirement.trim()]);
        }
    };

    const handleRequirementRemove = (index: number) => {
        console.log('set: requirements', formData?.requirements.filter((_, i) => i !== index));
    };

    return (
        <>

            <Helmet><title>Create Project - The Central Hub</title></Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                    <p className="text-gray-600 mt-2">Tell us about your project and we'll match you with the best contractors.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData?.title}
                                    onChange={(e) => console.log('set: title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Kitchen Renovation"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Type *
                                </label>
                                <select
                                    value={formData?.type}
                                    onChange={(e) => console.log('set: type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select project type</option>
                                    {projectTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Description *
                            </label>
                            <textarea
                                value={formData?.description}
                                onChange={(e) => console.log('set: description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe your project in detail..."
                                required
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Location & Budget */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Budget</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPinIcon className="inline w-4 h-4 mr-1" />
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    value={formData?.location}
                                    onChange={(e) => console.log('set: location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., New York, NY"
                                    required
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CurrencyDollarIcon className="inline w-4 h-4 mr-1" />
                                    Budget Range *
                                </label>
                                <input
                                    type="number"
                                    value={formData?.budget_range}
                                    onChange={(e) => console.log('set: budget_range', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 50000"
                                    min="1000"
                                    required
                                />
                                {errors.budget_range && <p className="text-red-500 text-sm mt-1">{errors.budget_range}</p>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="inline w-4 h-4 mr-1" />
                                Timeline *
                            </label>
                            <select
                                value={formData?.timeline}
                                onChange={(e) => console.log('set: timeline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select timeline</option>
                                {timelineOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.timeline && <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>}
                        </div>
                    </div>

                    {/* AI Cost Estimation */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                                    AI Cost Estimation
                                </h2>
                                <p className="text-sm text-gray-600">Get an AI-powered cost estimate for your project</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAiEstimation}
                                disabled={loading}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Analyzing...' : 'Get AI Estimate'}
                            </button>
                        </div>

                        {showAiEstimation && aiEstimation && (
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Estimated Cost</h3>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${aiEstimation.estimated_cost.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Confidence: {aiEstimation.confidence}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Key Factors</h3>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {aiEstimation.factors.map((factor, index) => (
                                                <li key={index}>• {factor}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {aiEstimation.recommendations.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {aiEstimation.recommendations.map((rec, index) => (
                                                <li key={index}>• {rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Project Images */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Images</h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="images" className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Upload project images
                                    </span>
                                    <span className="mt-1 block text-sm text-gray-500">
                                        PNG, JPG, GIF up to 10MB each
                                    </span>
                                </label>
                                <input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="sr-only"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Project Requirements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Requirements</h2>

                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Add a requirement..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleRequirementAdd(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.querySelector('input[placeholder="Add a requirement..."]') as HTMLInputElement;
                                        if (input) {
                                            handleRequirementAdd(input.value);
                                            input.value = '';
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            {formData?.requirements.length > 0 && (
                                <div className="space-y-2">
                                    {formData?.requirements.map((requirement, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                            <span className="text-sm text-gray-700">{requirement}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRequirementRemove(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            disabled={false}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {'Create Project'}
                        </button>
                    </div>
                </form>
            </div>

        </>
    );
}

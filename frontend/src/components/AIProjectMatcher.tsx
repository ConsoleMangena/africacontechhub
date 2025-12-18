import React, { useState, useEffect } from 'react';
import { 
    SparklesIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    StarIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ProjectMatch {
    contractor: {
        id: number;
        business_name: string;
        rating: number;
        location: string;
        specialty: string;
        has_insurance: boolean;
        verification_status: string;
        portfolio_images: string[];
    };
    match_score: number;
    estimated_cost: {
        min: number;
        max: number;
        confidence: string;
    };
    timeline: {
        min_days: number;
        max_days: number;
        confidence: string;
    };
    ai_insights: {
        strengths: string[];
        considerations: string[];
        recommendations: string[];
    };
}

interface ProjectData {
    title: string;
    description: string;
    type: string;
    location: string;
    budget_range: number;
    timeline: string;
}

export default function AIProjectMatcher({ projectData }: { projectData: ProjectData }) {
    const [matches, setMatches] = useState<ProjectMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);

    useEffect(() => {
        if (projectData.title && projectData.description) {
            findMatches();
        }
    }, [projectData]);

    const findMatches = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/contractors/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: null, // For new projects
                    project_data: projectData
                })
            });

            const data = await response.json();
            if (data?.success) {
                setMatches(data?.data);
            }
        } catch (error) {
            console.error('Error finding matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMatchScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 80) return 'text-blue-600 bg-blue-50';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'text-green-600 bg-green-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const ContractorMatchCard = ({ match }: { match: ProjectMatch }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.contractor.business_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{match.contractor.business_name}</h3>
                        <p className="text-sm text-gray-600">{match.contractor.specialty}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score}% Match
                    </div>
                    {match.contractor.verification_status === 'Fully Verified' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{match.contractor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{match.contractor.rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {match.contractor.has_insurance ? (
                        <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-600">
                        {match.contractor.has_insurance ? 'Insured' : 'Not Insured'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Estimated Cost</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(match.estimated_cost.confidence)}`}>
                            {match.estimated_cost.confidence} confidence
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        ${match.estimated_cost.min.toLocaleString()} - ${match.estimated_cost.max.toLocaleString()}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Timeline</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(match.timeline.confidence)}`}>
                            {match.timeline.confidence} confidence
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {match.timeline.min_days} - {match.timeline.max_days} days
                    </p>
                </div>
            </div>

            {match.ai_insights && (
                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Insights</h4>
                        <div className="space-y-2">
                            {match.ai_insights.strengths.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {match.ai_insights.strengths.map((strength, index) => (
                                            <li key={index}>• {strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {match.ai_insights.considerations.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-yellow-700 mb-1">Considerations:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {match.ai_insights.considerations.map((consideration, index) => (
                                            <li key={index}>• {consideration}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Profile
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Contractor
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Finding AI-powered matches...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* AI Analysis Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">AI-Powered Project Matching</h2>
                </div>
                <p className="text-sm text-gray-600">
                    Our AI has analyzed your project requirements and found the best matching contractors based on 
                    location, specialty, experience, and performance history.
                </p>
            </div>

            {/* Matches */}
            <div className="space-y-6">
                {matches.length > 0 ? (
                    matches.map((match, index) => (
                        <div key={match.contractor.id} className="relative">
                            {index === 0 && (
                                <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium z-10">
                                    Best Match
                                </div>
                            )}
                            <ContractorMatchCard match={match} />
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                        <p className="text-gray-600">
                            Try adjusting your project requirements or expanding your search criteria.
                        </p>
                    </div>
                )}
            </div>

            {/* AI Recommendations */}
            {matches.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Consider multiple bids</p>
                                <p className="text-sm text-gray-600">
                                    Get quotes from at least 3 contractors to ensure competitive pricing.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Verify insurance and licenses</p>
                                <p className="text-sm text-gray-600">
                                    Always confirm that contractors have proper insurance and required licenses.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Review portfolios</p>
                                <p className="text-sm text-gray-600">
                                    Check previous work to ensure quality matches your expectations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

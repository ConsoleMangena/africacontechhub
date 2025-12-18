import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AppLayout from '../../layouts/AppLayout';
import { 
    MagnifyingGlassIcon,
    FunnelIcon,
    StarIcon,
    MapPinIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface Contractor {
    id: number;
    business_name: string;
    description: string;
    specialty: string;
    location: string;
    rating: number;
    projects_completed: number;
    performance_score: number;
    has_insurance: boolean;
    verification_status: string;
    portfolio_images: string[];
    user: {
        name: string;
        email: string;
    };
}

interface FilterOptions {
    specialty: string;
    location: string;
    min_rating: number;
    has_insurance: boolean;
    service_areas: string[];
}

export default function ContractorsDirectory() {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        specialty: '',
        location: '',
        min_rating: 0,
        has_insurance: false,
        service_areas: []
    });

    const specialties = [
        'Residential Construction',
        'Commercial Construction',
        'Renovation',
        'Maintenance',
        'Electrical',
        'Plumbing',
        'HVAC',
        'Roofing',
        'Flooring',
        'Painting'
    ];

    const locations = [
        'New York, NY',
        'Los Angeles, CA',
        'Chicago, IL',
        'Houston, TX',
        'Phoenix, AZ',
        'Philadelphia, PA',
        'San Antonio, TX',
        'San Diego, CA',
        'Dallas, TX',
        'San Jose, CA'
    ];

    useEffect(() => {
        fetchContractors();
    }, [filters]);

    const fetchContractors = async () => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== 0 && value !== false) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`/api/contractors?${queryParams}`);
            const data = await response.json();
            
            if (data?.success) {
                setContractors(data?.data?.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contractors:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof FilterOptions, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            specialty: '',
            location: '',
            min_rating: 0,
            has_insurance: false,
            service_areas: []
        });
    };

    const filteredContractors = contractors.filter(contractor => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                <>
                contractor.business_name.toLowerCase().includes(searchLower) ||
                contractor.specialty.toLowerCase().includes(searchLower) ||
                contractor.location.toLowerCase().includes(searchLower)
                </>
            );
        }
        return true;
    });

    const ContractorCard = ({ contractor }: { contractor: Contractor }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {contractor.business_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contractor.business_name}</h3>
                        <p className="text-sm text-gray-600">{contractor.specialty}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {contractor.verification_status === 'Fully Verified' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    {contractor.has_insurance && (
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                    )}
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{contractor.description}</p>

            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{contractor.location}</span>
                </div>
                <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900">{contractor.rating}</span>
                </div>
                <div className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{contractor.projects_completed} projects</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Performance Score:</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${contractor.performance_score}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{contractor.performance_score}%</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Profile
                </button>
            </div>
        </div>
    );

    const FilterPanel = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select
                        value={filters.specialty}
                        onChange={(e) => handleFilterChange('specialty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Specialties</option>
                        {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Locations</option>
                        {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Rating: {filters.min_rating}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.min_rating}
                        onChange={(e) => handleFilterChange('min_rating', parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="has_insurance"
                        checked={filters.has_insurance}
                        onChange={(e) => handleFilterChange('has_insurance', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_insurance" className="ml-2 text-sm text-gray-700">
                        Has Insurance
                    </label>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <>
            <AppLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AppLayout>
            </>
        );
    }

    return (
        <>
        <AppLayout>
            <Helmet><title>Contractors Directory - The Central Hub</title></Helmet>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Contractors Directory</h1>
                    <p className="text-gray-600 mt-2">Find the perfect contractor for your project</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search contractors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FunnelIcon className="w-5 h-5 mr-2" />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="lg:col-span-1">
                            <FilterPanel />
                        </div>
                    )}

                    {/* Contractors Grid */}
                    <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {filteredContractors.length} Contractors Found
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Sort by:</span>
                                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                                    <option value="rating">Rating</option>
                                    <option value="projects">Projects Completed</option>
                                    <option value="performance">Performance Score</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredContractors.map((contractor) => (
                                <ContractorCard key={contractor.id} contractor={contractor} />
                            ))}
                        </div>

                        {filteredContractors.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
                                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
        </>
    );
}
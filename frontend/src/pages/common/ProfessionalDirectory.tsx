import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { 
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    StarIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    PhoneIcon,
    EnvelopeIcon,
    WrenchScrewdriverIcon,
    HomeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    FunnelIcon,
    BarsArrowUpIcon
} from '@heroicons/react/24/outline';

interface Professional {
    id: number;
    name: string;
    businessName: string;
    profession: string;
    location: string;
    rating: number;
    reviewCount: number;
    experience: string;
    verified: boolean;
    insured: boolean;
    specialties: string[];
    description: string;
    phone: string;
    email: string;
    website?: string;
    portfolio: string[];
    certifications: string[];
    availability: 'available' | 'busy' | 'unavailable';
    responseTime: string;
    priceRange: string;
}

export default function ProfessionalDirectory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

    const professionals: Professional[] = [
        {
            id: 1,
            name: 'Tendai Moyo',
            businessName: 'Moyo Construction',
            profession: 'General Contractor',
            location: 'Harare',
            rating: 4.9,
            reviewCount: 47,
            experience: '15 years',
            verified: true,
            insured: true,
            specialties: ['Residential Construction', 'Renovations', 'Project Management'],
            description: 'Experienced general contractor specializing in residential construction and renovations. Known for quality work and timely completion.',
            phone: '+263 77 123 4567',
            email: 'tendai@moyoconstruction.co.zw',
            website: 'www.moyoconstruction.co.zw',
            portfolio: ['Modern House - Borrowdale', 'Townhouse Complex - Avondale', 'Office Renovation - CBD'],
            certifications: ['Zimbabwe Building Contractors Association', 'Project Management Professional'],
            availability: 'available',
            responseTime: 'Within 2 hours',
            priceRange: '$50 - $100 per hour'
        },
        {
            id: 2,
            name: 'Sarah Chigwada',
            businessName: 'Chigwada Architects',
            profession: 'Architect',
            location: 'Bulawayo',
            rating: 4.8,
            reviewCount: 32,
            experience: '12 years',
            verified: true,
            insured: true,
            specialties: ['Residential Design', 'Commercial Architecture', 'Sustainable Design'],
            description: 'Creative architect with expertise in modern residential and commercial design. Focus on sustainable and energy-efficient buildings.',
            phone: '+263 77 234 5678',
            email: 'sarah@chigwadaarchitects.co.zw',
            portfolio: ['Eco-Friendly House - Hillside', 'Shopping Complex - CBD', 'School Extension - Mabelreign'],
            certifications: ['Zimbabwe Institute of Architects', 'Green Building Council'],
            availability: 'available',
            responseTime: 'Within 4 hours',
            priceRange: '$80 - $150 per hour'
        },
        {
            id: 3,
            name: 'John Mupfumira',
            businessName: 'Mupfumira Electrical',
            profession: 'Electrician',
            location: 'Harare',
            rating: 4.7,
            reviewCount: 28,
            experience: '10 years',
            verified: true,
            insured: true,
            specialties: ['Residential Wiring', 'Commercial Electrical', 'Solar Installation'],
            description: 'Licensed electrician specializing in residential and commercial electrical work. Expert in solar power installations.',
            phone: '+263 77 345 6789',
            email: 'john@mupfumiraelectrical.co.zw',
            portfolio: ['Solar Installation - Borrowdale', 'Office Wiring - CBD', 'House Rewiring - Avondale'],
            certifications: ['Zimbabwe Electrical Contractors Association', 'Solar Installation Certified'],
            availability: 'busy',
            responseTime: 'Within 6 hours',
            priceRange: '$40 - $80 per hour'
        },
        {
            id: 4,
            name: 'Grace Ncube',
            businessName: 'Ncube Plumbing',
            profession: 'Plumber',
            location: 'Gweru',
            rating: 4.6,
            reviewCount: 24,
            experience: '8 years',
            verified: true,
            insured: false,
            specialties: ['Residential Plumbing', 'Water Heater Installation', 'Pipe Repair'],
            description: 'Professional plumber with extensive experience in residential plumbing systems and water heater installations.',
            phone: '+263 77 456 7890',
            email: 'grace@ncubeplumbing.co.zw',
            portfolio: ['Bathroom Renovation - Gweru', 'Water Heater Installation - Kwekwe', 'Pipe Repair - Gweru'],
            certifications: ['Zimbabwe Plumbing Association'],
            availability: 'available',
            responseTime: 'Within 3 hours',
            priceRange: '$30 - $60 per hour'
        },
        {
            id: 5,
            name: 'David Muzenda',
            businessName: 'Muzenda Engineering',
            profession: 'Structural Engineer',
            location: 'Harare',
            rating: 4.9,
            reviewCount: 18,
            experience: '20 years',
            verified: true,
            insured: true,
            specialties: ['Structural Design', 'Foundation Engineering', 'Building Inspection'],
            description: 'Senior structural engineer with expertise in residential and commercial structural design and analysis.',
            phone: '+263 77 567 8901',
            email: 'david@muzendaengineering.co.zw',
            portfolio: ['Multi-story Building - CBD', 'Bridge Design - Chitungwiza', 'House Foundation - Borrowdale'],
            certifications: ['Zimbabwe Institution of Engineers', 'Professional Engineer'],
            availability: 'available',
            responseTime: 'Within 8 hours',
            priceRange: '$100 - $200 per hour'
        }
    ];

    const professions = [
        { id: 'all', name: 'All Professions', icon: WrenchScrewdriverIcon },
        { id: 'architect', name: 'Architects', icon: BuildingOfficeIcon },
        { id: 'contractor', name: 'Contractors', icon: HomeIcon },
        { id: 'electrician', name: 'Electricians', icon: WrenchScrewdriverIcon },
        { id: 'plumber', name: 'Plumbers', icon: WrenchScrewdriverIcon },
        { id: 'engineer', name: 'Engineers', icon: BuildingOfficeIcon }
    ];

    const locations = [
        'all', 'Harare', 'Bulawayo', 'Gweru', 'Mutare', 'Kwekwe', 'Kadoma', 'Chitungwiza'
    ];

    const filteredProfessionals = professionals.filter(professional => {
        const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            professional.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            professional.specialties.some(specialty => 
                                specialty.toLowerCase().includes(searchTerm.toLowerCase())
                            );
        
        const matchesProfession = selectedProfession === 'all' || 
                                 professional.profession.toLowerCase().includes(selectedProfession);
        
        const matchesLocation = selectedLocation === 'all' || 
                               professional.location.toLowerCase() === selectedLocation.toLowerCase();
        
        const matchesVerified = !showVerifiedOnly || professional.verified;
        
        return matchesSearch && matchesProfession && matchesLocation && matchesVerified;
    });

    const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.rating - a.rating;
            case 'experience':
                return parseInt(b.experience) - parseInt(a.experience);
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available':
                return 'text-green-600 bg-green-100';
            case 'busy':
                return 'text-yellow-600 bg-yellow-100';
            case 'unavailable':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <>
        <AppLayout>
            <Helmet><title>Professional Directory - Aspirational Builder Portal - The Central Hub</title></Helmet>
            
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
                                <h1 className="text-3xl font-bold text-gray-900">Professional Directory</h1>
                                <p className="text-gray-600 mt-2">Find vetted architects, engineers, and builders with reviews</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{filteredProfessionals.length}</div>
                                <div className="text-sm text-gray-600">Professionals Found</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, business, or specialty..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Profession Filter */}
                            <div>
                                <select
                                    value={selectedProfession}
                                    onChange={(e) => setSelectedProfession(e.target.value)}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {professions.map(profession => (
                                        <option key={profession.id} value={profession.id}>
                                            {profession.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {locations.map(location => (
                                        <option key={location} value={location}>
                                            {location === 'all' ? 'All Locations' : location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="verified-only"
                                    checked={showVerifiedOnly}
                                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="verified-only" className="ml-2 text-sm text-gray-700">
                                    Verified Only
                                </label>
                            </div>

                            <div className="flex items-center">
                                <BarsArrowUpIcon className="w-4 h-4 text-gray-400 mr-2" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="rating">Sort by Rating</option>
                                    <option value="experience">Sort by Experience</option>
                                    <option value="name">Sort by Name</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Professionals List */}
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="space-y-6">
                            {sortedProfessionals.map((professional) => (
                                <div key={professional.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {professional.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">{professional.name}</h3>
                                                    <p className="text-lg text-gray-600">{professional.businessName}</p>
                                                    <p className="text-sm text-blue-600 font-medium">{professional.profession}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {professional.verified && (
                                                    <div className="flex items-center text-green-600">
                                                        <CheckCircleIcon className="w-5 h-5 mr-1" />
                                                        <span className="text-sm font-medium">Verified</span>
                                                    </div>
                                                )}
                                                {professional.insured && (
                                                    <div className="flex items-center text-blue-600">
                                                        <ShieldCheckIcon className="w-5 h-5 mr-1" />
                                                        <span className="text-sm font-medium">Insured</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-gray-600 mb-4">{professional.description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center">
                                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                                        {professional.location}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                        {professional.rating} ({professional.reviewCount} reviews)
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span>{professional.experience} experience</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(professional.availability)}`}>
                                                        {professional.availability.charAt(0).toUpperCase() + professional.availability.slice(1)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{professional.responseTime}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {professional.specialties.map((specialty, index) => (
                                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-3 mt-4">Certifications</h4>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {professional.certifications.map((cert, index) => (
                                                        <li key={index}>• {cert}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center">
                                                        <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span>{professional.phone}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span>{professional.email}</span>
                                                    </div>
                                                    {professional.website && (
                                                        <div className="flex items-center">
                                                            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                                                {professional.website}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4">
                                                    <div className="text-sm text-gray-600 mb-2">Price Range:</div>
                                                    <div className="font-medium text-gray-900">{professional.priceRange}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Recent Work</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {professional.portfolio.slice(0, 3).map((project, index) => (
                                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                                            {project}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                                    View Profile
                                                </button>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    Contact
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {sortedProfessionals.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No professionals found</h3>
                                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
        </>
    );
}

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    PhoneIcon,
    HomeIcon,
    WrenchScrewdriverIcon,
    CubeIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface RoleOption {
    id: 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER';
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const roleOptions: RoleOption[] = [
    {
        id: 'BUILDER',
        name: 'Aspirational Builder',
        description: 'I want to build my own home or property',
        icon: HomeIcon,
        color: 'blue',
    },
    {
        id: 'CONTRACTOR',
        name: 'Professional Contractor',
        description: 'I provide construction services',
        icon: WrenchScrewdriverIcon,
        color: 'green',
    },
    {
        id: 'SUPPLIER',
        name: 'Material Supplier',
        description: 'I supply construction materials',
        icon: CubeIcon,
        color: 'purple',
    },
];

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '' as '' | 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Role selection, 2: Account details

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role: 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER') => {
        setFormData({ ...formData, role });
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error, user } = await signUp(formData.email, formData.password, {
                first_name: formData.firstName,
                last_name: formData.lastName,
                role: formData.role as 'BUILDER' | 'CONTRACTOR' | 'SUPPLIER',
                phone_number: formData.phoneNumber,
            });

            if (error) {
                setError(error.message);
            } else {
                // Navigate to role-specific dashboard
                const dashboardRoutes: Record<string, string> = {
                    'BUILDER': '/builder',
                    'CONTRACTOR': '/contractor',
                    'SUPPLIER': '/supplier',
                };
                const dashboardRoute = dashboardRoutes[formData.role] || '/dashboard';
                navigate(dashboardRoute, { replace: true });
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
            blue: {
                bg: isSelected ? 'bg-blue-500/30' : 'bg-white/5',
                border: isSelected ? 'border-blue-500' : 'border-white/20',
                text: 'text-blue-400',
                hover: 'hover:bg-blue-500/20 hover:border-blue-400',
            },
            green: {
                bg: isSelected ? 'bg-green-500/30' : 'bg-white/5',
                border: isSelected ? 'border-green-500' : 'border-white/20',
                text: 'text-green-400',
                hover: 'hover:bg-green-500/20 hover:border-green-400',
            },
            purple: {
                bg: isSelected ? 'bg-purple-500/30' : 'bg-white/5',
                border: isSelected ? 'border-purple-500' : 'border-white/20',
                text: 'text-purple-400',
                hover: 'hover:bg-purple-500/20 hover:border-purple-400',
            },
        };
        return colors[color];
    };

    return (
        <>
            <Helmet>
                <title>Create Account - The Central Hub</title>
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                </div>

                <div className="relative max-w-lg w-full space-y-8">
                    {/* Logo and Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-block">
                            <h1 className="text-4xl font-bold text-white mb-2">The Central Hub</h1>
                        </Link>
                        <h2 className="text-2xl font-semibold text-blue-200">
                            {step === 1 ? 'Choose Your Role' : 'Create Your Account'}
                        </h2>
                        <p className="mt-2 text-blue-300">
                            {step === 1
                                ? 'Select how you\'ll use The Central Hub'
                                : 'Fill in your details to get started'}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-white/20'}`}></div>
                    </div>

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                            <div className="space-y-4">
                                {roleOptions.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = formData.role === role.id;
                                    const colorClasses = getColorClasses(role.color, isSelected);

                                    return (
                                        <>
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => handleRoleSelect(role.id)}
                                                className={`w-full p-4 rounded-xl border-2 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} transition-all duration-200 flex items-center space-x-4 group`}
                                            >
                                                <div className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
                                                    <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                                                    <p className="text-sm text-blue-300">{role.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircleIcon className={`w-6 h-6 ${colorClasses.text}`} />
                                                )}
                                            </button>
                                        </>
                                    );
                                })}
                            </div>

                            {/* Already have account */}
                            <div className="mt-8 text-center">
                                <p className="text-blue-300">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Account Details */}
                    {step === 2 && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-blue-200 mb-2">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-blue-200 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-blue-200 mb-2">
                                        Phone Number <span className="text-blue-400">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="+263 77 123 4567"
                                        />
                                    </div>
                                </div>

                                {/* Password Fields */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-300"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 px-4 border-2 border-white/30 rounded-lg text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Already have account */}
                            <div className="mt-6 text-center">
                                <p className="text-blue-300">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <p className="text-center text-sm text-blue-300">
                        By creating an account, you agree to our{' '}
                        <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </>
    );
}

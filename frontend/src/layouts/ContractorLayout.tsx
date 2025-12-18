import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    WrenchScrewdriverIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/contractor', icon: HomeIcon },
    { name: 'Contractor Suite', href: '/contractor/suite', icon: Cog6ToothIcon },
    { name: 'Project Management', href: '/contractor/projects', icon: ClipboardDocumentListIcon },
    { name: 'Project Hub', href: '/contractor/hub', icon: WrenchScrewdriverIcon },
    { name: 'Subcontractor Hub', href: '/contractor/subcontractors', icon: UserGroupIcon },
    { name: 'Change Orders', href: '/contractor/change-orders', icon: DocumentTextIcon },
    { name: 'Financial Tools', href: '/contractor/financial', icon: CurrencyDollarIcon },
    { name: 'Analytics & Reports', href: '/contractor/analytics', icon: ChartBarIcon },
];

export default function ContractorLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === '/contractor') {
            return location.pathname === '/contractor';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-900 to-green-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-green-700">
                    <Link to="/" className="text-xl font-bold text-white">
                        The Central Hub
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-4 py-3 border-b border-green-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 text-green-200">
                        <WrenchScrewdriverIcon className="w-4 h-4 mr-1" />
                        Contractor Dashboard
                    </span>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-green-700 text-white'
                                        : 'text-green-100 hover:bg-green-700/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-green-700">
                    <div className="flex items-center mb-3">
                        <UserCircleIcon className="w-8 h-8 text-green-300 mr-2" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.email || 'User'}
                            </p>
                            <p className="text-xs text-green-300">Contractor</p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center w-full px-3 py-2 text-sm text-green-200 rounded-lg hover:bg-green-700/50 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <div className="flex-1 lg:ml-0 ml-4">
                            <h1 className="text-lg font-semibold text-gray-900">Contractor Portal</h1>
                        </div>
                        <Link
                            to="/"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Back to Home
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

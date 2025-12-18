import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    HomeIcon,
    CubeIcon,
    DocumentTextIcon,
    ChartBarIcon,
    CalculatorIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/supplier', icon: HomeIcon },
    { name: 'Inventory', href: '/supplier/inventory', icon: CubeIcon },
    { name: 'Quotes', href: '/supplier/quotes', icon: DocumentTextIcon },
    { name: 'Proposals', href: '/supplier/proposals', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/supplier/analytics', icon: ChartBarIcon },
    { name: 'TCO Calculator', href: '/supplier/tco-calculator', icon: CalculatorIcon },
    { name: 'Bulk Purchasing', href: '/supplier/bulk-purchasing', icon: ShoppingCartIcon },
    { name: 'My Groups', href: '/supplier/my-groups', icon: UserGroupIcon },
];

export default function SupplierLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === '/supplier') {
            return location.pathname === '/supplier';
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
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 to-purple-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-purple-700">
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

                <div className="px-4 py-3 border-b border-purple-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/30 text-purple-200">
                        <CubeIcon className="w-4 h-4 mr-1" />
                        Supplier Dashboard
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
                                        ? 'bg-purple-700 text-white'
                                        : 'text-purple-100 hover:bg-purple-700/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-purple-700">
                    <div className="flex items-center mb-3">
                        <UserCircleIcon className="w-8 h-8 text-purple-300 mr-2" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.email || 'User'}
                            </p>
                            <p className="text-xs text-purple-300">Supplier</p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center w-full px-3 py-2 text-sm text-purple-200 rounded-lg hover:bg-purple-700/50 transition-colors"
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
                            <h1 className="text-lg font-semibold text-gray-900">Supplier Portal</h1>
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

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
    CurrencyDollarIcon,
    DocumentTextIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ChartBarIcon,
    BanknotesIcon,
    ReceiptPercentIcon
} from '@heroicons/react/24/outline'

// Mock data
const estimates = [
    { id: 1, project_name: 'Modern Kitchen Renovation', client_name: 'John Mwangi', amount: 45000, status: 'pending', created_at: '2024-01-15', due_date: '2024-01-30' },
    { id: 2, project_name: 'Bathroom Remodel', client_name: 'Sarah Kimani', amount: 28000, status: 'approved', created_at: '2024-01-10', due_date: '2024-01-25' },
    { id: 3, project_name: 'Roof Repair', client_name: 'Peter Ochieng', amount: 15000, status: 'pending', created_at: '2024-01-18', due_date: '2024-02-01' }
]

const invoices = [
    { id: 1, project_name: 'Modern Kitchen Renovation', client_name: 'John Mwangi', amount: 45000, status: 'paid', invoice_number: 'INV-001', created_at: '2024-01-15', paid_at: '2024-01-20' },
    { id: 2, project_name: 'Bathroom Remodel', client_name: 'Sarah Kimani', amount: 28000, status: 'pending', invoice_number: 'INV-002', created_at: '2024-01-10', paid_at: null }
]

const expenses = [
    { id: 1, project_name: 'Modern Kitchen Renovation', category: 'Materials', description: 'Tiles and grout', amount: 8500, date: '2024-01-15', receipt: 'receipt_001.pdf' },
    { id: 2, project_name: 'Bathroom Remodel', category: 'Labor', description: 'Plumbing work', amount: 3200, date: '2024-01-12', receipt: 'receipt_002.pdf' }
]

export default function FinancialTools() {
    const [activeTab, setActiveTab] = useState('estimates')

    const tabs = [
        { id: 'estimates', name: 'Estimates', icon: DocumentTextIcon },
        { id: 'invoices', name: 'Invoices', icon: BanknotesIcon },
        { id: 'expenses', name: 'Expenses', icon: ReceiptPercentIcon },
        { id: 'reports', name: 'Reports', icon: ChartBarIcon },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'paid': return 'bg-blue-100 text-blue-800'
            case 'overdue': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <>
            <Helmet><title>Financial Tools - The Central Hub</title></Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Financial Tools</h1>
                        <p className="text-gray-600">Create estimates, manage invoices, and track expenses</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Estimate
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Estimates Tab */}
                {activeTab === 'estimates' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Estimates</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estimates.map((estimate) => (
                                    <tr key={estimate.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{estimate.project_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{estimate.client_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${estimate.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(estimate.status)}`}>
                                                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{estimate.due_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900"><EyeIcon className="w-4 h-4" /></button>
                                                <button className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-4 h-4" /></button>
                                                <button className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.project_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invoice.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.paid_at || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.project_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${expense.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                    <p className="text-lg font-medium text-gray-900">$73,000</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <ReceiptPercentIcon className="h-8 w-8 text-red-600" />
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                                    <p className="text-lg font-medium text-gray-900">$11,700</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">Net Profit</p>
                                    <p className="text-lg font-medium text-gray-900">$61,300</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
import React from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'

export default function ForContractors() {
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="order-2 lg:order-1 mt-10 lg:mt-0">
              <img 
                src="https://placehold.co/600x400/059669/ffffff?text=Professional+Contractor" 
                alt="Professional contractor at work" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">For Contractors & Suppliers</h2>
              <p className="mt-4 text-xl text-gray-600">Grow Your Business, Get Paid on Time, Access Premium Projects</p>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'Profile Creation & Verification', description: 'Create a compelling, verified profile with your business registration, references, and portfolio.' },
                  { title: 'Project Discovery', description: 'Dashboard to find and bid on relevant projects in your area.' },
                  { title: 'Direct Material Sourcing', description: 'Source materials at direct prices from our supplier directory.' },
                  { title: 'Premium Analytics (Coming Soon)', description: 'Get data on market rates and demand in your area.' },
                  { title: 'Priority Access (Coming Soon)', description: 'Premium members get early access to high-budget projects.' }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                        ✓
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link 
                  to="/contractor-signup"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">👷</span> Get Verified & Start Winning Projects!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'

export default function ForProjectOwners() {
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">For Project Owners</h2>
              <p className="mt-4 text-xl text-gray-600">Save Money, Reduce Risk, Build with Confidence</p>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'Free Project Posting', description: 'Simple form to describe your project (type, location, budget range, timeline).' },
                  { title: 'Vetted Contractor Directory', description: 'Search and filter contractors by specialty, location, rating, and past project photos.' },
                  { title: 'Transparent Bidding', description: 'Receive and compare multiple bids in one place.' },
                  { title: 'The Central Hub Escrow Service', description: 'Milestone-based payments protect your money until work is completed to your satisfaction.' },
                  { title: 'Integrated Insurance', description: 'Get project insurance to protect against unforeseen circumstances.' },
                  { title: 'Dispute Resolution', description: 'Clear, simple process for handling any issues that may arise.' }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
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
                  to="/post-project"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">✏️</span> Start Your Project Today - Post for Free!
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img 
                src="https://placehold.co/600x400/1e40af/ffffff?text=Happy+Homeowner" 
                alt="Happy homeowner with completed project" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

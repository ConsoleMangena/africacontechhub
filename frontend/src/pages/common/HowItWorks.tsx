import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function HowItWorks() {
  return (
      <>
    <AppLayout>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How The Central Hub Works</h2>
            <p className="mt-4 text-xl text-gray-600">A simple 4-step process to build your dream project</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Post or Browse', description: 'Homeowners post projects for free. Contractors browse projects.', icon: '📝' },
              { step: 2, title: 'Connect & Bid', description: 'Contractors submit bids. Homeowners review vetted profiles.', icon: '🤝' },
              { step: 3, title: 'Secure & Build', description: 'Agree on a bid, sign a digital contract, and use The Central Hub Escrow for milestone payments.', icon: '🔒' },
              { step: 4, title: 'Complete & Review', description: 'Project completion, final payment release, and leave a review.', icon: '✅' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Step {item.step}: {item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

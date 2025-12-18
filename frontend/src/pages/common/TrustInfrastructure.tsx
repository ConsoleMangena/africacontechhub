import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function TrustInfrastructure() {
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our Trust Infrastructure</h2>
            <p className="mt-4 text-xl text-green-100">Built to eliminate risk and ensure quality in every project</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                title: "Vetted Profiles",
                description: "Rigorous verification process for all contractors and suppliers",
                icon: "✅",
                details: "Business registration, references, portfolio review, and site visits for larger contractors"
              },
              {
                title: "Escrow Services",
                description: "Milestone-based payments held securely until work is approved",
                icon: "🔒",
                details: "Funds released only after owner approval, protecting both parties"
              },
              {
                title: "Integrated Insurance",
                description: "Project insurance to protect against unforeseen circumstances",
                icon: "🛡️",
                details: "Coverage for materials, workmanship, and liability"
              },
              {
                title: "Dispute Resolution",
                description: "Clear, efficient process for handling any conflicts",
                icon: "⚖️",
                details: "Mediation and arbitration services to ensure fair outcomes"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="text-4xl mb-4 text-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Mobile-First & Offline Capable</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Mobile-First Design",
                  description: "Optimized for smartphones, the primary device for most users in Africa",
                  icon: "📱"
                },
                {
                  title: "Offline Functionality",
                  description: "Access critical information and log data even without internet connectivity",
                  icon: "🌐"
                },
                {
                  title: "Automatic Sync",
                  description: "Changes sync automatically when connection is restored",
                  icon: "🔄"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3 text-center">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-green-100 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white bg-opacity-20 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-3">Why This Matters</h4>
              <p className="text-green-100">
                In many construction sites across Africa, reliable internet connectivity is a luxury. 
                Our platform is designed for the real world, allowing users to access critical information, 
                log progress, and manage their projects even when offline. This was a key factor in the field 
                adoption of platforms like PlanGrid and is a critical differentiator for our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

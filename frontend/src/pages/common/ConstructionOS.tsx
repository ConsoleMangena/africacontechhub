import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function ConstructionOS() {
  const constructionOSFeatures = [
    {
      id: 1,
      title: "Project Scheduling & Management",
      description: "Create detailed project timelines, assign tasks, and track progress in real-time.",
      icon: "📅",
      status: "Available"
    },
    {
      id: 2,
      title: "Daily Logs & Field Reporting",
      description: "Record daily activities, weather conditions, and workforce attendance directly from your mobile device.",
      icon: "📝",
      status: "Available"
    },
    {
      id: 3,
      title: "RFI & Submittal Management",
      description: "Streamline the Request for Information process and manage all project documentation in one place.",
      icon: "📋",
      status: "Beta"
    },
    {
      id: 4,
      title: "Quality & Safety Compliance",
      description: "Automate safety checklists, track inspections, and ensure compliance with local regulations.",
      icon: "✅",
      status: "Coming Soon"
    },
    {
      id: 5,
      title: "Project Closeout & Handover",
      description: "Manage the final stages of your project with automated punch lists and digital handover documentation.",
      icon: "🏁",
      status: "Coming Soon"
    }
  ]

  return (
      <>
    <AppLayout>
      <div className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Construction Operating System</h2>
            <p className="mt-4 text-xl text-indigo-100">Manage your entire construction project from start to finish</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {constructionOSFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition duration-300">
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  feature.status === 'Available' ? 'bg-green-100 text-green-800' :
                  feature.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {feature.status}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Our Construction OS?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Seamless Integration",
                  description: "All tools work together in one unified platform",
                  icon: "🔗"
                },
                {
                  title: "Mobile-First Design",
                  description: "Access your project from anywhere, even offline",
                  icon: "📱"
                },
                {
                  title: "AI-Powered Insights",
                  description: "Get intelligent recommendations and predictions",
                  icon: "🤖"
                },
                {
                  title: "Financial Integration",
                  description: "Manage payments and financing in one place",
                  icon: "💰"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3 text-center">{item.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-indigo-100 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white bg-opacity-20 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-white mb-3">The Future of Construction Management</h4>
              <p className="text-indigo-100">
                Our Construction Operating System represents the future of construction management in Africa. 
                By integrating procurement, financing, project management, and AI-powered insights into a single platform, 
                we're eliminating the fragmentation that has plagued the industry for decades. This isn't just software - 
                it's a complete ecosystem designed to make construction projects more efficient, transparent, and successful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

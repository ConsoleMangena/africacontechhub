import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function About() {
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About The Central Hub</h2>
            <p className="mt-4 text-xl text-gray-600">Building trust in Zimbabwe's construction industry</p>
          </div>
          
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6">
                The Central Hub was founded to solve the inefficiency and lack of trust in Zimbabwe's construction sector. We saw how middlemen markups, unreliable builders, and opaque pricing were making it difficult for ordinary Zimbabweans to build their dream homes and businesses.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is simple: to connect project owners directly with vetted, quality contractors and suppliers, eliminating unnecessary costs and creating a transparent, fair marketplace for construction services.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Our Vision</h3>
                <p className="text-blue-800">To become Africa's definitive Construction Operating System.</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-900 mb-2">The "Anti-Katerra" Philosophy</h3>
                <p className="text-green-800">We're committed to an asset-light, platform-centric model that coordinates the market rather than trying to own it. This allows us to scale efficiently while maintaining focus on our core value: trust and transparency.</p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img 
                src="https://placehold.co/600x400/7c3aed/ffffff?text=Our+Team" 
                alt="Our team" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Leadership</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Tendai Moyo",
                  role: "Founder & CEO",
                  bio: "Former construction project manager with 15+ years of experience in Zimbabwe's construction industry. Passionate about leveraging technology to solve systemic inefficiencies.",
                  image: "https://placehold.co/300x300/1e40af/ffffff?text=TM"
                },
                {
                  name: "Aisha Patel",
                  role: "CTO",
                  bio: "Tech innovator with expertise in marketplace platforms and AI-driven solutions. Previously led engineering teams at successful African tech startups.",
                  image: "https://placehold.co/300x300/059669/ffffff?text=AP"
                },
                {
                  name: "Brian Chikwava",
                  role: "Head of Operations",
                  bio: "Logistics and supply chain expert with deep knowledge of Zimbabwe's construction materials market. Ensures seamless operations across our platform.",
                  image: "https://placehold.co/300x300/7c2d12/ffffff?text=BC"
                }
              ].map((leader, index) => (
                <div key={index} className="text-center">
                  <img src={leader.image} alt={leader.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                  <h4 className="text-xl font-bold text-gray-900">{leader.name}</h4>
                  <p className="text-blue-600 font-medium mb-2">{leader.role}</p>
                  <p className="text-gray-600">{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 text-center">Our Roadmap to a Billion-Dollar Valuation</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  stage: "Stage 1",
                  title: "Core Marketplace",
                  years: "Years 1-2",
                  description: "Perfecting the core marketplace and trust infrastructure in Zimbabwe"
                },
                {
                  stage: "Stage 2",
                  title: "Fintech Engine",
                  years: "Years 3-5",
                  description: "Layering financial services to create high switching costs"
                },
                {
                  stage: "Stage 3",
                  title: "Data & AI Engine",
                  years: "Years 5-7",
                  description: "Monetizing our proprietary data asset with AI-powered insights"
                },
                {
                  stage: "Stage 4",
                  title: "Construction OS",
                  years: "Year 7+",
                  description: "Becoming Africa's definitive Construction Operating System"
                }
              ].map((phase, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold mb-2">{phase.stage}</div>
                  <div className="font-bold mb-1">{phase.title}</div>
                  <div className="text-sm mb-2">{phase.years}</div>
                  <p className="text-sm">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

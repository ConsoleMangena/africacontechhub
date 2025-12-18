import React, { useState } from 'react'
import { Link } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                  The Central Hub
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {[
                  { name: '🏠 Home', to: '/' },
                  { name: '🔒 Trust', to: '/trust-infrastructure' },
                  { name: '💳 Finance', to: '/aspirational-builder' },
                  { name: '🤖 AI', to: '/ai-features' },
                  { name: '🏗️ OS', to: '/construction-os' },
                  { name: '📚 Resources', to: '/resources' }
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {[
                { name: '🏠 Home', to: '/' },
                { name: '🔒 Trust Infrastructure', to: '/trust-infrastructure' },
                { name: '💳 Finance', to: '/aspirational-builder' },
                { name: '🤖 AI Features', to: '/ai-features' },
                { name: '🏗️ Construction OS', to: '/construction-os' },
                { name: '💰 Fair Price Calculator', to: '/fair-price-calculator' },
                { name: '📊 Project Cost Estimator', to: '/project-cost-estimator' },
                { name: '👷 Find Contractors', to: '/contractors-directory' },
                { name: '📚 Resources', to: '/resources' },
                { name: '💬 Community', to: '/community' },
                { name: '🎁 Referral Program', to: '/referral' },
                { name: '❓ FAQ', to: '/faq' },
                { name: 'ℹ️ About', to: '/about' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-3 py-2 rounded-md text-base font-medium w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">The Central Hub</h3>
              <p className="text-gray-300 mb-4">Zimbabwe's Trusted Marketplace for Quality Builders, Fair Prices & Peace of Mind.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">FB</a>
                <a href="#" className="text-gray-300 hover:text-white">TW</a>
                <a href="#" className="text-gray-300 hover:text-white">IG</a>
                <a href="#" className="text-gray-300 hover:text-white">LI</a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Core Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Vetted Profiles ✅</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Escrow Services 🔒</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Integrated Insurance 🛡️</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Dispute Resolution ⚖️</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Offline Capability 📱</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Advanced Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Financial Services 💳</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">AI-Powered Insights 🤖</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Predictive Analytics 📊</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Construction OS 🏗️</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">API Integration 🔗</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact & Connect</h3>
              <address className="text-gray-300 not-italic mb-4">
                <p>Harare, Zimbabwe</p>
                <p className="mt-2">info@dzenharesqb.com</p>
                <p className="mt-2">+263 77 123 4567</p>
              </address>
              <div className="mt-4">
                <h4 className="font-bold mb-2">Join Our Community</h4>
                <div className="flex space-x-2 mb-4">
                  <a href="#" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm">WhatsApp</a>
                  <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">Telegram</a>
                </div>
                <Link
                  to="/referral"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-bold"
                >
                  Refer & Earn 🎁
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8">
            <p className="text-center text-gray-400">
              &copy; {new Date().getFullYear()} The Central Hub. All rights reserved. |
              <a href="#" className="ml-2 text-blue-400 hover:text-blue-300">Privacy Policy</a> |
              <a href="#" className="ml-2 text-blue-400 hover:text-blue-300">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'

export default function ContractorSignup() {
  const navigate = useNavigate()
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessRegNumber, setBusinessRegNumber] = useState('')
  const [description, setDescription] = useState('')
  const [errors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting contractor signup')
    navigate('/')
  }

  return (
      <>
    <AppLayout>
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Get Verified & Find New Clients</h2>
            <p className="text-center text-gray-600 mb-8">Join Zimbabwe's most trusted construction marketplace</p>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Join The Central Hub?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-blue-900 mb-2">Grow Your Business</h4>
                  <p className="text-blue-800">Access a steady stream of qualified leads and projects in your area.</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-green-900 mb-2">Get Paid on Time</h4>
                  <p className="text-green-800">Our escrow system ensures you get paid for completed work.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-purple-900 mb-2">Build Your Reputation</h4>
                  <p className="text-purple-800">Collect reviews and showcase your portfolio to attract more clients.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-orange-900 mb-2">Save on Materials</h4>
                  <p className="text-orange-800">Access our supplier directory for direct, competitive pricing.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                    <input
                      type="text"
                      value={businessRegNumber}
                      onChange={(e) => setBusinessRegNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What do you build? 🛠️</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {['Bricklaying', 'Plumbing', 'Electrical', 'Windows/Doors'].map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSpecialty(spec)}
                      className={`p-4 border rounded-lg text-center transition duration-300 ${specialty === spec ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                        }`}
                    >
                      <div className="text-3xl mb-2">
                        {spec === 'Bricklaying' ? '🧱' : spec === 'Plumbing' ? '🚰' : spec === 'Electrical' ? '⚡' : '🪟'}
                      </div>
                      <div className="font-medium">{spec}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where do you work? 🌍</label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Midlands'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`p-3 border rounded-lg text-center transition duration-300 ${location === loc ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                        }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your business, experience, and what makes you unique..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show us your best work! 📸</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-2">Tap to add photos of your completed projects</p>
                  <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center mx-auto">
                    <span className="mr-2">📷</span> Add Photos
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-yellow-800 mb-2">Verification Process</h4>
                <p className="text-yellow-700">After submitting this form, our team will review your information and may contact you for additional details. The verification process typically takes 2-3 business days.</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">✅</span> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

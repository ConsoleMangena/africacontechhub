import React, { useState } from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function Referral() {
  const [showReferralModal, setShowReferralModal] = useState(false)

  return (
      <>
    <AppLayout>
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Refer a Friend, Earn Rewards</h2>
            <p className="mt-4 text-xl text-gray-600">Share The Central Hub and get rewarded when your friends join</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-xl p-8 text-white mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Earn 10% Cash Back on Your Next Project</h3>
              <p className="text-lg mb-6">For every friend who signs up and completes their first project through our platform, you'll receive 10% cash back on your next transaction fee.</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
                <h4 className="text-xl font-bold mb-3">Your Referral Link</h4>
                <div className="bg-white text-gray-800 p-3 rounded-md font-mono text-sm mb-4 break-all">
                  https://dzenharesqb.com/ref/yourname123
                </div>
                <button 
                  onClick={() => setShowReferralModal(true)}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Copy Link
                </button>
              </div>
              <p className="text-sm opacity-90">Share this link via email, WhatsApp, or social media</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl text-blue-600 mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600">Share your unique referral link with friends, family, or colleagues who might need construction services.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl text-green-600 mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">They Sign Up & Complete</h3>
              <p className="text-gray-600">Your friend signs up using your link and completes their first project through our platform.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl text-purple-600 mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You Get Rewarded</h3>
              <p className="text-gray-600">You receive 10% cash back on your next transaction fee, credited to your account automatically.</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Terms & Conditions</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Rewards are credited after your referred friend completes their first project worth at least $500.</li>
              <li>• There's no limit to how many friends you can refer.</li>
              <li>• Rewards expire after 12 months if not used.</li>
              <li>• Fraudulent referrals will result in account suspension.</li>
            </ul>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setShowReferralModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-300"
            >
              Start Referring Now
            </button>
          </div>
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Your Referral Link</h3>
              <button 
                onClick={() => setShowReferralModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-mono text-sm break-all">https://dzenharesqb.com/ref/yourname123</p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 mb-2">
              Copy Link
            </button>
            <button 
              onClick={() => setShowReferralModal(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
      </>
  )
}

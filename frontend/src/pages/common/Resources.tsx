import React, { useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { XMarkIcon, ClockIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image_url: string
  read_time: string
  content?: string
  author?: string
  published_at?: string
  category?: string
}

interface ResourcesProps {
  blogPosts: BlogPost[]
}

export default function Resources({ blogPosts }: ResourcesProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Resources & Blog</h2>
            <p className="mt-4 text-xl text-gray-600">Building trust, providing value, and helping you make informed decisions</p>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask me anything about construction... 🎤"
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m0 0V5a2 2 0 012-2h4a2 2 0 012 2v6z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{post.read_time}</span>
                    <span className="mx-2">•</span>
                    <span>Construction Guide</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    Read More →
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-900 mb-4 text-center">Subscribe to Our Newsletter</h3>
            <p className="text-blue-800 text-center mb-6">Get the latest construction tips, market insights, and exclusive offers delivered to your inbox.</p>
            <div className="max-w-md mx-auto">
              {!isSubscribed ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (email) {
                      setIsSubscribed(true)
                      setEmail('')
                    }
                  }}
                  className="flex"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300"
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">✅ Successfully subscribed!</p>
                    <p className="text-sm">Thank you for joining our newsletter.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedPost.title}
                  </h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Post Image */}
                  <img 
                    src={selectedPost.image_url} 
                    alt={selectedPost.title} 
                    className="w-full h-64 object-cover rounded-lg"
                  />

                  {/* Post Meta */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{selectedPost.read_time}</span>
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>{selectedPost.author || 'Construction Expert'}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{selectedPost.published_at || new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      {selectedPost.content || selectedPost.excerpt}
                    </p>
                    
                    {selectedPost.content && (
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-gray-900">Key Points</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>Professional construction techniques and best practices</li>
                          <li>Cost-saving strategies for your next project</li>
                          <li>Industry insights and market trends</li>
                          <li>Safety guidelines and compliance requirements</li>
                        </ul>
                        
                        <h4 className="text-xl font-semibold text-gray-900 mt-6">Additional Resources</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800">
                            Looking for more construction insights? Check out our comprehensive guides 
                            and connect with our expert community for personalized advice.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Share Article
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
      </>
  )
}

import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function Community() {
  return (
      <>
    <AppLayout>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Join Our Community</h2>
            <p className="mt-4 text-xl text-gray-600">Connect with other homeowners, contractors, and suppliers</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Discussions</h3>
                  <select className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="solved">Solved First</option>
                  </select>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "What's the going rate for bricklaying in Harare?",
                      author: "BuilderMike",
                      replies: 12,
                      likes: 24,
                      category: "Pricing",
                      time: "2 hours ago"
                    },
                    {
                      title: "Need recommendations for reliable electricians in Bulawayo",
                      author: "HomeownerSarah",
                      replies: 8,
                      likes: 15,
                      category: "Recommendations",
                      time: "5 hours ago"
                    },
                    {
                      title: "Has anyone used the new escrow system? How was your experience?",
                      author: "ContractorJohn",
                      replies: 17,
                      likes: 32,
                      category: "Platform Feedback",
                      time: "1 day ago"
                    },
                    {
                      title: "Best practices for managing construction projects during rainy season",
                      author: "ProjectManagerLisa",
                      replies: 23,
                      likes: 41,
                      category: "Tips & Advice",
                      time: "2 days ago"
                    }
                  ].map((discussion, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {discussion.author.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                              {discussion.title}
                            </h4>
                            <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                              {discussion.category}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>Posted by {discussion.author}</span>
                            <span className="mx-2">•</span>
                            <span>{discussion.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-4">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{discussion.replies} replies</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{discussion.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                    Start a New Discussion
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-3">
                  {[
                    { name: "Pricing & Costs", count: 127 },
                    { name: "Contractor Recommendations", count: 89 },
                    { name: "Material Suppliers", count: 64 },
                    { name: "Platform Feedback", count: 45 },
                    { name: "Legal & Permits", count: 38 },
                    { name: "Tips & Advice", count: 156 },
                    { name: "Success Stories", count: 23 }
                  ].map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                      <span className="font-medium">{category.name}</span>
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Join Our WhatsApp Groups</h3>
                <p className="text-gray-600 mb-4">Connect with other members in real-time</p>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900">Homeowners Group</h4>
                    <p className="text-sm text-gray-600 mb-2">For project owners to share experiences and get advice</p>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.047 24l6.305-1.654a11.882 11.882 0 005.693 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Join Group
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900">Contractors & Suppliers</h4>
                    <p className="text-sm text-gray-600 mb-2">For professionals to network and share opportunities</p>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.047 24l6.305-1.654a11.882 11.882 0 005.693 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Join Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

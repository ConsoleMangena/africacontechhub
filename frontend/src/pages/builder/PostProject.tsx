import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'


export default function PostProject() {
  const navigate = useNavigate()
  const [projectType, setProjectType] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    console.log('Submitting project:', { projectType, location, budget, timeline, title, description })
    navigate('/')
  }

  return (
      <>
    
      <div className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Post Your Project</h2>
            <p className="text-center text-gray-600 mb-8">It's free and takes less than 5 minutes</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you building? 🏠
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setProjectType('house')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${projectType === 'house' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">🏠</div>
                    <div className="font-medium">New House</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('renovation')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${projectType === 'renovation' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">🛠️</div>
                    <div className="font-medium">Renovation</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('commercial')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${projectType === 'commercial' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">🏢</div>
                    <div className="font-medium">Commercial</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('extension')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${projectType === 'extension' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">➕</div>
                    <div className="font-medium">Extension</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where? 🌍
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional) 💰
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBudget('under-50k')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${budget === 'under-50k' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                      }`}
                  >
                    Under $50K
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudget('50k-100k')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${budget === '50k-100k' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                      }`}
                  >
                    $50K - $100K
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudget('100k-250k')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${budget === '100k-250k' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                      }`}
                  >
                    $100K - $250K
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudget('over-250k')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${budget === 'over-250k' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                      }`}
                  >
                    Over $250K
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When do you want to start? ⏱️
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTimeline('asap')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${timeline === 'asap' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                      }`}
                  >
                    ASAP
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline('1-3months')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${timeline === '1-3months' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                      }`}
                  >
                    1-3 Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline('3-6months')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${timeline === '3-6months' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                      }`}
                  >
                    3-6 Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline('6-12months')}
                    className={`p-3 border rounded-lg text-center transition duration-300 ${timeline === '6-12months' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                      }`}
                  >
                    6-12 Months
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title 📝
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Modern 3-bedroom house in Harare"
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your project 📝
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project in detail. Include any specific requirements, materials, or design preferences."
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">✅</span> Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    
      </>
  )
}

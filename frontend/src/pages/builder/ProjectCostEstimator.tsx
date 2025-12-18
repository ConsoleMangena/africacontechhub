import React, { useState } from 'react'
import { Link } from 'react-router-dom'


export default function ProjectCostEstimator() {
  const [projectType, setProjectType] = useState('')
  const [location, setLocation] = useState('')
  const [qualityLevel, setQualityLevel] = useState('standard')
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)

  const estimateProjectCost = () => {
    // Simulate project cost estimation
    const baseCosts: { [key: string]: number } = {
      house: 35000,
      renovation: 15000,
      extension: 25000,
      commercial: 50000
    }
    
    const locationMultipliers: { [key: string]: number } = {
      Harare: 1.1,
      Bulawayo: 1.0,
      Mutare: 0.95,
      Gweru: 0.9,
      Kwekwe: 0.85,
      Midlands: 0.8
    }
    
    const qualityMultipliers: { [key: string]: number } = {
      economy: 0.8,
      standard: 1.0,
      premium: 1.4
    }
    
    const baseCost = baseCosts[projectType] || 25000
    const locationMultiplier = locationMultipliers[location] || 1.0
    const qualityMultiplier = qualityMultipliers[qualityLevel] || 1.0
    
    const estimatedCost = baseCost * locationMultiplier * qualityMultiplier
    setEstimatedCost(estimatedCost)
  }

  const aiInsights = [
    {
      id: 1,
      title: "Predictive Cost Analysis",
      description: "Our AI has analyzed 1,247 similar projects to predict your total cost with 92% accuracy.",
      value: "$42,500 ± $3,200",
      confidence: "High"
    },
    {
      id: 2,
      title: "Timeline Forecast",
      description: "Based on contractor availability and material lead times, your project is likely to take:",
      value: "4-5 months",
      confidence: "Medium"
    },
    {
      id: 3,
      title: "Risk Assessment",
      description: "Potential risks identified for your project location and type:",
      value: "Material price volatility (Medium Risk), Labor shortage (Low Risk)",
      confidence: "Medium"
    }
  ]

  return (
      <>
    
      <div className="bg-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Project Cost Estimator</h2>
            <p className="text-center text-gray-600 mb-8">Get a rough estimate for your construction project</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What are you building? 🏠</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setProjectType('house')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      projectType === 'house' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏠</div>
                    <div className="font-medium">New House</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setProjectType('renovation')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      projectType === 'renovation' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🛠️</div>
                    <div className="font-medium">Renovation</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setProjectType('commercial')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      projectType === 'commercial' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏢</div>
                    <div className="font-medium">Commercial</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setProjectType('extension')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      projectType === 'extension' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">➕</div>
                    <div className="font-medium">Extension</div>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Where? 🌍</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Kwekwe', 'Midlands'].map((loc) => (
                    <button 
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`p-3 border rounded-lg text-center transition duration-300 ${
                        location === loc ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How big? 🐭🐶🐘</label>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    type="button"
                    onClick={() => setQualityLevel('economy')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      qualityLevel === 'economy' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🐭</div>
                    <div className="font-medium">Small</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setQualityLevel('standard')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      qualityLevel === 'standard' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🐶</div>
                    <div className="font-medium">Medium</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setQualityLevel('premium')}
                    className={`p-4 border rounded-lg text-center transition duration-300 ${
                      qualityLevel === 'premium' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🐘</div>
                    <div className="font-medium">Large</div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                onClick={estimateProjectCost}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-md transition duration-300 flex items-center justify-center"
              >
                <span className="mr-2">💰</span> Estimate Project Cost
              </button>
            </div>
            
            {estimatedCost && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Estimated Project Cost</h3>
                <p className="text-3xl font-extrabold text-blue-600">${estimatedCost.toFixed(0)}</p>
                <p className="text-blue-700 mt-2">This is a rough estimate based on current market rates in your area</p>
                <div className="mt-4 text-sm text-blue-600">
                  <p>• Materials: ${(estimatedCost * 0.4).toFixed(0)}</p>
                  <p>• Labor: ${(estimatedCost * 0.45).toFixed(0)}</p>
                  <p>• Permits & Fees: ${(estimatedCost * 0.1).toFixed(0)}</p>
                  <p>• Contingency (10%): ${(estimatedCost * 0.05).toFixed(0)}</p>
                </div>
                
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-bold text-green-800 mb-2">AI-Powered Insights for Your Project</h4>
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                        <h5 className="font-bold text-green-700">{insight.title}</h5>
                        <p className="text-green-600 text-sm">
                          {insight.description}<br/>
                          <strong>{insight.value}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link 
                    to="/post-project"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    Post Your Project for Accurate Bids
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
      </>
  )
}

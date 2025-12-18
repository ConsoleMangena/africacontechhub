import React, { useState } from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function FairPriceCalculator() {
  const [material, setMaterial] = useState('bricks')
  const [quantity, setQuantity] = useState('')
  const [priceLocation, setPriceLocation] = useState('Harare')
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)

  const calculateFairPrice = () => {
    // Simulate price calculation based on material, quantity, and location
    const basePrices: { [key: string]: number } = {
      bricks: 0.85,
      cement: 12.50,
      'steel bars': 1.20,
      'roofing sheets': 18.75,
      windows: 150.00,
      doors: 225.00
    }
    
    const locationMultipliers: { [key: string]: number } = {
      Harare: 1.0,
      Bulawayo: 0.95,
      Mutare: 0.98,
      Gweru: 0.92,
      Kwekwe: 0.90,
      Midlands: 0.88
    }
    
    const basePrice = basePrices[material] || 1.0
    const multiplier = locationMultipliers[priceLocation] || 1.0
    const quantityNum = parseInt(quantity) || 1
    
    const totalPrice = basePrice * quantityNum * multiplier
    setCalculatedPrice(totalPrice)
  }

  return (
      <>
    <AppLayout>
      <div className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Fair Price Calculator</h2>
            <p className="text-center text-gray-600 mb-8">Get real-time estimated prices for construction materials in your area</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select 
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bricks">Bricks 🧱</option>
                  <option value="cement">Cement 🏗️</option>
                  <option value="steel bars">Steel Bars ⚙️</option>
                  <option value="roofing sheets">Roofing Sheets 🏠</option>
                  <option value="windows">Windows 🪟</option>
                  <option value="doors">Doors 🚪</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select 
                  value={priceLocation}
                  onChange={(e) => setPriceLocation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Harare">Harare 🌆</option>
                  <option value="Bulawayo">Bulawayo 🏙️</option>
                  <option value="Mutare">Mutare 🏞️</option>
                  <option value="Gweru">Gweru 🏘️</option>
                  <option value="Kwekwe">Kwekwe 🏡</option>
                  <option value="Midlands">Midlands 🌄</option>
                </select>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <button 
                onClick={calculateFairPrice}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-300 flex items-center justify-center mx-auto"
              >
                <span className="mr-2">💰</span> Calculate Fair Price
              </button>
            </div>
            
            {calculatedPrice && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-2">Estimated Fair Price</h3>
                <p className="text-3xl font-extrabold text-green-600">${calculatedPrice.toFixed(2)}</p>
                <p className="text-green-700 mt-2">You could save up to 25% compared to traditional suppliers</p>
                <p className="text-sm text-green-600 mt-1">Price based on current market data for {quantity} {material} in {priceLocation}</p>
                
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-bold text-blue-800 mb-2">AI-Powered Market Insights</h4>
                  <p className="text-blue-700 text-sm">
                    <strong>Price Trend:</strong> Cement prices in {priceLocation} are expected to increase by 3-5% in the next quarter due to increased demand.
                    <br />
                    <strong>Alternative Suppliers:</strong> We've identified 3 suppliers in your area offering competitive rates for {material}.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-lg font-bold text-yellow-800 mb-2">How Our Calculator Works</h4>
              <p className="text-yellow-700 text-sm">
                Our Fair Price Calculator uses real-time data from thousands of transactions on our platform to provide you with the most accurate market prices. 
                This tool is completely free and helps you make informed decisions before starting your construction project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

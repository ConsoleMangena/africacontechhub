import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function FAQ() {
  const faqs = [
    {
      question: "How much does it cost to use The Central Hub?",
      answer: "For project owners, posting a project is completely free. We only charge a small transaction fee (typically 3-5%) when you hire a contractor through our platform. For contractors and suppliers, creating a profile is free, and we charge a commission on successful projects secured through our platform."
    },
    {
      question: "How are contractors and suppliers verified?",
      answer: "We conduct a thorough verification process that includes checking business registration documents, reviewing past work and references, and verifying professional licenses where applicable. Our team may also conduct site visits for larger contractors. This ensures that only qualified, reliable professionals are listed on our platform."
    },
    {
      question: "How does the escrow payment system work?",
      answer: "Our escrow system holds your payment securely until the contractor completes each agreed-upon milestone. You release payment for each milestone only after you've approved the work. This protects both parties - you know work will be completed before payment is released, and contractors know they'll be paid for completed work."
    },
    {
      question: "What happens if there's a dispute with my contractor?",
      answer: "We have a dedicated dispute resolution team that will work with both parties to find a fair solution. Our process includes reviewing the contract, examining evidence from both sides, and facilitating mediation. If necessary, we can also help facilitate arbitration. Our goal is to ensure a fair outcome for everyone involved."
    },
    {
      question: "Can I use The Central Hub for small renovation projects?",
      answer: "Absolutely! Our platform is designed for projects of all sizes, from small home renovations to large commercial buildings. Many of our contractors specialize in smaller projects and renovations, so you'll be able to find the right professional for your specific needs."
    },
    {
      question: "How long does it take to get bids on my project?",
      answer: "Most projects receive their first bids within 24-48 hours of being posted. The number and quality of bids you receive will depend on factors like your project location, scope, and budget. You can expect to have multiple qualified bids to review within a few days."
    },
    {
      question: "What financial services do you offer?",
      answer: "We offer a range of financial services including trade credit for contractors to purchase materials, project financing for homeowners, and buy-now-pay-later options. Our AI-powered underwriting system provides fast approval based on your project history and performance formData?."
    },
    {
      question: "How does your AI-powered cost estimation work?",
      answer: "Our AI analyzes data from thousands of completed construction projects to provide highly accurate cost estimates. It considers factors like project type, location, size, and quality level to predict costs with 89-95% accuracy. The system also provides risk assessments and timeline predictions to help you plan your project effectively."
    },
    {
      question: "Is your platform available offline?",
      answer: "Yes! We understand that construction sites often have unreliable internet connectivity. Our mobile-first platform allows you to access critical information and log data even when you're offline. All changes will automatically sync when you reconnect to the internet."
    },
    {
      question: "What makes your Construction OS different from other project management tools?",
      answer: "Our Construction OS is built specifically for the African construction market and integrates procurement, financing, and project management in one seamless platform. Unlike standalone project management tools, our OS connects directly to our marketplace of vetted contractors and suppliers, and our financial services, creating a complete ecosystem for your construction project."
    }
  ]

  return (
      <>
    <AppLayout>
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-gray-600">Get answers to common questions about our platform</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Still have questions?</h3>
            <p className="text-blue-800 mb-4">Our AI Customer Support Agent is available 24/7 to help you.</p>
            <div className="bg-white p-4 rounded-md border border-gray-300">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">AI</div>
                <p className="ml-3 font-medium">The Central Hub AI Assistant</p>
              </div>
              <p className="text-gray-600 mb-3">Hello! I'm here to answer any questions you have about our platform. How can I help you today?</p>
              <input 
                type="text" 
                placeholder="Type your question here..." 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
      </>
  )
}

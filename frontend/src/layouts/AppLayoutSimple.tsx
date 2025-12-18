import React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayoutSimple({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {children}
      </div>
    </div>
  )
}


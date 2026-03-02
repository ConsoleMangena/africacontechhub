import { useState } from 'react'
import { UserAuthForm } from './components/user-auth-form'
import { TermsDialog } from '../sign-up/components/terms-dialog'
import { PrivacyDialog } from '../sign-up/components/privacy-dialog'

import './sign-in.css'

export function SignIn2() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <div className='flex min-h-svh bg-white'>
      {/* Left — Form */}
      <div className='flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2'>
        <div className='w-full max-w-sm space-y-6'>
          {/* Logo & brand */}
          <div className='flex items-center gap-3'>
            <img
              src='/images/logo.png'
              alt='DzeNhare SQB Logo'
              className='h-10 w-10 object-contain'
            />
            <span className='text-lg font-semibold text-gray-900'>DzeNhare SQB</span>
          </div>

          {/* Heading */}
          <div className='space-y-1'>
            <h2 className='text-2xl font-bold tracking-tight text-gray-900'>Welcome back</h2>
            <p className='text-sm text-gray-500'>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <UserAuthForm />

          {/* Links */}
          <div className='space-y-3 text-center text-sm'>
            <p className='text-gray-500'>
              Don&apos;t have an account?{' '}
              <a
                href='/sign-up'
                className='font-medium text-green-600 hover:text-green-700'
              >
                Create account
              </a>
            </p>
            <p className='text-xs text-gray-400'>
              By signing in you agree to our{' '}
              <button
                type='button'
                onClick={() => setTermsOpen(true)}
                className='underline underline-offset-4 hover:text-gray-600'
              >
                Terms
              </button>{' '}
              and{' '}
              <button
                type='button'
                onClick={() => setPrivacyOpen(true)}
                className='underline underline-offset-4 hover:text-gray-600'
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right — Hero panel */}
      <div className='relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center border-l bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50'>
        {/* Animated gradient background */}
        <div className='absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 animate-gradient-shift' />

        {/* Animated blobs */}
        <div className='absolute top-20 right-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-20 left-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime-200/20 rounded-full blur-3xl animate-pulse-slow' />

        {/* Grid pattern overlay */}
        <div className='absolute inset-0 bg-grid-pattern opacity-10' />

        {/* Content */}
        <div className='relative z-20 flex flex-col items-center space-y-8 px-12 text-center'>
          <div className='animate-fade-in-up'>
            <img
              src='/images/logo.png'
              alt='DzeNhare SQB Logo'
              className='h-32 w-32 drop-shadow-2xl object-contain'
            />
          </div>

          <div className='animate-fade-in-up animation-delay-200 space-y-3'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900'>
              DzeNhare SQB
            </h1>
            <p className='max-w-xs text-sm text-gray-600'>
              Zimbabwe&apos;s digital ecosystem connecting builders, contractors, and suppliers
            </p>
          </div>

          <div className='flex gap-2 animate-fade-in-up animation-delay-400'>
            <div className='rounded-full border border-green-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-gray-700'>
              Builders
            </div>
            <div className='rounded-full border border-green-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-gray-700'>
              Contractors
            </div>
            <div className='rounded-full border border-green-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-gray-700'>
              Suppliers
            </div>
          </div>
        </div>

        {/* Particles */}
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-particle-1' />
        <div className='absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/4 right-1/4 w-2 h-2 bg-lime-400 rounded-full animate-particle-3' />
        <div className='absolute bottom-1/3 left-1/3 w-1 h-1 bg-green-500 rounded-full animate-particle-4' />
      </div>

      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  )
}

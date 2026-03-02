import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SignUpForm } from './components/sign-up-form'
import { TermsDialog } from './components/terms-dialog'
import { PrivacyDialog } from './components/privacy-dialog'

import './sign-up.css'

export function SignUp2() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <div className='flex min-h-svh bg-white'>
      {/* Left — Form (scrollable) */}
      <div className='flex w-full flex-col items-center overflow-y-auto px-6 py-10 lg:w-1/2'>
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
            <h2 className='text-2xl font-bold tracking-tight text-gray-900'>Create an account</h2>
            <p className='text-sm text-gray-500'>
              Join the platform connecting builders, contractors, and suppliers
            </p>
          </div>

          {/* Form */}
          <SignUpForm />

          {/* Links */}
          <div className='space-y-3 pb-6 text-center text-sm'>
            <p className='text-gray-500'>
              Already have an account?{' '}
              <Link
                to='/sign-in'
                className='font-medium text-green-600 hover:text-green-700'
              >
                Sign in
              </Link>
            </p>
            <p className='text-xs text-gray-400'>
              By creating an account you agree to our{' '}
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
        <div className='absolute top-10 left-10 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-10 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/3 right-1/4 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl animate-pulse-slow' />

        {/* Diagonal pattern */}
        <div className='absolute inset-0 bg-diagonal-pattern opacity-5' />

        {/* Content */}
        <div className='relative z-20 flex flex-col items-center space-y-8 px-12 text-center'>
          <div className='animate-fade-in-up'>
            <img
              src='/images/logo.png'
              alt='DzeNhare SQB Logo'
              className='h-32 w-32 drop-shadow-2xl object-contain animate-bounce-slow'
            />
          </div>

          <div className='animate-fade-in-up animation-delay-200 space-y-3'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900'>
              DzeNhare SQB
            </h1>
            <p className='max-w-xs text-sm text-gray-600'>
              Build smarter with verified projects, escrow protection, and SI&nbsp;56 compliance
            </p>
          </div>

          {/* Feature cards */}
          <div className='w-full max-w-xs space-y-3 animate-fade-in-up animation-delay-400'>
            <div className='flex items-center gap-3 rounded-xl border border-green-100 bg-white/60 p-3 backdrop-blur-sm'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/15'>
                <svg className='h-5 w-5 text-green-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div className='text-left'>
                <p className='text-sm font-semibold text-gray-900'>Verified Projects</p>
                <p className='text-xs text-gray-500'>SI 56 Compliance</p>
              </div>
            </div>

            <div className='flex items-center gap-3 rounded-xl border border-green-100 bg-white/60 p-3 backdrop-blur-sm'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15'>
                <svg className='h-5 w-5 text-emerald-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
              <div className='text-left'>
                <p className='text-sm font-semibold text-gray-900'>Escrow Protection</p>
                <p className='text-xs text-gray-500'>Secure Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Particles */}
        <div className='absolute top-1/5 left-1/5 w-3 h-3 bg-green-400 rounded-full animate-particle-1' />
        <div className='absolute top-2/5 right-1/5 w-2 h-2 bg-emerald-400 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/5 right-1/5 w-2.5 h-2.5 bg-lime-400 rounded-full animate-particle-3' />
        <div className='absolute bottom-2/5 left-1/5 w-1.5 h-1.5 bg-green-500 rounded-full animate-particle-4' />
        <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-particle-5' />
      </div>

      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  )
}

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
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0 bg-white'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center gap-3'>
            <img 
              src='/images/logo.png' 
              alt='DzeNhare SQB Logo' 
              className='h-16 w-16 object-contain'
            />
            <h1 className='text-xl font-medium text-gray-900'>DzeNhare SQB</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight text-gray-900'>Create an account</h2>
            <p className='text-gray-600 text-sm'>
              Join the platform connecting aspirational builders, <br />
              professional contractors, and material suppliers
            </p>
          </div>
          <SignUpForm />
          <p className='text-gray-600 text-center text-sm'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4 text-green-600'
            >
              Sign In
            </Link>
          </p>
          <p className='text-gray-600 px-8 text-center text-xs'>
            By creating an account, you agree to our{' '}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className='hover:text-primary underline underline-offset-4 text-green-600 cursor-pointer'
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className='hover:text-primary underline underline-offset-4 text-green-600 cursor-pointer'
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />

      <div className='relative hidden h-full overflow-hidden flex-col p-10 lg:flex border-l bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50'>
        {/* Animated gradient background - Light Mode Only */}
        <div className='absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 animate-gradient-shift' />

        {/* Animated circles */}
        <div className='absolute top-10 left-10 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-10 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/3 right-1/4 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl animate-pulse-slow' />

        {/* Diagonal lines pattern */}
        <div className='absolute inset-0 bg-diagonal-pattern opacity-5' />

        {/* Content */}
        <div className='relative z-20 flex h-full flex-col items-center justify-center space-y-6'>
          <div className='animate-fade-in-up'>
            <img 
              src='/images/logo.png' 
              alt='DzeNhare SQB Logo' 
              className='h-40 w-40 drop-shadow-2xl object-contain animate-bounce-slow'
            />
          </div>
          <h1 className='text-5xl font-bold tracking-tight text-center text-gray-900 animate-fade-in-up animation-delay-200'>
            DzeNhare SQB
          </h1>

          {/* Feature cards */}
          <div className='grid grid-cols-1 gap-4 mt-8 w-full max-w-md animate-fade-in-up animation-delay-400'>
            <div className='p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-300 transform hover:scale-105 transition-transform'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-500/20 rounded-lg'>
                  <svg className='w-6 h-6 text-green-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900'>Verified Projects</h3>
                  <p className='text-sm text-gray-600'>SI 56 Compliance</p>
                </div>
              </div>
            </div>

            <div className='p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-300 transform hover:scale-105 transition-transform'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-emerald-500/20 rounded-lg'>
                  <svg className='w-6 h-6 text-emerald-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900'>Escrow Protection</h3>
                  <p className='text-sm text-gray-600'>Secure Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated particles */}
        <div className='absolute top-1/5 left-1/5 w-3 h-3 bg-green-400 rounded-full animate-particle-1' />
        <div className='absolute top-2/5 right-1/5 w-2 h-2 bg-emerald-400 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/5 right-1/5 w-2.5 h-2.5 bg-lime-400 rounded-full animate-particle-3' />
        <div className='absolute bottom-2/5 left-1/5 w-1.5 h-1.5 bg-green-500 rounded-full animate-particle-4' />
        <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-particle-5' />
      </div>
    </div>
  )
}

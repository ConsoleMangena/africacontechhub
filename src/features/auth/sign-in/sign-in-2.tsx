import { useState } from 'react'
import { UserAuthForm } from './components/user-auth-form'
import { TermsDialog } from '../sign-up/components/terms-dialog'
import { PrivacyDialog } from '../sign-up/components/privacy-dialog'

import './sign-in.css'

export function SignIn2() {
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
            <h2 className='text-lg font-semibold tracking-tight text-gray-900'>Sign in</h2>
            <p className='text-gray-600 text-sm'>
              Enter your email and password below <br />
              to log into your account
            </p>
          </div>
          <UserAuthForm />
          <p className='text-gray-600 text-center text-sm'>
            Don't have an account?{' '}
            <a
              href='/sign-up'
              className='hover:text-primary underline underline-offset-4 text-green-600'
            >
              Sign Up
            </a>
          </p>
          <p className='text-gray-600 px-8 text-center text-sm'>
            By clicking sign in, you agree to our{' '}
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
        <div className='absolute top-20 right-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-20 left-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime-200/20 rounded-full blur-3xl animate-pulse-slow' />

        {/* Grid pattern overlay */}
        <div className='absolute inset-0 bg-grid-pattern opacity-10' />

        {/* Content */}
        <div className='relative z-20 flex h-full flex-col items-center justify-center space-y-6'>
          <div className='animate-fade-in-up'>
            <img 
              src='/images/logo.png' 
              alt='DzeNhare SQB Logo' 
              className='h-40 w-40 drop-shadow-2xl object-contain'
            />
          </div>
          <h1 className='text-5xl font-bold tracking-tight text-center text-gray-900 animate-fade-in-up animation-delay-200'>
            DzeNhare SQB
          </h1>
          <div className='flex gap-3 mt-8 animate-fade-in-up animation-delay-400'>
            <div className='px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-sm border border-gray-300 text-gray-700'>
              Builders
            </div>
            <div className='px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-sm border border-gray-300 text-gray-700'>
              Contractors
            </div>
            <div className='px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-sm border border-gray-300 text-gray-700'>
              Suppliers
            </div>
          </div>
        </div>

        {/* Animated particles */}
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-particle-1' />
        <div className='absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/4 right-1/4 w-2 h-2 bg-lime-400 rounded-full animate-particle-3' />
        <div className='absolute bottom-1/3 left-1/3 w-1 h-1 bg-green-500 rounded-full animate-particle-4' />
      </div>
    </div>
  )
}

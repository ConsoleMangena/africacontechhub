import { Logo } from '@/assets/logo'
import { Link } from '@tanstack/react-router'
import { SignUpForm } from './components/sign-up-form'

import './sign-up.css'

export function SignUp2() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>Africa ConTech Hub</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Create an account</h2>
            <p className='text-muted-foreground text-sm'>
              Join the platform connecting aspirational builders, <br />
              professional contractors, and material suppliers
            </p>
          </div>
          <SignUpForm />
          <p className='text-muted-foreground text-center text-sm'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign In
            </Link>
          </p>
          <p className='text-muted-foreground px-8 text-center text-xs'>
            By creating an account, you agree to our{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className='relative hidden h-full overflow-hidden flex-col p-10 lg:flex border-l'>
        {/* Animated gradient background - Light/Dark Mode */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 animate-gradient-shift' />

        {/* Animated circles */}
        <div className='absolute top-10 left-10 w-80 h-80 bg-emerald-200/30 dark:bg-slate-700/20 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-10 right-10 w-72 h-72 bg-teal-200/30 dark:bg-gray-600/20 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-200/20 dark:bg-zinc-700/10 rounded-full blur-3xl animate-pulse-slow' />

        {/* Diagonal lines pattern */}
        <div className='absolute inset-0 bg-diagonal-pattern opacity-5' />

        {/* Content */}
        <div className='relative z-20 flex h-full flex-col items-center justify-center space-y-6'>
          <div className='animate-fade-in-up'>
            <Logo className='h-24 w-24 drop-shadow-2xl animate-bounce-slow' />
          </div>
          <h1 className='text-5xl font-bold tracking-tight text-center text-gray-900 dark:text-white animate-fade-in-up animation-delay-200'>
            Africa ConTech Hub
          </h1>

          {/* Feature cards */}
          <div className='grid grid-cols-1 gap-4 mt-8 w-full max-w-md animate-fade-in-up animation-delay-400'>
            <div className='p-4 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-white/20 transform hover:scale-105 transition-transform'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-emerald-500/20 dark:bg-white/20 rounded-lg'>
                  <svg className='w-6 h-6 text-emerald-700 dark:text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>Verified Projects</h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>SI 56 Compliance</p>
                </div>
              </div>
            </div>

            <div className='p-4 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-white/20 transform hover:scale-105 transition-transform'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-teal-500/20 dark:bg-white/20 rounded-lg'>
                  <svg className='w-6 h-6 text-teal-700 dark:text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>Escrow Protection</h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Secure Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated particles */}
        <div className='absolute top-1/5 left-1/5 w-3 h-3 bg-emerald-400 dark:bg-gray-300 rounded-full animate-particle-1' />
        <div className='absolute top-2/5 right-1/5 w-2 h-2 bg-teal-400 dark:bg-slate-200 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/5 right-1/5 w-2.5 h-2.5 bg-cyan-400 dark:bg-zinc-200 rounded-full animate-particle-3' />
        <div className='absolute bottom-2/5 left-1/5 w-1.5 h-1.5 bg-emerald-500 dark:bg-white rounded-full animate-particle-4' />
        <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-teal-500 dark:bg-gray-400 rounded-full animate-particle-5' />
      </div>
    </div>
  )
}

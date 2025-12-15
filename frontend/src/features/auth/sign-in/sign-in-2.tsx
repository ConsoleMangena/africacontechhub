import { Logo } from '@/assets/logo'
import { UserAuthForm } from './components/user-auth-form'

import './sign-in.css'

export function SignIn2() {
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
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-muted-foreground text-sm'>
              Enter your email and password below <br />
              to log into your account
            </p>
          </div>
          <UserAuthForm />
          <p className='text-muted-foreground text-center text-sm'>
            Don't have an account?{' '}
            <a
              href='/sign-up'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign Up
            </a>
          </p>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking sign in, you agree to our{' '}
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
        {/* Animated gradient background - Light Mode */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 animate-gradient-shift' />

        {/* Animated circles */}
        <div className='absolute top-20 right-20 w-72 h-72 bg-blue-200/30 dark:bg-white/5 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-20 left-20 w-96 h-96 bg-teal-200/30 dark:bg-slate-700/20 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 dark:bg-gray-600/10 rounded-full blur-3xl animate-pulse-slow' />

        {/* Grid pattern overlay */}
        <div className='absolute inset-0 bg-grid-pattern opacity-10' />

        {/* Content */}
        <div className='relative z-20 flex h-full flex-col items-center justify-center space-y-6'>
          <div className='animate-fade-in-up'>
            <Logo className='h-24 w-24 drop-shadow-2xl' />
          </div>
          <h1 className='text-5xl font-bold tracking-tight text-center text-gray-900 dark:text-white animate-fade-in-up animation-delay-200'>
            Africa ConTech Hub
          </h1>
          <div className='flex gap-3 mt-8 animate-fade-in-up animation-delay-400'>
            <div className='px-4 py-2 bg-white/40 dark:bg-white/10 backdrop-blur-sm rounded-full text-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white'>
              Builders
            </div>
            <div className='px-4 py-2 bg-white/40 dark:bg-white/10 backdrop-blur-sm rounded-full text-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white'>
              Contractors
            </div>
            <div className='px-4 py-2 bg-white/40 dark:bg-white/10 backdrop-blur-sm rounded-full text-sm border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white'>
              Suppliers
            </div>
          </div>
        </div>

        {/* Animated particles */}
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 dark:bg-white rounded-full animate-particle-1' />
        <div className='absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-400 dark:bg-gray-300 rounded-full animate-particle-2' />
        <div className='absolute bottom-1/4 right-1/4 w-2 h-2 bg-teal-400 dark:bg-slate-200 rounded-full animate-particle-3' />
        <div className='absolute bottom-1/3 left-1/3 w-1 h-1 bg-indigo-500 dark:bg-white rounded-full animate-particle-4' />
      </div>
    </div>
  )
}

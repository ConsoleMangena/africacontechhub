import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getSupabaseAuthErrorMessage } from '@/lib/supabase-error'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { authApi } from '@/services/api'
const formSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['BUILDER', 'CONTRACTOR', 'SUPPLIER', 'ADMIN']),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  })

  // If the account request was submitted, show a success/pending screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <Icon name="check_circle" className="h-10 w-10 text-green-600" />
          </div>
          <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Icon name="schedule" className="h-4 w-4 text-white" />
          </span>
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-1">Request Submitted!</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your account request for <span className="font-semibold text-gray-800">{submittedEmail}</span> has been sent to an administrator for review.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            You'll receive access once your request is approved. This typically takes less than 24 hours.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">
          <Icon name="gpp_good" className="h-4 w-4 shrink-0" />
          <span>Awaiting admin approval — you cannot log in yet.</span>
        </div>
      </div>
    )
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Check if Supabase is configured before attempting sign up
    if (!isSupabaseConfigured) {
      toast.error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
        'Get credentials from: https://app.supabase.com → Your Project → Settings → API'
      )
      setIsLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      // IMMEDIATELY notify Django of the new user to create the PENDING AccountRequest.
      // We use a plain fetch WITHOUT the Supabase token because:
      // 1. The endpoint is AllowAny (no auth needed)
      // 2. Sending an unverified token causes Django's SupabaseAuthentication to reject the request
      try {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalhost ? (import.meta.env.VITE_API_URL || 'http://localhost:8000') : '';
        await fetch(`${apiUrl}/api/v1/auth/register-request/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            supabase_id: authData.user.id,
            role: data.role,
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber
          })
        });
      } catch (e) {
        console.warn('Django register-request call failed:', e);
      }

      // Sign out immediately — they must wait for admin approval
      if (authData.session) {
        await supabase.auth.signOut();
      }
      setSubmittedEmail(data.email);
      setSubmitted(true);

    } catch (err: unknown) {
      console.error(err);
      toast.error(getSupabaseAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      toast.error(
        'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
        'Get credentials from: https://app.supabase.com → Your Project → Settings → API'
      )
      return
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(getSupabaseAuthErrorMessage(err));
      setIsLoading(false);
    }
  };


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2.5', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BUILDER">Aspirational Builder</SelectItem>
                  <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                  <SelectItem value="SUPPLIER">Supplier</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='phoneNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder='+263 7X XXX XXXX' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-3'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button className='mt-1.5 w-full' disabled={isLoading}>
          Create Account
        </Button>

        <div className='relative my-1.5'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading} onClick={handleGoogleLogin}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </div>
      </form>
    </Form>
  )
}

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/auth-store'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const accountFormSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const { auth } = useAuthStore()
  const user = auth.user

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      role: user?.profile?.role || '',
    },
  })

  function onSubmit() {
    toast.info('Account details are managed by your administrator.')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid gap-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>Email</FormLabel>
                <Card className='border-slate-200'>
                  <CardContent className='p-4'>
                    <FormControl>
                      <Input className='h-10' {...field} disabled />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormDescription className='text-xs text-slate-500'>
                  Your email address is used for logging in and notifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>Username / User ID</FormLabel>
                <Card className='border-slate-200'>
                  <CardContent className='p-4'>
                    <FormControl>
                      <Input className='h-10' {...field} disabled />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormDescription className='text-xs text-slate-500'>
                  Your unique identifier in the system.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>Role</FormLabel>
                <Card className='border-slate-200'>
                  <CardContent className='p-4'>
                    <FormControl>
                      <Input className='h-10' {...field} disabled />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormDescription className='text-xs text-slate-500'>
                  Your assigned role in the platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}


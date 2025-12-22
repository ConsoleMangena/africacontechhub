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
    // This is just a display form for now, or we could handle email updates here
    toast.info('Account details are managed by your administrator.')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Username / User ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                Your assigned role in the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type='submit'>Update account</Button> */}
      </form>
    </Form>
  )
}


import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '../components/avatar-upload'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  bio: z.string().max(160).optional(),
  urls: z
    .array(
      z.object({
        value: z.url('Please enter a valid URL.'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { auth } = useAuthStore()
  const user = auth.user

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phoneNumber: user?.profile?.phone_number || '',
      bio: '', // Bio is not yet in the backend model, keeping as placeholder or need to add to model
      urls: [], // URLs not in model yet
    },
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      await apiClient.patch('/api/v1/auth/me/', {
        first_name: data.firstName,
        last_name: data.lastName,
        profile: {
          phone_number: data.phoneNumber,
        }
      })

      // Refresh user data in store
      await auth.initialize()

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (!user) return null

  return (
    <div className="space-y-5">
      <AvatarUpload user={{
        name: user.first_name ? `${user.first_name} ${user.last_name}` : user.email || 'User',
        email: user.email || '',
        avatar: user.profile?.avatar || ''
      }} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' className='h-9' {...field} />
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
                  <FormLabel className='text-xs'>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' className='h-9' {...field} />
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
                <FormLabel className='text-xs'>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder='+1234567890' className='h-9' {...field} />
                </FormControl>
                <FormDescription className='text-xs'>
                  Used for important notifications and contact.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none min-h-[80px]'
                    {...field}
                  />
                </FormControl>
                <FormDescription className='text-xs'>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only', 'text-xs')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only', 'text-xs')}>
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                      <Input className='h-9' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2 h-8 text-xs'
              onClick={() => append({ value: '' })}
            >
              Add URL
            </Button>
          </div>
          <Button type='submit' size='sm' className='h-8'>
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  )
}

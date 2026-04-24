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
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/material-icon'

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

      {/* Digital Signature Section */}
      <DigitalSignatureSection user={user} />
    </div>
  )
}

// Digital Signature Section Component
function DigitalSignatureSection({ user }: { user: User }) {
  const { auth } = useAuthStore()
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const hasInitializedRef = useRef(false)

  // Load existing signature on mount or when user data is refreshed
  useEffect(() => {
    if (user?.profile?.signature && !hasInitializedRef.current) {
      setSignatureData(user.profile.signature)
      hasInitializedRef.current = true
    }
  }, [user])

  // Effect to draw signature on canvas when data is loaded
  useEffect(() => {
    if (signatureData && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          // Only clear and draw if the canvas is currently empty or we're initializing
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        img.src = signatureData
      }
    }
  }, [signatureData])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e293b'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    
    setIsSaving(true)
    try {
      await apiClient.patch('/api/v1/auth/me/', {
        profile: {
          signature: dataUrl
        }
      })
      
      setSignatureData(dataUrl)
      
      // Refresh user data in store to sync across app
      await auth.initialize()
      
      toast.success('Digital signature saved to profile')
    } catch (error) {
      console.error('Failed to save signature:', error)
      toast.error('Failed to save signature to database')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSignature = async () => {
    try {
      await apiClient.patch('/api/v1/auth/me/', {
        profile: {
          signature: null
        }
      })
      
      setSignatureData(null)
      clearSignature()
      hasInitializedRef.current = false // Allow re-initialization if needed
      
      // Refresh user data in store
      await auth.initialize()
      
      toast.success('Digital signature removed')
    } catch (error) {
      console.error('Failed to remove signature:', error)
      toast.error('Failed to remove signature from database')
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon name="signature" className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base">Digital Signature</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Create your digital signature for signing documents and budgets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="border border-slate-300 rounded-lg bg-white cursor-crosshair w-full touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <p className="text-xs text-slate-400 mt-1 text-center">
              Draw or edit your signature in the box above
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold flex items-center gap-1.5"
              onClick={clearSignature}
            >
              <Icon name="refresh" size={16} className="-ml-0.5" />
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 text-xs font-bold flex items-center gap-1.5"
              onClick={deleteSignature}
              disabled={!signatureData}
            >
              <Icon name="delete" size={16} className="-ml-0.5" />
              Remove
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs font-bold flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white ml-auto"
              onClick={saveSignature}
              disabled={isSaving}
            >
              <Icon name={isSaving ? 'sync' : 'save'} size={16} className={cn("-ml-0.5", isSaving && "animate-spin")} />
              {isSaving ? 'Saving...' : 'Save Signature'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

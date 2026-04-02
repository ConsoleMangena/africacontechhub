import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Icon } from '@/components/ui/material-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
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
import { Card, CardContent } from '@/components/ui/card'

const appearanceFormSchema = z.object({
  font: z.enum(fonts),
  theme: z.enum(['light', 'dark', 'system']),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: { font, theme },
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    if (data.theme != theme) setTheme(data.theme)
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>Font</FormLabel>
              <Card className='border-slate-200'>
                <CardContent className='p-4'>
                  <div className='relative w-fit'>
                    <FormControl>
                      <select
                        className={cn(
                          'h-10 px-4 pr-10 rounded-md border border-slate-200 bg-white text-sm appearance-none cursor-pointer',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                          'hover:border-slate-300 transition-colors capitalize'
                        )}
                        {...field}
                      >
                        {fonts.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <Icon name='expand_more' className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none' />
                  </div>
                </CardContent>
              </Card>
              <FormDescription className='text-xs text-slate-500'>
                Set the font you want to use in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>Theme Mode</FormLabel>
              <Card className='border-slate-200'>
                <CardContent className='p-4'>
                  <div className='relative w-fit'>
                    <FormControl>
                      <select
                        className={cn(
                          'h-10 px-4 pr-10 rounded-md border border-slate-200 bg-white text-sm appearance-none cursor-pointer',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                          'hover:border-slate-300 transition-colors capitalize'
                        )}
                        {...field}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </FormControl>
                    <Icon name='expand_more' className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none' />
                  </div>
                </CardContent>
              </Card>
              <FormDescription className='text-xs text-slate-500'>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='h-10 px-6'>
          Save Changes
        </Button>
      </form>
    </Form>
  )
}

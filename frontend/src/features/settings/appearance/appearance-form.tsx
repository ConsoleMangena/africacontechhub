import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const appearanceFormSchema = z.object({
  font: z.enum(fonts),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont } = useFont()

  const defaultValues: Partial<AppearanceFormValues> = {
    font,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs'>Font</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'w-[180px] appearance-none font-normal capitalize h-9 text-sm'
                    )}
                    {...field}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute end-3 top-2.5 h-3.5 w-3.5 opacity-50' />
              </div>
              <FormDescription className='text-xs font-manrope'>
                Set the font you want to use in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' size='sm' className='h-8'>
          Save Changes
        </Button>
      </form>
    </Form>
  )
}

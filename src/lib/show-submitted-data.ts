import { toast } from 'sonner'

/**
 * Utility function to show submitted form data
 * Useful for development and debugging
 */
export function showSubmittedData(data: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('Submitted data:', data)
    toast.success('Form submitted successfully!', {
      description: 'Check the console for submitted data.',
    })
  } else {
    toast.success('Form submitted successfully!')
  }
}


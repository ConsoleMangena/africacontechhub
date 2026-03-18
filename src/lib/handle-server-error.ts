import { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * Handles server errors and displays appropriate toast notifications
 * @param error - The error object (typically an AxiosError)
 */
export function handleServerError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.response?.data?.detail || error.message

    switch (status) {
      case 400:
        toast.error(message || 'Bad request. Please check your input.')
        break
      case 401:
        toast.error('Authentication required. Please sign in.')
        break
      case 403:
        toast.error('You do not have permission to perform this action.')
        break
      case 404:
        toast.error('The requested resource was not found.')
        break
      case 422:
        toast.error(message || 'Validation error. Please check your input.')
        break
      case 500:
        toast.error('Internal server error. Please try again later.')
        break
      case 503:
        toast.error('Service temporarily unavailable. Please try again later.')
        break
      default:
        if (message) {
          toast.error(message)
        } else if (error.message) {
          toast.error(error.message)
        } else {
          toast.error('An unexpected error occurred.')
        }
    }
  } else if (error instanceof Error) {
    toast.error(error.message || 'An unexpected error occurred.')
  } else {
    toast.error('An unexpected error occurred.')
  }
}

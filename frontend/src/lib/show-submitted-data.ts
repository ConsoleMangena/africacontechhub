
import { toast } from 'sonner'

export function showSubmittedData(data: any) {
  console.log(data)
  toast.success('Form submitted!', {
    description: JSON.stringify(data, null, 2),
  })
}

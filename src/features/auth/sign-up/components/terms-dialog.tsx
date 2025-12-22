import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { legalApi } from '@/services/api'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface TermsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['legal-document', 'terms'],
    queryFn: async () => {
      const response = await legalApi.getLegalDocument('terms')
      return response.data
    },
    enabled: open, // Only fetch when dialog is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {data?.title || 'Terms of Service'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {data?.updated_at 
              ? `Last updated: ${format(new Date(data.updated_at), 'MMM dd, yyyy')}`
              : 'Loading...'
            }
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-600 text-sm">Failed to load Terms of Service. Please try again later.</p>
            </div>
          ) : data ? (
            <div 
              className="space-y-4 text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-600 text-sm">No content available.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


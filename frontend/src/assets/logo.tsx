import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/images/logo.png'
      alt='Dzenhare SQB Logo'
      className={cn('size-12 object-contain', className)}
      {...props}
    />
  )
}

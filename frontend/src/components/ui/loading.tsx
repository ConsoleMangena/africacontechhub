import { Icon } from './material-icon'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  text?: string
  size?: number
  fullPage?: boolean
  variant?: 'primary' | 'muted' | 'white'
}

export function Loading({ 
  className, 
  text = 'Loading...', 
  size = 24, 
  fullPage = false,
  variant = 'primary'
}: LoadingProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    fullPage ? 'min-h-[60vh] w-full' : '',
    className
  )

  const iconClasses = cn(
    'shrink-0 leading-none flex items-center justify-center',
    variant === 'primary' && 'text-primary',
    variant === 'muted' && 'text-muted-foreground',
    variant === 'white' && 'text-white'
  )

  return (
    <div className={containerClasses}>
      <div 
        className="animate-spin flex items-center justify-center shrink-0" 
        style={{ width: size, height: size }}
      >
        <Icon 
          name="progress_activity" 
          size={size} 
          className={iconClasses} 
        />
      </div>
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

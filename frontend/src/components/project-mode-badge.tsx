import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/material-icon'
import { cn } from '@/lib/utils'

interface ProjectModeBadgeProps {
  engagementTier: 'DIT' | 'DIFY'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function ProjectModeBadge({ engagementTier, size = 'md', showIcon = true, className }: ProjectModeBadgeProps) {
  const isDIFY = engagementTier === 'DIFY'
  
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <Badge
      className={cn(
        'font-semibold uppercase tracking-wide border',
        isDIFY 
          ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon 
          name={isDIFY ? 'support_agent' : 'handyman'} 
          size={iconSizes[size]} 
          className="mr-1" 
        />
      )}
      {isDIFY ? 'Do It For You' : 'Do It Together'}
    </Badge>
  )
}

export function ProjectModeIndicator({ engagementTier }: { engagementTier: 'DIT' | 'DIFY' }) {
  const isDIFY = engagementTier === 'DIFY'
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
      isDIFY 
        ? 'bg-purple-50 border-purple-200 text-purple-700' 
        : 'bg-blue-50 border-blue-200 text-blue-700'
    )}>
      <Icon name={isDIFY ? 'support_agent' : 'handyman'} size={18} />
      <div>
        <p className="font-semibold text-xs uppercase tracking-wide">
          {isDIFY ? 'DIFY Mode' : 'DIT Mode'}
        </p>
        <p className="text-[10px] opacity-80">
          {isDIFY ? 'SQB manages your project' : 'You manage your project'}
        </p>
      </div>
    </div>
  )
}

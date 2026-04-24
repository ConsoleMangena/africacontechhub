import { Separator } from '@/components/ui/separator'

interface ContentSectionProps {
  title: string
  desc: string
  children: React.ReactNode
}

export function ContentSection({ title, desc, children }: ContentSectionProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{desc}</p>
      </div>
      <Separator />
      <div className='max-w-2xl'>{children}</div>
    </div>
  )
}

import { useState, type JSX } from 'react'
import { useLocation, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SidebarNavProps {
  items: {
    href: string
    title: string
    icon: JSX.Element
  }[]
  className?: string
}

export function SidebarNav({ className, items }: SidebarNavProps) {
  const { pathname } = useLocation()
  const [val, setVal] = useState(pathname ?? '/settings')

  return (
    <>
      {/* Mobile Select */}
      <div className='lg:hidden p-2'>
        <Select value={val} onValueChange={setVal}>
          <SelectTrigger className='h-10'>
            <SelectValue placeholder='Select section' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className='flex items-center gap-2'>
                  {item.icon}
                  <span className='text-sm'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Nav */}
      <nav className={cn('hidden lg:flex flex-col gap-1 p-2', className)}>
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-slate-400')}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

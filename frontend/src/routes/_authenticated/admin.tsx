import { createFileRoute, Outlet, Navigate, Link, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LayoutDashboard, Users, BookOpen, Image, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
})

const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users & Requests', href: '/admin/users', icon: Users },
  { name: 'Knowledge Base', href: '/admin/knowledge-base', icon: BookOpen },
  { name: 'Floor Plans', href: '/admin/floor-plans', icon: Image },
  { name: 'AI Command Center', href: '/admin/ai-command-center', icon: BrainCircuit },
]

function AdminLayout() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role
  const location = useLocation()

  if (role !== 'ADMIN') {
    return <Navigate to="/" />
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>
      
      {/* Admin Secondary Navigation */}
      <div className="border-b bg-background sticky top-16 z-30">
        <div className="flex h-12 w-full items-center px-4 overflow-x-auto no-scrollbar gap-1">
          {adminNavigation.map((item) => {
             const isActive = item.href === '/admin' 
                ? location.pathname === '/admin' || location.pathname === '/admin/'
                : location.pathname.startsWith(item.href)
                
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-muted-foreground")} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <Main fluid>
        <Outlet />
      </Main>
    </>
  )
}

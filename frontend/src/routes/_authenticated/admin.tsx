import { createFileRoute, Outlet, Navigate, Link, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/material-icon'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
})

const adminNavigation = [
  { name: 'Overview', href: '/admin', icon: 'space_dashboard', badge: false },
  { name: 'Users & Requests', href: '/admin/users', icon: 'group', badge: true },
  { name: 'Projects', href: '/admin/projects', icon: 'business', badge: false },
  { name: 'Billing', href: '/admin/billing', icon: 'payments', badge: false },
  { name: 'Knowledge Base', href: '/admin/knowledge-base', icon: 'menu_book', badge: false },
  { name: 'Floor Plans', href: '/admin/floor-plans', icon: 'image', badge: false },
  { name: 'AI Command Center', href: '/admin/ai-command-center', icon: 'psychology', badge: false },
  { name: 'Settings', href: '/admin/settings', icon: 'settings', badge: false },
  { name: 'Activity Log', href: '/admin/activity-log', icon: 'history', badge: false },
]

function AdminLayout() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role
  const location = useLocation()

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => (await adminApi.getMetrics()).data,
    staleTime: 30_000,
  })

  const pendingCount = metrics?.system_overview?.pending_requests ?? 0

  if (role !== 'ADMIN') {
    return <Navigate to="/" />
  }

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Icon name="admin_panel_settings" className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">Admin Console</span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      {/* Admin Secondary Navigation */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="flex h-11 w-full items-end px-4 sm:px-6 overflow-x-auto no-scrollbar gap-0.5">
          {adminNavigation.map((item) => {
            const isActive = item.href === '/admin'
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 pb-2.5 pt-2 text-[13px] font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "text-indigo-700"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  name={item.icon}
                  size={15}
                  className={cn(isActive ? "text-indigo-600" : "text-muted-foreground/70")}
                />
                {item.name}
                {item.badge && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                    {pendingCount}
                  </span>
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-indigo-600" />
                )}
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

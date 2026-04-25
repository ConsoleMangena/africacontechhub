import { Outlet } from '@tanstack/react-router'
import { Loading } from '@/components/ui/loading'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/auth-store'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { activityApi } from '@/services/api'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { user, isLoading } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate({ to: '/sign-in' })
      } else if (
        user.profile &&
        user.profile.is_approved === false &&
        user.profile.role !== 'ADMIN'
      ) {
        navigate({ to: '/pending-approval' })
      }
    }
  }, [isLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    // Log route views for per-user activity timeline.
    // Best-effort (never blocks navigation).
    activityApi.logEvent({
      event_type: 'PAGE_VIEW',
      path: location.pathname,
      title: document?.title || '',
      referrer: document?.referrer || '',
    }).catch(() => {})
  }, [user?.id, location.pathname])

  if (isLoading) {
    return <Loading fullPage text="Securing your session..." />
  }

  if (!user) return null // Will redirect via useEffect

  if (
    user.profile &&
    user.profile.is_approved === false &&
    user.profile.role !== 'ADMIN'
  ) {
    return null // Will redirect via useEffect
  }

  const isFullscreenApp = location.pathname.includes('/architectural-studio')

  if (isFullscreenApp) {
    return (
      <SearchProvider>
        <LayoutProvider>
          <div className="dark min-h-screen w-full bg-slate-950">
            {children ?? <Outlet />}
          </div>
        </LayoutProvider>
      </SearchProvider>
    )
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              'bg-background min-h-screen',
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}

import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AiChatButton } from '@/components/ai-chat-button'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { user, isLoading } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const { pathname } = useLocation()

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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) return null // Will redirect via useEffect

  if (
    user.profile &&
    user.profile.is_approved === false &&
    user.profile.role !== 'ADMIN'
  ) {
    return null // Will redirect via useEffect
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
          {pathname.startsWith('/builder') && <AiChatButton />}
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}

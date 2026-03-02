import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/(auth)/pending-approval')({
  component: PendingApproval,
})

function PendingApproval() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await auth.login()
      const user = useAuthStore.getState().auth.user
      if (user?.profile?.is_approved) {
        const role = user.profile.role
        const path =
          role === 'BUILDER'
            ? '/builder'
            : role === 'CONTRACTOR'
              ? '/contractor'
              : role === 'SUPPLIER'
                ? '/supplier'
                : role === 'ADMIN'
                  ? '/admin'
                  : '/'
        navigate({ to: path, replace: true })
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    auth.reset()
    navigate({ to: '/sign-in', replace: true })
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader className='pb-4'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
            <Clock className='h-8 w-8 text-amber-600 dark:text-amber-400' />
          </div>
          <CardTitle className='text-2xl'>Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Your account has been created successfully. An administrator needs to
            review and approve your account before you can access the platform.
          </p>
          <p className='text-sm text-muted-foreground'>
            This typically takes less than 24 hours. You'll be able to access your
            dashboard once approved.
          </p>
          <div className='flex flex-col gap-2 pt-2'>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Check Approval Status
            </Button>
            <Button variant='outline' onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

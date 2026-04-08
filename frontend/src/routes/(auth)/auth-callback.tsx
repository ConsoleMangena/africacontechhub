import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loading } from '@/components/ui/loading'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)/auth-callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const { auth } = useAuthStore()

  useEffect(() => {
    // After Supabase redirects back, the session is stored and will be picked up here.
    // We then sync the Django profile via /api/v1/auth/me/ and let role-based routing take over.
    auth.login().finally(() => {
      const user = useAuthStore.getState().auth.user
      const role = user?.profile?.role
      const isApproved = user?.profile?.is_approved

      if (isApproved === false && role !== 'ADMIN') {
        window.location.href = '/pending-approval'
        return
      }

      switch (role) {
        case 'BUILDER':
          window.location.href = '/builder'
          return
        case 'CONTRACTOR':
          window.location.href = '/contractor'
          return
        case 'SUPPLIER':
          window.location.href = '/supplier'
          return
        case 'ADMIN':
          window.location.href = '/admin'
          return
        default:
          window.location.href = '/'
      }
    })
  }, [auth])

  return <Loading fullPage text="Signing you in..." />
}


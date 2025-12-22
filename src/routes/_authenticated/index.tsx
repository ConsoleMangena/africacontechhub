import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardRedirect,
})

function DashboardRedirect() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role

  if (role === 'CONTRACTOR') {
    return <Navigate to="/contractor" />
  } else if (role === 'SUPPLIER') {
    return <Navigate to="/supplier" />
  } else if (role === 'ADMIN') {
    return <Navigate to="/builder" /> // Or admin dashboard
  } else {
    // Default to builder for BUILDER role or fallback
    return <Navigate to="/builder" />
  }
}

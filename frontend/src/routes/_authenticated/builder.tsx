import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  tab: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/builder')({
  component: BuilderRoute,
  validateSearch: searchSchema,
})

function BuilderRoute() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role

  if (role !== 'BUILDER' && role !== 'ADMIN') {
    return <Navigate to="/" />
  }

  return <Outlet />
}

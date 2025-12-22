import { createFileRoute } from '@tanstack/react-router'
import SupplierDashboard from '@/features/dashboards/supplier'

import { z } from 'zod'

const searchSchema = z.object({
  tab: z.string().optional(),
})

import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/supplier')({
  component: SupplierRoute,
  validateSearch: searchSchema,
})

function SupplierRoute() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role

  if (role !== 'SUPPLIER' && role !== 'ADMIN') {
    return <Navigate to="/" />
  }

  return <SupplierDashboard />
}

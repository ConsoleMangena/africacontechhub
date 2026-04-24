import { createFileRoute } from '@tanstack/react-router'
import ContractorDashboard from '@/features/dashboards/contractor'

import { z } from 'zod'

const searchSchema = z.object({
  tab: z.string().optional(),
})

import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/contractor')({
  component: ContractorRoute,
  validateSearch: searchSchema,
})

function ContractorRoute() {
  const user = useAuthStore((state) => state.auth.user)
  const role = user?.profile?.role

  if (role !== 'CONTRACTOR' && role !== 'ADMIN') {
    return <Navigate to="/" />
  }

  return <ContractorDashboard />
}

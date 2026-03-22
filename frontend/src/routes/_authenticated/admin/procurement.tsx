import { createFileRoute } from '@tanstack/react-router'
import { AdminProcurement } from '@/features/dashboards/admin/procurement'

export const Route = createFileRoute('/_authenticated/admin/procurement')({
  component: AdminProcurement,
})

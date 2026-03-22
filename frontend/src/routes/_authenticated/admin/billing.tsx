import { createFileRoute } from '@tanstack/react-router'
import { AdminBilling } from '@/features/dashboards/admin/billing'

export const Route = createFileRoute('/_authenticated/admin/billing')({
  component: AdminBilling,
})

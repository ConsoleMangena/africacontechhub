import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from '@/features/dashboards/admin'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminDashboard,
})

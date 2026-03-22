import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardAnalytics } from '@/features/dashboards/admin/dashboard-analytics'

export const Route = createFileRoute('/_authenticated/admin/dashboard-analytics')({
  component: AdminDashboardAnalytics,
})

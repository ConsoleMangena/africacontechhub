import { createFileRoute } from '@tanstack/react-router'
import { AdminActivityLog } from '@/features/dashboards/admin/activity-log'

export const Route = createFileRoute('/_authenticated/admin/activity-log')({
  component: AdminActivityLog,
})

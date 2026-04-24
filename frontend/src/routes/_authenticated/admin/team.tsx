import { createFileRoute } from '@tanstack/react-router'
import { AdminTeam } from '@/features/dashboards/admin/team'

export const Route = createFileRoute('/_authenticated/admin/team')({
  component: AdminTeam,
})

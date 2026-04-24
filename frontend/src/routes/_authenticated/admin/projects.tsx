import { createFileRoute } from '@tanstack/react-router'
import { AdminProjects } from '@/features/dashboards/admin/projects'

export const Route = createFileRoute('/_authenticated/admin/projects')({
  component: AdminProjects,
})

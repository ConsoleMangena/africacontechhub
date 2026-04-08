import { createFileRoute } from '@tanstack/react-router'
import { AdminProjectDetails } from '@/features/dashboards/admin/project-details'

export const Route = createFileRoute('/_authenticated/admin/projects/$projectId')({
  component: AdminProjectDetails,
})


import { createFileRoute } from '@tanstack/react-router'
import BuilderDashboard from '@/features/dashboards/builder'

export const Route = createFileRoute('/_authenticated/builder/')({
  component: BuilderDashboardRoute,
})

function BuilderDashboardRoute() {
  return <BuilderDashboard />
}

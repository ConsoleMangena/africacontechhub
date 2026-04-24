import { createFileRoute } from '@tanstack/react-router'
import { AdminFloorPlans } from '@/features/dashboards/admin/components/floor-plans'

export const Route = createFileRoute('/_authenticated/admin/floor-plans')({
  component: AdminFloorPlans,
})

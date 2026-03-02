import { createFileRoute } from '@tanstack/react-router'

import { BuilderFloorPlans } from '@/features/dashboards/builder/components/floor-plans'

export const Route = createFileRoute('/_authenticated/builder/floor-plans')({
  component: BuilderFloorPlans,
})


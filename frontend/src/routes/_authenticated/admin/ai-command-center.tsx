import { createFileRoute } from '@tanstack/react-router'
import { AICommandCenter } from '@/features/dashboards/admin/ai-command-center'

export const Route = createFileRoute('/_authenticated/admin/ai-command-center')({
  component: AICommandCenter,
})

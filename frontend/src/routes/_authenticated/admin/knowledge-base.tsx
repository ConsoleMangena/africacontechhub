import { createFileRoute } from '@tanstack/react-router'
import { AdminKnowledgeBase } from '@/features/dashboards/admin/knowledge-base'

export const Route = createFileRoute('/_authenticated/admin/knowledge-base')({
  component: AdminKnowledgeBase,
})

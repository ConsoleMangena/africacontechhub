import { createFileRoute } from '@tanstack/react-router'
import { AdminAuditLog } from '@/features/dashboards/admin/audit-log'
import { z } from 'zod'

const searchSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
})

export const Route = createFileRoute('/_authenticated/admin/audit-log')({
  component: AdminAuditLog,
  validateSearch: searchSchema,
})


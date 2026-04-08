import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AdminFinance } from '@/features/dashboards/admin/finance'

const searchSchema = z.object({
  tab: z.enum(['balance', 'pl', 'cashflow', 'invoices', 'coa', 'journal']).optional(),
  accountId: z.coerce.number().int().positive().optional(),
})

export const Route = createFileRoute('/_authenticated/admin/finance')({
  component: AdminFinance,
  validateSearch: searchSchema,
})


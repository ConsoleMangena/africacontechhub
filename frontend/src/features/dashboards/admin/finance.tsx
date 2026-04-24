import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { Route as FinanceRoute } from '@/routes/_authenticated/admin/finance'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

function formatMoney(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function addDaysIsoDate(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function AdminFinance() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { tab } = FinanceRoute.useSearch() as { tab?: 'balance' | 'pl' | 'cashflow' | 'invoices' }
  const activeTab = tab ?? 'pl'
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [userPickerOpen, setUserPickerOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<any | null>(null)
  const [invoiceForm, setInvoiceForm] = useState({
    user_email: '',
    customer_name: '',
    company_name: '',
    subtotal: '',
    tax: '',
    status: 'OPEN',
    due_date: addDaysIsoDate(10),
  })

  useEffect(() => {
    if (!isCreateOpen) return
    setInvoiceForm((prev) => {
      if (prev.due_date) return prev
      return { ...prev, due_date: addDaysIsoDate(10) }
    })
  }, [isCreateOpen])

  const billingQuery = useQuery({
    queryKey: ['admin-billing'],
    queryFn: async () => (await adminApi.getBilling()).data,
    staleTime: 30_000,
  })

  const procurementQuery = useQuery({
    queryKey: ['admin-procurement-summary'],
    queryFn: async () => (await adminApi.getProcurementRequests()).data,
    staleTime: 30_000,
  })

  const usersQuery = useQuery({
    queryKey: ['admin-users', 'invoice-user-picker'],
    queryFn: async () => (await adminApi.getUsers()).data,
    enabled: isCreateOpen,
    staleTime: 30_000,
  })

  const billing = billingQuery.data ?? {}
  const invoices: any[] = billing.invoices ?? []
  const invoiceRevenue = invoices
    .filter((i) => String(i.status || '').toUpperCase() === 'PAID')
    .reduce((s, i) => s + Number(i.amount || 0), 0)

  const procurement = procurementQuery.data ?? {}
  const procurementTotal = Number(procurement.summary?.total_cost ?? 0)

  const grossResult = invoiceRevenue - procurementTotal

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const subtotal = Number(invoiceForm.subtotal)
      const tax = invoiceForm.tax ? Number(invoiceForm.tax) : undefined
      if (!invoiceForm.user_email.trim()) throw new Error('User email is required')
      if (!Number.isFinite(subtotal)) throw new Error('Subtotal must be a number')
      await adminApi.createInvoice({
        user_email: invoiceForm.user_email.trim(),
        customer_name: invoiceForm.customer_name.trim() || undefined,
        company_name: invoiceForm.company_name.trim() || undefined,
        subtotal,
        tax,
        status: invoiceForm.status,
        due_date: invoiceForm.due_date ? invoiceForm.due_date : undefined,
      })
    },
    onSuccess: () => {
      toast.success('Invoice created')
      setIsCreateOpen(false)
      setInvoiceForm({
        user_email: '',
        customer_name: '',
        company_name: '',
        subtotal: '',
        tax: '',
        status: 'OPEN',
        due_date: addDaysIsoDate(10),
      })
      qc.invalidateQueries({ queryKey: ['admin-billing'] })
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.error || e?.message || 'Failed to create invoice'
      toast.error(msg)
    }
  })

  if (billingQuery.isLoading || procurementQuery.isLoading) {
    return <Loading fullPage text="Loading finance..." />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon name="account_balance" className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Finance Management</h1>
          <p className="text-sm text-muted-foreground">Balance sheet, P&L, cash flow, and invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paid invoices</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatMoney(invoiceRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">From billing invoices</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Procurement total</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatMoney(procurementTotal)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">From procurement requests</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Net result</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatMoney(grossResult)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Revenue − procurement</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data coverage</p>
          <p className="mt-1 text-sm font-extrabold tracking-tight text-slate-900 truncate">Partial</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">More ledgers coming</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          navigate({ to: '/admin/finance', search: { tab: v as any } })
        }}
        className="w-full"
      >
        <TabsList className="w-full justify-start bg-muted/30 border border-border/50 rounded-xl p-1">
          <TabsTrigger value="balance" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="pl" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Profit &amp; Loss
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="coa" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="journal" className="text-[11px] font-bold uppercase tracking-widest gap-2">
            Journal Entries
          </TabsTrigger>
        </TabsList>
        <TabsContent value="balance" className="mt-4 focus-visible:outline-none">
          <BalanceSheetCard />
        </TabsContent>

        <TabsContent value="pl" className="mt-4 focus-visible:outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon name="trending_up" className="h-3.5 w-3.5 text-slate-400" />
                </div>
                Profit &amp; Loss (Current)
              </CardTitle>
              <CardDescription className="text-xs">
                Based on paid invoices vs procurement totals (partial P&amp;L).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue (paid invoices)</span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(invoiceRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expenses (procurement total)</span>
                <span className="text-sm font-bold tabular-nums">{formatMoney(procurementTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-sm font-extrabold">Net result</span>
                <span className="text-sm font-extrabold tabular-nums">{formatMoney(grossResult)}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Note: This is a **partial** P&amp;L until we track payroll, subscriptions, refunds, and other operating costs.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4 focus-visible:outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon name="water" className="h-3.5 w-3.5 text-slate-400" />
                </div>
                Cash Flow (Coming soon)
              </CardTitle>
              <CardDescription className="text-xs">
                Needs cash movements (collections, payouts, escrow releases).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We’ll generate a cash flow statement once the system records cash-in/cash-out events and escrow releases.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4 focus-visible:outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                    <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Icon name="receipt_long" className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    Invoices
                  </CardTitle>
                  <CardDescription className="text-xs">{invoices.length} invoice(s) loaded from billing.</CardDescription>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]">
                      <Icon name="add_circle" className="h-4 w-4" />
                      Create Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Invoice</DialogTitle>
                      <DialogDescription>Create an invoice for a user by email.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-2">
                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">User Email</label>
                        <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="w-full justify-between font-normal">
                              <span className="truncate">
                                {invoiceForm.user_email ? invoiceForm.user_email : 'Select a user email...'}
                              </span>
                              <Icon name="unfold_more" className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                            <Command>
                              <CommandInput placeholder="Search users..." />
                              <CommandList>
                                <CommandEmpty>{usersQuery.isLoading ? 'Loading users...' : 'No users found.'}</CommandEmpty>
                                {(usersQuery.data ?? []).map((u: any) => {
                                  const email = String(u?.email ?? '').trim()
                                  const name = String(u?.name ?? `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim()).trim()
                                  if (!email) return null
                                  const selected = invoiceForm.user_email === email
                                  return (
                                    <CommandItem
                                      key={email}
                                      value={`${email} ${name}`}
                                      onSelect={() => {
                                        setInvoiceForm((prev) => ({
                                          ...prev,
                                          user_email: email,
                                          customer_name: name || prev.customer_name,
                                        }))
                                        setUserPickerOpen(false)
                                      }}
                                    >
                                      <div className="flex items-center justify-between w-full gap-3">
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium truncate">{email}</div>
                                          {name ? <div className="text-[11px] text-muted-foreground truncate">{name}</div> : null}
                                        </div>
                                        {selected ? <Icon name="check" className="h-4 w-4 text-slate-900" /> : null}
                                      </div>
                                    </CommandItem>
                                  )
                                })}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                        <Input
                          value={invoiceForm.customer_name}
                          disabled
                          placeholder="John Doe"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Auto-filled from the selected user.
                        </p>
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Company Name (Optional)</label>
                        <Input
                          value={invoiceForm.company_name}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, company_name: e.target.value })}
                          placeholder="Acme Ltd"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Subtotal</label>
                          <Input
                            type="number"
                            value={invoiceForm.subtotal}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Tax (optional)</label>
                          <Input
                            type="number"
                            value={invoiceForm.tax}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Status</label>
                          <Select value={invoiceForm.status} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, status: v })}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="PAID">Paid</SelectItem>
                              <SelectItem value="VOID">Void</SelectItem>
                              <SelectItem value="UNCOLLECTIBLE">Uncollectible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Due Date (optional)</label>
                          <Input
                            type="date"
                            value={invoiceForm.due_date}
                            max={addDaysIsoDate(10)}
                            onChange={(e) => {
                              const v = e.target.value
                              const max = addDaysIsoDate(10)
                              if (v && v > max) {
                                setInvoiceForm({ ...invoiceForm, due_date: max })
                                toast.error('Due date cannot be after 10 days from creation.')
                                return
                              }
                              setInvoiceForm({ ...invoiceForm, due_date: v })
                            }}
                          />
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Defaults to 10 days from creation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="bg-slate-900 hover:bg-slate-800"
                        disabled={createInvoiceMutation.isPending}
                        onClick={() => createInvoiceMutation.mutate()}
                      >
                        {createInvoiceMutation.isPending ? (
                          <Icon name="progress_activity" className="h-4 w-4 animate-spin" />
                        ) : null}
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Created</TableHead>
                      <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          <Icon name="receipt" className="h-6 w-6 mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-medium">No invoices found.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.slice(0, 50).map((inv: any) => {
                        const expired = !!inv.is_expired && String(inv.status || '').toUpperCase() !== 'PAID'
                        const displayStatus = expired ? 'EXPIRED' : inv.status
                        return (
                        <TableRow key={inv.id} className="hover:bg-muted/20">
                          <TableCell className="px-4 py-3 text-sm font-medium">{inv.id}</TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge variant="outline" className={`text-[10px] font-bold ${expired ? 'border-red-300 text-red-700 bg-red-50' : ''}`}>
                              {displayStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="text-sm font-semibold truncate max-w-[220px]">
                              {inv.customer_name || '—'}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                              {inv.user_email || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-bold tabular-nums">{formatMoney(Number(inv.amount || 0))}</TableCell>
                          <TableCell className="px-4 py-3 text-[11px] text-muted-foreground tabular-nums">{inv.created_at ? String(inv.created_at).slice(0, 19).replace('T', ' ') : '—'}</TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => setViewInvoice(inv)}
                              aria-label="View invoice"
                            >
                              <Icon name="visibility" className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )})
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-3 text-[11px] text-muted-foreground">
                Showing up to 50 invoices.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coa" className="mt-4 focus-visible:outline-none">
          <ChartOfAccountsCard />
        </TabsContent>

        <TabsContent value="journal" className="mt-4 focus-visible:outline-none">
          <JournalEntriesCard />
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewInvoice} onOpenChange={(open) => (open ? null : setViewInvoice(null))}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Details for the selected invoice.</DialogDescription>
          </DialogHeader>

          {viewInvoice ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice #</p>
                  <p className="mt-1 text-sm font-extrabold">{viewInvoice.invoice_number || `#${viewInvoice.id}`}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                  <p className="mt-1 text-sm font-extrabold">{String(viewInvoice.is_expired) === 'true' && String(viewInvoice.status || '').toUpperCase() !== 'PAID' ? 'EXPIRED' : viewInvoice.status}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</p>
                <p className="mt-1 text-sm font-semibold">{viewInvoice.customer_name || '—'}</p>
                <p className="text-xs text-muted-foreground">{viewInvoice.user_email || '—'}</p>
                {viewInvoice.company_name ? <p className="mt-1 text-xs font-medium">{viewInvoice.company_name}</p> : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtotal</p>
                  <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(viewInvoice.subtotal || 0))}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tax</p>
                  <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(viewInvoice.tax || 0))}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                  <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(viewInvoice.amount || 0))}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice date</p>
                  <p className="mt-1 text-sm font-semibold">
                    {viewInvoice.invoice_date ? String(viewInvoice.invoice_date).slice(0, 19).replace('T', ' ') : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due date</p>
                  <p className="mt-1 text-sm font-semibold">
                    {viewInvoice.due_date ? String(viewInvoice.due_date).slice(0, 19).replace('T', ' ') : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewInvoice(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BalanceSheetCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-finance-reports'],
    queryFn: async () => (await adminApi.getFinanceReports()).data,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="py-10">
          <Loading fullPage={false} text="Loading balance sheet..." />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Icon name="balance" className="h-3.5 w-3.5 text-slate-400" />
            </div>
            Balance Sheet
          </CardTitle>
          <CardDescription className="text-xs">Could not load reports.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const bs = data?.balance_sheet ?? {}
  const totals = bs.totals ?? {}

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
          <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Icon name="balance" className="h-3.5 w-3.5 text-slate-400" />
          </div>
          Balance Sheet
        </CardTitle>
        <CardDescription className="text-xs">Derived from posted journal entries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assets</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{formatMoney(Number(totals.assets || 0))}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Liabilities</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{formatMoney(Number(totals.liabilities || 0))}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Equity</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{formatMoney(Number(totals.equity || 0))}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Assets</div>
            <div className="divide-y divide-border/40">
              {(bs.assets ?? []).length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground">No posted asset balances yet.</div>
              ) : (
                (bs.assets ?? []).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium">{a.code} {a.name}</span>
                    <span className="text-xs font-bold tabular-nums">{formatMoney(Number(a.balance || 0))}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Liabilities</div>
            <div className="divide-y divide-border/40">
              {(bs.liabilities ?? []).length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground">No posted liabilities yet.</div>
              ) : (
                (bs.liabilities ?? []).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium">{a.code} {a.name}</span>
                    <span className="text-xs font-bold tabular-nums">{formatMoney(Number(a.balance || 0))}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartOfAccountsCard() {
  const navigate = useNavigate()
  const { accountId } = FinanceRoute.useSearch() as { accountId?: number }
  const [q, setQ] = useState('')
  const [type, setType] = useState<'ALL' | 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'>('ALL')
  const qc = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', account_type: 'ASSET', description: '' })

  const coaQuery = useQuery({
    queryKey: ['admin-finance-coa', q, type],
    queryFn: async () => (await adminApi.getChartOfAccounts({ q: q || undefined, type: type === 'ALL' ? undefined : type })).data,
    staleTime: 15_000,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      await adminApi.createAccount(form)
    },
    onSuccess: () => {
      toast.success('Account created')
      setIsOpen(false)
      setForm({ code: '', name: '', account_type: 'ASSET', description: '' })
      qc.invalidateQueries({ queryKey: ['admin-finance-coa'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || e?.message || 'Failed to create account'),
  })

  const accounts = coaQuery.data ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <Card className="border-border/60 shadow-sm lg:col-span-3">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="account_tree" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              Chart of Accounts
            </CardTitle>
            <CardDescription className="text-xs">{accounts.length} account(s)</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]">
                <Icon name="add_circle" className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Account</DialogTitle>
                <DialogDescription>Create a new chart of account entry.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Code</label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1000" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                    <Select value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASSET">Asset</SelectItem>
                        <SelectItem value="LIABILITY">Liability</SelectItem>
                        <SelectItem value="EQUITY">Equity</SelectItem>
                        <SelectItem value="REVENUE">Revenue</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cash" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-slate-900 hover:bg-slate-800" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
                  {createMutation.isPending ? <Icon name="progress_activity" className="h-4 w-4 animate-spin" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="relative flex-1 min-w-[220px]">
            <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by code or name..." className="pl-9 h-9" />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="ASSET">Assets</SelectItem>
              <SelectItem value="LIABILITY">Liabilities</SelectItem>
              <SelectItem value="EQUITY">Equity</SelectItem>
              <SelectItem value="REVENUE">Revenue</SelectItem>
              <SelectItem value="EXPENSE">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Code</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[90px]">
                  <div className="flex justify-end">Actions</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaQuery.isLoading ? (
                <TableRow><TableCell colSpan={4} className="px-4 py-10"><Loading fullPage={false} text="Loading accounts..." /></TableCell></TableRow>
              ) : accounts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No accounts yet.</TableCell></TableRow>
              ) : (
                accounts.map((a: any) => (
                  <TableRow key={a.id} className="hover:bg-muted/20">
                    <TableCell className="px-4 py-3 text-sm font-bold tabular-nums">{a.code}</TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium">
                      <button
                        className="text-left hover:underline"
                        onClick={() => navigate({ to: '/admin/finance', search: (prev) => ({ ...prev, tab: 'coa', accountId: a.id }) })}
                      >
                        {a.name}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3"><Badge variant="outline" className="text-[10px] font-bold">{a.account_type}</Badge></TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View account usage"
                        onClick={() => navigate({ to: '/admin/finance', search: (prev) => ({ ...prev, tab: 'coa', accountId: a.id }) })}
                      >
                        <Icon name="visibility" className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AccountUsageCard accountId={accountId} />
    </div>
  )
}

function AccountUsageCard({ accountId }: { accountId?: number }) {
  const navigate = useNavigate()
  const ledgerQuery = useQuery({
    queryKey: ['admin-finance-ledger', accountId],
    queryFn: async () => (await adminApi.getAccountLedger(accountId as number, { limit: 200 })).data,
    enabled: !!accountId,
    staleTime: 15_000,
  })

  if (!accountId) {
    return (
      <Card className="border-border/60 shadow-sm lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Icon name="analytics" className="h-3.5 w-3.5 text-slate-400" />
            </div>
            Account Usage
          </CardTitle>
          <CardDescription className="text-xs">Select an account to see balances and how money is used.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          <Icon name="touch_app" className="h-7 w-7 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium">Click the eye icon.</p>
        </CardContent>
      </Card>
    )
  }

  if (ledgerQuery.isLoading) {
    return (
      <Card className="border-border/60 shadow-sm lg:col-span-2">
        <CardContent className="py-10">
          <Loading fullPage={false} text="Loading ledger..." />
        </CardContent>
      </Card>
    )
  }

  const ledger = ledgerQuery.data ?? {}
  const acct = ledger.account ?? {}
  const totals = ledger.totals ?? { debit: 0, credit: 0, balance: 0 }
  const lines = ledger.lines ?? []

  return (
    <Card className="border-border/60 shadow-sm lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="analytics" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              {acct.code} — {acct.name}
            </CardTitle>
            <CardDescription className="text-xs">From posted journal entries.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] font-bold"
            onClick={() => navigate({ to: '/admin/finance', search: (prev) => ({ ...prev, tab: 'coa', accountId: undefined }) })}
          >
            <Icon name="close" className="h-4 w-4 mr-1.5" />
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Debit</p>
            <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(totals.debit || 0))}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credit</p>
            <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(totals.credit || 0))}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Balance</p>
            <p className="mt-1 text-sm font-extrabold tabular-nums">{formatMoney(Number(totals.balance || 0))}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="px-3 py-2 bg-muted/30 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Recent activity
          </div>
          <div className="divide-y divide-border/40 max-h-[420px] overflow-auto">
            {lines.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted-foreground">No posted lines yet.</div>
            ) : (
              lines.slice(0, 50).map((l: any) => (
                <div key={l.id} className="px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate">
                      {l.memo || l.reference || `JE#${l.entry_id}`}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      {String(l.entry_date).slice(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {l.description || '—'}
                    </span>
                    <span className="text-[11px] font-bold tabular-nums">
                      {Number(l.debit || 0) > 0 ? `+${formatMoney(Number(l.debit))}` : `-${formatMoney(Number(l.credit || 0))}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border/40">
            Showing up to 50 lines.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JournalEntriesCard() {
  const qc = useQueryClient()
  const [status, setStatus] = useState<'ALL' | 'DRAFT' | 'POSTED' | 'VOID'>('ALL')
  const [isOpen, setIsOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<Array<{ account_id: string; debit: string; credit: string; description: string }>>([
    { account_id: '', debit: '', credit: '', description: '' },
    { account_id: '', debit: '', credit: '', description: '' },
  ])

  const coaQuery = useQuery({
    queryKey: ['admin-finance-coa-all'],
    queryFn: async () => (await adminApi.getChartOfAccounts()).data,
    staleTime: 30_000,
  })

  const jeQuery = useQuery({
    queryKey: ['admin-finance-je', status],
    queryFn: async () => (await adminApi.getJournalEntries({ status: status === 'ALL' ? undefined : status, limit: 200 })).data,
    staleTime: 15_000,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const payloadLines = lines
        .filter((l) => l.account_id && (Number(l.debit) > 0 || Number(l.credit) > 0))
        .map((l) => ({
          account_id: Number(l.account_id),
          debit: l.debit ? Number(l.debit) : 0,
          credit: l.credit ? Number(l.credit) : 0,
          description: l.description,
        }))
      await adminApi.createJournalEntry({ memo, reference, lines: payloadLines })
    },
    onSuccess: () => {
      toast.success('Journal entry created')
      setIsOpen(false)
      setMemo('')
      setReference('')
      setLines([{ account_id: '', debit: '', credit: '', description: '' }, { account_id: '', debit: '', credit: '', description: '' }])
      qc.invalidateQueries({ queryKey: ['admin-finance-je'] })
      qc.invalidateQueries({ queryKey: ['admin-finance-reports'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || e?.message || 'Failed to create journal entry'),
  })

  const postMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApi.postJournalEntry(id)
    },
    onSuccess: () => {
      toast.success('Entry posted')
      qc.invalidateQueries({ queryKey: ['admin-finance-je'] })
      qc.invalidateQueries({ queryKey: ['admin-finance-reports'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || e?.message || 'Failed to post entry'),
  })

  const entries = jeQuery.data ?? []
  const accounts = coaQuery.data ?? []

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon name="library_books" className="h-3.5 w-3.5 text-slate-400" />
              </div>
              Journal Entries
            </CardTitle>
            <CardDescription className="text-xs">{entries.length} entry(s)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]">
                  <Icon name="add_circle" className="h-4 w-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Journal Entry</DialogTitle>
                  <DialogDescription>Debits must equal credits.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Reference (optional)</label>
                      <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Memo (optional)</label>
                      <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <div className="col-span-5">Account</div>
                      <div className="col-span-2 text-right">Debit</div>
                      <div className="col-span-2 text-right">Credit</div>
                      <div className="col-span-3">Description</div>
                    </div>
                    <div className="divide-y divide-border/40">
                      {lines.map((l, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2">
                          <div className="col-span-5">
                            <Select value={l.account_id} onValueChange={(v) => {
                              const next = [...lines]
                              next[idx] = { ...next[idx], account_id: v }
                              setLines(next)
                            }}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((a: any) => (
                                  <SelectItem key={a.id} value={String(a.id)}>{a.code} — {a.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input className="h-8 text-right" type="number" value={l.debit} onChange={(e) => {
                              const next = [...lines]
                              next[idx] = { ...next[idx], debit: e.target.value }
                              setLines(next)
                            }} />
                          </div>
                          <div className="col-span-2">
                            <Input className="h-8 text-right" type="number" value={l.credit} onChange={(e) => {
                              const next = [...lines]
                              next[idx] = { ...next[idx], credit: e.target.value }
                              setLines(next)
                            }} />
                          </div>
                          <div className="col-span-3">
                            <Input className="h-8" value={l.description} onChange={(e) => {
                              const next = [...lines]
                              next[idx] = { ...next[idx], description: e.target.value }
                              setLines(next)
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-fit text-[11px] font-bold"
                    onClick={() => setLines([...lines, { account_id: '', debit: '', credit: '', description: '' }])}
                  >
                    <Icon name="add" className="h-4 w-4" />
                    Add line
                  </Button>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button className="bg-slate-900 hover:bg-slate-800" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
                    {createMutation.isPending ? <Icon name="progress_activity" className="h-4 w-4 animate-spin" /> : null}
                    Create draft
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Debit</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Credit</TableHead>
                <TableHead className="h-11 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jeQuery.isLoading ? (
                <TableRow><TableCell colSpan={6} className="px-4 py-10"><Loading fullPage={false} text="Loading entries..." /></TableCell></TableRow>
              ) : entries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No journal entries yet.</TableCell></TableRow>
              ) : (
                entries.map((e: any) => (
                  <TableRow key={e.id} className="hover:bg-muted/20">
                    <TableCell className="px-4 py-3 text-sm font-bold">JE#{e.id}</TableCell>
                    <TableCell className="px-4 py-3 text-[11px] text-muted-foreground tabular-nums">{String(e.entry_date).slice(0, 10)}</TableCell>
                    <TableCell className="px-4 py-3"><Badge variant="outline" className="text-[10px] font-bold">{e.status}</Badge></TableCell>
                    <TableCell className="px-4 py-3 text-right tabular-nums font-semibold">{formatMoney(Number(e.debit_total || 0))}</TableCell>
                    <TableCell className="px-4 py-3 text-right tabular-nums font-semibold">{formatMoney(Number(e.credit_total || 0))}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {e.status === 'DRAFT' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-[11px] font-bold"
                          disabled={postMutation.isPending}
                          onClick={() => postMutation.mutate(e.id)}
                        >
                          Post
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}



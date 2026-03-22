import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { toast } from 'sonner'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

/* ─────────────────── Types ─────────────────── */

interface BOQTemplate {
  id: number
  name: string
  is_active: boolean
  category_order: string
  extraction_rules: string
  example_items_json: string
  example_items: any[]
  include_labour_rate: boolean
  include_measurement_formula: boolean
  header_text: string
  footer_text: string
  updated_at: string | null
  created_at: string | null
}

interface MaterialPriceItem {
  id: number
  material: string
  unit: string
  price: string
  currency: string
  region: string
  supplier_name: string
  notes: string
  updated_at: string | null
}

/* ─────────────────── Main Export ─────────────────── */

export function AICommandCenter() {
  const { data: templates = [], isLoading: templatesLoading } = useQuery<BOQTemplate[]>({
    queryKey: ['boq-templates'],
    queryFn: async () => (await adminApi.getBOQTemplates()).data,
  })

  const { data: prices = [], isLoading: pricesLoading } = useQuery<MaterialPriceItem[]>({
    queryKey: ['material-prices'],
    queryFn: async () => (await adminApi.getMaterialPrices()).data,
  })

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Icon name="psychology" className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Manage BOQ templates and material pricing data that power the AI assistant.
          </p>
        </div>
      </div>

      {/* BOQ Templates Section */}
      <BOQTemplatesSection templates={templates} loading={templatesLoading} />

      {/* Material Prices Section */}
      <MaterialPricesSection prices={prices} loading={pricesLoading} />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   BOQ TEMPLATES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function BOQTemplatesSection({ templates, loading }: { templates: BOQTemplate[]; loading: boolean }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<BOQTemplate | null>(null)
  const [creating, setCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  /* Blank form state */
  const blank: Omit<BOQTemplate, 'id' | 'example_items' | 'updated_at' | 'created_at'> = {
    name: 'New BOQ Template',
    is_active: true,
    category_order: "1. Preliminaries\n2. Substructure\n3. Superstructure — Walling\n4. Superstructure — Roofing\n5. Finishes\n6. Windows & Doors\n7. Plumbing & Drainage\n8. Electrical\n9. External Works",
    extraction_rules: '',
    example_items_json: '[]',
    include_labour_rate: false,
    include_measurement_formula: false,
    header_text: '',
    footer_text: '',
  }

  const [form, setForm] = useState(blank)

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await adminApi.updateBOQTemplate(editing.id, form)
      } else {
        await adminApi.createBOQTemplate(form)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boq-templates'] })
      qc.invalidateQueries({ queryKey: ['ai-analytics'] })
      setEditing(null)
      setCreating(false)
      toast.success(editing ? 'Template updated' : 'Template created')
    },
    onError: () => toast.error('Failed to save template'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBOQTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boq-templates'] })
      toast.success('Template deleted')
    },
    onError: () => toast.error('Failed to delete template'),
  })

  const openEdit = (t: BOQTemplate) => {
    setForm({
      name: t.name,
      is_active: t.is_active,
      category_order: t.category_order,
      extraction_rules: t.extraction_rules,
      example_items_json: t.example_items_json,
      include_labour_rate: t.include_labour_rate,
      include_measurement_formula: t.include_measurement_formula,
      header_text: t.header_text,
      footer_text: t.footer_text,
    })
    setEditing(t)
    setCreating(true)
  }

  const openCreate = () => {
    setForm(blank)
    setEditing(null)
    setCreating(true)
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">BOQ Templates</h3>
          <p className="text-sm text-muted-foreground">
            Define how the AI structures extracted BOQ data. The active template is injected into every /analyse call.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] shadow-none">
          <Icon name="add" className="h-4 w-4" /> New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState message="No BOQ templates yet. Create one to guide how the AI formats Bill of Quantities." />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-semibold">{t.name}</CardTitle>
                    {t.is_active ? (
                      <Badge className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest border-none shadow-none">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 border-none shadow-none">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                      {expandedId === t.id ? <Icon name="keyboard_arrow_up" className="h-4 w-4" /> : <Icon name="keyboard_arrow_down" className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={() => openEdit(t)}>
                      <Icon name="edit" className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={() => {
                      if (confirm('Delete this template?')) deleteMutation.mutate(t.id)
                    }}>
                      <Icon name="delete" className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {t.example_items.length} example items · {t.include_labour_rate ? 'Labour ✓' : 'Labour ✗'} · {t.include_measurement_formula ? 'Formula ✓' : 'Formula ✗'}
                  {t.updated_at && ` · Updated ${new Date(t.updated_at).toLocaleDateString()}`}
                </CardDescription>
              </CardHeader>
              {expandedId === t.id && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Category Order</p>
                      <pre className="text-xs bg-muted/30 p-2 rounded-md whitespace-pre-wrap max-h-40 overflow-y-auto">{t.category_order || '—'}</pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Extraction Rules</p>
                      <pre className="text-xs bg-muted/30 p-2 rounded-md whitespace-pre-wrap max-h-40 overflow-y-auto">{t.extraction_rules || '—'}</pre>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Example Items (Few-Shot)</p>
                      <pre className="text-xs bg-muted/30 p-2 rounded-md whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">{t.example_items_json || '[]'}</pre>
                    </div>
                    {(t.header_text || t.footer_text) && (
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        {t.header_text && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Header</p>
                            <pre className="text-xs bg-muted/30 p-2 rounded-md whitespace-pre-wrap">{t.header_text}</pre>
                          </div>
                        )}
                        {t.footer_text && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Footer</p>
                            <pre className="text-xs bg-muted/30 p-2 rounded-md whitespace-pre-wrap">{t.footer_text}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null) } }}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-sm">
              <Icon name="assignment" className="h-5 w-5 text-slate-400" />
              {editing ? 'Modify BOQ Template' : 'Configure BOQ Template'}
            </DialogTitle>
            <DialogDescription>
              Define the format, categories, rules and examples for AI-generated Bills of Quantities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Template Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.include_labour_rate} onChange={(e) => setForm({ ...form, include_labour_rate: e.target.checked })} className="rounded" />
                  Labour Rate
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.include_measurement_formula} onChange={(e) => setForm({ ...form, include_measurement_formula: e.target.checked })} className="rounded" />
                  Formula
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category Order</label>
              <p className="text-[10px] text-muted-foreground">Numbered list — the AI will group items under these headings in this order.</p>
              <Textarea value={form.category_order} onChange={(e) => setForm({ ...form, category_order: e.target.value })} className="mt-1 min-h-[100px] font-mono text-xs" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Extraction Rules</label>
              <p className="text-[10px] text-muted-foreground">Tell the AI what to look for and how to measure each element.</p>
              <Textarea value={form.extraction_rules} onChange={(e) => setForm({ ...form, extraction_rules: e.target.value })} className="mt-1 min-h-[120px] font-mono text-xs" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Example Items (JSON Array)</label>
              <p className="text-[10px] text-muted-foreground">Paste example BOQ rows as JSON. The AI will mimic this naming/detail level.</p>
              <Textarea value={form.example_items_json} onChange={(e) => setForm({ ...form, example_items_json: e.target.value })} className="mt-1 min-h-[120px] font-mono text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Header Text (optional)</label>
                <Textarea value={form.header_text} onChange={(e) => setForm({ ...form, header_text: e.target.value })} className="mt-1 min-h-[60px] text-xs" placeholder="Company name, project title..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Footer Text (optional)</label>
                <Textarea value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} className="mt-1 min-h-[60px] text-xs" placeholder="Validity note, T&Cs..." />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null) }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] gap-1.5 shadow-none">
              {saveMutation.isPending ? <Icon name="progress_activity" className="h-4 w-4 animate-spin" /> : <Icon name="save" className="h-4 w-4" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   MATERIAL PRICES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function MaterialPricesSection({ prices, loading }: { prices: MaterialPriceItem[]; loading: boolean }) {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<MaterialPriceItem | null>(null)
  const [search, setSearch] = useState('')

  const blankPrice = { material: '', unit: '', price: '0', currency: 'USD', region: 'Zimbabwe', supplier_name: '', notes: '' }
  const [form, setForm] = useState(blankPrice)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price: parseFloat(form.price) || 0 }
      if (editing) {
        await adminApi.updateMaterialPrice(editing.id, payload)
      } else {
        await adminApi.createMaterialPrice(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['material-prices'] })
      qc.invalidateQueries({ queryKey: ['ai-analytics'] })
      setCreating(false)
      setEditing(null)
      toast.success(editing ? 'Price updated' : 'Price added')
    },
    onError: () => toast.error('Failed to save price'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMaterialPrice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['material-prices'] })
      toast.success('Price deleted')
    },
  })

  const filtered = prices.filter(p =>
    p.material.toLowerCase().includes(search.toLowerCase()) ||
    p.region.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier_name.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (p: MaterialPriceItem) => {
    setForm({ material: p.material, unit: p.unit, price: p.price, currency: p.currency, region: p.region, supplier_name: p.supplier_name, notes: p.notes })
    setEditing(p)
    setCreating(true)
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Material Price Database</h3>
          <p className="text-sm text-muted-foreground">
            These prices feed the AI's _get_material_prices tool — used when generating BOQs and answering cost queries.
          </p>
        </div>
        <Button onClick={() => { setForm(blankPrice); setEditing(null); setCreating(true) }} className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] shadow-none">
          <Icon name="add" className="h-4 w-4" /> Add Price
        </Button>
      </div>

      <Input placeholder="Search materials, regions, suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {filtered.length === 0 ? (
        <EmptyState message={prices.length === 0 ? "No material prices yet. Add some to power the AI's pricing tool." : "No results matching your search."} />
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2.5 font-medium">Material</th>
                    <th className="text-left px-4 py-2.5 font-medium">Unit</th>
                    <th className="text-right px-4 py-2.5 font-medium">Price</th>
                    <th className="text-center px-4 py-2.5 font-medium">Currency</th>
                    <th className="text-left px-4 py-2.5 font-medium">Region</th>
                    <th className="text-left px-4 py-2.5 font-medium">Supplier</th>
                    <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2 font-medium">{p.material}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.unit}</td>
                      <td className="px-4 py-2 text-right font-mono">{parseFloat(p.price).toLocaleString()}</td>
                      <td className="px-4 py-2 text-center"><Badge variant="secondary" className="text-[10px]">{p.currency}</Badge></td>
                      <td className="px-4 py-2 text-muted-foreground">{p.region}</td>
                      <td className="px-4 py-2 text-muted-foreground truncate max-w-[150px]">{p.supplier_name || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={() => openEdit(p)}>
                            <Icon name="edit" className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900" onClick={() => {
                            if (confirm('Delete this price entry?')) deleteMutation.mutate(p.id)
                          }}>
                            <Icon name="delete" className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null) } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-sm">
              <Icon name="attach_money" className="h-5 w-5 text-slate-400" />
              {editing ? 'Modify Price' : 'Add Price'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Material Name</label>
                <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. Cement" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. 50kg bag" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Price</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="USD">USD</option>
                  <option value="ZWL">ZWL</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Region</label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Supplier Name (optional)</label>
              <Input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 min-h-[60px] text-xs" />
            </div>
          </div>
          <DialogFooter className="mt-3">
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null) }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] gap-1.5 shadow-none">
              {saveMutation.isPending ? <Icon name="progress_activity" className="h-4 w-4 animate-spin" /> : <Icon name="save" className="h-4 w-4" />}
              {editing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <Icon name="progress_activity" size={32} className="animate-spin text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border/60">
      <Icon name="description" className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

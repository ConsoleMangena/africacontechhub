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

interface AIAnalytics {
  messages_per_day: { date: string; count: number }[]
  token_summary: {
    total_input: number
    total_output: number
    total_tokens: number
    request_count: number
    estimated_cost_usd: number
  }
  tokens_7d: { total: number; count: number }
  endpoint_breakdown: { endpoint: string; count: number; tokens: number }[]
  top_users: { user__username: string; user__email: string; total: number; requests: number }[]
  feedback: { avg_rating: number; total_feedback: number }
  sessions: { total: number; active_30d: number }
  boq_templates: { total: number; active_template: any }
  training_data: {
    knowledge_documents: number
    embedded_documents: number
    material_prices: number
    material_regions: string[]
    style_presets: number
    active_presets: number
  }
  analyse_usage: { count_30d: number; tokens_30d: number }
  model_breakdown: { model_name: string; count: number; tokens: number }[]
  messages_by_role: { role: string; count: number }[]
}

/* ─────────────────── Stat Card ─────────────────── */

function MiniStat({ icon, label, value, sub, iconBg, iconColor }: {
  icon: string; label: string; value: string | number; sub?: string
  iconBg: string; iconColor: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
      <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon name={icon} className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold tracking-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

/* ─────────────────── Main Export ─────────────────── */

export function AICommandCenter() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'boq-templates' | 'material-prices' | 'style-presets'>('analytics')

  /* ── Queries ── */
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AIAnalytics>({
    queryKey: ['ai-analytics'],
    queryFn: async () => (await adminApi.getAIAnalytics()).data,
  })

  const { data: templates = [], isLoading: templatesLoading } = useQuery<BOQTemplate[]>({
    queryKey: ['boq-templates'],
    queryFn: async () => (await adminApi.getBOQTemplates()).data,
  })

  const { data: prices = [], isLoading: pricesLoading } = useQuery<MaterialPriceItem[]>({
    queryKey: ['material-prices'],
    queryFn: async () => (await adminApi.getMaterialPrices()).data,
  })

  const { data: presets = [] } = useQuery<any[]>({
    queryKey: ['style-presets'],
    queryFn: async () => (await adminApi.getStylePresets()).data,
  })

  const tabs = [
    { id: 'analytics' as const, label: 'Analytics & Performance', icon: 'bar_chart' },
    { id: 'boq-templates' as const, label: 'BOQ Templates', icon: 'assignment' },
    { id: 'material-prices' as const, label: 'Material Prices', icon: 'attach_money' },
    { id: 'style-presets' as const, label: 'Drawing Presets', icon: 'palette' },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Icon name="psychology" className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">
            Train, tune and monitor your AI — BOQ templates, pricing data, analytics & presets.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
            }`}
          >
            <Icon name={tab.icon} className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <AnalyticsTab analytics={analytics} loading={analyticsLoading} />
      )}
      {activeTab === 'boq-templates' && (
        <BOQTemplatesTab templates={templates} loading={templatesLoading} />
      )}
      {activeTab === 'material-prices' && (
        <MaterialPricesTab prices={prices} loading={pricesLoading} />
      )}
      {activeTab === 'style-presets' && (
        <StylePresetsTab presets={presets} />
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════════════════════════ */

function AnalyticsTab({ analytics, loading }: { analytics?: AIAnalytics; loading: boolean }) {
  if (loading) return <LoadingState />

  if (!analytics) return <EmptyState message="No analytics available yet." />

  const ts = analytics.token_summary
  const td = analytics.training_data

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MiniStat icon="bolt" label="Total Tokens (30d)" value={(ts.total_tokens ?? 0).toLocaleString()} sub={`~$${ts.estimated_cost_usd ?? 0}`} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <MiniStat icon="chat" label="AI Requests (30d)" value={ts.request_count ?? 0} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <MiniStat icon="monitoring" label="Sessions (30d)" value={analytics.sessions.active_30d ?? 0} sub={`${analytics.sessions.total} total`} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <MiniStat icon="assignment" label="BOQ Analyses" value={analytics.analyse_usage.count_30d ?? 0} sub={`${(analytics.analyse_usage.tokens_30d ?? 0).toLocaleString()} tokens`} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <MiniStat icon="database" label="Training Docs" value={td.embedded_documents ?? 0} sub={`${td.knowledge_documents} uploaded`} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <MiniStat icon="attach_money" label="Material Prices" value={td.material_prices ?? 0} sub={`${td.material_regions?.length ?? 0} regions`} iconBg="bg-green-50" iconColor="text-green-600" />
      </div>

      {/* 7-Day Quick Stats */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="trending_up" className="h-4 w-4 text-indigo-500" />
            7-Day Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{(analytics.tokens_7d.total ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Tokens (7d)</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{analytics.tokens_7d.count ?? 0}</p>
              <p className="text-xs text-muted-foreground">Requests (7d)</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{analytics.feedback.avg_rating?.toFixed(1) ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Avg Rating ({analytics.feedback.total_feedback} reviews)</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{td.active_presets ?? 0}/{td.style_presets ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active Presets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Breakdown */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="bar_chart" className="h-4 w-4 text-blue-500" />
              Endpoint Breakdown
            </CardTitle>
            <CardDescription className="text-xs">AI requests by command type (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.endpoint_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {analytics.endpoint_breakdown.map((ep) => {
                  const max = Math.max(...analytics.endpoint_breakdown.map(e => e.count))
                  const pct = max > 0 ? (ep.count / max) * 100 : 0
                  return (
                    <div key={ep.endpoint} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium capitalize">{ep.endpoint}</span>
                        <span className="text-muted-foreground">{ep.count} reqs · {(ep.tokens ?? 0).toLocaleString()} tokens</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Breakdown */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="psychology" className="h-4 w-4 text-purple-500" />
              Model Performance
            </CardTitle>
            <CardDescription className="text-xs">Token usage by model (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.model_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.model_breakdown.map((m) => (
                  <div key={m.model_name} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card">
                    <div>
                      <p className="text-sm font-medium">{m.model_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{m.count} requests</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {(m.tokens ?? 0).toLocaleString()} tokens
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="group" className="h-4 w-4 text-emerald-500" />
              Top AI Users
            </CardTitle>
            <CardDescription className="text-xs">Heaviest token consumers (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.top_users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.top_users.slice(0, 8).map((u, i) => (
                  <div key={u.user__email} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                      <span className="text-sm truncate">{u.user__email}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">{u.requests} reqs</span>
                      <Badge variant="outline" className="text-xs">{(u.total ?? 0).toLocaleString()}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active BOQ Template */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="assignment" className="h-4 w-4 text-amber-500" />
              Active BOQ Template
            </CardTitle>
            <CardDescription className="text-xs">Currently guiding /analyse output format</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.boq_templates.active_template ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{analytics.boq_templates.active_template.name}</span>
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">Example Items</p>
                    <p className="font-medium">{analytics.boq_templates.active_template.example_items_count}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">Labour Rate</p>
                    <p className="font-medium">{analytics.boq_templates.active_template.include_labour_rate ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">Measurement Formula</p>
                    <p className="font-medium">{analytics.boq_templates.active_template.include_measurement_formula ? '✅ Yes' : '❌ No'}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{analytics.boq_templates.active_template.updated_at ? new Date(analytics.boq_templates.active_template.updated_at).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Icon name="assignment" className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active BOQ template</p>
                <p className="text-xs text-muted-foreground mt-1">Create one in the BOQ Templates tab</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages Per Day Chart (simple bar representation) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="monitoring" className="h-4 w-4 text-indigo-500" />
            AI Messages Per Day (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.messages_per_day.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No messages yet</p>
          ) : (
            <div className="flex items-end gap-[2px] h-32 overflow-hidden">
              {analytics.messages_per_day.map((d) => {
                const max = Math.max(...analytics.messages_per_day.map(x => x.count))
                const h = max > 0 ? (d.count / max) * 100 : 0
                return (
                  <div key={d.date} className="flex-1 group relative">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-sm transition-all hover:from-indigo-600 hover:to-indigo-400"
                      style={{ height: `${Math.max(h, 2)}%` }}
                      title={`${d.date}: ${d.count} messages`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════════
   BOQ TEMPLATES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function BOQTemplatesTab({ templates, loading }: { templates: BOQTemplate[]; loading: boolean }) {
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
        <Button onClick={openCreate} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
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
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                      {expandedId === t.id ? <Icon name="keyboard_arrow_up" className="h-4 w-4" /> : <Icon name="keyboard_arrow_down" className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600" onClick={() => openEdit(t)}>
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => {
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
            <DialogTitle className="flex items-center gap-2">
              <Icon name="assignment" className="h-5 w-5 text-indigo-500" />
              {editing ? 'Edit BOQ Template' : 'Create BOQ Template'}
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
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
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

function MaterialPricesTab({ prices, loading }: { prices: MaterialPriceItem[]; loading: boolean }) {
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
        <Button onClick={() => { setForm(blankPrice); setEditing(null); setCreating(true) }} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600" onClick={() => openEdit(p)}>
                            <Icon name="pencil" className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => {
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
            <DialogTitle className="flex items-center gap-2">
              <Icon name="attach_money" className="h-5 w-5 text-emerald-500" />
              {editing ? 'Edit Material Price' : 'Add Material Price'}
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
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
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
   STYLE PRESETS TAB
   ═══════════════════════════════════════════════════════════════════════ */

function StylePresetsTab({ presets }: { presets: any[] }) {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const blankPreset = {
    name: '', category: 'OTHER', keywords: '', prompt_template: '',
    negative_prompt: 'blurry, low quality, realistic photo, watermark', style_tokens: '',
    guidance_scale: '7.5', is_active: true, priority: '0',
  }
  const [form, setForm] = useState(blankPreset)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, guidance_scale: parseFloat(form.guidance_scale) || 7.5, priority: parseInt(form.priority as string) || 0 }
      if (editing) {
        await adminApi.updateStylePreset(editing.id, payload)
      } else {
        await adminApi.createStylePreset(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['style-presets'] })
      setCreating(false)
      setEditing(null)
      toast.success(editing ? 'Preset updated' : 'Preset created')
    },
    onError: () => toast.error('Failed to save preset'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStylePreset(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['style-presets'] })
      toast.success('Preset deleted')
    },
  })

  const openEdit = (p: any) => {
    setForm({
      name: p.name, category: p.category, keywords: p.keywords, prompt_template: p.prompt_template,
      negative_prompt: p.negative_prompt, style_tokens: p.style_tokens,
      guidance_scale: String(p.guidance_scale), is_active: p.is_active, priority: String(p.priority),
    })
    setEditing(p)
    setCreating(true)
  }

  const categories = [
    { value: 'FLOOR_PLAN', label: 'Floor Plan' },
    { value: 'ELEVATION', label: 'Elevation' },
    { value: 'SITE_PLAN', label: 'Site Plan' },
    { value: 'SECTION', label: 'Section View' },
    { value: '3D_RENDER', label: '3D Render' },
    { value: 'LANDSCAPE', label: 'Landscape Design' },
    { value: 'DETAIL', label: 'Construction Detail' },
    { value: 'OTHER', label: 'Other' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Drawing Style Presets</h3>
          <p className="text-sm text-muted-foreground">
            Keyword-matched templates that guide how Claude crafts Gemini image prompts for /draw commands.
          </p>
        </div>
        <Button onClick={() => { setForm(blankPreset); setEditing(null); setCreating(true) }} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
          <Icon name="add" className="h-4 w-4" /> New Preset
        </Button>
      </div>

      {presets.length === 0 ? (
        <EmptyState message="No drawing style presets. Create some to customize /draw output." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map((p: any) => (
            <Card key={p.id} className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="palette" className="h-4 w-4 text-purple-500" />
                    <CardTitle className="text-sm font-semibold">{p.name}</CardTitle>
                    {p.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                      {expandedId === p.id ? <Icon name="keyboard_arrow_up" className="h-4 w-4" /> : <Icon name="keyboard_arrow_down" className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600" onClick={() => openEdit(p)}>
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => {
                      if (confirm('Delete this preset?')) deleteMutation.mutate(p.id)
                    }}>
                      <Icon name="delete" className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {p.category_display} · Priority {p.priority} · Guidance {p.guidance_scale}
                  {p.avg_rating ? ` · ⭐ ${p.avg_rating.toFixed(1)}` : ''}
                </CardDescription>
              </CardHeader>
              {expandedId === p.id && (
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">Keywords</p>
                    <p className="text-xs bg-muted/30 p-1.5 rounded">{p.keywords || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">Prompt Template</p>
                    <pre className="text-xs bg-muted/30 p-1.5 rounded whitespace-pre-wrap max-h-24 overflow-y-auto">{p.prompt_template || '—'}</pre>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">Negative Prompt</p>
                    <p className="text-xs bg-muted/30 p-1.5 rounded">{p.negative_prompt || '—'}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={creating} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null) } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="palette" className="h-5 w-5 text-purple-500" />
              {editing ? 'Edit Preset' : 'Create Preset'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Keywords (comma-separated)</label>
              <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="mt-1" placeholder="floor plan, floorplan, room layout" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prompt Template</label>
              <Textarea value={form.prompt_template} onChange={(e) => setForm({ ...form, prompt_template: e.target.value })} className="mt-1 min-h-[80px] text-xs font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Negative Prompt</label>
              <Textarea value={form.negative_prompt} onChange={(e) => setForm({ ...form, negative_prompt: e.target.value })} className="mt-1 min-h-[50px] text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Style Tokens</label>
                <Input value={form.style_tokens} onChange={(e) => setForm({ ...form, style_tokens: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Guidance Scale</label>
                <Input type="number" step="0.5" value={form.guidance_scale} onChange={(e) => setForm({ ...form, guidance_scale: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              Active
            </label>
          </div>
          <DialogFooter className="mt-3">
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null) }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-purple-600 hover:bg-purple-700 gap-1.5">
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

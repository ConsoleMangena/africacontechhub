import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/api'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ToggleRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors border-none ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-none ${checked ? 'translate-x-5.5' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}

export function AdminSettings() {
    const qc = useQueryClient()
    const { data, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => (await adminApi.getSettings()).data,
    })

    const [form, setForm] = useState<any>(null)

    useEffect(() => {
        if (data && !form) setForm({ ...data })
    }, [data, form])

    const saveMutation = useMutation({
        mutationFn: async () => {
            await adminApi.updateSettings(form)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-settings'] })
            toast.success('Settings saved successfully')
        },
        onError: () => toast.error('Failed to save settings'),
    })

    if (isLoading || !form) return <Loading fullPage text="Loading settings..." />

    const hasChanges = JSON.stringify(form) !== JSON.stringify(data)

    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                        <Icon name="settings" className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-display tracking-tight">Platform Settings</h1>
                        <p className="text-sm text-muted-foreground">Configure global platform behavior and defaults.</p>
                    </div>
                </div>
                <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending || !hasChanges}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px] shadow-none gap-1.5"
                >
                    {saveMutation.isPending ? (
                        <Icon name="progress_activity" className="h-4 w-4 animate-spin" />
                    ) : (
                        <Icon name="save" className="h-4 w-4" />
                    )}
                    Apply Changes
                </Button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="info" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            Platform Identity
                        </CardTitle>
                        <CardDescription className="text-xs">Basic platform identity and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Site Name</label>
                                <Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Support Email</label>
                                <Input type="email" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Tagline</label>
                            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="mt-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* Registration & Access */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="person_add" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            Onboarding Policy
                        </CardTitle>
                        <CardDescription className="text-xs">Control how users can sign up and access the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ToggleRow
                            label="Open Registration"
                            description="Allow new users to create accounts"
                            checked={form.registration_open}
                            onChange={(v) => setForm({ ...form, registration_open: v })}
                        />
                        <ToggleRow
                            label="Require Admin Approval"
                            description="New accounts must be approved before gaining access"
                            checked={form.require_approval}
                            onChange={(v) => setForm({ ...form, require_approval: v })}
                        />
                        <div className="pt-3">
                            <label className="text-xs font-medium text-muted-foreground">Default Role for New Users</label>
                            <Select value={form.default_role} onValueChange={(v) => setForm({ ...form, default_role: v })}>
                                <SelectTrigger className="w-[200px] mt-1 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUILDER">Builder</SelectItem>
                                    <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Limits */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="tune" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            Resource Governance
                        </CardTitle>
                        <CardDescription className="text-xs">Set resource limits for platform users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Max Projects per User</label>
                                <Input
                                    type="number"
                                    value={form.max_projects_per_user}
                                    onChange={(e) => setForm({ ...form, max_projects_per_user: parseInt(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Max File Upload (MB)</label>
                                <Input
                                    type="number"
                                    value={form.max_file_upload_mb}
                                    onChange={(e) => setForm({ ...form, max_file_upload_mb: parseInt(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Mode */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                            <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon name="engineering" className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            System Maintenance
                        </CardTitle>
                        <CardDescription className="text-xs">Take the platform offline for maintenance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ToggleRow
                            label="Enable Maintenance Mode"
                            description="Users will see a maintenance page instead of the platform"
                            checked={form.maintenance_mode}
                            onChange={(v) => setForm({ ...form, maintenance_mode: v })}
                        />
                        {form.maintenance_mode && (
                            <div className="pt-3">
                                <label className="text-xs font-medium text-muted-foreground">Maintenance Message</label>
                                <Textarea
                                    value={form.maintenance_message}
                                    onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })}
                                    className="mt-1 min-h-[80px] text-sm"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

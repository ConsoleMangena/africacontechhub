import { useState, useEffect } from 'react';
import { builderApi } from '@/services/api';
import type { 
    Project, BudgetSheets, BOQBuildingItem, BOQProfessionalFee, 
    BOQAdminExpense, BOQLabourCost, BOQMachinePlant, 
    BOQLabourBreakdown, BOQScheduleTask, BOQScheduleMaterial
} from '@/types/api';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { AiChatButton } from '@/components/ai-chat-button';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/material-icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProjectModeBadge } from '@/components/project-mode-badge';

type TabKey = 'building_items' | 'professional_fees' | 'admin_expenses' | 'labour_costs' | 'machine_plants' | 'labour_breakdowns' | 'schedule_tasks' | 'schedule_materials';

/** Maps budget tab → procurement category for “Procure” deep-link */
type ProcurementCategory = 'MATERIAL' | 'LABOUR' | 'PLANT' | 'PROFESSIONAL' | 'ADMIN';
const TAB_TO_PROCUREMENT: Record<TabKey, ProcurementCategory> = {
    building_items: 'MATERIAL',
    professional_fees: 'PROFESSIONAL',
    admin_expenses: 'ADMIN',
    labour_costs: 'LABOUR',
    machine_plants: 'PLANT',
    labour_breakdowns: 'LABOUR',
    schedule_tasks: 'MATERIAL',
    schedule_materials: 'MATERIAL',
};

const TABS: { key: TabKey, label: string }[] = [
    { key: 'building_items', label: 'Building' },
    { key: 'professional_fees', label: 'Professional' },
    { key: 'admin_expenses', label: 'Admin' },
    { key: 'labour_costs', label: 'Labour' },
    { key: 'machine_plants', label: 'Plant' },
    { key: 'labour_breakdowns', label: 'Breakdown' },
    { key: 'schedule_tasks', label: 'Tasks' },
    { key: 'schedule_materials', label: 'Materials' },
];

export default function BOQMeasurements() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [budgetSheets, setBudgetSheets] = useState<BudgetSheets | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('building_items');
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: number, type: TabKey, data: any } | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [budgetView, setBudgetView] = useState<'preliminary' | 'final'>('preliminary');
    const [promoting, setPromoting] = useState(false);
    const [signOpen, setSignOpen] = useState(false);
    const [signing, setSigning] = useState(false);
    const user = useAuthStore((state) => state.auth.user);
    const hasProfileSignature = Boolean(user?.profile?.has_signature);

    const [allProcured, setAllProcured] = useState(false);
    const bk: 'preliminary' | 'final' = budgetView;
    const currentProject = projects.find(p => p.id === selectedProject);
    const isDIFY = currentProject?.engagement_tier === 'DIFY';
    const canEdit = !isDIFY && !(budgetView === 'final' && budgetSheets?.budget_meta?.is_locked);

    // Check if all BOQ items already have procurement requests
    useEffect(() => {
        if (!selectedProject || budgetView !== 'final' || !budgetSheets?.budget_meta?.is_locked) {
            setAllProcured(false);
            return;
        }
        const totalBoq =
            (budgetSheets.building_items?.length ?? 0) +
            (budgetSheets.professional_fees?.length ?? 0) +
            (budgetSheets.admin_expenses?.length ?? 0) +
            (budgetSheets.labour_costs?.length ?? 0) +
            (budgetSheets.machine_plants?.length ?? 0);
        if (totalBoq === 0) { setAllProcured(false); return; }

        builderApi.getProjectMaterialRequests(selectedProject)
            .then((res) => {
                const reqs = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                const linkedIds = new Set(
                    reqs
                        .map((r: any) => {
                            const linkedId = r.object_id ?? (r.procurement_category === 'MATERIAL' ? r.boq_item : undefined);
                            return linkedId ? `${r.procurement_category}:${linkedId}` : null;
                        })
                        .filter(Boolean),
                );
                setAllProcured(linkedIds.size >= totalBoq);
            })
            .catch(() => setAllProcured(false));
    }, [selectedProject, budgetView, budgetSheets]);

    useEffect(() => {
        builderApi.getProjects().then(res => {
            setProjects(res.data.results || []);
            if (res.data.results?.length > 0) {
                setSelectedProject(res.data.results[0].id);
            }
        }).catch(() => toast.error("Failed to load projects"))
        .finally(() => setLoadingProjects(false));
    }, []);

    useEffect(() => {
        if (!selectedProject) return;
        setLoading(true);
        builderApi.getProjectBudgetSheets(selectedProject, budgetView)
            .then(res => setBudgetSheets(res.data))
            .catch(() => toast.error("Failed to load budget sheets"))
            .finally(() => setLoading(false));
    }, [selectedProject, budgetView]);

    const handlePromoteToFinal = async () => {
        if (!selectedProject) return;
        if (!confirm('Replace final budget with preliminary copy?')) return;
        setPromoting(true);
        try {
            const res = await builderApi.promoteBudgetToFinal(selectedProject);
            setBudgetSheets(res.data);
            setBudgetView('final');
            toast.success('Updated.');
        } catch {
            toast.error('Failed');
        } finally {
            setPromoting(false);
        }
    };

    const handleSignFinal = async () => {
        if (!selectedProject || !hasProfileSignature) return;
        setSigning(true);
        try {
            const res = await builderApi.signFinalBudget(selectedProject);
            setBudgetSheets(res.data);
            setSignOpen(false);
            toast.success('Signed.');
        } catch {
            toast.error('Failed');
        } finally {
            setSigning(false);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProject(Number(e.target.value));
    };

    const deleteItem = async (id: number, type: TabKey) => {
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            if (type === 'building_items') await builderApi.deleteBOQBuildingItem(id, bk);
            else if (type === 'professional_fees') await builderApi.deleteBOQProfessionalFee(id, bk);
            else if (type === 'admin_expenses') await builderApi.deleteBOQAdminExpense(id, bk);
            else if (type === 'labour_costs') await builderApi.deleteBOQLabourCost(id, bk);
            else if (type === 'machine_plants') await builderApi.deleteBOQMachinePlant(id, bk);
            else if (type === 'labour_breakdowns') await builderApi.deleteBOQLabourBreakdown(id, bk);
            else if (type === 'schedule_tasks') await builderApi.deleteBOQScheduleTask(id, bk);
            else if (type === 'schedule_materials') await builderApi.deleteScheduleMaterial(id, bk);
            
            toast.success('Item deleted');
            // Optimistic update
            setBudgetSheets(prev => {
                if (!prev) return prev;
                return { ...prev, [type]: (prev[type] as any[]).filter(i => i.id !== id) };
            });
        } catch {
            toast.error('Failed to delete item');
        }
    };

    const handleEdit = (item: any, type: TabKey) => {
        setEditingItem({ id: item.id, type, data: { ...item } });
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        setIsSavingEdit(true);
        try {
            const { id, type, data } = editingItem;
            const payload = { ...data };
            // Strip out non-editable fields
            delete payload.id;
            delete payload.project;
            delete payload.budget_version;
            delete payload.created_at;
            delete payload.updated_at;
            delete payload.is_ai_generated;
            delete payload.amount;
            delete payload.total_cost;
            delete payload.estimated_fee;
            delete payload.weekly_wage_bill;

            if (type === 'building_items') await builderApi.updateBOQBuildingItem(id, payload, bk);
            else if (type === 'professional_fees') await builderApi.updateBOQProfessionalFee(id, payload, bk);
            else if (type === 'admin_expenses') await builderApi.updateBOQAdminExpense(id, payload, bk);
            else if (type === 'labour_costs') await builderApi.updateBOQLabourCost(id, payload, bk);
            else if (type === 'machine_plants') await builderApi.updateBOQMachinePlant(id, payload, bk);
            else if (type === 'labour_breakdowns') await builderApi.updateBOQLabourBreakdown(id, payload, bk);
            else if (type === 'schedule_tasks') await builderApi.updateBOQScheduleTask(id, payload, bk);
            else if (type === 'schedule_materials') await builderApi.updateScheduleMaterial(id, payload, bk);

            toast.success('Item updated');
            setEditingItem(null);
            
            setLoading(true);
            const res = await builderApi.getProjectBudgetSheets(selectedProject!, budgetView);
            setBudgetSheets(res.data);
            setLoading(false);
        } catch {
            toast.error('Failed to update item');
        } finally {
            setIsSavingEdit(false);
        }
    };

    if (loadingProjects) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
                <p className="text-slate-500 text-sm">Loading...</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return <div className="p-8 text-center text-slate-500">No active projects found. Create a project first.</div>;
    }

    const isFinalLocked = Boolean(budgetSheets?.budget_meta?.is_locked);
    const canOpenProcurement = Boolean(selectedProject && isFinalLocked);

    return (
        <div className="max-w-7xl mx-auto px-3 py-4 sm:p-4 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Project Budget</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={selectedProject || ''}
                                onChange={handleProjectChange}
                                className="h-9 sm:h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none flex-1 sm:flex-none sm:w-64 min-w-0"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                            {currentProject && <ProjectModeBadge engagementTier={currentProject.engagement_tier} size="sm" />}
                        </div>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <button
                                type="button"
                                onClick={() => setBudgetView('preliminary')}
                                className={`px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${budgetView === 'preliminary' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                            >
                                Preliminary
                            </button>
                            <button
                                type="button"
                                onClick={() => setBudgetView('final')}
                                className={`px-4 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-l border-slate-200 transition-all ${budgetView === 'final' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                            >
                                Final
                            </button>
                        </div>
                        {selectedProject && <AiChatButton projectId={selectedProject} />}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5">
                {budgetSheets?.budget_meta && (
                    <span className="text-lg font-bold tabular-nums text-slate-900 mr-auto">
                        ${Number(budgetSheets.budget_meta.gross_total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                )}

                <span className="hidden md:block h-5 w-px bg-slate-200" />

                <Button type="button" variant="outline" size="sm" disabled={promoting || !selectedProject} onClick={handlePromoteToFinal}>
                    <Icon name="publish" className="mr-1 text-base" />
                    {promoting ? 'Promoting…' : 'Promote'}
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={isFinalLocked ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 font-bold uppercase tracking-wider text-[10px]'}
                    disabled={budgetView !== 'final' || isFinalLocked || !hasProfileSignature}
                    title={!hasProfileSignature ? 'Add signature in Settings → Profile' : undefined}
                    onClick={() => {
                        if (!hasProfileSignature) {
                            toast.error('Save a digital signature under Settings → Profile before signing.');
                            return;
                        }
                        setSignOpen(true);
                    }}
                >
                    <Icon name={isFinalLocked ? 'lock' : 'draw'} className="mr-1.5 text-base" />
                    {isFinalLocked ? 'Signed' : 'Sign Budget'}
                </Button>

                <span className="hidden md:block h-5 w-px bg-slate-200" />

                {allProcured ? (
                    <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <Icon name="check_circle" size={14} className="text-emerald-500" />
                        All items procured
                    </span>
                ) : canOpenProcurement && selectedProject && !isDIFY ? (
                    <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-none font-bold uppercase tracking-wider text-[10px]">
                        <Link to="/builder/procurement" search={{ projectId: selectedProject, category: TAB_TO_PROCUREMENT[activeTab], bulkPrefill: true, prefill: undefined, boqId: undefined }}>
                            <Icon name="library_add" className="mr-1.5 text-base" />
                            Bulk Procure
                        </Link>
                    </Button>
                ) : isDIFY && selectedProject ? (
                    <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <Icon name="info" size={14} className="text-slate-400" />
                        <span>SQB manages budget for DIFY projects</span>
                    </div>
                ) : null}

            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 sm:gap-1 border-b border-slate-200 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${
                            activeTab === tab.key 
                                ? 'border-slate-900 text-slate-900 bg-slate-50/50' 
                                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        {tab.label}
                        {budgetSheets && (
                            <span className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] py-0.5 px-1 sm:px-1.5 rounded-full bg-slate-100 text-slate-500">
                                {budgetSheets[tab.key]?.length || 0}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <style>{`@keyframes tileIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div>
                {loading ? (
                    <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">Loading budget data...</div>
                ) : (
                    <div>
                        {activeTab === 'building_items' && (
                            <BuildingItemsTable readOnly={!canEdit} items={budgetSheets?.building_items || []} onDelete={(id) => deleteItem(id, 'building_items')} onEdit={(item) => handleEdit(item, 'building_items')} />
                        )}
                        {activeTab === 'professional_fees' && (
                            <ProfessionalFeesTable readOnly={!canEdit} items={budgetSheets?.professional_fees || []} onDelete={(id) => deleteItem(id, 'professional_fees')} onEdit={(item) => handleEdit(item, 'professional_fees')} />
                        )}
                        {activeTab === 'admin_expenses' && (
                            <AdminExpensesTable readOnly={!canEdit} items={budgetSheets?.admin_expenses || []} onDelete={(id) => deleteItem(id, 'admin_expenses')} onEdit={(item) => handleEdit(item, 'admin_expenses')} />
                        )}
                        {activeTab === 'labour_costs' && (
                            <LabourCostsTable readOnly={!canEdit} items={budgetSheets?.labour_costs || []} onDelete={(id) => deleteItem(id, 'labour_costs')} onEdit={(item) => handleEdit(item, 'labour_costs')} />
                        )}
                        {activeTab === 'machine_plants' && (
                            <MachinePlantsTable readOnly={!canEdit} items={budgetSheets?.machine_plants || []} onDelete={(id) => deleteItem(id, 'machine_plants')} onEdit={(item) => handleEdit(item, 'machine_plants')} />
                        )}
                        {activeTab === 'labour_breakdowns' && (
                            <LabourBreakdownsTable readOnly={!canEdit} items={budgetSheets?.labour_breakdowns || []} onDelete={(id) => deleteItem(id, 'labour_breakdowns')} onEdit={(item) => handleEdit(item, 'labour_breakdowns')} />
                        )}
                        {activeTab === 'schedule_tasks' && (
                            <ScheduleTasksTable readOnly={!canEdit} items={budgetSheets?.schedule_tasks || []} onDelete={(id) => deleteItem(id, 'schedule_tasks')} onEdit={(item) => handleEdit(item, 'schedule_tasks')} />
                        )}
                        {activeTab === 'schedule_materials' && (
                            <ScheduleMaterialsTable readOnly={!canEdit} items={budgetSheets?.schedule_materials || []} onDelete={(id) => deleteItem(id, 'schedule_materials')} onEdit={(item) => handleEdit(item, 'schedule_materials')} />
                        )}
                    </div>
                )}
            </div>

            {budgetView === 'final' && budgetSheets?.budget_meta?.is_locked && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Author signature</p>
                    {budgetSheets.budget_meta.signature_image ? (
                        <img
                            src={budgetSheets.budget_meta.signature_image}
                            alt="Signed"
                            className="max-h-28 w-auto object-contain object-left border-b border-slate-200 pb-3"
                        />
                    ) : null}
                    <p className="text-sm text-slate-700">
                        <span className="font-medium">{budgetSheets.budget_meta.author_signature || '—'}</span>
                        {budgetSheets.budget_meta.signed_at && (
                            <span className="text-slate-500">
                                {' · '}
                                {new Date(budgetSheets.budget_meta.signed_at).toLocaleString()}
                            </span>
                        )}
                    </p>
                </div>
            )}

            <Dialog open={signOpen} onOpenChange={setSignOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sign final budget</DialogTitle>
                        <DialogDescription className="text-sm text-slate-600 pt-1">
                            Your saved profile signature will be applied and this budget will be locked. You can update your signature anytime under{' '}
                            <Link to="/settings" className="text-emerald-600 font-medium hover:underline">Settings</Link> (Profile).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSignOpen(false)}>Cancel</Button>
                        <Button disabled={signing || !hasProfileSignature} className="bg-amber-600 hover:bg-amber-700" onClick={handleSignFinal}>
                            {signing ? '…' : 'Sign'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription className="sr-only">
                            Update budget line fields below, then save your changes.
                        </DialogDescription>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4 py-4">
                            {Object.entries(editingItem.data).map(([key, value]) => {
                                if (['id', 'project', 'budget_version', 'created_at', 'updated_at', 'is_ai_generated', 'amount', 'total_cost', 'estimated_fee', 'weekly_wage_bill'].includes(key)) return null;
                                return (
                                    <div key={key} className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </label>
                                        <Input 
                                            value={(value as string) || ''} 
                                            onChange={e => setEditingItem({
                                                ...editingItem,
                                                data: { ...editingItem.data, [key]: e.target.value }
                                            })}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                            {isSavingEdit ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ---- Sub-components for Tables ----

function BuildingItemsTable({ items, onDelete, onEdit, readOnly }: { items: BOQBuildingItem[], onDelete: (id: number) => void, onEdit: (item: BOQBuildingItem) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-md hover:border-slate-900 hover:-translate-y-0.5 transition-all duration-300" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{i.description}</p>
                            <div className="flex items-center gap-1 shrink-0">
                                {i.is_ai_generated && <span className="text-base" title="AI generated">✨</span>}
                                {!readOnly && (
                                    <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-900"><Icon name="edit" size={16} /></button>
                                        <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon name="delete" size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {i.specification && <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{i.specification}</p>}
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            {i.bill_no && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">Bill {i.bill_no}</span>}
                            <span>{i.unit || '—'}</span>
                            <span>Qty: {Number(i.quantity).toLocaleString()}</span>
                            <span>Rate: ${Number(i.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Building Cost</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function ProfessionalFeesTable({ items, onDelete, onEdit, readOnly }: { items: BOQProfessionalFee[], onDelete: (id: number) => void, onEdit: (item: BOQProfessionalFee) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">{i.discipline || '—'}</p>
                            {!readOnly && (
                                <div className="flex gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                </div>
                            )}
                        </div>
                        {i.role_scope && <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{i.role_scope}</p>}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Basis: {i.basis || '—'}</span>
                            <span>Rate: {i.rate || '—'}</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.estimated_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Professional Fees</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.estimated_fee), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function AdminExpensesTable({ items, onDelete, onEdit, readOnly }: { items: BOQAdminExpense[], onDelete: (id: number) => void, onEdit: (item: BOQAdminExpense) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">{i.item_role || '—'}</p>
                            {!readOnly && (
                                <div className="flex gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                </div>
                            )}
                        </div>
                        {i.description && <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{i.description}</p>}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Trips/Wk: {i.trips_per_week || '—'}</span>
                            <span>Distance: {i.distance || '—'} km</span>
                            <span>Rate: ${Number(i.rate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.total_cost).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Admin Costs</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function LabourCostsTable({ items, onDelete, onEdit, readOnly }: { items: BOQLabourCost[], onDelete: (id: number) => void, onEdit: (item: BOQLabourCost) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">{i.trade_role || '—'}</p>
                            {!readOnly && (
                                <div className="flex gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            {i.phase && <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-200">{i.phase}</span>}
                            {i.skill_level && <span className="text-[9px] bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-100 italic">{i.skill_level}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Gang: {i.gang_size || '—'}</span>
                            <span>{i.duration_weeks || '—'} wks</span>
                            <span>{i.total_man_days || '—'} man-days</span>
                            <span>${Number(i.daily_rate).toLocaleString()}/day</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-emerald-700">${Number(i.total_cost).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Labour Cost</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function MachinePlantsTable({ items, onDelete, onEdit, readOnly }: { items: BOQMachinePlant[], onDelete: (id: number) => void, onEdit: (item: BOQMachinePlant) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">{i.machine_item || '—'}</p>
                            {!readOnly && (
                                <div className="flex gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                </div>
                            )}
                        </div>
                        {i.category && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium inline-block mb-2">{i.category}</span>}
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Qty: {i.qty || '1'}</span>
                            <span>Wet: ${Number(i.daily_wet_rate).toLocaleString()}/day</span>
                            <span>{i.days_rqd || '—'} days</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.total_cost).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Machine/Plant Cost</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function LabourBreakdownsTable({ items, onDelete, onEdit, readOnly }: { items: BOQLabourBreakdown[], onDelete: (id: number) => void, onEdit: (item: BOQLabourBreakdown) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">{i.trade_role || '—'}</p>
                            {!readOnly && (
                                <div className="flex gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                </div>
                            )}
                        </div>
                        {i.phase && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium inline-block mb-2">{i.phase}</span>}
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Gang: {i.gang_size || '—'}</span>
                            <span>{i.duration_weeks || '—'} wks</span>
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.total_cost).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Labour Breakdown</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function ScheduleTasksTable({ items, onDelete, onEdit, readOnly }: { items: BOQScheduleTask[], onDelete: (id: number) => void, onEdit: (item: BOQScheduleTask) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-3 p-3 sm:p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {items.map((i, idx) => (
                    <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{i.task_description || '—'}</p>
                            <div className="flex items-center gap-1 shrink-0">
                                {i.wbs && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{i.wbs}</span>}
                                {!readOnly && (
                                    <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                        <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                            <span>{i.start_date || '—'} → {i.end_date || '—'}</span>
                            <span>{i.days || '—'} days</span>
                            {i.predecessor && <span className="text-slate-400">← {i.predecessor}</span>}
                        </div>
                        <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${Number(i.est_cost).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest">Total Schedule Cost</span>
                <span className="text-sm sm:text-lg font-bold text-white">${items.reduce((sum, i) => sum + Number(i.est_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>
    );
}

function ScheduleMaterialsTable({ items, onDelete, onEdit, readOnly }: { items: BOQScheduleMaterial[], onDelete: (id: number) => void, onEdit: (item: BOQScheduleMaterial) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, BOQScheduleMaterial[]>);

    const formatSection = (section: string) => {
        const labels: Record<string, string> = {
            'SUBSTRUCTURE': 'Substructure',
            'SUPERSTRUCTURE': 'Superstructure',
            'ROOFING_CEILINGS': 'Roofing & Ceilings',
            'FINISHES': 'Finishes',
            'DOORS_WINDOWS': 'Doors & Windows',
            'PLUMBING': 'Plumbing & Drainage',
            'ELECTRICAL_SOLAR': 'Electrical & Solar Off-Grid',
        };
        return labels[section] || section;
    };

    return (
        <div className="space-y-4 sm:space-y-5 p-3 sm:p-4">
            {Object.entries(groupedItems).map(([section, sectionItems]) => (
                <div key={section}>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">{formatSection(section)}</p>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {sectionItems.map((i, idx) => (
                            <div key={i.id} className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200" style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{i.material_description}</p>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {i.is_ai_generated && <span className="text-base" title="AI generated">✨</span>}
                                        {!readOnly && (
                                            <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 sm:p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 sm:p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {i.specification && <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{i.specification}</p>}
                                <div className="text-[11px] text-slate-500 mt-1">
                                    <span>Est. Qty: {i.estimated_qty || '—'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Icon name="insert_drive_file" className="text-3xl" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No items</h3>
        </div>
    );
}

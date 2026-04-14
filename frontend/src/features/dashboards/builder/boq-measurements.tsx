import { useState, useEffect } from 'react';
import { builderApi } from '@/services/api';
import type { 
    Project, BudgetSheets, BOQBuildingItem, BOQProfessionalFee, 
    BOQAdminExpense, BOQLabourCost, BOQMachinePlant, 
    BOQLabourBreakdown, BOQScheduleTask, BOQScheduleMaterial
} from '@/types/api';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/material-icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProjectModeBadge } from '@/components/project-mode-badge';
import { ProjectWorkspacePicker } from './components/project-workspace-picker';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

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

export interface BOQMeasurementsProps {
    initialProjectId?: number | null;
    onSelectProject?: (projectId: number) => void;
    onExitProject?: () => void;
    onOpenPortfolio?: () => void;
}

export default function BOQMeasurements({ initialProjectId = null, onSelectProject, onExitProject, onOpenPortfolio }: BOQMeasurementsProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [selectedProject, setSelectedProject] = useState<number | null>(initialProjectId);
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

    const selectProject = (projectId: number) => {
        setSelectedProject(projectId);
        onSelectProject?.(projectId);
    };

    const exitProject = () => {
        setSelectedProject(null);
        setBudgetSheets(null);
        setAllProcured(false);
        setEditingItem(null);
        setSignOpen(false);
        setLoading(false);
        onExitProject?.();
    };

    useEffect(() => {
        setSelectedProject(initialProjectId ?? null);
    }, [initialProjectId]);

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
        }).catch(() => toast.error("Failed to load projects"))
        .finally(() => setLoadingProjects(false));
    }, []);

    useEffect(() => {
        if (loadingProjects || !selectedProject) return;
        if (projects.some((project) => project.id === selectedProject)) return;
        exitProject();
    }, [loadingProjects, projects, selectedProject]);

    useEffect(() => {
        if (!selectedProject) {
            setBudgetSheets(null);
            setAllProcured(false);
            setLoading(false);
            return;
        }
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
            <div className="w-full px-3 py-4 sm:p-4 md:p-8">
                <ProjectWorkspacePicker
                    title="Choose a budget workspace"
                    description="Select a project tile before loading budget sheets, BOQ tabs, and signing tools. Only the chosen project's budget data will be opened here."
                    projects={[]}
                    loading
                    onSelectProject={selectProject}
                    onPrimaryAction={onOpenPortfolio}
                    primaryActionLabel="Open Portfolio"
                />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="w-full px-3 py-4 sm:p-4 md:p-8">
                <ProjectWorkspacePicker
                    title="Choose a budget workspace"
                    description="Pick a project tile to open its construction budget, BOQ details, and signing controls. Until then, this page stays free of project-specific budget data."
                    projects={[]}
                    onSelectProject={selectProject}
                    onPrimaryAction={onOpenPortfolio}
                    primaryActionLabel="Open Portfolio"
                    emptyTitle="No budget workspaces yet"
                    emptyDescription="Create a project from your builder portfolio first, then return here to build, review, and sign its BOQ budget sheets."
                />
            </div>
        );
    }

    if (!selectedProject || !currentProject) {
        return (
            <div className="w-full px-3 py-4 sm:p-4 md:p-8">
                <ProjectWorkspacePicker
                    title="Choose a budget workspace"
                    description="Pick a project tile to open its construction budget, BOQ details, and signing controls. Until then, this page stays free of project-specific budget data."
                    projects={projects}
                    onSelectProject={selectProject}
                    onPrimaryAction={onOpenPortfolio}
                    primaryActionLabel="Open Portfolio"
                    emptyTitle="No budget workspaces yet"
                    emptyDescription="Create a project from your builder portfolio first, then return here to build, review, and sign its BOQ budget sheets."
                />
            </div>
        );
    }

    const isFinalLocked = Boolean(budgetSheets?.budget_meta?.is_locked);
    const canOpenProcurement = Boolean(selectedProject && isFinalLocked);

    const buildingTotal = budgetSheets?.building_items?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
    const professionalTotal = budgetSheets?.professional_fees?.reduce((s, i) => s + Number(i.estimated_fee || 0), 0) || 0;
    const adminTotal = budgetSheets?.admin_expenses?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0;
    const labourTotal = budgetSheets?.labour_costs?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0;
    const plantTotal = budgetSheets?.machine_plants?.reduce((s, i) => s + Number(i.total_cost || 0), 0) || 0;
    
    const chartData = [
        { name: 'Materials', value: buildingTotal, color: '#38bdf8' }, // sky-400
        { name: 'Professional', value: professionalTotal, color: '#a78bfa' }, // violet-400
        { name: 'Admin', value: adminTotal, color: '#fbbf24' }, // amber-400
        { name: 'Labour', value: labourTotal, color: '#34d399' }, // emerald-400
        { name: 'Plant', value: plantTotal, color: '#fb7185' }, // rose-400
    ].filter(d => d.value > 0);

    return (
        <div className="flex h-full w-full overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto px-3 py-4 sm:p-4 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Project Budget</h1>
                        <p className="mt-1 text-sm text-slate-500">{currentProject.title}{currentProject.location ? ` • ${currentProject.location}` : ''}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <ProjectModeBadge engagementTier={currentProject.engagement_tier} size="sm" />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={exitProject}
                            className="h-9 sm:h-10 border-slate-200 bg-white text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
                        >
                            <Icon name="logout" className="mr-1.5 text-base" />
                            Exit Project
                        </Button>
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
                        <Button asChild variant="outline" className="h-9 sm:h-10 border-slate-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all">
                            <Link to="/builder/budget-engineer" search={selectedProject ? { projectId: String(selectedProject) } : {}}>
                                <Icon name="engineering" className="mr-1.5 text-base" />
                                Engineer
                            </Link>
                        </Button>
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

            {/* Budget Summary Dashboard */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
                    <div className="md:col-span-2 flex flex-col justify-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Budget Distribution Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {chartData.map((data, idx) => (
                                <div key={data.name} className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{data.name}</span>
                                    </div>
                                    <span className="text-sm sm:text-base font-bold text-slate-900 pl-5">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-1 h-[200px] sm:h-[240px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

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
        </div>
    );
}

// ---- Sub-components for Tables ----

function BuildingItemsTable({ items, onDelete, onEdit, readOnly }: { items: BOQBuildingItem[], onDelete: (id: number) => void, onEdit: (item: BOQBuildingItem) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Bill No</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Qty</th>
                                <th className="px-4 py-3 text-right">Unit</th>
                                <th className="px-4 py-3 text-right">Rate</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{i.bill_no || '—'}</td>
                                    <td className="px-4 py-3 text-slate-900 font-medium whitespace-normal min-w-[200px]">
                                        {i.description}
                                        {i.is_ai_generated && <span className="ml-1" title="AI generated">✨</span>}
                                        {i.specification && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{i.specification}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{Number(i.quantity).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-slate-500 text-[11px]">{i.unit || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">${Number(i.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                         <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={5} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Building Cost</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ProfessionalFeesTable({ items, onDelete, onEdit, readOnly }: { items: BOQProfessionalFee[], onDelete: (id: number) => void, onEdit: (item: BOQProfessionalFee) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Discipline</th>
                                <th className="px-4 py-3">Description / Scope</th>
                                <th className="px-4 py-3">Basis</th>
                                <th className="px-4 py-3 text-right">Rate</th>
                                <th className="px-4 py-3 text-right">Estimated Fee</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 text-slate-900 font-medium">{i.discipline || '—'}</td>
                                    <td className="px-4 py-3 text-slate-700 whitespace-normal min-w-[200px]">{i.role_scope || '—'}</td>
                                    <td className="px-4 py-3 text-slate-500 text-[11px]">{i.basis || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.rate || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.estimated_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={4} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Professional Fees</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.estimated_fee), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AdminExpensesTable({ items, onDelete, onEdit, readOnly }: { items: BOQAdminExpense[], onDelete: (id: number) => void, onEdit: (item: BOQAdminExpense) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Trips/Week</th>
                                <th className="px-4 py-3 text-right">Distance (km)</th>
                                <th className="px-4 py-3 text-right">Rate</th>
                                <th className="px-4 py-3 text-right">Total Cost</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 text-slate-900 font-medium">{i.item_role || '—'}</td>
                                    <td className="px-4 py-3 text-slate-700 whitespace-normal min-w-[200px]">{i.description || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.trips_per_week || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.distance || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">${Number(i.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={5} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Admin Costs</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LabourCostsTable({ items, onDelete, onEdit, readOnly }: { items: BOQLabourCost[], onDelete: (id: number) => void, onEdit: (item: BOQLabourCost) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Trade Role</th>
                                <th className="px-4 py-3">Phase / Skill</th>
                                <th className="px-4 py-3 text-right">Gang Size</th>
                                <th className="px-4 py-3 text-right text-nowrap">Duration (wks)</th>
                                <th className="px-4 py-3 text-right text-nowrap">Man-days</th>
                                <th className="px-4 py-3 text-right">Daily Rate</th>
                                <th className="px-4 py-3 text-right">Total Cost</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 text-slate-900 font-medium">{i.trade_role || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-start gap-1">
                                            {i.phase && <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{i.phase}</span>}
                                            {i.skill_level && <span className="text-[9px] text-slate-500 italic">{i.skill_level}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.gang_size || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.duration_weeks || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.total_man_days || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">${Number(i.daily_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={6} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Labour Cost</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MachinePlantsTable({ items, onDelete, onEdit, readOnly }: { items: BOQMachinePlant[], onDelete: (id: number) => void, onEdit: (item: BOQMachinePlant) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Machine Item</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-right">Qty</th>
                                <th className="px-4 py-3 text-right text-nowrap">Days Rqd</th>
                                <th className="px-4 py-3 text-right">Wet Rate</th>
                                <th className="px-4 py-3 text-right">Total Cost</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 text-slate-900 font-medium whitespace-normal min-w-[200px]">{i.machine_item || '—'}</td>
                                    <td className="px-4 py-3">
                                        {i.category && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">{i.category}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.qty || '1'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.days_rqd || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">${Number(i.daily_wet_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={5} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Machine/Plant Cost</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LabourBreakdownsTable({ items, onDelete, onEdit, readOnly }: { items: BOQLabourBreakdown[], onDelete: (id: number) => void, onEdit: (item: BOQLabourBreakdown) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Trade Role</th>
                                <th className="px-4 py-3">Phase</th>
                                <th className="px-4 py-3 text-right">Gang Size</th>
                                <th className="px-4 py-3 text-right">Duration (wks)</th>
                                <th className="px-4 py-3 text-right">Total Cost</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 text-slate-900 font-medium">{i.trade_role || '—'}</td>
                                    <td className="px-4 py-3">
                                        {i.phase && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{i.phase}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.gang_size || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.duration_weeks || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.total_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={4} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Labour Breakdown</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ScheduleTasksTable({ items, onDelete, onEdit, readOnly }: { items: BOQScheduleTask[], onDelete: (id: number) => void, onEdit: (item: BOQScheduleTask) => void, readOnly?: boolean }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">WBS</th>
                                <th className="px-4 py-3 min-w-[200px]">Task Description</th>
                                <th className="px-4 py-3 text-center">Start → End</th>
                                <th className="px-4 py-3 text-right">Days</th>
                                <th className="px-4 py-3 text-center">Predecessor</th>
                                <th className="px-4 py-3 text-right">Est. Cost</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((i, idx) => (
                                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{i.wbs || '—'}</td>
                                    <td className="px-4 py-3 text-slate-900 font-medium whitespace-normal">{i.task_description || '—'}</td>
                                    <td className="px-4 py-3 text-center text-slate-700 text-[11px]">{i.start_date || '—'} <span className="text-slate-400 mx-1">→</span> {i.end_date || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{i.days || '—'}</td>
                                    <td className="px-4 py-3 text-center text-[11px] text-slate-500">{i.predecessor || '—'}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">${Number(i.est_cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                            <tr>
                                <th colSpan={5} className="px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300 border-none">Total Schedule Cost</th>
                                <th className="px-4 py-3 text-right font-bold text-sm sm:text-lg border-none">${items.reduce((sum, i) => sum + Number(i.est_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</th>
                                {!readOnly && <th className="border-none"></th>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
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
        <div className="space-y-0 p-3 sm:p-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Material Description</th>
                                <th className="px-4 py-3 text-right">Est. Qty</th>
                                {!readOnly && <th className="px-4 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        {Object.entries(groupedItems).map(([section, sectionItems]) => (
                            <tbody key={section} className="divide-y divide-slate-100">
                                <tr className="bg-slate-50/80 border-t border-slate-200">
                                    <td colSpan={readOnly ? 2 : 3} className="px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-slate-500">
                                        {formatSection(section)}
                                    </td>
                                </tr>
                                {sectionItems.map((i, idx) => (
                                    <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3 text-slate-900 font-medium whitespace-normal min-w-[250px]">
                                            {i.material_description}
                                            {i.is_ai_generated && <span className="ml-1" title="AI generated">✨</span>}
                                            {i.specification && <p className="text-[11px] text-slate-400 font-normal mt-0.5">{i.specification}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-slate-700 font-semibold">{i.estimated_qty || '—'}</td>
                                        {!readOnly && (
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600"><Icon name="edit" size={16} /></button>
                                                    <button type="button" onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-rose-500"><Icon name="delete" size={16} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        ))}
                    </table>
                </div>
            </div>
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

import { useState, useEffect, useRef, Fragment } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type TabKey = 'building_items' | 'professional_fees' | 'admin_expenses' | 'labour_costs' | 'machine_plants' | 'labour_breakdowns' | 'schedule_tasks' | 'schedule_materials';
const TABS: { key: TabKey, label: string }[] = [
    { key: 'building_items', label: '1. Building Items' },
    { key: 'professional_fees', label: '2. Professional Fees' },
    { key: 'admin_expenses', label: '3. Admin & Expenses' },
    { key: 'labour_costs', label: '4. Labour Costs' },
    { key: 'machine_plants', label: '5. Machine & Plant' },
    { key: 'labour_breakdowns', label: '6. Labour Breakdown' },
    { key: 'schedule_tasks', label: '7. Schedule Tasks' },
    { key: 'schedule_materials', label: '8. Schedule of Materials' },
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
    
    useEffect(() => {
        builderApi.getProjects().then(res => {
            setProjects(res.data.results || []);
            if (res.data.results?.length > 0) {
                setSelectedProject(res.data.results[0].id);
            }
        }).catch(err => toast.error("Failed to load projects"))
        .finally(() => setLoadingProjects(false));
    }, []);

    useEffect(() => {
        if (!selectedProject) return;
        setLoading(true);
        builderApi.getProjectBudgetSheets(selectedProject)
            .then(res => setBudgetSheets(res.data))
            .catch(err => toast.error("Failed to load budget sheets"))
            .finally(() => setLoading(false));
    }, [selectedProject]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProject(Number(e.target.value));
    };

    const deleteItem = async (id: number, type: TabKey) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            if (type === 'building_items') await builderApi.deleteBOQBuildingItem(id);
            else if (type === 'professional_fees') await builderApi.deleteBOQProfessionalFee(id);
            else if (type === 'admin_expenses') await builderApi.deleteBOQAdminExpense(id);
            else if (type === 'labour_costs') await builderApi.deleteBOQLabourCost(id);
            else if (type === 'machine_plants') await builderApi.deleteBOQMachinePlant(id);
            else if (type === 'labour_breakdowns') await builderApi.deleteBOQLabourBreakdown(id);
            else if (type === 'schedule_tasks') await builderApi.deleteBOQScheduleTask(id);
            else if (type === 'schedule_materials') await builderApi.deleteScheduleMaterial(id);
            
            toast.success('Item deleted');
            // Optimistic update
            setBudgetSheets(prev => {
                if (!prev) return prev;
                return { ...prev, [type]: (prev[type] as any[]).filter(i => i.id !== id) };
            });
        } catch (err) {
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
            delete payload.created_at;
            delete payload.updated_at;
            delete payload.is_ai_generated;
            delete payload.amount;
            delete payload.total_cost;
            delete payload.estimated_fee;
            delete payload.weekly_wage_bill;

            if (type === 'building_items') await builderApi.updateBOQBuildingItem(id, payload);
            else if (type === 'professional_fees') await builderApi.updateBOQProfessionalFee(id, payload);
            else if (type === 'admin_expenses') await builderApi.updateBOQAdminExpense(id, payload);
            else if (type === 'labour_costs') await builderApi.updateBOQLabourCost(id, payload);
            else if (type === 'machine_plants') await builderApi.updateBOQMachinePlant(id, payload);
            else if (type === 'labour_breakdowns') await builderApi.updateBOQLabourBreakdown(id, payload);
            else if (type === 'schedule_tasks') await builderApi.updateBOQScheduleTask(id, payload);
            else if (type === 'schedule_materials') await builderApi.updateScheduleMaterial(id, payload);

            toast.success('Item updated');
            setEditingItem(null);
            
            setLoading(true);
            const res = await builderApi.getProjectBudgetSheets(selectedProject!);
            setBudgetSheets(res.data);
            setLoading(false);
        } catch (err) {
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

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Budget</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all budget sheets for this project</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProject || ''}
                        onChange={handleProjectChange}
                        className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    {selectedProject && <AiChatButton projectId={selectedProject} />}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto hide-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            activeTab === tab.key 
                                ? 'border-emerald-500 text-emerald-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        {tab.label}
                        {budgetSheets && (
                            <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-100 text-slate-600">
                                {budgetSheets[tab.key]?.length || 0}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading budget data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'building_items' && (
                            <BuildingItemsTable items={budgetSheets?.building_items || []} onDelete={(id) => deleteItem(id, 'building_items')} onEdit={(item) => handleEdit(item, 'building_items')} />
                        )}
                        {activeTab === 'professional_fees' && (
                            <ProfessionalFeesTable items={budgetSheets?.professional_fees || []} onDelete={(id) => deleteItem(id, 'professional_fees')} onEdit={(item) => handleEdit(item, 'professional_fees')} />
                        )}
                        {activeTab === 'admin_expenses' && (
                            <AdminExpensesTable items={budgetSheets?.admin_expenses || []} onDelete={(id) => deleteItem(id, 'admin_expenses')} onEdit={(item) => handleEdit(item, 'admin_expenses')} />
                        )}
                        {activeTab === 'labour_costs' && (
                            <LabourCostsTable items={budgetSheets?.labour_costs || []} onDelete={(id) => deleteItem(id, 'labour_costs')} onEdit={(item) => handleEdit(item, 'labour_costs')} />
                        )}
                        {activeTab === 'machine_plants' && (
                            <MachinePlantsTable items={budgetSheets?.machine_plants || []} onDelete={(id) => deleteItem(id, 'machine_plants')} onEdit={(item) => handleEdit(item, 'machine_plants')} />
                        )}
                        {activeTab === 'labour_breakdowns' && (
                            <LabourBreakdownsTable items={budgetSheets?.labour_breakdowns || []} onDelete={(id) => deleteItem(id, 'labour_breakdowns')} onEdit={(item) => handleEdit(item, 'labour_breakdowns')} />
                        )}
                        {activeTab === 'schedule_tasks' && (
                            <ScheduleTasksTable items={budgetSheets?.schedule_tasks || []} onDelete={(id) => deleteItem(id, 'schedule_tasks')} onEdit={(item) => handleEdit(item, 'schedule_tasks')} />
                        )}
                        {activeTab === 'schedule_materials' && (
                            <ScheduleMaterialsTable items={budgetSheets?.schedule_materials || []} onDelete={(id) => deleteItem(id, 'schedule_materials')} onEdit={(item) => handleEdit(item, 'schedule_materials')} />
                        )}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4 py-4">
                            {Object.entries(editingItem.data).map(([key, value]) => {
                                if (['id', 'project', 'created_at', 'updated_at', 'is_ai_generated', 'amount', 'total_cost', 'estimated_fee', 'weekly_wage_bill'].includes(key)) return null;
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

function BuildingItemsTable({ items, onDelete, onEdit }: { items: BOQBuildingItem[], onDelete: (id: number) => void, onEdit: (item: BOQBuildingItem) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3 min-w-[200px]">Description</th>
                    <th className="px-4 py-3 min-w-[200px]">Specification</th>
                    <th className="px-4 py-3">Bill No</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">AI</th>
                    <th className="px-4 py-3 w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 placeholder-shown:">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 whitespace-normal break-words max-w-xs">{i.description}</td>
                        <td className="px-4 py-3 whitespace-normal break-words max-w-xs text-slate-600">{i.specification || '-'}</td>
                        <td className="px-4 py-3">{i.bill_no || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{i.unit || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{Number(i.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">${Number(i.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right font-semibold">${Number(i.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-center text-xl">{i.is_ai_generated ? '✨' : ''}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Building Cost</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td colSpan={2}></td>
                </tr>
            </tfoot>
        </table>
    );
}

function ProfessionalFeesTable({ items, onDelete, onEdit }: { items: BOQProfessionalFee[], onDelete: (id: number) => void, onEdit: (item: BOQProfessionalFee) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Discipline</th>
                    <th className="px-4 py-3">Role / Scope</th>
                    <th className="px-4 py-3">Basis</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3 text-right">Est. Fee</th>
                    <th className="px-4 py-3 w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">{i.discipline || '-'}</td>
                        <td className="px-4 py-3 whitespace-normal">{i.role_scope || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{i.basis || '-'}</td>
                        <td className="px-4 py-3">{i.rate || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold">${Number(i.estimated_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Professional Fees</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.estimated_fee), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function AdminExpensesTable({ items, onDelete, onEdit }: { items: BOQAdminExpense[], onDelete: (id: number) => void, onEdit: (item: BOQAdminExpense) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Role / Item</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 text-right">Trips/Wk</th>
                    <th className="px-4 py-3 text-right">Distance (km)</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3 w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">{i.item_role || '-'}</td>
                        <td className="px-4 py-3 whitespace-normal">{i.description || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.trips_per_week || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.distance || '-'}</td>
                        <td className="px-4 py-3 text-right">${Number(i.rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold">${Number(i.total_cost).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={5} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Admin Costs</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function LabourCostsTable({ items, onDelete, onEdit }: { items: BOQLabourCost[], onDelete: (id: number) => void, onEdit: (item: BOQLabourCost) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Phase</th>
                    <th className="px-4 py-3">Trade Role</th>
                    <th className="px-4 py-3">Skill Level</th>
                    <th className="px-4 py-3 text-right">Gang Size</th>
                    <th className="px-4 py-3 text-right">Duration (Wks)</th>
                    <th className="px-4 py-3 text-right">Man Days</th>
                    <th className="px-4 py-3 text-right">Daily Rate</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">{i.phase || '-'}</td>
                        <td className="px-4 py-3 font-medium">{i.trade_role || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{i.skill_level || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.gang_size || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.duration_weeks || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.total_man_days || '-'}</td>
                        <td className="px-4 py-3 text-right">${Number(i.daily_rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">${Number(i.total_cost).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={7} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Labour Cost</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function MachinePlantsTable({ items, onDelete, onEdit }: { items: BOQMachinePlant[], onDelete: (id: number) => void, onEdit: (item: BOQMachinePlant) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Machine/Plant</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Dry Hire</th>
                    <th className="px-4 py-3 text-right">Fuel Rate</th>
                    <th className="px-4 py-3 text-right">Operator Rate</th>
                    <th className="px-4 py-3 text-right">Wet Rate</th>
                    <th className="px-4 py-3 text-right">Days Req</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">{i.category || '-'}</td>
                        <td className="px-4 py-3 font-medium">{i.machine_item || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.qty || '1'}</td>
                        <td className="px-4 py-3 text-right">${i.dry_hire_rate || '-'}</td>
                        <td className="px-4 py-3 text-right">${i.fuel_cost || '-'}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{i.operator_rate || '-'}</td>
                        <td className="px-4 py-3 text-right">${Number(i.daily_wet_rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{i.days_rqd || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-sky-600">${Number(i.total_cost).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={8} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Machine/Plant Cost</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function LabourBreakdownsTable({ items, onDelete, onEdit }: { items: BOQLabourBreakdown[], onDelete: (id: number) => void, onEdit: (item: BOQLabourBreakdown) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Phase</th>
                    <th className="px-4 py-3">Trade Role</th>
                    <th className="px-4 py-3 text-right">Gang Size</th>
                    <th className="px-4 py-3 text-right">Duration</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">{i.phase || '-'}</td>
                        <td className="px-4 py-3 font-medium">{i.trade_role || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.gang_size || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.duration_weeks || '-'} wks</td>
                        <td className="px-4 py-3 text-right font-semibold">${Number(i.total_cost).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Labour Breakdown</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.total_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function ScheduleTasksTable({ items, onDelete, onEdit }: { items: BOQScheduleTask[], onDelete: (id: number) => void, onEdit: (item: BOQScheduleTask) => void }) {
    if (items.length === 0) return <EmptyState />;
    return (
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">WBS</th>
                    <th className="px-4 py-3">Task Description</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                    <th className="px-4 py-3 text-right">Days</th>
                    <th className="px-4 py-3 text-slate-400">Predecessor</th>
                    <th className="px-4 py-3 text-right">Est. Cost</th>
                    <th className="px-4 py-3 w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs bg-slate-100 rounded px-2">{i.wbs || '-'}</td>
                        <td className="px-4 py-3 font-medium">{i.task_description || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{i.start_date || '-'}</td>
                        <td className="px-4 py-3 text-slate-500">{i.end_date || '-'}</td>
                        <td className="px-4 py-3 text-right">{i.days || '-'}</td>
                        <td className="px-4 py-3 text-slate-400">{i.predecessor || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold">${Number(i.est_cost).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                            <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-slate-600 uppercase tracking-wider text-[10px]">Total Schedule Cost</td>
                    <td className="px-4 py-3 text-right text-emerald-700">${items.reduce((sum, i) => sum + Number(i.est_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
}

function ScheduleMaterialsTable({ items, onDelete, onEdit }: { items: BOQScheduleMaterial[], onDelete: (id: number) => void, onEdit: (item: BOQScheduleMaterial) => void }) {
    if (items.length === 0) return <EmptyState />;
    
    // Group items by section
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, BOQScheduleMaterial[]>);
    
    // Format section labels from the enum keys
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
        <div className="w-full">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                        <th className="px-4 py-3 min-w-[250px] w-1/4">Material Description</th>
                        <th className="px-4 py-3 min-w-[300px] w-1/2">Specification</th>
                        <th className="px-4 py-3 text-right min-w-[150px] w-1/4">Estimated Quantity</th>
                        <th className="px-4 py-3 text-center">AI</th>
                        <th className="px-4 py-3 w-16"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {Object.entries(groupedItems).map(([section, sectionItems]) => (
                        <Fragment key={section}>
                            {/* Section Header Row */}
                            <tr className="bg-slate-50/80 border-y border-slate-200">
                                <td colSpan={5} className="px-4 py-3 font-semibold text-slate-800 uppercase tracking-wide text-xs">
                                    {formatSection(section)}
                                </td>
                            </tr>
                            {/* Section Items */}
                            {sectionItems.map(i => (
                                <tr key={i.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium whitespace-normal break-words">{i.material_description}</td>
                                    <td className="px-4 py-3 whitespace-normal break-words text-slate-600">{i.specification || '-'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-700">{i.estimated_qty || '-'}</td>
                                    <td className="px-4 py-3 text-center text-xl">{i.is_ai_generated ? '✨' : ''}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => onEdit(i)} className="text-slate-400 hover:text-emerald-600"><Icon name="edit" className="text-lg"/></button>
                                        <button onClick={() => onDelete(i.id)} className="text-rose-400 hover:text-rose-600"><Icon name="delete" className="text-lg"/></button>
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Icon name="insert_drive_file" className="text-3xl" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No items available</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Upload an architectural plan and use the AI Analyzer to automatically populate this budget sheet.</p>
        </div>
    );
}

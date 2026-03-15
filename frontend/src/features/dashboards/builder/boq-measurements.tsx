import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { builderApi } from '@/services/api';
import type { Project, BOQItem } from '@/types/api';
import { toast } from 'sonner';
import { Link, useNavigate } from '@tanstack/react-router'
import { AiChatButton } from '@/components/ai-chat-button'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
    '1. Site Prep & Setup',
    '2. Digging & Foundation',
    '3. Concrete & Structure',
    '4. Walls & Bricks',
    '5. Water Protection',
    '6. Woodwork, Doors & Windows',
    '7. Roofing',
    '8. Plumbing',
    '9. Electricity',
    '10. Inside Finishes',
    '11. Painting & Glass',
    '12. Yard & Outside',
    '13. Extra Costs',
];

const UNITS = ['m²', 'm³', 'm', 'nr', 'kg', 'ton', 'item', 'sum', 'lot', 'bags', 'bricks', 'hours'];

const emptyForm = {
    category: '1. Site Prep & Setup', item_name: '', description: '', unit: 'm²',
    quantity: '', rate: '', labour_rate: '', measurement_formula: '', material_type: '',
    // Formula variables
    var_L: '', var_W: '', var_H: '', var_D: '',
};

// Formula calculator - evaluates expressions with variables
type FormulaVars = { L?: number; W?: number; H?: number; D?: number };

function evaluateFormula(formula: string, vars: FormulaVars): number | null {
    if (!formula) return null;
    
    // Replace multiplication symbols
    let expr = formula.replace(/×/g, '*').replace(/x/gi, '*').replace(/÷/g, '/');
    
    // Replace variables with values
    expr = expr.replace(/L/gi, String(vars.L || 0));
    expr = expr.replace(/W/gi, String(vars.W || 0));
    expr = expr.replace(/H/gi, String(vars.H || 0));
    expr = expr.replace(/D/gi, String(vars.D || 0));
    
    // Only allow numbers, operators, parentheses, and decimals
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(expr)) {
        return null;
    }
    
    try {
        // Safe evaluation
        const result = Function('"use strict"; return (' + expr + ')')();
        return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : null;
    } catch {
        return null;
    }
}

// Skeleton row for loading state
function SkeletonRow() {
    return (
        <tr className="border-b border-slate-50 bg-white">
            <td className="px-4 py-2.5"><div className="h-4 w-28 bg-slate-200 rounded animate-pulse" /></td>
            <td className="px-4 py-2.5"><div className="h-4 w-40 bg-slate-100 rounded animate-pulse" /></td>
            <td className="px-4 py-2.5 text-right"><div className="h-4 w-10 bg-slate-100 rounded animate-pulse ml-auto" /></td>
            <td className="px-4 py-2.5 text-right"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse ml-auto" /></td>
            <td className="px-4 py-2.5 text-right"><div className="h-4 w-14 bg-slate-100 rounded animate-pulse ml-auto" /></td>
            <td className="px-4 py-2.5 text-right"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto" /></td>
            <td className="px-4 py-2.5"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse ml-auto" /></td>
        </tr>
    );
}

function SkeletonTable() {
    return (
        <div>
            {/* Skeleton category header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3.5 w-36 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-5 bg-slate-200 rounded-full animate-pulse" />
                </div>
                <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-50 bg-white">
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Unit</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Qty</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Total</th>
                        <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20"></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
            </table>
        </div>
    );
}

// Thin animated loading bar
function LoadingBar() {
    return (
        <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
            <div className="h-full w-1/3 bg-emerald-500 rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]"
                style={{ animation: 'shimmer 1.2s ease-in-out infinite' }} />
            <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}

export default function BOQMeasurements() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [items, setItems] = useState<BOQItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refetching, setRefetching] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [isBudgetSigned, setIsBudgetSigned] = useState(false);
    const user = useAuthStore(state => state.auth.user);
    const navigate = useNavigate();

    // In-memory cache for BOQ items per project
    const itemsCacheRef = useRef<Map<number, BOQItem[]>>(new Map());
    const projectsCachedRef = useRef(false);

    // Fetch projects on mount — with cleanup to prevent stale updates from StrictMode double-mount
    useEffect(() => {
        if (projectsCachedRef.current && projects.length > 0) return;
        let cancelled = false;
        builderApi.getProjects()
            .then(res => {
                if (cancelled) return;
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setProjects(data);
                projectsCachedRef.current = true;
                if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load projects');
            });
        return () => { cancelled = true; };
    }, []);

    const loadItems = useCallback(() => {
        if (!selectedProject) return;
        const hasCached = itemsCacheRef.current.has(selectedProject);
        if (hasCached) {
            setRefetching(true);
        } else {
            setLoading(true);
        }
        builderApi.getProjectBOQItems(selectedProject)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setItems(data);
                itemsCacheRef.current.set(selectedProject, data);
            })
            .catch(() => toast.error('Failed to load BOQ items'))
            .finally(() => { setLoading(false); setRefetching(false); });
    }, [selectedProject]);

    // Fetch BOQ items when project changes — stale-while-revalidate
    useEffect(() => {
        let cancelled = false;
        if (!selectedProject) return;

        // Sync budget signing status from project object
        const project = projects.find(p => p.id === selectedProject);
        if (project) {
            setIsBudgetSigned(project.is_budget_signed);
        }

        // Show cached data immediately if available
        const cached = itemsCacheRef.current.get(selectedProject);
        if (cached) {
            setItems(cached);
            setRefetching(true);
        } else {
            setLoading(true);
        }

        builderApi.getProjectBOQItems(selectedProject)
            .then(res => {
                if (cancelled) return;
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setItems(data);
                itemsCacheRef.current.set(selectedProject, data);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load BOQ items');
            })
            .finally(() => {
                if (!cancelled) { setLoading(false); setRefetching(false); }
            });
        return () => { cancelled = true; };
    }, [selectedProject]);

    const handleSubmit = async () => {
        if (!form.item_name || !form.quantity || !form.rate || !selectedProject) return;
        setSaving(true);
        try {
            if (editingId) {
                await builderApi.updateBOQItem(editingId, {
                    ...form,
                    project: selectedProject as any,
                });
                toast.success('Item updated');
            } else {
                await builderApi.createBOQItem({
                    ...form,
                    project: selectedProject as any,
                });
                toast.success('Item added');
            }
            // Refresh and update cache
            loadItems();
            resetForm();
        } catch (err) {
            console.error(err);
            toast.error(editingId ? 'Failed to update item' : 'Failed to add item');
        }
        finally { setSaving(false); }
    };

    const handleEdit = (item: BOQItem) => {
        setForm({
            category: item.category,
            item_name: item.item_name,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            labour_rate: item.labour_rate || '',
            measurement_formula: item.measurement_formula || '',
            material_type: '',
            var_L: '', var_W: '', var_H: '', var_D: '',
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        // Optimistic delete — remove immediately, restore on failure
        const previousItems = items;
        const updatedItems = items.filter(i => i.id !== id);
        setItems(updatedItems);
        if (selectedProject) itemsCacheRef.current.set(selectedProject, updatedItems);
        setConfirmDeleteId(null);
        setDeleting(id);
        try {
            await builderApi.deleteBOQItem(id);
            toast.success('Item deleted');
        } catch (err) {
            console.error(err);
            // Restore on failure
            setItems(previousItems);
            if (selectedProject) itemsCacheRef.current.set(selectedProject, previousItems);
            toast.error('Failed to delete item');
        } finally {
            setDeleting(null);
        }
    };

    const resetForm = () => {
        setForm({
            category: '1. Preliminaries & General',
            item_name: '',
            description: '',
            unit: 'm²',
            quantity: '',
            rate: '',
            labour_rate: '',
            measurement_formula: '',
            material_type: '',
            var_L: '', var_W: '', var_H: '', var_D: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSignBudget = () => {
        if (!user) {
            toast.error('Please log in to sign the budget');
            return;
        }

        // Check if user has a signature in their profile
        if (!user.profile?.has_signature) {
            toast.info('Please set up your e-signature in your profile first');
            navigate({ to: '/settings' }); // Redirect to profile/settings
            return;
        }

        // Persist signing to backend
        setSaving(true);
        builderApi.updateProject(selectedProject, { is_budget_signed: true })
            .then(() => {
                setIsBudgetSigned(true);
                // Update local projects list to reflect the change
                setProjects(prev => prev.map(p => 
                    p.id === selectedProject ? { ...p, is_budget_signed: true } : p
                ));
                toast.success('Budget signed successfully', {
                    description: 'The construction budget has been officially authorized.',
                    icon: <Icon name="verified" className="text-emerald-500" />
                });
            })
            .catch(() => {
                toast.error('Failed to sign budget. Please try again.');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const toggleCategory = (cat: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };

    // ── Export helpers ──
    const exportToCSV = () => {
        if (items.length === 0) return;
        const headers = ['Category', 'Item', 'Description', 'Unit', 'Quantity', 'Rate', 'Total', 'Labour Rate', 'Formula'];
        const rows = items.map(i => [
            i.category, i.item_name, `"${i.description}"`, i.unit,
            i.quantity, i.rate, i.total_amount,
            i.labour_rate || '', i.measurement_formula || ''
        ]);
        const grandTotal = items.reduce((s, i) => s + parseFloat(i.total_amount || '0'), 0);
        rows.push(['', '', '', '', '', 'Grand Total', grandTotal.toFixed(2), '', '']);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BOQ_${selectedProjectObj?.title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToPrint = () => {
        if (items.length === 0) return;
        const grandTotal = items.reduce((s, i) => s + parseFloat(i.total_amount || '0'), 0);
        const html = `
          <html><head><title>Bill of Quantities — ${selectedProjectObj?.title || ''}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e293b; }
            h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
            .subtitle { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
            th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
            .cat-header { background: #f1f5f9; font-weight: 700; font-size: 0.75rem; }
            .total-row { font-weight: 700; background: #f0fdf4; }
            .text-right { text-align: right; }
            @media print { body { padding: 0.5rem; } }
          </style></head><body>
          <h1>📋 Bill of Quantities</h1>
          <div class="subtitle">${selectedProjectObj?.title || ''} · ${items.length} items · ${new Date().toLocaleDateString()}</div>
          <table>
            <thead><tr><th>Item</th><th>Description</th><th class="text-right">Unit</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Total</th></tr></thead>
            <tbody>
              ${Object.entries(grouped).map(([cat, catItems]) => `
                <tr class="cat-header"><td colspan="6">${cat} (${catItems.length} items) — $${catItems.reduce((s, i) => s + parseFloat(i.total_amount || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
                ${catItems.map(i => `<tr><td>${i.item_name}</td><td>${i.description || '—'}</td><td class="text-right">${i.unit}</td><td class="text-right">${parseFloat(i.quantity).toLocaleString()}</td><td class="text-right">$${parseFloat(i.rate).toLocaleString()}</td><td class="text-right">$${parseFloat(i.total_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
              `).join('')}
              <tr class="total-row"><td colspan="5" class="text-right">Grand Total</td><td class="text-right">$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
          </body></html>`;
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.print();
        }
    };

    // Group items by category (ensure standard order)
    const grouped = CATEGORIES.reduce<Record<string, BOQItem[]>>((acc, cat) => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length > 0) acc[cat] = catItems;
        return acc;
    }, {});

    // Add any items with custom categories not in the standard list
    const otherItems = items.filter(i => !CATEGORIES.includes(i.category));
    if (otherItems.length > 0) {
        // Group other items by their custom categories
        otherItems.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });
    }

    const totalValue = items.reduce((sum, i) => sum + parseFloat(i.total_amount || '0'), 0);
    const selectedProjectObj = projects.find(p => p.id === selectedProject);

    // Calculate budget breakdowns
    const budgetBreakdown = useMemo(() => {
        const materials = items.filter(i => 
            i.category.includes('Concrete') || 
            i.category.includes('Brickwork') || 
            i.category.includes('Roof') ||
            i.category.includes('Timber') ||
            i.category.includes('Plumbing') ||
            i.category.includes('Electrical') ||
            i.category.includes('Finishes')
        ).reduce((sum, i) => sum + parseFloat(i.total_amount || '0'), 0);

        const labour = items.filter(i => 
            i.category.includes('Preliminaries') || 
            i.item_name.toLowerCase().includes('labour') ||
            i.labour_rate
        ).reduce((sum, i) => sum + (parseFloat(i.labour_rate || '0') * parseFloat(i.quantity || '0')), 0);

        const machinery = items.filter(i => 
            i.item_name.toLowerCase().includes('machine') ||
            i.item_name.toLowerCase().includes('equipment') ||
            i.item_name.toLowerCase().includes('hire') ||
            i.category.includes('Earthworks')
        ).reduce((sum, i) => sum + parseFloat(i.total_amount || '0'), 0);

        const provisional = items.filter(i => 
            i.category.includes('Provisional')
        ).reduce((sum, i) => sum + parseFloat(i.total_amount || '0'), 0);

        // Estimate material quantities based on common construction ratios
        const estimatedBricks = Math.floor((totalValue * 0.15) / 0.85); // ~15% of budget on bricks
        const estimatedCement = Math.floor((totalValue * 0.08) / 12.5); // ~8% on cement
        const estimatedSand = Math.floor((totalValue * 0.06) / 45); // ~6% on sand
        const estimatedSteel = Math.floor((totalValue * 0.12) / 2.8); // ~12% on steel

        return {
            materials,
            labour,
            machinery,
            provisional,
            estimatedBricks,
            estimatedCement,
            estimatedSand,
            estimatedSteel,
            materialPercentage: totalValue > 0 ? (materials / totalValue) * 100 : 0,
            labourPercentage: totalValue > 0 ? (labour / totalValue) * 100 : 0,
            machineryPercentage: totalValue > 0 ? (machinery / totalValue) * 100 : 0,
        };
    }, [items, totalValue]);

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Icon name="receipt_long" className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">Construction Budget</h2>
                        <p className="text-xs text-slate-500">Full project cost breakdown including materials, labour & machinery</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Project Selector */}
                    <select
                        value={selectedProject || ''}
                        onChange={e => setSelectedProject(Number(e.target.value))}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-w-[200px]"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                    {/* Export buttons */}
                    {items.length > 0 && (
                        <>
                            <button
                                onClick={exportToCSV}
                                className="bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
                                title="Export to CSV"
                            >
                                <Icon name="download" size={14} /> CSV
                            </button>
                            <button
                                onClick={exportToPrint}
                                className="bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
                                title="Print BOQ"
                            >
                                <Icon name="print" size={14} /> Print
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        disabled={!selectedProject}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                        <Icon name="add" size={14} /> Add Item
                    </button>
                </div>
            </div>

            {/* Compact Budget Stats */}
            {selectedProject && !loading && (
                <div className="space-y-3">
                    {/* Main Budget Summary - Compact Horizontal */}
                    <div className="flex flex-wrap items-center gap-4 bg-white rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center">
                                <Icon name="account_balance" size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Budget</p>
                                <span className="text-lg font-bold text-emerald-700">${totalValue.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500">Materials</span>
                                <span className="font-semibold text-blue-600">${budgetBreakdown.materials.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400">({Math.round(budgetBreakdown.materialPercentage)}%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500">Labour</span>
                                <span className="font-semibold text-amber-600">${budgetBreakdown.labour.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400">({Math.round(budgetBreakdown.labourPercentage)}%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500">Machinery</span>
                                <span className="font-semibold text-purple-600">${budgetBreakdown.machinery.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400">({Math.round(budgetBreakdown.machineryPercentage)}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Material Estimates - Compact Row */}
                    {items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: 'foundation', color: 'orange', label: 'Bricks', value: budgetBreakdown.estimatedBricks, unit: '', cost: budgetBreakdown.estimatedBricks * 0.85 },
                                { icon: 'inventory_2', color: 'slate', label: 'Cement', value: budgetBreakdown.estimatedCement, unit: 'bags', cost: budgetBreakdown.estimatedCement * 18 },
                                { icon: 'grain', color: 'yellow', label: 'Sand', value: budgetBreakdown.estimatedSand, unit: 'm³', cost: budgetBreakdown.estimatedSand * 45 },
                                { icon: 'straighten', color: 'slate', label: 'Steel', value: budgetBreakdown.estimatedSteel, unit: 'kg', cost: budgetBreakdown.estimatedSteel * 2.8 },
                                { icon: 'schedule', color: 'green', label: 'Labour', value: Math.floor(budgetBreakdown.labour / 25), unit: 'hrs', cost: null },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2 bg-white rounded-md border border-slate-200 px-3 py-2">
                                    <div className={`h-6 w-6 rounded bg-${item.color}-100 flex items-center justify-center shrink-0`}>
                                        <Icon name={item.icon} size={14} className={`text-${item.color}-600`} />
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-sm font-semibold text-slate-900">{item.value.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-500">{item.unit}</span>
                                        {item.cost !== null && (
                                            <span className="text-[10px] text-slate-400">~${item.cost.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                            {editingId ? 'Edit BOQ Item' : 'Add BOQ Item'}
                        </h3>
                        <button onClick={resetForm} className="p-1 hover:bg-slate-100 rounded">
                            <Icon name="close" size={16} className="text-slate-400" />
                        </button>
                    </div>
                    {/* Section 1 — Item Details */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Trade Bill (Category)</label>
                                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Item Name</label>
                                <input value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} placeholder="e.g. Strip Footing" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unit</label>
                                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed description of the work item" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2 — Quantity & Measurement */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity & Measurement</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    Quantity
                                    {form.measurement_formula && <span className="text-[10px] text-emerald-600 font-normal">(auto from formula)</span>}
                                </label>
                                <input
                                    value={form.quantity}
                                    onChange={e => setForm({...form, quantity: e.target.value})}
                                    placeholder="0"
                                    type="number"
                                    step="0.01"
                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Formula (optional)</label>
                                <input
                                    value={form.measurement_formula}
                                    onChange={e => {
                                        const newFormula = e.target.value;
                                        setForm(prev => {
                                            const vars: FormulaVars = {
                                                L: parseFloat(prev.var_L || '0') || 0,
                                                W: parseFloat(prev.var_W || '0') || 0,
                                                H: parseFloat(prev.var_H || '0') || 0,
                                                D: parseFloat(prev.var_D || '0') || 0,
                                            };
                                            const calculated = evaluateFormula(newFormula, vars);
                                            return {
                                                ...prev,
                                                measurement_formula: newFormula,
                                                quantity: calculated !== null ? String(calculated.toFixed(2)) : prev.quantity
                                            };
                                        });
                                    }}
                                    placeholder="e.g. L*W*H"
                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                            <div className="flex items-end pb-1">
                                {form.measurement_formula && form.quantity && (
                                    <span className="text-xs text-slate-500">= <span className="font-semibold text-slate-700">{parseFloat(form.quantity || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> {form.unit}</span>
                                )}
                            </div>
                        </div>

                        {/* Formula Variables - Show when formula has variables */}
                        {form.measurement_formula && /[LWHDI]/i.test(form.measurement_formula) && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Icon name="calculate" size={16} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-600">Formula Calculator</span>
                                    <span className="text-xs text-slate-400 font-mono bg-white px-2 py-0.5 rounded border">{form.measurement_formula}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Length (L)</label>
                                        <input
                                            value={form.var_L}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setForm(prev => {
                                                    const vars: FormulaVars = {
                                                        L: parseFloat(val || '0') || 0,
                                                        W: parseFloat(prev.var_W || '0') || 0,
                                                        H: parseFloat(prev.var_H || '0') || 0,
                                                        D: parseFloat(prev.var_D || '0') || 0,
                                                    };
                                                    const calculated = evaluateFormula(prev.measurement_formula, vars);
                                                    return {
                                                        ...prev,
                                                        var_L: val,
                                                        quantity: calculated !== null ? String(calculated.toFixed(2)) : prev.quantity
                                                    };
                                                });
                                            }}
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Width (W)</label>
                                        <input
                                            value={form.var_W}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setForm(prev => {
                                                    const vars: FormulaVars = {
                                                        L: parseFloat(prev.var_L || '0') || 0,
                                                        W: parseFloat(val || '0') || 0,
                                                        H: parseFloat(prev.var_H || '0') || 0,
                                                        D: parseFloat(prev.var_D || '0') || 0,
                                                    };
                                                    const calculated = evaluateFormula(prev.measurement_formula, vars);
                                                    return {
                                                        ...prev,
                                                        var_W: val,
                                                        quantity: calculated !== null ? String(calculated.toFixed(2)) : prev.quantity
                                                    };
                                                });
                                            }}
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Height (H)</label>
                                        <input
                                            value={form.var_H}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setForm(prev => {
                                                    const vars: FormulaVars = {
                                                        L: parseFloat(prev.var_L || '0') || 0,
                                                        W: parseFloat(prev.var_W || '0') || 0,
                                                        H: parseFloat(val || '0') || 0,
                                                        D: parseFloat(prev.var_D || '0') || 0,
                                                    };
                                                    const calculated = evaluateFormula(prev.measurement_formula, vars);
                                                    return {
                                                        ...prev,
                                                        var_H: val,
                                                        quantity: calculated !== null ? String(calculated.toFixed(2)) : prev.quantity
                                                    };
                                                });
                                            }}
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Depth/Dia (D)</label>
                                        <input
                                            value={form.var_D}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setForm(prev => {
                                                    const vars: FormulaVars = {
                                                        L: parseFloat(prev.var_L || '0') || 0,
                                                        W: parseFloat(prev.var_W || '0') || 0,
                                                        H: parseFloat(prev.var_H || '0') || 0,
                                                        D: parseFloat(val || '0') || 0,
                                                    };
                                                    const calculated = evaluateFormula(prev.measurement_formula, vars);
                                                    return {
                                                        ...prev,
                                                        var_D: val,
                                                        quantity: calculated !== null ? String(calculated.toFixed(2)) : prev.quantity
                                                    };
                                                });
                                            }}
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Use L, W, H, D in formula. Operators: + - * / ( )</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3 — Pricing */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Material Rate ($)</label>
                                <input value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} placeholder="0.00" type="number" step="0.01" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Labour Rate ($, optional)</label>
                                <input value={form.labour_rate} onChange={e => setForm({...form, labour_rate: e.target.value})} placeholder="0.00" type="number" step="0.01" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div className="flex items-end pb-1">
                                {form.quantity && form.rate ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 w-full flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-emerald-700 font-medium">Total: </span>
                                            <span className="text-emerald-800 font-bold">
                                                ${(parseFloat(form.quantity || '0') * parseFloat(form.rate || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {form.category.includes('Provisional') && (
                                            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Estimate</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 pb-2">Enter quantity & rate to see total</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={resetForm} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
                        <button onClick={handleSubmit} disabled={saving || !form.item_name || !form.quantity || !form.rate} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                            {saving && <Icon name="progress_activity" size={14} className="animate-spin" />}
                            {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </div>
            )}

            {/* BOQ Table — grouped by category */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Background refetch loading bar */}
                {refetching && <LoadingBar />}
                {!selectedProject ? (
                    <div className="text-center py-12">
                        <Icon name="assignment" size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Select a project to view its BOQ.</p>
                    </div>
                ) : loading ? (
                    <SkeletonTable />
                ) : items.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                            <Icon name="assignment" size={24} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">No Budget Items</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                            Start building your construction budget by adding items manually.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm mx-auto"
                        >
                            <Icon name="add" size={14} /> Add First Item
                        </button>
                    </div>
                ) : (
                    <div>
                        {Object.entries(grouped).map(([category, catItems]) => {
                            const catTotal = catItems.reduce((s, i) => s + parseFloat(i.total_amount || '0'), 0);
                            const isCollapsed = collapsedCategories.has(category);
                            return (
                                <div key={category}>
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isCollapsed ? <Icon name="keyboard_arrow_right" size={14} className="text-slate-400" /> : <Icon name="keyboard_arrow_down" size={14} className="text-slate-400" />}
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{category}</span>
                                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{catItems.length}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">${catTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </button>
                                    {/* Items Table */}
                                    {!isCollapsed && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-50 bg-white">
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Unit</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Qty</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Rate</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Total</th>
                                                    <th className="px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {catItems.map(item => (
                                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-200 group bg-white animate-[fadeIn_0.2s_ease-in]">
                                                        <td className="px-4 py-2.5 text-sm font-medium text-slate-800">
                                                            {item.item_name}
                                                            {category.includes('Provisional') && (
                                                                <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-1.5 text-[8px] font-bold uppercase text-amber-600 ring-1 ring-inset ring-amber-500/10">PC SUM</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-xs text-slate-500 max-w-[200px] truncate">{item.description || '—'}</td>
                                                        <td className="px-4 py-2.5 text-xs text-slate-500 text-right">{item.unit}</td>
                                                        <td className="px-4 py-2.5 text-sm text-slate-700 text-right font-medium">{(item.quantity === '0.00' || item.quantity === '0' || !item.quantity) ? <span className="text-slate-300">—</span> : parseFloat(item.quantity).toLocaleString()}</td>
                                                        <td className="px-4 py-2.5 text-sm text-slate-700 text-right">{(item.rate === '0.00' || item.rate === '0' || !item.rate) ? <span className="text-slate-300">—</span> : `$${parseFloat(item.rate).toLocaleString()}`}</td>
                                                        <td className="px-4 py-2.5 text-sm font-bold text-slate-900 text-right">{(item.total_amount === '0.00' || item.total_amount === '0' || !item.total_amount) ? <span className="text-slate-300">—</span> : `$${parseFloat(item.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</td>
                                                        <td className="px-4 py-2.5">
                                                            {confirmDeleteId === item.id ? (
                                                                <div className="flex gap-1 items-center justify-end">
                                                                    <button
                                                                        onClick={() => handleDelete(item.id)}
                                                                        disabled={deleting === item.id}
                                                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                                                                    >
                                                                        {deleting === item.id ? <Icon name="progress_activity" size={10} className="animate-spin" /> : null}
                                                                        Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded transition-colors"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-blue-50 rounded transition-colors" title={!parseFloat(item.quantity) ? "Fill Amount" : "Edit"}>
                                                                        <Icon name="edit" size={13} className="text-slate-400 hover:text-blue-500" />
                                                                    </button>
                                                                    <button onClick={() => setConfirmDeleteId(item.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                                        <Icon name="delete" size={13} className="text-slate-400 hover:text-red-500" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            );
                        })}
                        {/* Grand Total Footer */}
                        <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-t border-emerald-200">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Grand Total</span>
                            <span className="text-base font-bold text-emerald-700">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {/* Signature & Procurement Section */}
                        {selectedProject && items.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-slate-200">
                                {/* Sign Budget Button */}
                                {!isBudgetSigned ? (
                                    <Button
                                        onClick={handleSignBudget}
                                        disabled={saving}
                                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-8 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                                    >
                                        {saving ? (
                                            <Icon name="progress_activity" size={16} className="animate-spin" />
                                        ) : (
                                            <Icon name="edit_note" size={18} className="-ml-1" />
                                        )}
                                        {saving ? 'Signing...' : 'Sign Budget'}
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
                                        <Icon name="verified" size={18} className="text-emerald-600" />
                                        <span className="text-sm font-semibold">Budget Signed</span>
                                    </div>
                                )}
                                {/* Procure Materials Button */}
                                <Link
                                    to="/builder/procurement"
                                    search={{ projectId: selectedProject }}
                                    className={`text-white text-xs font-bold h-8 px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
                                        isBudgetSigned 
                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                            : 'bg-slate-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                    onClick={(e) => {
                                        if (!isBudgetSigned) {
                                            e.preventDefault();
                                            toast.error('Please sign the budget first before procuring materials');
                                        }
                                    }}
                                >
                                    <Icon name="inventory_2" size={18} className="-ml-1" /> Procure Materials
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {selectedProject && (() => {
                const project = projects.find(p => p.id === selectedProject);
                return project ? <AiChatButton project={project} /> : null;
            })()}
        </div>
    );
}

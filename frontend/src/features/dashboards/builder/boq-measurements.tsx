import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect, useCallback } from 'react';
import { builderApi } from '@/services/api';
import type { Project, BOQItem } from '@/types/api';
import { toast } from 'sonner';

const CATEGORIES = [
    '1. Preliminaries & General',
    '2. Earthworks & Excavation',
    '3. Concrete, Formwork & Reinforcement',
    '4. Brickwork & Blockwork',
    '5. Waterproofing',
    '6. Carpentry, Joinery & Ironmongery',
    '7. Roof Coverings',
    '8. Plumbing & Drainage',
    '9. Electrical Installations',
    '10. Floor, Wall & Ceiling Finishes',
    '11. Glazing & Painting',
    '12. External Works',
    '13. Provisional & Prime Cost Sums',
];

const UNITS = ['m²', 'm³', 'm', 'nr', 'kg', 'ton', 'item', 'sum', 'lot'];

const emptyForm = {
    category: '1. Preliminaries & General', item_name: '', description: '', unit: 'm²',
    quantity: '', rate: '', labour_rate: '', measurement_formula: '',
};

export default function BOQMeasurements() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [items, setItems] = useState<BOQItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    // Fetch projects on mount — with cleanup to prevent stale updates from StrictMode double-mount
    useEffect(() => {
        let cancelled = false;
        builderApi.getProjects()
            .then(res => {
                if (cancelled) return;
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setProjects(data);
                if (data.length > 0) setSelectedProject(data[0].id);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load projects');
            });
        return () => { cancelled = true; };
    }, []);

    const loadItems = useCallback(() => {
        if (!selectedProject) return;
        setLoading(true);
        builderApi.getProjectBOQItems(selectedProject)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setItems(data);
            })
            .catch(() => toast.error('Failed to load BOQ items'))
            .finally(() => setLoading(false));
    }, [selectedProject]);

    // Fetch BOQ items when project changes — with cleanup
    useEffect(() => {
        let cancelled = false;
        if (!selectedProject) return;
        setLoading(true);
        builderApi.getProjectBOQItems(selectedProject)
            .then(res => {
                if (cancelled) return;
                const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
                setItems(data);
            })
            .catch(() => {
                if (!cancelled) toast.error('Failed to load BOQ items');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [selectedProject]);

    const handleGenerateTemplate = async () => {
        if (!selectedProject) return;
        setGenerating(true);
        try {
            await builderApi.generateBOQTemplate(selectedProject);
            loadItems();
            toast.success('Standard BOQ template generated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate template. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

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
            // Refresh
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
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        setDeleting(id);
        try {
            await builderApi.deleteBOQItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success('Item deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete item');
        } finally {
            setDeleting(null);
            setConfirmDeleteId(null);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
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
    const categoryCount = Object.keys(grouped).length;
    const selectedProjectObj = projects.find(p => p.id === selectedProject);

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Icon name="assignment" className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">Bill of Quantities</h2>
                        <p className="text-xs text-slate-500">Manage standard BOQ items</p>
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
                    {items.length === 0 && selectedProject && (
                        <button
                            onClick={handleGenerateTemplate}
                            disabled={generating}
                            className="bg-amber-100/50 hover:bg-amber-100 text-amber-700 disabled:opacity-50 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm border border-amber-200"
                        >
                            {generating ? <Icon name="progress_activity" size={14} className="animate-spin" /> : <Icon name="auto_fix_high" size={14} />} 
                            {generating ? 'Generating...' : 'Standard Template'}
                        </button>
                    )}
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

            {/* Stats Row */}
            {selectedProject && !loading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                        <span className="text-sm font-bold text-slate-900 line-clamp-1">{selectedProjectObj?.title}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Items</p>
                        <span className="text-2xl font-bold text-slate-900">{items.length}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Trade Bills</p>
                        <span className="text-2xl font-bold text-slate-900">{categoryCount}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-emerald-200/50 p-4">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Total Value</p>
                        <span className="text-2xl font-bold text-emerald-600">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quantity</label>
                            <input value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" type="number" step="0.01" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rate ($)</label>
                            <input value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} placeholder="0.00" type="number" step="0.01" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Labour Rate ($)</label>
                            <input value={form.labour_rate} onChange={e => setForm({...form, labour_rate: e.target.value})} placeholder="Optional" type="number" step="0.01" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Formula</label>
                            <input value={form.measurement_formula} onChange={e => setForm({...form, measurement_formula: e.target.value})} placeholder="e.g. L×W×D" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                    </div>
                    {/* Live total preview */}
                    {form.quantity && form.rate && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm flex items-center justify-between">
                            <div>
                                <span className="text-emerald-700 font-medium">Line Total: </span>
                                <span className="text-emerald-800 font-bold">
                                    ${(parseFloat(form.quantity || '0') * parseFloat(form.rate || '0')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {form.category.includes('Provisional') && (
                                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Cost Estimate</span>
                            )}
                        </div>
                    )}
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
                {!selectedProject ? (
                    <div className="text-center py-12">
                        <Icon name="assignment" size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Select a project to view its BOQ.</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Icon name="progress_activity" className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Icon name="assignment" size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Bill of Quantities</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                            Start building your standard BOQ from scratch or generate a prepopulated template based on standard ZIQS Trade Bills.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleGenerateTemplate}
                                disabled={generating}
                                className="bg-amber-100/50 hover:bg-amber-100 text-amber-700 border border-amber-200 disabled:opacity-50 text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                {generating ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="auto_fix_high" size={16} />} 
                                {generating ? 'Generating...' : 'Standard Template'}
                            </button>
                            <span className="text-xs text-slate-400 font-medium">OR</span>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Icon name="add" size={16} /> Enter Manually
                            </button>
                        </div>
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
                                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group bg-white">
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
                    </div>
                )}
            </div>
        </div>
    );
}

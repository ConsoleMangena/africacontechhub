import { useState, useEffect } from 'react';
import { builderApi } from '@/services/api';
import type { MaterialPool, MaterialPoolCommitment, Project } from '@/types/api';
import { Package, Truck, Landmark, Send, ArrowRight, Share2, Printer, MapPin, XCircle, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplyChainAggregator({ projectId }: { projectId?: number }) {
    const [activeTab, setActiveTab] = useState<'pools' | 'fleet' | 'clearing'>('pools');
    
    const [pools, setPools] = useState<MaterialPool[]>([]);
    const [commitments, setCommitments] = useState<MaterialPoolCommitment[]>([]);
    const [loading, setLoading] = useState(true);

    const [fleetManifest, setFleetManifest] = useState<any[]>([]);
    const [clearingInflows, setClearingInflows] = useState<any[]>([]);

    const getLogisticsAdjustment = (source: string) => {
        return source.toLowerCase().includes('harare') ? 0 : 50;
    };

    const fetchPools = async () => {
        try {
            const res = await builderApi.getMaterialPools();
            setPools(res.data.results || []);
        } catch {
            toast.error("Failed to fetch pools");
        }
    };

    const fetchCommitments = async () => {
        try {
            const res = await builderApi.getPoolCommitments(projectId);
            setCommitments(res.data || []);
        } catch {
            toast.error("Failed to fetch commitments");
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPools(), fetchCommitments()]).finally(() => setLoading(false));
    }, [projectId]);

    const handleJoinPool = async (poolId: number, qty: number) => {
        if (!projectId) {
            toast.error("You must have an active project to join a pool.");
            return;
        }
        try {
            await builderApi.joinPool(poolId, { projectId, quantity: String(qty) });
            toast.success("Successfully locked into material pool.");
            fetchPools();
            fetchCommitments();
        } catch {
            toast.error("Error joining pool.");
        }
    };

    const handleCancel = async (commitmentId: number) => {
        try {
            await builderApi.cancelCommitment(commitmentId);
            toast.success("Commitment cancelled.");
            fetchPools();
            fetchCommitments();
        } catch {
            toast.error("Failed to cancel commitment.");
        }
    };

    // Calculate dynamic clearing additions based on user commitments
    const dynamicClearingInflows = [
        ...clearingInflows,
        ...commitments.filter(c => c.status === 'LOCKED').map(c => ({
            id: `TX-C${c.id}`,
            type: 'Deposit Lock',
            entity: 'Self',
            amount: Number(c.deposit_paid),
            status: 'Cleared',
            ref: 'PLATFORM-ESCROW'
        }))
    ];
    const totalPoolFunds = dynamicClearingInflows.reduce((acc, tx) => acc + tx.amount, 0);

    const activeSavings = commitments.reduce((acc, c) => {
        // c.pool could be an object if we serialized depth, or an ID. Assuming object or ID fallback to find:
        const poolId = typeof c.pool === 'object' ? (c.pool as any).id : c.pool;
        const pool = pools.find(p => p.id === poolId);
        if (pool && pool.tier_2_discount) {
            return acc + (Number(c.quantity) * Number(pool.tier_2_discount));
        }
        return acc;
    }, 0);

    const shareMilkRun = () => {
        if (fleetManifest.length === 0) {
            toast.error("No active fleet manifest present.");
            return;
        }
        const truck = fleetManifest[0];
        let text = `*DzeNhare Logistics: MILK RUN MANIFEST*\n`;
        text += `*Route:* ${truck.route}\n`;
        text += `*Load:* ${truck.currentLoad.toLocaleString()}kg (${truck.utilization}%)\n\n`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading supply chain engine...</div>;
    }

    return (
        <div className="fade-in w-full h-full overflow-y-auto px-4 py-8 space-y-8 bg-white">
            {/* Header */}
            <div className="bg-white p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                         <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Supply Chain Aggregator</h1>
                    </div>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        Consolidating fragmented demand into wholesale power. Syncing site requirements with manufacturer production batches and optimized delivery routes.
                    </p>
                </div>
                <div className="flex gap-8 items-center border border-slate-200 p-4 rounded-xl">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Weekly Bulk Vol</p>
                        <p className="text-xl font-bold text-slate-800">{pools.reduce((acc, p) => acc + Number(p.current_volume), 0).toLocaleString()}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Aggregated Profit</p>
                        <p className="text-xl font-bold text-slate-800">${activeSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200 px-4">
                <button 
                    onClick={() => setActiveTab('pools')} 
                    className={`flex items-center gap-2 py-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'pools' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Package className="w-4 h-4" /> Pool Command
                </button>
                <button 
                    onClick={() => setActiveTab('fleet')} 
                    className={`flex items-center gap-2 py-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'fleet' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Truck className="w-4 h-4" /> Fleet Tetris
                </button>
                <button 
                    onClick={() => setActiveTab('clearing')} 
                    className={`flex items-center gap-2 py-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'clearing' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Landmark className="w-4 h-4" /> Clearing House
                </button>
            </div>

            {/* POOLS TAB */}
            {activeTab === 'pools' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-800">Active Material Pools</h3>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="pb-3 px-2 text-center">Pool ID</th>
                                            <th className="pb-3">Material</th>
                                            <th className="pb-3 text-right">MOQ Tier 2</th>
                                            <th className="pb-3 text-right">Current Vol</th>
                                            <th className="pb-3 text-right">Pricing Info</th>
                                            <th className="pb-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {pools.map(pool => {
                                            const adjustment = getLogisticsAdjustment(pool.source_location);
                                            const hasJoined = commitments.some(c => c.pool === pool.id && c.status === 'LOCKED');
                                            return (
                                                <tr key={pool.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-2 font-mono font-bold text-slate-400 text-center">P-{pool.id.toString().padStart(3,'0')}</td>
                                                    <td className="py-4">
                                                        <p className="font-bold text-slate-800">{pool.name}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><MapPin className="w-3 h-3"/> {pool.supplier} — {pool.source_location}</p>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <p className="font-mono font-bold text-slate-400">{pool.moq.toLocaleString()}</p>
                                                    </td>
                                                    <td className="py-4 font-mono font-black text-right text-slate-900">{Number(pool.current_volume).toLocaleString()}</td>
                                                    <td className="py-4 text-right">
                                                        <p className="font-mono font-bold text-slate-900">${pool.base_price}</p>
                                                        {adjustment > 0 ? (
                                                            <span className="text-[10px] font-black text-amber-600">+$ {adjustment} Log.</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-emerald-600">Local Ship</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <button 
                                                            disabled={pool.status !== 'OPEN' || hasJoined}
                                                            onClick={() => handleJoinPool(pool.id, 50)} // Hardcoded qty for demo
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                pool.status !== 'OPEN' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : hasJoined ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                                                            }`}>
                                                            {pool.status !== 'OPEN' ? pool.status : hasJoined ? 'JOINED' : 'JOIN POOL (50)'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {pools.length === 0 && (
                                            <tr><td colSpan={6} className="py-8 text-center text-slate-400">No active pools currently open.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6">Your Material Commitments</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="pb-3 px-2 text-center">Commitment ID</th>
                                            <th className="pb-3 text-center">Pool</th>
                                            <th className="pb-3 text-right">Qty</th>
                                            <th className="pb-3 text-right">Deposit Paid</th>
                                            <th className="pb-3 text-center">Status</th>
                                            <th className="pb-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {commitments.map(c => (
                                            <tr key={c.id} className={`transition-colors ${c.status === 'CANCELLED' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                                                <td className="py-4 px-2 font-mono font-bold text-slate-400 text-center">C-{c.id}</td>
                                                <td className="py-4 font-bold text-center text-slate-800">{c.pool_details?.name || c.pool}</td>
                                                <td className="py-4 font-mono font-black text-right text-slate-900">{Number(c.quantity).toLocaleString()}</td>
                                                <td className="py-4 font-mono font-bold text-right text-emerald-600">${Number(c.deposit_paid).toLocaleString()}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${c.status === 'LOCKED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{c.status}</span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    {c.status === 'LOCKED' && (
                                                        <button onClick={() => handleCancel(c.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {commitments.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-10 text-center text-slate-400 italic">No active commitments found. Join a pool to secure wholesale pricing.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-full relative">
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6">MOQ Gap Analysis</h3>
                                {pools.map(pool => (
                                    <div key={pool.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{pool.name}</p>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <p className="text-xl font-bold text-slate-900">{pool.moq - Number(pool.current_volume) > 0 ? (pool.moq - Number(pool.current_volume)).toLocaleString() : 'MET'}</p>
                                            <p className="text-xs font-semibold text-slate-500">UNITS REC.</p>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1 mb-2 overflow-hidden">
                                            <div className="bg-slate-800 h-full transition-all" style={{ width: `${Math.min((Number(pool.current_volume) / pool.moq) * 100, 100)}%` }}></div>
                                        </div>
                                        <p className="text-xs text-slate-500">Target: {pool.moq} to unlock Tier 2 (${pool.tier_2_discount} off)</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 flex items-center justify-center gap-2 transition-colors mt-8 rounded-lg text-sm">
                                <Send className="w-4 h-4" /> Notify Suppliers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FLEET TETRIS TAB */}
            {activeTab === 'fleet' && (
                <div className="grid grid-cols-1 gap-8 fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Fleet Manifest (Utilization Engine)</h3>
                                <p className="text-xs text-slate-500 font-medium">Maximizing Bin Packing for 30-Tonne Rigs.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={shareMilkRun} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                                    <Share2 className="w-4 h-4" /> Share to WhatsApp
                                </button>
                                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 transition-colors">
                                    <Printer className="w-4 h-4" /> Print Manifest
                                </button>
                            </div>
                        </div>

                        {/* Truck Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                             {fleetManifest.length === 0 && (
                                 <div className="col-span-full py-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                                    <p className="text-slate-400 font-semibold text-sm">No active dispatches currently planned.</p>
                                 </div>
                             )}
                             {fleetManifest.map(truck => (
                                 <div key={truck.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative">
                                     <span className="absolute top-3 right-3 text-[10px] font-black text-slate-400 flex items-center gap-1"><Truck className="w-3 h-3" /> {truck.id}</span>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Route & Load</p>
                                     <p className="text-sm font-black text-slate-800 mb-4">{truck.route}</p>
                                     
                                     <div className="flex justify-between text-xs font-bold mb-1">
                                         <span>{truck.utilization}% Full</span>
                                         <span>{(truck.currentLoad/1000)}T / 30T</span>
                                     </div>
                                     <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                         <div className={`h-full ${truck.utilization >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${truck.utilization}%` }}></div>
                                     </div>
                                 </div>
                             ))}
                        </div>

                        {/* Cost Splitting Logic */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div>
                                    <h4 className="text-base font-semibold text-slate-800 mb-1">Fair-Share Cost Allocation</h4>
                                    <p className="text-xs font-semibold text-slate-400">Base Trip Cost: $600.00 (Harare &rarr; Gweru)</p>
                                </div>
                                <div className="hidden sm:grid sm:grid-cols-3 gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1 leading-none">--</p>
                                        <p className="text-xl font-mono md:font-semibold text-slate-400">$0.00</p>
                                        <p className="text-[8px] font-medium text-slate-400">-% Load share</p>
                                    </div>
                                    <div className="text-right border-l border-slate-100 pl-6">
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1 leading-none">--</p>
                                        <p className="text-xl font-mono md:font-semibold text-slate-400">$0.00</p>
                                    </div>
                                    <div className="text-right border-l border-slate-100 pl-6">
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1 leading-none">--</p>
                                        <p className="text-xl font-mono md:font-semibold text-slate-400">$0.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CLEARING HOUSE TAB */}
            {activeTab === 'clearing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center justify-between">
                                Inflows: Escrow &rarr; Clearing
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black italic">VERIFIED BY BANK</span>
                            </h3>
                            <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="pb-3 px-2">TX ID</th>
                                            <th className="pb-3 text-center">Type</th>
                                            <th className="pb-3">Source Entity</th>
                                            <th className="pb-3 text-right">Amount ($)</th>
                                            <th className="pb-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-medium">
                                        {dynamicClearingInflows.map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-2 font-mono font-bold text-slate-400 text-xs">{tx.id}</td>
                                                <td className="py-4 text-center">
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">{tx.type}</span>
                                                </td>
                                                <td className="py-4 font-bold text-slate-800">{tx.entity} <span className="block text-[10px] text-slate-400 font-medium">{tx.ref}</span></td>
                                                <td className="py-4 font-mono font-black text-right text-slate-900">${tx.amount.toLocaleString()}</td>
                                                <td className="py-4 text-center">
                                                    <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-900 text-white">
                                            <td colSpan={3} className="py-4 px-6 uppercase font-black tracking-widest text-xs">Total Pool Funds</td>
                                            <td className="py-4 font-mono font-black text-right text-xl pr-6">${totalPoolFunds.toLocaleString()}</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                 </table>
                            </div>
                        </div>

                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center justify-between">
                                Outflows: Bulk Execution
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black">WHOLESALE PO GENERATED</span>
                            </h3>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-105 transition-transform font-black text-blue-600">PO</div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">Sino-Zim / Bulk Cement</p>
                                            <h4 className="text-base font-black text-slate-800">PO-BATCH-01</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-mono font-black text-slate-900">$5,985.00</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Awaiting Wire</p>
                                    </div>
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-6">Fiduciary Reconciliation</h3>
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center text-sm font-semibold pb-3 border-b border-slate-100">
                                        <span className="text-slate-500">Collected (Inflows)</span>
                                        <span className="font-mono text-slate-900">${totalPoolFunds.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold pb-3 border-b border-slate-100">
                                        <span className="text-slate-500">Bulk PO (Outflow)</span>
                                        <span className="font-mono text-slate-900">($5,985.00)</span>
                                    </div>
                                    
                                    <div className="pt-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Net Balance Variance</p>
                                        <p className="text-2xl font-mono font-semibold text-slate-800">${(totalPoolFunds - 5985).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-sm mt-8 flex items-center justify-center gap-2 transition-colors">
                                <Landmark className="w-4 h-4" /> Authorize Settlement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

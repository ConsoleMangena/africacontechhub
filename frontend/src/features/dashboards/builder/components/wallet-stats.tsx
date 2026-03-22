import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
interface WalletStatsProps {
    totalBudget: number;
}

export function WalletRates({ totalBudget }: WalletStatsProps) {
    const [showWalletDetails, setShowWalletDetails] = useState(false)

    const balances = {
        USD: totalBudget,
        ZiG: totalBudget * 28.5,
        GBP: totalBudget * 0.79,
    }

    return (
        <div
            className="rounded-xl border border-slate-200 p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-slate-900 cursor-pointer hover:shadow-sm transition-all group bg-white relative overflow-hidden"
            onClick={() => setShowWalletDetails(!showWalletDetails)}
        >
            {/* Static Sync Reference */}
            <div className="absolute top-0 right-0 p-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Synced</span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:min-w-[160px]">
                <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Icon name="public" size={16} className="text-slate-400" />
                </div>
                <div>
                    <h3 className="text-slate-900 text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">FX Oracle</h3>
                    <p className="text-slate-500 text-[9px] leading-none uppercase tracking-tighter">Real-time parity</p>
                </div>
            </div>

            <div className="flex flex-1 items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-slate-400">USD</span>
                    <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-1">
                        ${balances.USD.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-slate-400">GBP</span>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700">
                        £{balances.GBP.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-slate-400">ZiG</span>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700">
                        Z${balances.ZiG.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            {showWalletDetails && (
                <div className="flex gap-1.5 mt-2 sm:mt-0 sm:ml-auto">
                    <button className="bg-slate-900 border-none text-white rounded-md px-3 py-1.5 text-[9px] font-bold transition-all uppercase tracking-widest hover:bg-slate-800">
                        Convert Currency
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-md px-3 py-1.5 text-[9px] font-bold transition-all uppercase tracking-widest">
                        Exch. History
                    </button>
                </div>
            )}
        </div>
    )
}

export function WalletStats({ totalBudget }: WalletStatsProps) {
    const balances = {
        USD: totalBudget,
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 overflow-hidden shadow-none rounded-xl">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Icon name="wallet" size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Liquidity Pool</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">${balances.USD.toLocaleString()}</div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">85% Allotment</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none rounded-xl">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Icon name="monitoring" size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Burn Velocity</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">Nominal</div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Matches capacity</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none rounded-xl">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Icon name="schedule" size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Slippage Audit</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">$0.00</div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Zero Variance</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none rounded-xl">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Icon name="trending_down" size={20} className="text-slate-400" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Capital Salvage</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight text-emerald-900">$4,250</div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Direct Sourcing</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

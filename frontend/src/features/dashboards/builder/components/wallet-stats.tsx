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
            {/* Real-time Sync Indicator */}
            <div className="absolute top-0 right-0 p-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">Live Sync</span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:min-w-[160px]">
                <div className="p-1.5 bg-blue-50/80 rounded-lg border border-blue-100/50">
                    <Icon name="public" size={16} className="text-blue-600 animate-[spin_8s_linear_infinite]" />
                </div>
                <div>
                    <h3 className="text-slate-800 text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Wallet Rates</h3>
                    <p className="text-slate-500 text-[9px] leading-none">Click to convert</p>
                </div>
            </div>

            <div className="flex flex-1 items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-blue-600">USD</span>
                    <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center gap-1">
                        ${balances.USD.toLocaleString()}
                        <span className="w-1 h-3 bg-emerald-400/20 rounded-full animate-pulse hidden group-hover/val:block" />
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-blue-600">GBP</span>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700 flex items-center gap-1">
                        £{balances.GBP.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="w-1 h-3 bg-emerald-400/20 rounded-full animate-pulse hidden group-hover/val:block" />
                    </span>
                </div>
                <div className="flex items-baseline gap-1.5 group/val">
                    <span className="text-[10px] font-bold text-blue-600">ZiG</span>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700 flex items-center gap-1">
                        Z${balances.ZiG.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="w-1 h-3 bg-emerald-400/20 rounded-full animate-pulse hidden group-hover/val:block" />
                    </span>
                </div>
            </div>

            {showWalletDetails && (
                <div className="flex gap-1.5 mt-2 sm:mt-0 sm:ml-auto">
                    <button className="bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/50 rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-all uppercase tracking-wider">
                        USD → ZiG
                    </button>
                    <button className="bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/50 rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-all uppercase tracking-wider">
                        GBP → USD
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
            <Card className="bg-white border-slate-200 overflow-hidden shadow-none">
                <CardContent className="p-3 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon name="wallet" size={20} className="text-blue-600" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">Total Budget (WIPAA)</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">${balances.USD.toLocaleString()}</div>
                        <p className="text-[10px] text-slate-400 font-medium">85% Funded</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none">
                <CardContent className="p-3 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon name="monitoring" size={20} className="text-emerald-600" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">Current Burn Rate</p>
                        <div className="text-xl font-bold text-emerald-600 leading-tight">Healthy</div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">Matches monthly saving capacity</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none">
                <CardContent className="p-3 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <Icon name="schedule" size={20} className="text-slate-500" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">Slippage Cost Ticker</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">$0.00</div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">On Schedule (0 Days Delay)</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-none">
                <CardContent className="p-3 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100/50 flex items-center justify-center shrink-0">
                        <Icon name="trending_down" size={20} className="text-emerald-700" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 leading-tight">Capital Saved (VE & Audit)</p>
                        <div className="text-xl font-bold text-slate-900 leading-tight">$4,250</div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">Through Direct Procurement</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

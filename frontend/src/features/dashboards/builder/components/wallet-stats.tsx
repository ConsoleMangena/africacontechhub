import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
interface WalletStatsProps {
    totalBudget: number;
}

export function WalletStats({ totalBudget }: WalletStatsProps) {
    const [showWalletDetails, setShowWalletDetails] = useState(false)

    const balances = {
        USD: totalBudget,
        ZiG: totalBudget * 28.5,
        GBP: totalBudget * 0.79,
    }

    return (
        <div className="space-y-4">
            {/* Top Row: Multi-Currency Wallet - sleek top bar */}
            <div
                className="rounded-xl border border-slate-200 p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-slate-900 cursor-pointer hover:shadow-sm transition-all group bg-white"
                onClick={() => setShowWalletDetails(!showWalletDetails)}
            >
                <div className="flex items-center gap-2 sm:min-w-[160px]">
                    <div className="p-1.5 bg-blue-50/80 rounded-lg border border-blue-100/50">
                        <Icon name="public" size={16} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-slate-800 text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Wallet Rates</h3>
                        <p className="text-slate-500 text-[9px] leading-none">Click to convert</p>
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] font-bold text-blue-600">USD</span>
                        <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                            ${balances.USD.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] font-bold text-blue-600">GBP</span>
                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700">
                            £{balances.GBP.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] font-bold text-blue-600">ZiG</span>
                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700">
                            Z${balances.ZiG.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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

            {/* Row 2: 4 stat cards in an even grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Total Budget (WIPAA)
                        </CardTitle>
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                            <Icon name="wallet" className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                            ${balances.USD.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">85% Funded</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-emerald-200 bg-emerald-50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Current Burn Rate
                        </CardTitle>
                        <div className="p-1.5 bg-white rounded-lg border border-emerald-100 shrink-0">
                            <Icon name="monitoring" className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-700">Healthy</div>
                        <p className="text-xs text-slate-500 mt-1">Matches monthly saving capacity</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-slate-300 to-slate-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Slippage Cost Ticker
                        </CardTitle>
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                            <Icon name="schedule" className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">$0.00</div>
                        <p className="text-xs text-slate-500 mt-1">On Schedule (0 Days Delay)</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-600" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Capital Saved (VE & Audit)
                        </CardTitle>
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                            <Icon name="trending_down" className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-slate-900">$4,250</div>
                        <p className="text-xs text-slate-500 mt-1">Through Direct Procurement</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

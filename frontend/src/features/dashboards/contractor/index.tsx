import { Icon } from '@/components/ui/material-icon'
import { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { contractorApi } from '@/services/api'
import { Bid, WIPAA } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'

function StatCard({
    title,
    value,
    sub,
    icon,
}: {
    title: string
    value: string | number
    sub: string
    icon: string
}) {
    return (
        <Card className="relative overflow-hidden group hover:border-slate-900 transition-all duration-300 border-slate-200 bg-white shadow-none">
            <div className={`absolute top-0 left-0 w-1 h-full bg-slate-900`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100`}>
                    <Icon name={icon} className={`h-4 w-4 text-slate-400`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{sub}</p>
            </CardContent>
        </Card>
    )
}

const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'bg-slate-100 text-slate-900',
    ACCEPTED: 'bg-slate-900 text-white',
    REJECTED: 'bg-slate-50 text-slate-400',
    PENDING: 'bg-slate-100 text-slate-700',
}

export default function ContractorDashboard() {
    const [bids, setBids] = useState<Bid[]>([])
    const [wipaa, setWipaa] = useState<WIPAA[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bidsRes, wipaaRes] = await Promise.all([
                    contractorApi.getBids(),
                    contractorApi.getWIPAA()
                ])
                // Handle paginated responses: data may be { results: [...] } or an array
                const bidsData = bidsRes.data
                const wipaaData = wipaaRes.data
                setBids(Array.isArray(bidsData) ? bidsData : (bidsData?.results ?? []))
                setWipaa(Array.isArray(wipaaData) ? wipaaData : (wipaaData?.results ?? []))
            } catch (error) {
                console.error("Failed to fetch contractor data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const safeBids = Array.isArray(bids) ? bids : []
    const safeWipaa = Array.isArray(wipaa) ? wipaa : []
    const activeBids = safeBids.filter(b => b.status === 'SUBMITTED').length
    const acceptedBids = safeBids.filter(b => b.status === 'ACCEPTED').length
    const winRate = safeBids.length > 0 ? Math.round((acceptedBids / safeBids.length) * 100) : 0
    const totalRevenue = safeWipaa.reduce((acc, w) => acc + parseFloat(w.earned_revenue || '0'), 0)

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Icon name="progress_activity" size={40} className="animate-spin text-slate-900 mb-3" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-xl bg-white px-6 py-5 border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Contractor Portal
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    Track bidding activity, project revenue & portfolio performance
                                </p>
                            </div>
                            <div className="relative z-10">
                                <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 h-9 font-bold uppercase tracking-wider text-[10px] transition-all shadow-none"
                                >
                                    <Icon name="add_circle" className="h-4 w-4 mr-1.5" />
                                    New Bid
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Active Bids"
                                value={activeBids}
                                sub="Pending response"
                                icon="work"
                            />
                            <StatCard
                                title="Win Rate"
                                value={`${winRate}%`}
                                sub={`${acceptedBids} of ${bids.length} accepted`}
                                icon="trending_up"
                            />
                            <StatCard
                                title="Total Revenue"
                                value={`$${totalRevenue.toLocaleString()}`}
                                sub="Earned via WIPAA"
                                icon="monetization_on"
                            />
                            <StatCard
                                title="Risk Status"
                                value="Nominal"
                                sub="WIPAA analysis"
                                icon="verified"
                            />
                        </div>

                        {/* Recent Bids & WIPAA */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            <Card className="lg:col-span-4 border-slate-200 bg-white shadow-none">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                        <Icon name="description" className="h-4 w-4 text-slate-400" />
                                        Recent Bids
                                    </CardTitle>
                                    <CardDescription className="text-[11px] text-slate-400 uppercase font-medium">Latest proposals submitted to builders.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {safeBids.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400">
                                                <Icon name="work" className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-xs font-medium">No bids submitted yet.</p>
                                            </div>
                                        ) : (
                                            safeBids.slice(0, 5).map((bid) => (
                                                <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-all group">
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900">Project #{bid.project}</p>
                                                        <p className="text-xs text-slate-500 font-medium">${parseFloat(bid.total_amount).toLocaleString()}</p>
                                                    </div>
                                                    <Badge className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none shadow-none ${STATUS_COLORS[bid.status] || 'bg-slate-100 text-slate-600'}`}>
                                                        {bid.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-3 border-slate-200 bg-white shadow-none">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                        <Icon name="monitoring" className="h-4 w-4 text-slate-400" />
                                        Performance Map
                                    </CardTitle>
                                    <CardDescription className="text-[11px] text-slate-400 uppercase font-medium">Solvency & variance audit.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {safeWipaa.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <Icon name="monitoring" className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No WIPAA records found.</p>
                                            </div>
                                        ) : (
                                            safeWipaa.slice(0, 5).map((record) => {
                                                const isOver = parseFloat(record.over_under_billing || '0') >= 0
                                                return (
                                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-all group">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900">Project #{record.project}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{record.period}</p>
                                                        </div>
                                                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 border border-slate-200 ${isOver
                                                            ? 'bg-slate-50 text-slate-900 font-bold'
                                                            : 'bg-slate-900 text-white'
                                                            }`}>
                                                            {isOver ? 'Over-Billed' : 'Under-Billed'}
                                                        </span>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Submitted', count: safeBids.filter(b => b.status === 'SUBMITTED').length, icon: 'schedule' },
                                { label: 'Accepted', count: safeBids.filter(b => b.status === 'ACCEPTED').length, icon: 'check_circle' },
                                { label: 'Rejected', count: safeBids.filter(b => b.status === 'REJECTED').length, icon: 'block' },
                            ].map(({ label, count, icon: iconName }) => (
                                <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Icon name={iconName} className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold font-display tracking-tight text-slate-900">{count}</p>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} Bids</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Main>
        </>
    )
}

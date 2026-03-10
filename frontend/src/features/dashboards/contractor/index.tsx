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
    accentFrom,
    accentTo,
    iconBg,
    iconColor,
}: {
    title: string
    value: string | number
    sub: string
    icon: string
    accentFrom: string
    accentTo: string
    iconBg: string
    iconColor: string
}) {
    return (
        <Card className="relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-border/60 bg-card">
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accentFrom} ${accentTo}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon name={icon} className={`h-4 w-4 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-display tracking-tight text-foreground">
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
        </Card>
    )
}

const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
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
                        <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-6">
                        {/* Hero Banner */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-sky-50/50 px-5 py-3.5 border border-blue-200/50 flex items-center justify-between gap-4">
                            <div className="relative z-10">
                                <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                                    Contractor Dashboard
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Track your bids, revenue & WIPAA performance
                                </p>
                            </div>
                            <div className="relative z-10">
                                <Button
                                    size="sm"
                                    className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                >
                                    <Icon name="add" className="h-3.5 w-3.5 mr-1.5" />
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
                                accentFrom="from-blue-400"
                                accentTo="to-blue-600"
                                iconBg="bg-blue-100"
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                title="Win Rate"
                                value={`${winRate}%`}
                                sub={`${acceptedBids} of ${bids.length} accepted`}
                                icon="trending_up"
                                accentFrom="from-green-400"
                                accentTo="to-green-600"
                                iconBg="bg-green-100"
                                iconColor="text-green-600"
                            />
                            <StatCard
                                title="Total Revenue"
                                value={`$${totalRevenue.toLocaleString()}`}
                                sub="Earned via WIPAA"
                                icon="monetization_on"
                                accentFrom="from-amber-400"
                                accentTo="to-amber-600"
                                iconBg="bg-amber-100"
                                iconColor="text-amber-600"
                            />
                            <StatCard
                                title="Solvency Risk"
                                value="Low"
                                sub="WIPAA analysis"
                                icon="error_outline"
                                accentFrom="from-purple-400"
                                accentTo="to-purple-600"
                                iconBg="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Recent Bids & WIPAA */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            <Card className="lg:col-span-4 border-border/60 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                                        <Icon name="description" className="h-4 w-4 text-blue-600" />
                                        Recent Bids
                                    </CardTitle>
                                    <CardDescription>Latest proposals submitted to builders.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {safeBids.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <Icon name="work" className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No bids submitted yet.</p>
                                            </div>
                                        ) : (
                                            safeBids.slice(0, 5).map((bid) => (
                                                <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">Project #{bid.project}</p>
                                                        <p className="text-xs text-muted-foreground">${parseFloat(bid.total_amount).toLocaleString()}</p>
                                                    </div>
                                                    <Badge className={`text-xs shrink-0 ${STATUS_COLORS[bid.status] || 'bg-muted text-muted-foreground'}`}>
                                                        {bid.status}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-3 border-border/60 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                                        <Icon name="monitoring" className="h-4 w-4 text-purple-600" />
                                        WIPAA Overview
                                    </CardTitle>
                                    <CardDescription>Solvency and billing status.</CardDescription>
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
                                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground">Project #{record.project}</p>
                                                            <p className="text-xs text-muted-foreground">{record.period}</p>
                                                        </div>
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${isOver
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {isOver ? 'Overbilled' : 'Underbilled'}
                                                        </span>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status Summary */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Submitted', count: safeBids.filter(b => b.status === 'SUBMITTED').length, icon: 'schedule', iconColor: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Accepted', count: safeBids.filter(b => b.status === 'ACCEPTED').length, icon: 'check_circle', iconColor: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Rejected', count: safeBids.filter(b => b.status === 'REJECTED').length, icon: 'error_outline', iconColor: 'text-red-600', bg: 'bg-red-50' },
                            ].map(({ label, count, icon: iconName, iconColor, bg }) => (
                                <div key={label} className={`flex items-center gap-4 p-4 rounded-xl border border-border/60 ${bg}`}>
                                    <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shadow-sm">
                                        <Icon name={iconName} className={`h-4 w-4 ${iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold font-display tracking-tight text-foreground">{count}</p>
                                        <p className="text-xs text-muted-foreground">{label} bids</p>
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

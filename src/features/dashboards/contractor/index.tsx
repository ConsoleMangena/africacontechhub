import { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, TrendingUp, AlertCircle } from 'lucide-react'
import { contractorApi } from '@/services/api'
import { Bid, WIPAA } from '@/types/api'
import { Route } from '@/routes/_authenticated/contractor'

export default function ContractorDashboard() {
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()
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
                setBids(bidsRes.data)
                setWipaa(wipaaRes.data)
            } catch (error) {
                console.error("Failed to fetch contractor data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>
    }

    const currentTab = tab || 'overview'

    const handleTabChange = (value: string) => {
        navigate({ search: { tab: value } })
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Contractor Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40 hover:scale-110"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bids">Bids</TabsTrigger>
                    <TabsTrigger value="wipaa">WIPAA</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Bids
                                </CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{bids.filter(b => b.status === 'SUBMITTED').length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Pending response
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Win Rate
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {bids.length > 0
                                        ? Math.round((bids.filter(b => b.status === 'ACCEPTED').length / bids.length) * 100)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last 30 days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${wipaa.reduce((acc, w) => acc + parseFloat(w.earned_revenue), 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Earned revenue
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Solvency Risk
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Low</div>
                                <p className="text-xs text-muted-foreground">
                                    WIPAA analysis
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Bids</CardTitle>
                                <CardDescription>
                                    Status of your submitted proposals.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {bids.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No bids found.</p>
                                    ) : (
                                        bids.slice(0, 5).map((bid) => (
                                            <div key={bid.id} className="flex items-center">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        Project #{bid.project}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${parseFloat(bid.total_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">{bid.status}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>WIPAA Overview</CardTitle>
                                <CardDescription>
                                    Solvency and billing status.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {wipaa.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No WIPAA records.</p>
                                    ) : (
                                        wipaa.slice(0, 5).map((record) => (
                                            <div key={record.id} className="flex items-center">
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">Project #{record.project}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {record.period}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">
                                                    {parseFloat(record.over_under_billing || '0') >= 0 ? 'Overbilled' : 'Underbilled'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

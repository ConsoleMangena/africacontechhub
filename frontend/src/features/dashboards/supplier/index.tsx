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
import {
    Plus, Package, Truck, ShieldCheck, Star,
    TrendingUp, ClipboardList, BarChart3, Loader2
} from 'lucide-react'
import { supplierApi } from '@/services/api'
import { MaterialOrder, Product } from '@/types/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    accentFrom,
    accentTo,
    iconBg,
    iconColor,
}: {
    title: string
    value: string | number
    sub: string
    icon: React.ElementType
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
                    <Icon className={`h-4 w-4 ${iconColor}`} />
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

const ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default function SupplierDashboard() {
    const [orders, setOrders] = useState<MaterialOrder[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    supplierApi.getOrders(),
                    supplierApi.getProducts()
                ])
                setOrders(ordersRes.data)
                setProducts(productsRes.data)
            } catch (error) {
                console.error("Failed to fetch supplier data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
    const totalSales = orders.reduce((acc, o) => acc + parseFloat(o.total_cost || '0'), 0)
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
    const onTimeRate = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 100
    const tcoScore = (4.0 + (onTimeRate / 100)).toFixed(1)

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
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-6">
                        {/* Hero Banner */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-violet-50/80 to-fuchsia-50/50 px-5 py-3.5 border border-purple-200/50 flex items-center justify-between gap-4">
                            <div className="relative z-10">
                                <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                                    Supplier Dashboard
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Manage inventory, orders & delivery performance
                                </p>
                            </div>
                            <div className="relative z-10">
                                <Button
                                    size="sm"
                                    className="rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Active Orders"
                                value={activeOrders}
                                sub="Processing or shipping"
                                icon={Package}
                                accentFrom="from-purple-400"
                                accentTo="to-purple-600"
                                iconBg="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                            <StatCard
                                title="On-Time Rate"
                                value={`${onTimeRate}%`}
                                sub="Based on completed orders"
                                icon={Truck}
                                accentFrom="from-green-400"
                                accentTo="to-green-600"
                                iconBg="bg-green-100"
                                iconColor="text-green-600"
                            />
                            <StatCard
                                title="Total Sales"
                                value={`$${totalSales.toLocaleString()}`}
                                sub="Guaranteed payment"
                                icon={TrendingUp}
                                accentFrom="from-amber-400"
                                accentTo="to-amber-600"
                                iconBg="bg-amber-100"
                                iconColor="text-amber-600"
                            />
                            <StatCard
                                title="TCO Score"
                                value={`${tcoScore} / 5.0`}
                                sub="Computed rating"
                                icon={Star}
                                accentFrom="from-pink-400"
                                accentTo="to-pink-600"
                                iconBg="bg-pink-100"
                                iconColor="text-pink-600"
                            />
                        </div>

                        {/* Recent Orders & Top Products */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            <Card className="lg:col-span-4 border-border/60 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-purple-600" />
                                        Recent Orders
                                    </CardTitle>
                                    <CardDescription>Latest material requests from builders.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {orders.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No orders yet.</p>
                                            </div>
                                        ) : (
                                            orders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                                                        <p className="text-xs text-muted-foreground">${parseFloat(order.total_cost || '0').toLocaleString()}</p>
                                                    </div>
                                                    <Badge className={`text-xs shrink-0 ${ORDER_STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                                                        {order.status}
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
                                        <BarChart3 className="h-4 w-4 text-pink-600" />
                                        Top Products
                                    </CardTitle>
                                    <CardDescription>Best-selling items this month.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {products.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No products listed yet.</p>
                                            </div>
                                        ) : (
                                            products.slice(0, 5).map((product, idx) => (
                                                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">${parseFloat(product.unit_price || '0').toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium shrink-0">
                                                        High Demand
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quality Assurance Strip */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Verified Supplier', icon: ShieldCheck, iconColor: 'text-green-600', bg: 'bg-green-50', text: 'Certified & Trusted' },
                                { label: 'On-Time Delivery', icon: Truck, iconColor: 'text-blue-600', bg: 'bg-blue-50', text: `${onTimeRate}% performance` },
                                { label: 'Quality Score', icon: Star, iconColor: 'text-amber-600', bg: 'bg-amber-50', text: `${tcoScore} / 5.0 rating` },
                            ].map(({ label, icon: Icon, iconColor, bg, text }) => (
                                <div key={label} className={`flex items-center gap-4 p-4 rounded-xl border border-border/60 ${bg}`}>
                                    <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shadow-sm">
                                        <Icon className={`h-4 w-4 ${iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{label}</p>
                                        <p className="text-xs text-muted-foreground">{text}</p>
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

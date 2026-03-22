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

const ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-slate-100 text-slate-900',
    PROCESSING: 'bg-slate-900 text-white',
    SHIPPED: 'bg-slate-100 text-slate-700',
    DELIVERED: 'bg-slate-200 text-slate-800',
    CANCELLED: 'bg-slate-50 text-slate-400',
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
                const ordersData = ordersRes.data
                const productsData = productsRes.data
                setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.results ?? []))
                setProducts(Array.isArray(productsData) ? productsData : (productsData?.results ?? []))
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
                        <Icon name="progress_activity" size={40} className="animate-spin text-slate-900 mb-3" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-6">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-xl bg-white px-6 py-5 border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Supplier Portal
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    Manage inventory, orders & fulfillment logistics
                                </p>
                            </div>
                            <div className="relative z-10">
                                <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 h-9 font-bold uppercase tracking-wider text-[10px] transition-all shadow-none"
                                >
                                    <Icon name="add_circle" className="h-4 w-4 mr-1.5" />
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
                                icon="package"
                            />
                            <StatCard
                                title="On-Time Rate"
                                value={`${onTimeRate}%`}
                                sub="Based on completed orders"
                                icon="local_shipping"
                            />
                            <StatCard
                                title="Total Sales"
                                value={`$${totalSales.toLocaleString()}`}
                                sub="Guaranteed payment"
                                icon="trending_up"
                            />
                            <StatCard
                                title="TCO Score"
                                value={`${tcoScore} / 5.0`}
                                sub="Computed rating"
                                icon="star"
                            />
                        </div>

                        {/* Recent Orders & Top Products */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            <Card className="lg:col-span-4 border-slate-200 bg-white shadow-none">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                                        <Icon name="assignment" className="h-4 w-4 text-slate-400" />
                                        Recent Orders
                                    </CardTitle>
                                    <CardDescription className="text-[11px] text-slate-400 uppercase font-medium">Latest material requests from builders.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {orders.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400">
                                                <Icon name="package" className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-xs font-medium">No orders yet.</p>
                                            </div>
                                        ) : (
                                            orders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-all group">
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900">Order #{order.id}</p>
                                                        <p className="text-xs text-slate-500 font-medium">${parseFloat(order.total_cost || '0').toLocaleString()}</p>
                                                    </div>
                                                    <Badge className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-none shadow-none ${ORDER_STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                        {order.status}
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
                                        <Icon name="bar_chart" className="h-4 w-4 text-slate-400" />
                                        Inventory Audit
                                    </CardTitle>
                                    <CardDescription className="text-[11px] text-slate-400 uppercase font-medium">High turnover velocity items.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {products.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <Icon name="bar_chart" className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No products listed yet.</p>
                                            </div>
                                        ) : (
                                            products.slice(0, 5).map((product, idx) => (
                                                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-all group">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-[10px] font-bold text-slate-400 w-4 tracking-tighter">#{idx + 1}</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">${parseFloat(product.unit_price || '0').toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold uppercase tracking-widest shadow-sm">
                                                        High Demand
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Verified Supplier', icon: 'verified_user', text: 'Certified & Trusted' },
                                { label: 'On-Time Delivery', icon: 'local_shipping', text: `${onTimeRate}% performance` },
                                { label: 'Quality Score', icon: 'star', text: `${tcoScore} / 5.0 rating` },
                            ].map(({ label, icon: iconName, text }) => (
                                <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Icon name={iconName} className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{label}</p>
                                        <p className="text-[11px] text-slate-500 font-medium">{text}</p>
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

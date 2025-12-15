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
import { Plus, Package, Truck, ShieldCheck } from 'lucide-react'
import { supplierApi } from '@/services/api'
import { MaterialOrder, Product } from '@/types/api'
import { Route } from '@/routes/_authenticated/supplier'

export default function SupplierDashboard() {
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()
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
                <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 hover:from-purple-600 hover:to-violet-700 dark:hover:from-purple-700 dark:hover:to-violet-800 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/40 hover:scale-110"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Orders
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Processing or shipping
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    On-Time Rate
                                </CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">98%</div>
                                <p className="text-xs text-muted-foreground">
                                    Last 30 days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Sales
                                </CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${orders.reduce((acc, o) => acc + parseFloat(o.total_cost), 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Guaranteed payment
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    TCO Score
                                </CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4.8</div>
                                <p className="text-xs text-muted-foreground">
                                    Top rated supplier
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>
                                    Latest material requests from builders.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {orders.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                                    ) : (
                                        orders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="flex items-center">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        Order #{order.id}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${parseFloat(order.total_cost).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">{order.status}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Top Products</CardTitle>
                                <CardDescription>
                                    Best selling items this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {products.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No products listed.</p>
                                    ) : (
                                        products.slice(0, 5).map((product) => (
                                            <div key={product.id} className="flex items-center">
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${parseFloat(product.unit_price).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">High Demand</div>
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

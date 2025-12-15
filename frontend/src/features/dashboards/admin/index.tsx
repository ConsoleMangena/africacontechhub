import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SystemOverview } from './components/system-overview'
import { UserStats } from './components/user-stats'
import { TransactionVolume } from './components/transaction-volume'
import { Users, Building2, Package2, DollarSign } from 'lucide-react'

export function AdminDashboard() {
    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <TopNav links={topNav} />
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ThemeSwitch />

                    <ProfileDropdown />
                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main>
                <div className='mb-2 flex items-center justify-between space-y-2'>
                    <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
                    <div className='flex items-center space-x-2'>
                        <Button>System Settings</Button>
                    </div>
                </div>
                <Tabs
                    orientation='vertical'
                    defaultValue='overview'
                    className='space-y-4'
                >
                    <div className='w-full overflow-x-auto pb-2'>
                        <TabsList>
                            <TabsTrigger value='overview'>Overview</TabsTrigger>
                            <TabsTrigger value='users'>Users</TabsTrigger>
                            <TabsTrigger value='transactions'>Transactions</TabsTrigger>
                            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value='overview' className='space-y-4'>
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Total Users
                                    </CardTitle>
                                    <Users className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>2,847</div>
                                    <p className='text-muted-foreground text-xs'>
                                        +18.2% from last month
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Active Projects
                                    </CardTitle>
                                    <Building2 className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>156</div>
                                    <p className='text-muted-foreground text-xs'>
                                        $12.4M total value
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>Active Suppliers</CardTitle>
                                    <Package2 className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>89</div>
                                    <p className='text-muted-foreground text-xs'>
                                        Verified vendors
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Total Volume
                                    </CardTitle>
                                    <DollarSign className='text-muted-foreground h-4 w-4' />
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>$8.2M</div>
                                    <p className='text-muted-foreground text-xs'>
                                        Platform transactions
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                            <Card className='col-span-1 lg:col-span-4'>
                                <CardHeader>
                                    <CardTitle>Transaction Volume</CardTitle>
                                    <CardDescription>Monthly platform activity</CardDescription>
                                </CardHeader>
                                <CardContent className='ps-2'>
                                    <TransactionVolume />
                                </CardContent>
                            </Card>
                            <Card className='col-span-1 lg:col-span-3'>
                                <CardHeader>
                                    <CardTitle>User Distribution</CardTitle>
                                    <CardDescription>
                                        By user type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UserStats />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value='users' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage builders, contractors, and suppliers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserStats />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value='transactions' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Monitor</CardTitle>
                                <CardDescription>Track all platform transactions and escrow releases</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TransactionVolume />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value='analytics' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>System Analytics</CardTitle>
                                <CardDescription>Platform performance and insights</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SystemOverview />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Main>
        </>
    )
}

const topNav = [
    {
        title: 'Dashboard',
        href: '/admin',
        isActive: true,
        disabled: false,
    },
    {
        title: 'Users',
        href: '/admin/users',
        isActive: false,
        disabled: true,
    },
    {
        title: 'Projects',
        href: '/admin/projects',
        isActive: false,
        disabled: true,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        isActive: false,
        disabled: true,
    },
]

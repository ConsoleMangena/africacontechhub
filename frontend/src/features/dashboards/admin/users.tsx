import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { UserManagement } from './components/user-management'
import { AccountRequests } from './components/account-requests'
import { UserStats } from './components/user-stats'
import { Users, Bell, PieChart } from 'lucide-react'

export function AdminUsers() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
                        Users & Approvals
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage platform access, roles, and review pending registrations.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Requests */}
                    <Card className="border-border/60 bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                                <Bell className="h-4 w-4 text-amber-600" />
                                Account Requests
                            </CardTitle>
                            <CardDescription className="text-xs">Review and approve or reject new user registrations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountRequests />
                        </CardContent>
                    </Card>

                    {/* User Management */}
                    <Card className="border-border/60 bg-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                                <Users className="h-4 w-4 text-indigo-600" />
                                User Directory
                            </CardTitle>
                            <CardDescription className="text-xs">View, edit, and manage all active user accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserManagement />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {/* User Stats/Distribution */}
                    <Card className="border-border/60 bg-card sticky top-36">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                                <PieChart className="h-4 w-4 text-purple-600" />
                                User Distribution
                            </CardTitle>
                            <CardDescription className="text-xs">By user type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserStats />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

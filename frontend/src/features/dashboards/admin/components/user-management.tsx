import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'


const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator',
    BUILDER: 'Builder',
    CONTRACTOR: 'Contractor',
    SUPPLIER: 'Supplier',
}

function getInitials(first?: string, last?: string, email?: string): string {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase()
    if (first) return first.slice(0, 2).toUpperCase()
    if (email) return email[0].toUpperCase()
    return '?'
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
}

const AVATAR_COLORS = [
    'bg-slate-400', 'bg-slate-500', 'bg-zinc-400', 'bg-zinc-500',
    'bg-gray-400', 'bg-gray-500',
]

export function UserManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('ALL')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'BUILDER',
        password: '',
    })

    const currentUser = useAuthStore((state) => state.auth.user)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await adminApi.getUsers()
            setUsers(res.data)
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast.error('Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredUsers = useMemo(() => {
        let result = users
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(u =>
                u.email?.toLowerCase().includes(q) ||
                u.first_name?.toLowerCase().includes(q) ||
                u.last_name?.toLowerCase().includes(q)
            )
        }
        return result
    }, [users, search, roleFilter])

    const handleRoleChange = async (userId: number, newRole: string) => {
        setActionLoading(`role-${userId}`)
        try {
            await adminApi.updateUser(userId, { role: newRole })
            toast.success(`Role updated to ${ROLE_LABELS[newRole] || newRole}`)
            await fetchUsers()
        } catch (error) {
            console.error("Failed to update role", error)
            toast.error('Failed to update role')
        } finally {
            setActionLoading(null)
        }
    }

    const handleStatusChange = async (userId: number, isActive: boolean) => {
        setActionLoading(`status-${userId}`)
        try {
            await adminApi.updateUser(userId, { is_active: isActive })
            toast.success(isActive ? 'User activated' : 'User suspended')
            await fetchUsers()
        } catch (error) {
            console.error("Failed to update status", error)
            toast.error('Failed to update status')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setActionLoading(`delete-${deleteTarget.id}`)
        try {
            await adminApi.deleteUser(deleteTarget.id)
            toast.success('User deleted successfully')
            await fetchUsers()
        } catch (error) {
            console.error("Failed to delete user", error)
            toast.error('Failed to delete user')
        } finally {
            setActionLoading(null)
            setDeleteTarget(null)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUser.email) {
            toast.error('Email is required')
            return
        }
        setActionLoading('create')
        try {
            await adminApi.createUser(newUser)
            toast.success('User created successfully')
            setIsCreateOpen(false)
            setNewUser({
                email: '',
                first_name: '',
                last_name: '',
                role: 'BUILDER',
                password: '',
            })
            await fetchUsers()
        } catch (error: any) {
            console.error("Failed to create user", error)
            const msg = error.response?.data?.error || 'Failed to create user'
            toast.error(msg)
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Icon name="group" className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No users found.</p>
            </div>
        )
    }

    const isSelf = (userId: number) => currentUser?.id === userId

    return (
        <>
            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/50 focus-visible:bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 px-3 border-border/60 hover:bg-muted/50 hover:text-indigo-600 font-bold transition-all shadow-none">
                                <Icon name="add_circle" className="h-4 w-4" />
                                <span className="hidden sm:inline">Add User</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleCreateUser}>
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>
                                        Add a new member to the SQB platform.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-xs">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={newUser.email}
                                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                            className="h-9 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name" className="text-xs">First Name</Label>
                                            <Input
                                                id="first_name"
                                                placeholder="John"
                                                value={newUser.first_name}
                                                onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name" className="text-xs">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                placeholder="Doe"
                                                value={newUser.last_name}
                                                onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role" className="text-xs">Initial Role</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={val => setNewUser({ ...newUser, role: val })}
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BUILDER">Builder</SelectItem>
                                                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                                                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pass" className="text-xs">Password (Optional)</Label>
                                        <Input
                                            id="pass"
                                            type="password"
                                            placeholder="Leave empty for random"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={actionLoading === 'create'}>
                                        {actionLoading === 'create' ? <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                        Create Account
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="h-9 flex-1 lg:w-[150px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Administrators</SelectItem>
                            <SelectItem value="BUILDER">Builders</SelectItem>
                            <SelectItem value="CONTRACTOR">Contractors</SelectItem>
                            <SelectItem value="SUPPLIER">Suppliers</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 shrink-0 bg-muted/20 px-2 py-1 rounded-md border border-border/40">
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                            {filteredUsers.length} Users
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => fetchUsers()} className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Refresh">
                            <Icon name="refresh" className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="rounded-xl border border-border/50 overflow-x-auto no-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[200px]">User</TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">Role</TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[100px]">Status</TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Joined</TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <Icon name="search_off" className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                                    <p className="text-xs font-medium">No users match your search</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => {
                                const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
                                return (
                                    <TableRow key={user.id} className="hover:bg-muted/20 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-7 w-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                                    {getInitials(user.first_name, user.last_name, user.email)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-foreground truncate">
                                                        {user.first_name || user.last_name
                                                            ? `${user.first_name} ${user.last_name}`.trim()
                                                            : 'Unnamed User'}
                                                        {isSelf(user.id) && (
                                                            <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 font-medium text-muted-foreground border-border">
                                                                You
                                                            </Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                key={`role-${user.id}-${user.role}`}
                                                value={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                                disabled={actionLoading === `role-${user.id}`}
                                            >
                                                <SelectTrigger className={`h-7 w-[125px] text-[10px] font-bold border-0 bg-muted/20 hover:bg-muted/40 transition-all rounded-md`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                                    <SelectItem value="BUILDER">Builder</SelectItem>
                                                    <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                                                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`text-[11px] font-bold cursor-pointer rounded-lg px-2 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors ${actionLoading === `status-${user.id}` ? 'opacity-50 pointer-events-none' : ''}`}
                                                onClick={() => {
                                                    if (actionLoading !== `status-${user.id}`) {
                                                        handleStatusChange(user.id, !user.is_active)
                                                    }
                                                }}
                                            >
                                                {actionLoading === `status-${user.id}` ? (
                                                    <Icon name="progress_activity" className="h-3 w-3 animate-spin mr-1" />
                                                ) : (
                                                    <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${user.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                )}
                                                {user.is_active ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <span className="text-[11px] text-muted-foreground" title={new Date(user.date_joined).toLocaleString()}>
                                                {timeAgo(user.date_joined)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 h-7 w-7 disabled:opacity-20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={isSelf(user.id) || actionLoading === `delete-${user.id}`}
                                                title={isSelf(user.id) ? 'You cannot delete your own account' : 'Delete user'}
                                                onClick={() => setDeleteTarget({
                                                    id: user.id,
                                                    name: user.first_name || user.last_name
                                                        ? `${user.first_name} ${user.last_name}`.trim()
                                                        : user.email,
                                                })}
                                            >
                                                {actionLoading === `delete-${user.id}` ? (
                                                    <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Icon name="delete" className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                            <Icon name="delete" className="h-5 w-5 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-2">
                        <AlertDialogCancel disabled={actionLoading?.startsWith('delete-')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDelete}
                            disabled={actionLoading?.startsWith('delete-')}
                        >
                            {actionLoading?.startsWith('delete-') ? (
                                <><Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1.5" /> Deleting...</>
                            ) : (
                                'Delete User'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

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
import { useNavigate } from '@tanstack/react-router'


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

function formatDate(dateStr?: string): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '-'
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(d)
}

const AVATAR_COLORS = [
    'bg-slate-400', 'bg-slate-500', 'bg-zinc-400', 'bg-zinc-500',
    'bg-gray-400', 'bg-gray-500',
]

export function UserManagement() {
    const navigate = useNavigate()
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('ALL')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
    const [joinedFrom, setJoinedFrom] = useState('')
    const [joinedTo, setJoinedTo] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<'10' | '25' | '50'>('25')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
    const [editTarget, setEditTarget] = useState<any>(null)
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'BUILDER',
    })
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
        if (statusFilter !== 'ALL') {
            const shouldBeActive = statusFilter === 'ACTIVE'
            result = result.filter(u => !!u.is_active === shouldBeActive)
        }
        const fromDate = joinedFrom ? new Date(`${joinedFrom}T00:00:00`) : null
        const toDate = joinedTo ? new Date(`${joinedTo}T23:59:59`) : null
        if (fromDate || toDate) {
            result = result.filter(u => {
                const d = u.date_joined ? new Date(u.date_joined) : null
                if (!d || Number.isNaN(d.getTime())) return false
                if (fromDate && d < fromDate) return false
                if (toDate && d > toDate) return false
                return true
            })
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
    }, [users, search, roleFilter, statusFilter, joinedFrom, joinedTo])

    useEffect(() => {
        // Reset to first page when filters change.
        setPage(1)
    }, [search, roleFilter, statusFilter, joinedFrom, joinedTo, users.length])

    const pagination = useMemo(() => {
        const size = Number(pageSize)
        const total = filteredUsers.length
        const totalPages = Math.max(1, Math.ceil(total / size))
        const safePage = Math.min(Math.max(1, page), totalPages)
        const startIdx = (safePage - 1) * size
        const endIdx = Math.min(total, startIdx + size)
        const items = filteredUsers.slice(startIdx, endIdx)
        return { size, total, totalPages, page: safePage, startIdx, endIdx, items }
    }, [filteredUsers, page, pageSize])

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

    const openEditUser = (user: any) => {
        setEditForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            role: user.role || 'BUILDER',
        })
        setEditTarget(user)
    }

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editTarget) return
        if (!editForm.email) {
            toast.error('Email is required')
            return
        }
        setActionLoading(`edit-${editTarget.id}`)
        try {
            await adminApi.updateUser(editTarget.id, editForm)
            toast.success('User updated successfully')
            setEditTarget(null)
            await fetchUsers()
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Failed to update user'
            toast.error(msg)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteUser = async () => {
        if (!deleteTarget) return
        setActionLoading(`delete-${deleteTarget.id}`)
        try {
            await adminApi.deleteUser(deleteTarget.id)
            toast.success(`User "${deleteTarget.name}" deleted successfully`)
            setDeleteTarget(null)
            await fetchUsers()
        } catch (error: any) {
            console.error('Failed to delete user', error)
            const msg = error.response?.data?.error || 'Failed to delete user'
            toast.error(msg)
        } finally {
            setActionLoading(null)
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
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative flex-1 min-w-[220px]">
                    <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/50 focus-visible:bg-white"
                    />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-[150px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
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

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="h-9 w-full sm:w-[160px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                </Select>

                <Input type="date" value={joinedFrom} onChange={(e) => setJoinedFrom(e.target.value)} className="h-9 text-xs w-full sm:w-[160px]" />
                <Input type="date" value={joinedTo} onChange={(e) => setJoinedTo(e.target.value)} className="h-9 text-xs w-full sm:w-[160px]" />

                {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL' || joinedFrom || joinedTo) && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-[11px] font-bold"
                        onClick={() => {
                            setSearch('')
                            setRoleFilter('ALL')
                            setStatusFilter('ALL')
                            setJoinedFrom('')
                            setJoinedTo('')
                        }}
                    >
                        <Icon name="close" className="h-4 w-4 mr-1.5" />
                        Clear
                    </Button>
                )}

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

                <div className="flex items-center gap-2 shrink-0 bg-muted/20 px-2 py-1 rounded-md border border-border/40">
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {pagination.total} Users
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => fetchUsers()} className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Refresh">
                        <Icon name="refresh" className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* User Table */}
            <div className="rounded-xl border border-border/50 overflow-x-auto no-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[240px]">Name</TableHead>
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[260px]">Email</TableHead>
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[160px]">Role</TableHead>
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">Status</TableHead>
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell w-[150px]">Joined</TableHead>
                            <TableHead className="h-11 px-4 py-2 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[190px]">
                                <div className="flex justify-end">Actions</div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pagination.total === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    <Icon name="search_off" className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                                    <p className="text-xs font-medium">No users match your search</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pagination.items.map((user) => {
                                const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
                                return (
                                    <TableRow key={user.id} className="hover:bg-muted/20 group">
                                        <TableCell className="px-4 py-3 align-middle">
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
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-middle">
                                            <p className="text-[12px] text-muted-foreground truncate" title={user.email}>
                                                {user.email}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-middle">
                                            <Select
                                                key={`role-${user.id}-${user.role}`}
                                                value={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                                disabled={actionLoading === `role-${user.id}`}
                                            >
                                                <SelectTrigger className="h-7 w-[140px] px-2 text-[10px] font-bold border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all rounded-md">
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
                                        <TableCell className="px-4 py-3 align-middle">
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
                                        <TableCell className="hidden lg:table-cell px-4 py-3 align-middle">
                                            <span className="text-[11px] text-muted-foreground tabular-nums" title={user.date_joined ? new Date(user.date_joined).toLocaleString() : undefined}>
                                                {formatDate(user.date_joined)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-[11px] font-bold"
                                                    onClick={() => navigate({ to: '/admin/users/$userId', params: { userId: String(user.id) } })}
                                                >
                                                    View
                                                </Button>
                                                {!isSelf(user.id) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-[11px] font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                        onClick={() => openEditUser(user)}
                                                    >
                                                        <Icon name="edit" className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {!isSelf(user.id) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        disabled={actionLoading === `delete-${user.id}`}
                                                        onClick={() => setDeleteTarget({
                                                            id: user.id,
                                                            name: user.first_name || user.last_name
                                                                ? `${user.first_name} ${user.last_name}`.trim()
                                                                : user.email,
                                                        })}
                                                    >
                                                        {actionLoading === `delete-${user.id}`
                                                            ? <Icon name="progress_activity" className="h-3 w-3 animate-spin" />
                                                            : <Icon name="delete" className="h-3.5 w-3.5" />
                                                        }
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">
                            Showing {pagination.startIdx + 1}-{pagination.endIdx} of {pagination.total}
                        </span>
                        <Select value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                            <SelectTrigger className="h-8 w-[110px] text-[11px] font-bold border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="25">25 / page</SelectItem>
                                <SelectItem value="50">50 / page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={pagination.page <= 1}
                            onClick={() => setPage(1)}
                        >
                            First
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={pagination.page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            title="Previous"
                        >
                            <Icon name="chevron_left" className="h-4 w-4" />
                        </Button>
                        <div className="text-xs text-muted-foreground tabular-nums px-2">
                            Page {pagination.page} / {pagination.totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            title="Next"
                        >
                            <Icon name="chevron_right" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPage(pagination.totalPages)}
                        >
                            Last
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleEditUser}>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update account details for this user.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_first_name" className="text-xs">First Name</Label>
                                    <Input
                                        id="edit_first_name"
                                        placeholder="John"
                                        value={editForm.first_name}
                                        onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_last_name" className="text-xs">Last Name</Label>
                                    <Input
                                        id="edit_last_name"
                                        placeholder="Doe"
                                        value={editForm.last_name}
                                        onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_email" className="text-xs">Email Address</Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="h-9 text-sm"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_role" className="text-xs">Role</Label>
                                <Select
                                    value={editForm.role}
                                    onValueChange={val => setEditForm({ ...editForm, role: val })}
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
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditTarget(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={actionLoading === `edit-${editTarget?.id}`}>
                                {actionLoading === `edit-${editTarget?.id}` ? <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone. All associated data will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteUser}
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

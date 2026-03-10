import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
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

const ROLE_STYLES: Record<string, string> = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    BUILDER: 'bg-blue-50 text-blue-700 border-blue-200',
    CONTRACTOR: 'bg-amber-50 text-amber-700 border-amber-200',
    SUPPLIER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator',
    BUILDER: 'Builder',
    CONTRACTOR: 'Contractor',
    SUPPLIER: 'Supplier',
}

export function UserManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null) // "role-{id}" | "status-{id}" | "delete-{id}"
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

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
            <div className="rounded-lg border border-border/60 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                            <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} className="hover:bg-muted/30">
                                <TableCell className="text-sm font-medium text-foreground">
                                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown User'}
                                    {isSelf(user.id) && (
                                        <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">(You)</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        key={`role-${user.id}-${user.role}`}
                                        value={user.role}
                                        onValueChange={(val) => handleRoleChange(user.id, val)}
                                        disabled={actionLoading === `role-${user.id}`}
                                    >
                                        <SelectTrigger className={`h-7 w-[130px] text-xs font-medium border ${ROLE_STYLES[user.role] || 'bg-muted text-muted-foreground border-border'}`}>
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
                                        className={`text-xs font-medium cursor-pointer ${user.is_active
                                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                        } ${actionLoading === `status-${user.id}` ? 'opacity-50 pointer-events-none' : ''}`}
                                        onClick={() => {
                                            if (actionLoading !== `status-${user.id}`) {
                                                handleStatusChange(user.id, !user.is_active)
                                            }
                                        }}
                                    >
                                        {actionLoading === `status-${user.id}` ? (
                                            <Icon name="progress_activity" className="h-3 w-3 animate-spin mr-1" />
                                        ) : null}
                                        {user.is_active ? 'Active' : 'Suspended'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 disabled:opacity-30"
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
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?
                            This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading?.startsWith('delete-')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDelete}
                            disabled={actionLoading?.startsWith('delete-')}
                        >
                            {actionLoading?.startsWith('delete-') ? (
                                <><Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1.5" /> Deleting...</>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

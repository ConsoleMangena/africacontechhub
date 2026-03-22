import { Icon } from '@/components/ui/material-icon'
import { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
    architect: 'Architect',
    structural_engineer: 'Structural Engineer',
    contractor: 'General Contractor',
    project_manager: 'Project Manager',
    quantity_surveyor: 'Quantity Surveyor',
    electrician: 'Electrician',
    plumber: 'Plumber',
    mason: 'Mason/Bricklayer',
    carpenter: 'Carpenter',
    painter: 'Painter',
    roofer: 'Roofer',
    tiler: 'Tiler',
}

const AVAILABILITY_STYLES: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    busy: 'bg-amber-50 text-amber-700 border-amber-200',
    unavailable: 'bg-red-50 text-red-700 border-red-200',
}

export function ProfessionalManagement() {
    const [professionals, setProfessionals] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    
    // Create Mode
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newProf, setNewProf] = useState({
        user_id: '',
        role: 'architect',
        company_name: '',
        location: '',
        is_verified: true,
    })

    // Delete Mode
    const [deleteTarget, setDeleteTarget] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [profRes, userRes] = await Promise.all([
                adminApi.getAdminProfessionals(),
                adminApi.getUsers()
            ])
            setProfessionals(profRes.data)
            setUsers(userRes.data)
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast.error('Failed to load professional data')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProfessionals = useMemo(() => {
        let result = professionals
        if (roleFilter !== 'all') {
            result = result.filter(p => p.role === roleFilter)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(p => 
                p.full_name?.toLowerCase().includes(q) ||
                p.email?.toLowerCase().includes(q) ||
                p.company_name?.toLowerCase().includes(q)
            )
        }
        return result
    }, [professionals, search, roleFilter])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProf.user_id) {
            toast.error('Select a user to link')
            return
        }
        setActionLoading('create')
        try {
            await adminApi.createAdminProfessional({
                ...newProf,
                user_id: parseInt(newProf.user_id)
            })
            toast.success('Professional profile created')
            setIsCreateOpen(false)
            setNewProf({
                user_id: '',
                role: 'architect',
                company_name: '',
                location: '',
                is_verified: true,
            })
            await fetchData()
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Failed to create profile'
            toast.error(msg)
        } finally {
            setActionLoading(null)
        }
    }

    const toggleVerification = async (profId: number, current: boolean) => {
        setActionLoading(`verify-${profId}`)
        try {
            await adminApi.updateAdminProfessional(profId, { is_verified: !current })
            toast.success(!current ? 'Profile verified' : 'Verification removed')
            await fetchData()
        } catch (error) {
            toast.error('Failed to update verification status')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setActionLoading(`delete-${deleteTarget.id}`)
        try {
            await adminApi.deleteAdminProfessional(deleteTarget.id)
            toast.success('Professional profile removed')
            setDeleteTarget(null)
            await fetchData()
        } catch (error) {
            toast.error('Failed to delete profile')
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading && professionals.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                <div className="relative flex-1">
                    <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search professionals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-muted/30 border-border/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="h-10 w-[160px] text-xs font-medium border-border/50 bg-muted/30">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-4 shadow-sm shadow-indigo-200">
                                <Icon name="person_add" className="h-4 w-4" />
                                <span>Add to Team</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Add Professional to Team</DialogTitle>
                                    <DialogDescription>
                                        Link an existing user to the SQB Building Team portal.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-6">
                                    <div className="grid gap-2">
                                        <Label className="text-xs">Linked User</Label>
                                        <Select
                                            value={newProf.user_id}
                                            onValueChange={val => setNewProf({ ...newProf, user_id: val })}
                                        >
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue placeholder="Select user..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[250px]">
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.email} ({u.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs">Professional Role</Label>
                                        <Select
                                            value={newProf.role}
                                            onValueChange={val => setNewProf({ ...newProf, role: val })}
                                        >
                                            <SelectTrigger className="h-10 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px]">
                                                {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                                    <SelectItem key={v} value={v}>{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label className="text-xs">Company Name</Label>
                                            <Input
                                                placeholder="e.g. Acme Arch"
                                                value={newProf.company_name}
                                                onChange={e => setNewProf({ ...newProf, company_name: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs">Location</Label>
                                            <Input
                                                placeholder="e.g. Harare, ZW"
                                                value={newProf.location}
                                                onChange={e => setNewProf({ ...newProf, location: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={actionLoading === 'create'}>
                                        {actionLoading === 'create' ? <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                                        Add to Portal
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="icon" onClick={() => fetchData()} className="h-10 w-10 shrink-0 text-muted-foreground border-border/50">
                        <Icon name="refresh" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Professionals Table */}
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[200px]">Professional</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[140px]">Role / Company</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[100px]">Verification</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[100px]">Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground min-w-[100px]">Rating</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProfessionals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <Icon name="engineering" className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No professionals found in the team</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProfessionals.map((prof) => (
                                    <TableRow key={prof.id} className="hover:bg-muted/20 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                                                    <Icon name="person" className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-bold text-foreground truncate">{prof.full_name}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{prof.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <p className="text-[12px] font-bold text-foreground">
                                                    {ROLE_LABELS[prof.role] || prof.role}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {prof.company_name}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-bold group-hover:shadow-sm transition-all cursor-pointer ${prof.is_verified ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-muted text-muted-foreground border-border'}`}
                                                onClick={() => toggleVerification(prof.id, prof.is_verified)}
                                            >
                                                {actionLoading === `verify-${prof.id}` ? (
                                                    <Icon name="progress_activity" className="h-2.5 w-2.5 animate-spin mr-1" />
                                                ) : (
                                                    <Icon name={prof.is_verified ? "verified" : "help_outline"} className="h-2.5 w-2.5 mr-1" />
                                                )}
                                                {prof.is_verified ? 'Verified' : 'Unverified'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-[10px] font-bold rounded-lg border ${AVAILABILITY_STYLES[prof.availability] || ''}`}>
                                                {prof.availability}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Icon name="star" className="h-3 w-3 text-amber-400" />
                                                <span className="text-[12px] font-bold">{prof.average_rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground/30 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setDeleteTarget(prof)}
                                                disabled={!!actionLoading}
                                            >
                                                <Icon name="delete" className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove from Team?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            This will remove <strong>{deleteTarget?.full_name}</strong> from the public Building Team portal.
                            Their user account will NOT be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:justify-center pt-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {actionLoading?.startsWith('delete-') ? (
                                <Icon name="progress_activity" className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : null}
                            Remove Professional
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

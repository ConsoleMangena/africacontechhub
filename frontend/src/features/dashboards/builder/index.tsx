import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Plus, MapPin, DollarSign, AlertTriangle, Loader2,
    ShieldCheck, ClipboardList, FolderOpen, Image
} from 'lucide-react'
import { Project } from '@/types/api'
import { Route } from '@/routes/_authenticated/builder'
import { CreateProjectDialog } from './components/create-project-dialog'
import { ProjectsView } from './components/projects-view'
import { useProjects, useSiteUpdates, useDeleteProject } from './hooks/use-builder-data'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
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
} from "@/components/ui/alert-dialog"

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

export default function BuilderDashboard() {
    const navigate = Route.useNavigate()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

    const user = useAuthStore((state) => state.auth.user)
    const role = user?.profile?.role

    const { data: projects = [], refetch: refetchProjects, isLoading: isLoadingProjects } = useProjects(role)
    const { data: siteUpdates = [], isLoading: isLoadingSiteUpdates } = useSiteUpdates(role)

    const isLoading = isLoadingProjects || isLoadingSiteUpdates
    const deleteProjectMutation = useDeleteProject()

    const handleProjectCreated = () => {
        refetchProjects()
    }

    const handleEditProject = (project: Project) => {
        setSelectedProject(project)
        setIsCreateDialogOpen(true)
    }

    const handleDeleteProject = (project: Project) => {
        setProjectToDelete(project)
    }

    const confirmDelete = async () => {
        if (!projectToDelete) return
        deleteProjectMutation.mutate(projectToDelete.id, {
            onSettled: () => setProjectToDelete(null)
        })
    }

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-6">
                        {/* Hero Banner */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-emerald-50/80 to-teal-50/50 px-5 py-3.5 border border-green-200/50 flex items-center justify-between gap-4">
                            <div className="relative z-10">
                                <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                                    Aspirational Builder Dashboard
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Manage your projects and track progress
                                </p>
                            </div>
                            <div className="relative z-10">
                                <Button
                                    onClick={() => {
                                        setSelectedProject(null)
                                        setIsCreateDialogOpen(true)
                                    }}
                                    size="sm"
                                    className="rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    New Project
                                </Button>
                            </div>
                        </div>

                        <CreateProjectDialog
                            open={isCreateDialogOpen}
                            onOpenChange={(open) => {
                                setIsCreateDialogOpen(open)
                                if (!open) setSelectedProject(null)
                            }}
                            onSuccess={handleProjectCreated}
                            project={selectedProject}
                        />

                        {/* Stats */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Projects"
                                value={projects.length}
                                sub="Active construction sites"
                                icon={MapPin}
                                accentFrom="from-green-400"
                                accentTo="to-green-600"
                                iconBg="bg-green-100"
                                iconColor="text-green-600"
                            />
                            <StatCard
                                title="Total Budget"
                                value={`$${projects.reduce((acc, p) => acc + parseFloat(p.budget), 0).toLocaleString()}`}
                                sub="Across all projects"
                                icon={DollarSign}
                                accentFrom="from-blue-400"
                                accentTo="to-blue-600"
                                iconBg="bg-blue-100"
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                title="Pending Reviews"
                                value={siteUpdates.filter(u => !u.verified).length}
                                sub="Updates needing attention"
                                icon={AlertTriangle}
                                accentFrom="from-amber-400"
                                accentTo="to-amber-600"
                                iconBg="bg-amber-100"
                                iconColor="text-amber-600"
                            />
                            <StatCard
                                title="Verified Projects"
                                value={`${projects.filter(p => p.si56_verified).length}/${projects.length}`}
                                sub="SI 56 verified professionals"
                                icon={ShieldCheck}
                                accentFrom="from-purple-400"
                                accentTo="to-purple-600"
                                iconBg="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Recent Updates & Active Projects */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            <Card className="lg:col-span-4 border-border/60 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-primary" />
                                        Recent Site Updates
                                    </CardTitle>
                                    <CardDescription>
                                        Latest photos and progress reports from your sites.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {siteUpdates.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No updates yet.</p>
                                            </div>
                                        ) : (
                                            siteUpdates.map((update) => (
                                                <div key={update.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground leading-snug truncate">
                                                            {update.description}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(update.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${update.verified
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {update.verified ? 'Verified' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="ml-3 text-xs font-medium text-muted-foreground shrink-0">
                                                        #{update.project}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-3 border-border/60 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-primary" />
                                        Active Projects
                                    </CardTitle>
                                    <CardDescription>
                                        Overview of your ongoing projects.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {projects.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                                <p className="text-sm">No active projects.</p>
                                            </div>
                                        ) : (
                                            projects.map((project) => (
                                                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="space-y-0.5 flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground leading-none truncate">
                                                            {project.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {project.location}
                                                        </p>
                                                    </div>
                                                    <span className="ml-3 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium shrink-0">
                                                        {project.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Projects List */}
                        <ProjectsView
                            projects={projects}
                            onView={(project) => {
                                navigate({ to: '/builder/project/$projectId', params: { projectId: String(project.id) } })
                            }}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                        />

                        {/* Delete Confirmation */}
                        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the project
                                        "{projectToDelete?.title}" and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={confirmDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </Main>
        </>
    )
}

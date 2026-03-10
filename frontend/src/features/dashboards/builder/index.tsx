import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Project } from '@/types/api'
import { Route } from '@/routes/_authenticated/builder'
import { CreateProjectDialog } from './components/create-project-dialog'
import { ProjectsView } from './components/projects-view'
import { useProjects, useDeleteProject } from './hooks/use-builder-data'
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
import { WalletStats } from './components/wallet-stats'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function BuilderDashboard() {
    const navigate = Route.useNavigate()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

    const user = useAuthStore((state) => state.auth.user)
    const role = user?.profile?.role

    const { data: projects = [], refetch: refetchProjects, isLoading } = useProjects(role)

    const deleteProjectMutation = useDeleteProject()

    const handleProjectCreated = () => refetchProjects()
    const handleEditProject = (project: Project) => {
        setSelectedProject(project)
        setIsCreateDialogOpen(true)
    }
    const handleDeleteProject = (project: Project) => setProjectToDelete(project)
    const confirmDelete = async () => {
        if (!projectToDelete) return
        deleteProjectMutation.mutate(projectToDelete.id, {
            onSettled: () => setProjectToDelete(null)
        })
    }

    // Aggregations
    const totalBudget = projects.reduce((acc, p) => acc + parseFloat(p.budget || '0'), 0)

    // Filter projects by status
    const planningProjects = projects.filter(p => !p.status || p.status === 'PLANNING' || p.status === 'ON_HOLD')
    const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS')
    const completedProjects = projects.filter(p => p.status === 'COMPLETED')

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
                        <p className="mt-3 text-sm text-muted-foreground font-medium">Building your fortress...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2 border-b border-slate-200">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 font-display">
                                        Overview
                                    </h1>
                                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200 shadow-sm">
                                        <Icon name="gpp_good" size={14} /> 
                                        Title Armor: Verified
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-1 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></span>
                                    {projects.length} Active Projects
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    setSelectedProject(null)
                                    setIsCreateDialogOpen(true)
                                }}
                                className="w-full sm:w-auto rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
                            >
                                <Icon name="add" className="h-4 w-4 mr-2" />
                                New Project
                            </Button>
                        </div>

                        {/* Top Stats - Multi-Currency Wallet */}
                        <WalletStats totalBudget={totalBudget} />

                        {/* Active Sites (Tabs) */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <Tabs defaultValue="in-progress" className="w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                                        <Icon name="folder_open" size={20} className="text-blue-500" />
                                        Project Portfolio
                                    </h2>
                                    <TabsList className="bg-slate-50 border border-slate-200 p-1">
                                        <TabsTrigger value="planning" className="gap-2 px-4">
                                            <Icon name="assignment" size={14} className="text-blue-500" />
                                            Planning
                                            <span className="ml-1.5 flex h-4 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                                                {planningProjects.length}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger value="in-progress" className="gap-2 px-4">
                                            <Icon name="engineering" size={14} className="text-amber-500" />
                                            In Progress
                                            <span className="ml-1.5 flex h-4 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                                                {inProgressProjects.length}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger value="completed" className="gap-2 px-4">
                                            <Icon name="check_circle" size={14} className="text-emerald-500" />
                                            Completed
                                            <span className="ml-1.5 flex h-4 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">
                                                {completedProjects.length}
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="planning" className="focus-visible:outline-none">
                                    <ProjectsView
                                        projects={planningProjects}
                                        onView={(project) => {
                                            navigate({ to: '/builder/project/$projectId', params: { projectId: String(project.id) } })
                                        }}
                                        onEdit={handleEditProject}
                                        onDelete={handleDeleteProject}
                                    />
                                </TabsContent>
                                <TabsContent value="in-progress" className="focus-visible:outline-none">
                                    <ProjectsView
                                        projects={inProgressProjects}
                                        onView={(project) => {
                                            navigate({ to: '/builder/project/$projectId', params: { projectId: String(project.id) } })
                                        }}
                                        onEdit={handleEditProject}
                                        onDelete={handleDeleteProject}
                                    />
                                </TabsContent>
                                <TabsContent value="completed" className="focus-visible:outline-none">
                                    <ProjectsView
                                        projects={completedProjects}
                                        onView={(project) => {
                                            navigate({ to: '/builder/project/$projectId', params: { projectId: String(project.id) } })
                                        }}
                                        onEdit={handleEditProject}
                                        onDelete={handleDeleteProject}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Dialogs */}
                        <CreateProjectDialog
                            open={isCreateDialogOpen}
                            onOpenChange={(open) => {
                                setIsCreateDialogOpen(open)
                                if (!open) setSelectedProject(null)
                            }}
                            onSuccess={handleProjectCreated}
                            project={selectedProject}
                        />

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

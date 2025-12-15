import { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, DollarSign, AlertTriangle } from 'lucide-react'
import { Project } from '@/types/api'
import { Route } from '@/routes/_authenticated/builder'
import { CreateProjectDialog } from './components/create-project-dialog'
import { ProjectsView } from './components/projects-view'
import { useProjects, useSiteUpdates, useDeleteProject } from './hooks/use-builder-data'

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

export default function BuilderDashboard() {
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

    // Use React Query hooks
    const { data: projects = [], refetch: refetchProjects } = useProjects()
    const { data: siteUpdates = [] } = useSiteUpdates()
    const deleteProjectMutation = useDeleteProject()

    const currentTab = tab || 'overview'

    const handleTabChange = (value: string) => {
        navigate({ search: { tab: value } })
    }

    const handleProjectCreated = () => {
        refetchProjects() // Refresh projects list
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
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Builder Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        size="icon"
                        onClick={() => {
                            setSelectedProject(null)
                            setIsCreateDialogOpen(true)
                        }}
                        className="h-14 w-14 rounded-full bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:text-gray-50 dark:hover:bg-slate-900 dark:border-slate-800 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110"
                    >
                        <Plus className="h-6 w-6" />
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
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Home</TabsTrigger>
                    <TabsTrigger value="projects">My Projects</TabsTrigger>
                    <TabsTrigger value="escrow">Payments</TabsTrigger>
                    <TabsTrigger value="compliance">Verifications</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Projects
                                </CardTitle>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{projects.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active construction sites
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Budget
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${projects.reduce((acc, p) => acc + parseFloat(p.budget), 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all active projects
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Reviews
                                </CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3</div>
                                <p className="text-xs text-muted-foreground">
                                    Updates needing your attention
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Verified Builders
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {projects.filter(p => p.si56_verified).length}/{projects.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Projects with verified pros
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Site Updates</CardTitle>
                                <CardDescription>
                                    Latest photos and progress reports from your sites.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {siteUpdates.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No updates yet.</p>
                                    ) : (
                                        siteUpdates.map((update) => (
                                            <div key={update.id} className="flex items-center">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {update.description}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(update.created_at).toLocaleDateString()} - {update.verified ? 'Verified' : 'Pending Verification'}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">
                                                    Project #{update.project}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Active Projects</CardTitle>
                                <CardDescription>
                                    Overview of your ongoing projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {projects.map((project) => (
                                        <div key={project.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{project.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.location}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">{project.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                    <ProjectsView
                        projects={projects}
                        onView={(project) => {
                            navigate({ to: '/builder/project/$projectId', params: { projectId: String(project.id) } })
                        }}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                    />
                </TabsContent>
            </Tabs>



            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project "{projectToDelete?.title}" and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

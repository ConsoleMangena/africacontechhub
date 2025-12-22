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
import { ProfileForm } from '@/features/settings/profile/profile-form'
import { BuilderConnections } from './components/builder-connections'
import { EscrowView } from './components/escrow-view'
import { ContractorsView } from './components/contractors-view'

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
        <div className="flex-1 space-y-6 p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Builder Dashboard</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your projects and track progress</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => {
                            setSelectedProject(null)
                            setIsCreateDialogOpen(true)
                        }}
                        className="h-11 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
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
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Home</TabsTrigger>
                    <TabsTrigger value="projects">My Projects</TabsTrigger>
                    <TabsTrigger value="escrow">Payments</TabsTrigger>
                    <TabsTrigger value="compliance">Verifications</TabsTrigger>
                    <TabsTrigger value="profile">My Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                    Total Projects
                                </CardTitle>
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Active construction sites
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                    Total Budget
                                </CardTitle>
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    ${projects.reduce((acc, p) => acc + parseFloat(p.budget), 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Across all active projects
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                    Pending Reviews
                                </CardTitle>
                                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">3</div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Updates needing your attention
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                    Verified Builders
                                </CardTitle>
                                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        className="h-5 w-5 text-purple-600"
                                    >
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {projects.filter(p => p.si56_verified).length}/{projects.length}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Projects with verified pros
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">Recent Site Updates</CardTitle>
                                <CardDescription>
                                    Latest photos and progress reports from your sites.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {siteUpdates.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-500">No updates yet.</p>
                                        </div>
                                    ) : (
                                        siteUpdates.map((update) => (
                                            <div key={update.id} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="space-y-1 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                                        {update.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-gray-600">
                                                            {new Date(update.created_at).toLocaleDateString()}
                                                        </p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                            {update.verified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4 text-sm font-semibold text-gray-700">
                                                    #{update.project}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">Active Projects</CardTitle>
                                <CardDescription>
                                    Overview of your ongoing projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {projects.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-500">No active projects.</p>
                                        </div>
                                    ) : (
                                        projects.map((project) => (
                                            <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="space-y-1 flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 leading-none">{project.title}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {project.location}
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                                        {project.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
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

                <TabsContent value="escrow" className="space-y-4">
                    <EscrowView />
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance & Verifications</CardTitle>
                            <CardDescription>
                                Manage your project verifications and compliance requirements.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Compliance features coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contractors" className="space-y-4">
                    <ContractorsView />
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="md:col-span-1 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Profile</CardTitle>
                                    <CardDescription>
                                        Update your personal information and profile details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProfileForm />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-1">
                            <BuilderConnections />
                        </div>
                    </div>
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

import { Icon } from '@/components/ui/material-icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { Project } from '@/types/api'
import { DitDashboard } from '@/features/dashboards/builder/components/dit-dashboard'
import { DifyDashboard } from '@/features/dashboards/builder/components/dify-dashboard'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { AiChatButton } from '@/components/ai-chat-button'
import { toast } from 'sonner'
export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId',
)({
  component: ProjectRouteComponent,
})

function ProjectRouteComponent() {
  const { projectId } = Route.useParams()
  const navigate = Route.useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initiating, setInitiating] = useState(false)

  useEffect(() => {
    const id = Number(projectId)

    if (!id || Number.isNaN(id)) {
      setError('Invalid project id')
      setLoading(false)
      return
    }

    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await builderApi.getProject(id)
        setProject(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to load project', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleInitiateProject = async () => {
    if (!project) return
    setInitiating(true)
    try {
      const response = await builderApi.updateProject(project.id, { status: 'IN_PROGRESS' })
      setProject(response.data)
      toast.success('Project initiated! Status changed to In Progress.')
    } catch (err) {
      console.error('Failed to initiate project', err)
      toast.error('Failed to initiate project. Please try again.')
    } finally {
      setInitiating(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header showSidebarTrigger={false}>
          <div className="flex w-full items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate({ to: '/builder' })}>
              <Icon name="arrow_back" className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase">Project</p>
              <div className="h-4 w-32 rounded-full bg-muted animate-pulse" />
            </div>
            <div className='ms-auto flex items-center space-x-4'>
              <Search />
              <ProfileDropdown />
            </div>
          </div>
        </Header>
        <Main className="min-h-[70vh] bg-slate-50">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Icon name="progress_activity" size={40} className="animate-spin text-primary mb-3" />
            <p className="mt-3 text-sm text-muted-foreground font-medium">Loading project...</p>
          </div>
        </Main>
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Header showSidebarTrigger={false}>
          <div className="flex w-full items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate({ to: '/builder' })}>
              <Icon name="arrow_back" className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground font-semibold uppercase">Project</p>
              <p className="text-sm font-semibold text-destructive">{error ?? 'Project not found.'}</p>
            </div>
            <div className='ms-auto flex items-center space-x-4'>
              <Search />
              <ProfileDropdown />
            </div>
          </div>
        </Header>
        <Main className="min-h-[70vh] bg-slate-50">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-sm font-semibold text-destructive mb-1">{error ?? 'Project not found.'}</p>
            <p className="text-xs text-muted-foreground">Please try again or go back to your projects.</p>
          </div>
        </Main>
      </>
    )
  }

  const Dashboard = project.engagement_tier === 'DIFY' ? DifyDashboard : DitDashboard

  return (
    <>
      <Header showSidebarTrigger={false}>
        <div className="flex w-full items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate({ to: '/builder' })}>
            <Icon name="arrow_back" className="h-4 w-4" />
          </Button>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Project</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold leading-none text-foreground truncate max-w-[150px] sm:max-w-none">{project.title}</h1>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] sm:text-xs capitalize px-1.5 py-0">{project.status.replace('_', ' ').toLowerCase()}</Badge>
                <Badge className="text-[10px] px-1.5 py-0" variant="secondary">{project.engagement_tier}</Badge>
              </div>
            </div>
            {project.location && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">{project.location}</p>
            )}
          </div>
          <div className='ms-auto flex items-center justify-end gap-2 sm:gap-4'>
            {project.status === 'PLANNING' && (
              <Button
                size="sm"
                className="h-8 sm:h-9 bg-primary hover:bg-primary/90 text-primary-foreground px-2 sm:px-4"
                onClick={handleInitiateProject}
                disabled={initiating}
              >
                {initiating ? (
                  <Icon name="progress_activity" className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icon name="play_arrow" className="sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Initiate Project</span>
                  </>
                )}
              </Button>
            )}
            <div className="hidden sm:block">
              <Search />
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </Header>
      <Main className="bg-slate-50 pb-10">
        <Dashboard project={project} />
      </Main>
      <AiChatButton project={project} />
    </>
  )
}

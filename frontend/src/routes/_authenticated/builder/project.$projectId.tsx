import { Icon } from '@/components/ui/material-icon'
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
export const Route = createFileRoute(
  '/_authenticated/builder/project/$projectId',
)({
  component: ProjectRouteComponent,
})

function ProjectRouteComponent() {
  const { projectId } = Route.useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
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
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
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
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <Dashboard project={project} />
      </Main>
    </>
  )
}

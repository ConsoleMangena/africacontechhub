import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { builderApi } from '@/services/api'
import type { Project } from '@/types/api'
import { DiyDashboard } from '@/features/dashboards/builder/components/diy-dashboard'
import { DitDashboard } from '@/features/dashboards/builder/components/dit-dashboard'
import { DifyDashboard } from '@/features/dashboards/builder/components/dify-dashboard'

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
    return <div className="p-8">Loading project...</div>
  }

  if (error || !project) {
    return (
      <div className="p-8 text-red-600">
        {error ?? 'Project not found.'}
      </div>
    )
  }

  switch (project.engagement_tier) {
    case 'DIY':
      return <DiyDashboard project={project} />
    case 'DIT':
      return <DitDashboard project={project} />
    case 'DIFY':
      return <DifyDashboard project={project} />
    default:
      return <DiyDashboard project={project} />
  }
}

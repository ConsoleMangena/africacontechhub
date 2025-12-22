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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-600 text-lg font-semibold mb-2">{error ?? 'Project not found.'}</p>
          <p className="text-gray-600">Please try again or go back to your projects.</p>
        </div>
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

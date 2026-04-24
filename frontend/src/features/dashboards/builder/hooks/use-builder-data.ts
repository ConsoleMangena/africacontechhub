import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { toast } from 'sonner'

export function useProjects(role?: string) {
    return useQuery({
        queryKey: ['projects', role],
        queryFn: async () => {
            const response = await builderApi.getProjects()
            return response.data.results
        },
        enabled: !!role,
    })
}

export function useSiteUpdates(role?: string) {
    return useQuery({
        queryKey: ['site-updates', role],
        queryFn: async () => {
            const response = await builderApi.getSiteUpdates()
            return response.data.results
        },
        enabled: !!role,
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (projectId: number) => builderApi.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Project deleted successfully')
        },
        onError: () => {
            toast.error('Failed to delete project')
        },
    })
}

export function useBuilderConnections(role?: string) {
    return useQuery({
        queryKey: ['builder-connections', role],
        queryFn: async () => {
            // Placeholder: Typically would fetch from a specific connections endpoint
            // or filter from projects. For now, we'll try to get projects and 
            // return an empty structure if not found to avoid breaking UI.
            try {
                await builderApi.getProjects()
                // Return an empty structure to avoid breaking UI while maintaining the hook
                return {
                    contractors: [],
                    suppliers: []
                }
            } catch {
                return { contractors: [], suppliers: [] }
            }
        },
        enabled: !!role,
    })
}

export function useProjectConnections(projectId: number) {
    return useQuery({
        queryKey: ['project-connections', projectId],
        queryFn: async () => {
            try {
                const response = await builderApi.getProjectDashboard(projectId)
                return {
                    contractors: response.data.contractors || [],
                    suppliers: response.data.suppliers || []
                }
            } catch {
                return { contractors: [], suppliers: [] }
            }
        },
        enabled: !!projectId,
    })
}

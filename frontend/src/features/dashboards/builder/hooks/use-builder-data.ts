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

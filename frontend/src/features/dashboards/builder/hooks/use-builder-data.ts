import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { toast } from 'sonner'

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await builderApi.getProjects()
            return response.data.results
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useSiteUpdates = () => {
    return useQuery({
        queryKey: ['site-updates'],
        queryFn: async () => {
            const response = await builderApi.getSiteUpdates()
            return response.data.results
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useDeleteProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (projectId: number) => builderApi.deleteProject(projectId),
        onSuccess: () => {
            toast.success('Project deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: (error) => {
            console.error('Failed to delete project:', error)
            toast.error('Failed to delete project')
        },
    })
}

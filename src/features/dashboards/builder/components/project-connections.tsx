import { useProjectConnections } from '../hooks/use-builder-data'
import { Briefcase, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProjectConnectionsProps {
    projectId: number
}

export function ProjectConnections({ projectId }: ProjectConnectionsProps) {
    const { data, isLoading } = useProjectConnections(projectId)

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Loading connections...</span>
            </div>
        )
    }

    if (!data) {
        return null
    }

    const contractors = data.contractors || []
    const suppliers = data.suppliers || []

    if (contractors.length === 0 && suppliers.length === 0) {
        return (
            <div className="text-xs text-muted-foreground">
                No connections yet
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {contractors.length > 0 && (
                <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-blue-600" />
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {contractors.length} {contractors.length === 1 ? 'Contractor' : 'Contractors'}
                    </Badge>
                </div>
            )}
            {suppliers.length > 0 && (
                <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-green-600" />
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                        {suppliers.length} {suppliers.length === 1 ? 'Supplier' : 'Suppliers'}
                    </Badge>
                </div>
            )}
        </div>
    )
}


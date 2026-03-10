import { Icon } from '@/components/ui/material-icon'
import { useProjectConnections } from '../hooks/use-builder-data'
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
                    <Icon name="work" className="h-3 w-3 text-blue-600" />
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {contractors.length} {contractors.length === 1 ? 'Contractor' : 'Contractors'}
                    </Badge>
                </div>
            )}
            {suppliers.length > 0 && (
                <div className="flex items-center gap-1">
                    <Icon name="package" className="h-3 w-3 text-green-600" />
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {suppliers.length} {suppliers.length === 1 ? 'Supplier' : 'Suppliers'}
                    </Badge>
                </div>
            )}
        </div>
    )
}


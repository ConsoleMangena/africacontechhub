import { Icon } from '@/components/ui/material-icon'
import { Loading } from '@/components/ui/loading'
import { useProjectConnections } from '../hooks/use-builder-data'
import { Badge } from '@/components/ui/badge'

interface ProjectConnectionsProps {
    projectId: number
}

export function ProjectConnections({ projectId }: ProjectConnectionsProps) {
    const { data, isLoading } = useProjectConnections(projectId)

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-1">
                <Loading size={14} text="" />
                <span className="text-[10px] text-muted-foreground font-medium animate-pulse">Syncing...</span>
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
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200">
                        <Icon name="domain" size={12} className="mr-1" />
                        {contractors.length} {contractors.length === 1 ? 'Contractor' : 'Contractors'}
                    </Badge>
                </div>
            )}
            {suppliers.length > 0 && (
                <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200">
                        <Icon name="package_2" size={12} className="mr-1" />
                        {suppliers.length} {suppliers.length === 1 ? 'Supplier' : 'Suppliers'}
                    </Badge>
                </div>
            )}
        </div>
    )
}


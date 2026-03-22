import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/types/api'

const statusConfig: Record<Project['status'], { label: string; className: string }> = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
}

const tierConfig: Record<Project['engagement_tier'], { label: string; icon: string; className: string }> = {
    DIT: { label: 'DIT', icon: 'group', className: 'text-indigo-600 bg-indigo-100' },
    DIFY: { label: 'DIFY', icon: 'gpp_good', className: 'text-teal-600 bg-teal-100' },
}

interface ProjectsViewProps {
    projects: Project[]
    onView: (project: Project) => void
    onEdit: (project: Project) => void
    onDelete: (project: Project) => void
}

export function ProjectsView({ projects, onView, onEdit, onDelete }: ProjectsViewProps) {
    if (projects.length === 0) {
        return (
            <Card className="border-border/60 bg-card">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Icon name="folder_open" size={48} className="text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No projects yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Create your first project to get started.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/60 bg-card">
            <CardHeader>
                <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
                    <Icon name="folder_open" size={16} className="text-primary" />
                    All Projects
                </CardTitle>
                <CardDescription>
                    Manage and track all your construction projects.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {projects.map((project) => {
                        const tier = tierConfig[project.engagement_tier]
                        const statusBadge = statusConfig[project.status]
                        const tierIconName = tier?.icon || 'group'

                        return (
                            <div
                                key={project.id}
                                className="group relative rounded-lg border border-border/60 bg-card p-4 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground truncate">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                            <Icon name="location_on" size={12} className="shrink-0" />
                                            <span className="truncate">{project.location}</span>
                                        </div>
                                    </div>
                                    <Badge className={`shrink-0 ml-2 text-xs ${statusBadge?.className || ''}`}>
                                        {statusBadge?.label || project.status}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                        <Icon name="attach_money" size={12} />
                                        <span>${parseFloat(project.budget).toLocaleString()}</span>
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] sm:text-xs whitespace-nowrap ${tier?.className || ''}`}>
                                        <Icon name={tierIconName} size={12} className="mr-1" />
                                        {tier?.label || project.engagement_tier}
                                    </Badge>
                                    {project.si56_verified && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs text-green-600 bg-green-50 whitespace-nowrap">
                                            <Icon name="gpp_good" size={12} className="mr-1" />
                                            SI 56
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] sm:text-xs text-blue-600 bg-blue-50 whitespace-nowrap">
                                        <Icon name="groups" size={12} className="mr-1" />
                                        {project.total_team_count} Artisans
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[11px] sm:text-xs flex-1 min-w-[60px]"
                                        onClick={() => onView(project)}
                                    >
                                        <Icon name="visibility" size={14} className="mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[11px] sm:text-xs flex-1 min-w-[60px]"
                                        onClick={() => onEdit(project)}
                                    >
                                        <Icon name="edit" size={14} className="mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[11px] sm:text-xs flex-1 min-w-[60px] text-destructive hover:text-destructive"
                                        onClick={() => onDelete(project)}
                                    >
                                        <Icon name="delete" size={14} className="mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

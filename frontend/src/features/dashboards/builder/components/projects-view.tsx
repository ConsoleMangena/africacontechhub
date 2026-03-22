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
    PLANNING: { label: 'Planning', className: 'bg-slate-100 text-slate-700' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-slate-900 text-white' },
    ON_HOLD: { label: 'On Hold', className: 'bg-slate-50 text-slate-400' },
    COMPLETED: { label: 'Completed', className: 'bg-slate-200 text-slate-800' },
}

const tierConfig: Record<Project['engagement_tier'], { label: string; icon: string; className: string }> = {
    DIT: { label: 'DIT', icon: 'group', className: 'text-slate-900 bg-slate-50' },
    DIFY: { label: 'DIFY', icon: 'gpp_good', className: 'text-slate-900 bg-slate-100' },
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
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900">
                    <Icon name="folder_open" size={16} className="text-slate-400" />
                    Project Portfolio
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
                                className="group relative rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-900 transition-all duration-300 shadow-none overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                    <Badge className={`shrink-0 ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-none shadow-none ${statusBadge?.className || ''}`}>
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
                                        <Badge variant="outline" className="text-[10px] text-slate-900 bg-slate-50 border-slate-200 whitespace-nowrap font-bold uppercase tracking-tighter">
                                            <Icon name="gpp_good" size={12} className="mr-1" />
                                            SI 56 Verified
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] text-slate-900 bg-slate-50 border-slate-200 whitespace-nowrap font-bold uppercase tracking-tighter">
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

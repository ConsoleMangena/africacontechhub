import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    MapPin,
    DollarSign,
    Eye,
    Pencil,
    Trash2,
    Users,
    ShieldCheck,
    FolderOpen,
} from 'lucide-react'
import { Project } from '@/types/api'

const statusConfig: Record<Project['status'], { label: string; className: string }> = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
}

const tierConfig: Record<Project['engagement_tier'], { label: string; icon: React.ElementType; className: string }> = {
    DIT: { label: 'DIT', icon: Users, className: 'text-indigo-600 bg-indigo-100' },
    DIFY: { label: 'DIFY', icon: ShieldCheck, className: 'text-teal-600 bg-teal-100' },
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
                    <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
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
                    <FolderOpen className="h-4 w-4 text-primary" />
                    All Projects
                </CardTitle>
                <CardDescription>
                    Manage and track all your construction projects.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                        const tier = tierConfig[project.engagement_tier]
                        const statusBadge = statusConfig[project.status]
                        const TierIcon = tier?.icon || Users

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
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{project.location}</span>
                                        </div>
                                    </div>
                                    <Badge className={`shrink-0 ml-2 text-xs ${statusBadge?.className || ''}`}>
                                        {statusBadge?.label || project.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <DollarSign className="h-3 w-3" />
                                        <span>${parseFloat(project.budget).toLocaleString()}</span>
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${tier?.className || ''}`}>
                                        <TierIcon className="h-3 w-3 mr-1" />
                                        {tier?.label || project.engagement_tier}
                                    </Badge>
                                    {project.si56_verified && (
                                        <Badge variant="outline" className="text-xs text-green-600 bg-green-50">
                                            <ShieldCheck className="h-3 w-3 mr-1" />
                                            SI 56
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs flex-1"
                                        onClick={() => onView(project)}
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs flex-1"
                                        onClick={() => onEdit(project)}
                                    >
                                        <Pencil className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs flex-1 text-destructive hover:text-destructive"
                                        onClick={() => onDelete(project)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
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

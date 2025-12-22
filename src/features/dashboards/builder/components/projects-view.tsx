import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    MapPin,
    DollarSign,
    Calendar,
    Edit,
    Trash2,
    Search,
    Filter,
    Hammer,
    Users,
    ShieldCheck,
    FolderOpen
} from 'lucide-react'
import { Project } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'
import { ProjectConnections } from './project-connections'

interface ProjectsViewProps {
    projects: Project[]
    onEdit?: (project: Project) => void
    onDelete?: (project: Project) => void
    onView?: (project: Project) => void
}

const statusConfig = {
    PLANNING: { label: 'Planning', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
    ON_HOLD: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
}

const tierConfig = {
    DIY: { label: 'DIY', icon: Hammer, className: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    DIT: { label: 'DIT', icon: Users, className: 'text-indigo-600 bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' },
    DIFY: { label: 'DIFY', icon: ShieldCheck, className: 'text-teal-600 bg-teal-100 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' },
}

export function ProjectsView({ projects, onEdit, onDelete, onView }: ProjectsViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'date' | 'budget' | 'title'>('date')

    // Filter and sort projects
    const filteredProjects = projects
        .filter((project) => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.location.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter
            return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            } else if (sortBy === 'budget') {
                return parseFloat(b.budget) - parseFloat(a.budget)
            } else {
                return a.title.localeCompare(b.title)
            }
        })

    if (projects.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='rounded-full bg-gray-100 p-6 mb-4'>
                    <MapPin className='h-12 w-12 text-gray-600' />
                </div>
                <h3 className='text-lg font-semibold mb-2 text-gray-900'>No projects yet</h3>
                <p className='text-gray-600 mb-4 max-w-sm'>
                    Get started by creating your first construction project. Click the + button above to begin.
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Filters and Search */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500' />
                    <Input
                        placeholder='Search projects by title or location...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10'
                    />
                </div>
                <div className='flex gap-2'>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='w-[180px]'>
                            <Filter className='mr-2 h-4 w-4' />
                            <SelectValue placeholder='Filter by status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Statuses</SelectItem>
                            <SelectItem value='PLANNING'>Planning</SelectItem>
                            <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                            <SelectItem value='ON_HOLD'>On Hold</SelectItem>
                            <SelectItem value='COMPLETED'>Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='date'>Date Created</SelectItem>
                            <SelectItem value='budget'>Budget</SelectItem>
                            <SelectItem value='title'>Title</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Count */}
            <div className='text-sm text-gray-600'>
                Showing {filteredProjects.length} of {projects.length} projects
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className='text-center py-12'>
                    <p className='text-gray-600'>No projects match your search criteria</p>
                </div>
            ) : (
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-8'>
                    {filteredProjects.map((project) => {
                        const tier = project.engagement_tier || 'DIY'
                        const TierIcon = tierConfig[tier].icon

                        return (
                            <Card key={project.id} className='group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col'>
                                <CardHeader className="block space-y-4">
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1 min-w-0 mr-2'>
                                            <CardTitle className='text-lg truncate'>{project.title}</CardTitle>
                                            <CardDescription className='flex items-center gap-1 mt-1'>
                                                <MapPin className='h-3 w-3' />
                                                <span className='truncate'>{project.location}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge className={statusConfig[project.status].className}>
                                            {statusConfig[project.status].label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Badge variant="outline" className={tierConfig[tier].className}>
                                            <TierIcon className="w-3 h-3 mr-1" />
                                            {tierConfig[tier].label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className='space-y-4 flex-1 flex flex-col'>
                                    <div className='space-y-2 flex-1'>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-gray-600 flex items-center gap-1'>
                                                <DollarSign className='h-4 w-4' />
                                                Budget
                                            </span>
                                            <span className='font-semibold text-gray-900'>
                                                ${parseFloat(project.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-gray-600 flex items-center gap-1'>
                                                <Calendar className='h-4 w-4' />
                                                Created
                                            </span>
                                            <span className='text-gray-600'>
                                                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {project.si56_verified && (
                                            <div className='flex items-center gap-1 text-sm text-green-600 dark:text-green-400'>
                                                <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                                                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                                                </svg>
                                                SI 56 Verified
                                            </div>
                                        )}
                                        <div className='pt-2 border-t'>
                                            <ProjectConnections projectId={project.id} />
                                        </div>
                                    </div>

                                    <div className='flex gap-2 pt-4 border-t mt-auto'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='flex-1'
                                            onClick={() => onView?.(project)}
                                        >
                                            <FolderOpen className='h-4 w-4 mr-1' />
                                            Open Project
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='flex-1'
                                            onClick={() => onEdit?.(project)}
                                            disabled={tier === 'DIFY'}
                                            title={tier === 'DIFY' ? 'Managed by DzeNhare' : 'Edit Project'}
                                        >
                                            <Edit className='h-4 w-4 mr-1' />
                                            Edit
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => onDelete?.(project)}
                                            className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                                            disabled={tier === 'DIFY'}
                                            title={tier === 'DIFY' ? 'Managed by DzeNhare' : 'Delete Project'}
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

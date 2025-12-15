import { Progress } from '@/components/ui/progress'

const projects = [
    {
        name: 'Residential Complex - Harare',
        progress: 75,
        value: '$280,000',
        status: 'On Track',
    },
    {
        name: 'Office Building - Bulawayo',
        progress: 45,
        value: '$520,000',
        status: 'On Track',
    },
    {
        name: 'Shopping Center - Gweru',
        progress: 62,
        value: '$1,200,000',
        status: 'Delayed',
    },
    {
        name: 'Housing Development',
        progress: 30,
        value: '$450,000',
        status: 'On Track',
    },
]

export function ActiveProjects() {
    return (
        <div className='space-y-6'>
            {projects.map((project, index) => (
                <div key={index} className='space-y-2'>
                    <div className='flex items-start justify-between'>
                        <div className='space-y-1 flex-1'>
                            <p className='text-sm font-medium leading-none'>{project.name}</p>
                            <p className='text-muted-foreground text-xs'>
                                {project.value} • {project.status}
                            </p>
                        </div>
                    </div>
                    <div className='space-y-1'>
                        <Progress value={project.progress} className='h-2' />
                        <p className='text-muted-foreground text-xs text-right'>
                            {project.progress}% complete
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

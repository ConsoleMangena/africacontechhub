import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/material-icon'
import { ProjectModeBadge } from '@/components/project-mode-badge'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/api'

const statusConfig: Record<Project['status'], { label: string; cls: string; icon: string }> = {
  PLANNING: {
    label: 'Planning',
    cls: 'bg-slate-100 text-slate-600 border border-slate-200',
    icon: 'architecture',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: 'rocket_launch',
  },
  COMPLETED: {
    label: 'Completed',
    cls: 'bg-violet-50 text-violet-700 border border-violet-200',
    icon: 'check_circle',
  },
  ON_HOLD: {
    label: 'On Hold',
    cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: 'pause_circle',
  },
}

interface ProjectWorkspacePickerProps {
  title: string
  description: string
  projects: Project[]
  loading?: boolean
  onSelectProject: (projectId: number) => void
  onPrimaryAction?: () => void
  primaryActionLabel?: string
  emptyTitle?: string
  emptyDescription?: string
}

function formatBudget(value: string) {
  const amount = Number(value || '0')
  if (!Number.isFinite(amount) || amount <= 0) return '—'
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

function PickerSkeleton() {
  return (
    <div className="space-y-3 p-3 sm:p-4">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
            <div className="mt-2 h-3 w-52 rounded bg-slate-100 animate-pulse" />
            <div className="mt-3 flex gap-3">
              <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 h-4 w-24 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectWorkspacePicker({
  title,
  description,
  projects,
  loading = false,
  onSelectProject,
  onPrimaryAction,
  primaryActionLabel = 'Create Project',
  emptyTitle = 'No projects available yet',
  emptyDescription = 'Create your first project to unlock the workspace tiles.',
}: ProjectWorkspacePickerProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return projects
    const q = search.toLowerCase()
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.building_type?.toLowerCase().includes(q),
    )
  }, [projects, search])

  if (loading) return <PickerSkeleton />

  return (
    <div className="space-y-4 sm:space-y-6">
      <style>{`@keyframes tileIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 4 && (
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="h-9 w-full sm:w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
          {onPrimaryAction && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrimaryAction}
              className="h-9 rounded-lg border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50"
            >
              <Icon name="add" size={14} className="mr-1" />
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Icon name="folder_off" size={28} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-sm font-bold text-slate-900">{emptyTitle}</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500">{emptyDescription}</p>
          {onPrimaryAction && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrimaryAction}
              className="mt-4 h-8 rounded-lg border-slate-200 px-3 text-xs font-semibold"
            >
              <Icon name="add" size={14} className="mr-1" />
              {primaryActionLabel}
            </Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
          <Icon name="search_off" size={24} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">
            No projects match "<span className="font-semibold text-slate-700">{search}</span>"
          </p>
          <button type="button" onClick={() => setSearch('')} className="mt-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700">
            Clear search
          </button>
        </div>
      ) : (
        /* Project tiles grid — matches measurements page tile style */
        <div className="space-y-3 p-0">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, idx) => {
              const status = statusConfig[project.status]
              const meta = [project.location, project.building_type].filter(Boolean)

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className="group rounded-xl border border-slate-200 bg-white p-3 sm:p-4 text-left hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                  style={{ animation: `tileIn 0.35s ease-out ${idx * 40}ms both` }}
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1 line-clamp-2">{project.title}</p>
                    <div className="flex gap-1 shrink-0 items-center">
                      {project.si56_verified && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-100">SI56</span>
                      )}
                      <Icon name="arrow_forward" size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>

                  {/* Location / type */}
                  {meta.length > 0 && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{meta.join(' · ')}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider', status.cls)}>
                      <Icon name={status.icon} size={12} />
                      {status.label}
                    </span>
                    <ProjectModeBadge engagementTier={project.engagement_tier} size="sm" />
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>Budget: {formatBudget(project.budget)}</span>
                    <span>Team: {project.total_team_count || 0}</span>
                    {project.timeline && <span>{project.timeline}</span>}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end mt-2 sm:mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-600 transition-colors">
                      Open workspace
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { Icon } from "@/components/ui/material-icon";
import { useState, useEffect, useCallback } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { ProjectWorkspacePicker } from "@/features/dashboards/builder/components/project-workspace-picker";
import { builderApi } from "@/services/api";
import type { Project, BOQScheduleTask } from "@/types/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/builder/task-board")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: (search.projectId as string) || undefined,
  }),
});

type KanbanColumn = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

interface EnhancedTask extends BOQScheduleTask {
  kanban_status?: KanbanColumn;
  priority?: "low" | "medium" | "high";
  assignee_name?: string;
}

const COLUMN_COLORS: Record<KanbanColumn, { bg: string, text: string, border: string, badgeBg: string }> = {
  TODO: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", badgeBg: "bg-slate-200/50" },
  IN_PROGRESS: { bg: "bg-blue-50/50", text: "text-blue-700", border: "border-blue-100", badgeBg: "bg-blue-200/50" },
  BLOCKED: { bg: "bg-red-50/50", text: "text-red-700", border: "border-red-100", badgeBg: "bg-red-200/50" },
  DONE: { bg: "bg-emerald-50/50", text: "text-emerald-700", border: "border-emerald-100", badgeBg: "bg-emerald-200/50" },
};

const COLUMN_TITLES: Record<KanbanColumn, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Completed"
};

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch();
  const navigate = useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId);
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const selectProject = (id: number) => {
    setSelectedProject(id);
    builderStore.selectProject(id);
    navigate({
      to: "/builder/task-board",
      search: { projectId: String(id) },
      replace: true,
    });
  };

  const exitProject = useCallback(() => {
    setSelectedProject(null);
    builderStore.exitProject();
    navigate({
      to: "/builder/task-board",
      search: { projectId: undefined },
      replace: true,
    });
  }, [navigate, builderStore]);

  const currentProject = projects.find((p) => p.id === selectedProject);

  useEffect(() => {
    setSelectedProject(searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null);
  }, [searchProjectId, builderStore.selectedProjectId]);

  useEffect(() => {
    setLoadingProjects(true);
    builderApi
      .getProjects()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
        setProjects(data);
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoadingTasks(true);

    builderApi.getProjectBOQScheduleTasks(selectedProject, 'final')
      .catch(() => builderApi.getProjectBOQScheduleTasks(selectedProject, 'preliminary'))
      .catch(() => ({ data: [] }))
      .then((res) => {
        const baseTasks = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
        // Mock statuses and priorities for demo purposes since we don't have this in DB yet
        const decorated = baseTasks.map((t: BOQScheduleTask, i: number) => ({
          ...t,
          kanban_status: i % 7 === 0 ? 'BLOCKED' : i % 5 === 0 ? 'DONE' : i % 2 === 0 ? 'IN_PROGRESS' : 'TODO',
          priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
          assignee_name: i % 4 === 0 ? 'Sarah Jenkins' : i % 3 === 0 ? 'Michael Chang' : 'Unassigned'
        }));
        setTasks(decorated);
      })
      .finally(() => setLoadingTasks(false));
  }, [selectedProject]);

  const moveTask = (taskId: number, newStatus: KanbanColumn) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, kanban_status: newStatus } : t));
    toast.success(`Task moved to ${COLUMN_TITLES[newStatus]}`);
  };

  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4"><Search /><ProfileDropdown /></div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Select a project tile to activate the Kanban Task Board."
              projects={[]} loading onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })} primaryActionLabel="Open Portfolio"
            />
          </div>
        </Main>
      </>
    );
  }

  if (!selectedProject || !currentProject) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4"><Search /><ProfileDropdown /></div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Pick a project to load its active schedule tasks into a visual progression board."
              projects={projects} onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })} primaryActionLabel="Open Portfolio"
              emptyTitle="No projects available"
            />
          </div>
        </Main>
      </>
    );
  }

  const columns: KanbanColumn[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-white min-h-[calc(100vh-theme(spacing.16))]">
        <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col space-y-6 max-h-[calc(100vh-theme(spacing.16))]">
          
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 shrink-0">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 font-display">
                <Icon name="view_kanban" className="text-slate-800" size={28} />
                Task Board
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Visualizing schedule activities for <strong>{currentProject.title}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  toast.success("Syncing schedule with latest Budget changes...");
                }}
                className="h-10 px-4 flex items-center text-xs font-bold uppercase tracking-widest rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Icon name="sync" size={16} className="mr-1.5 text-slate-400" />
                Sync Schedule
              </button>
              <button
                onClick={exitProject}
                className="h-10 px-4 flex items-center text-xs font-bold uppercase tracking-widest rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Icon name="logout" size={16} className="mr-1.5" />
                Switch Project
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto pb-4">
            {loadingTasks ? (
               <div className="flex items-center justify-center h-full">
                 <Icon name="autorenew" size={40} className="animate-spin text-slate-300" />
               </div>
            ) : (
               <div className="flex gap-6 h-full min-w-max items-stretch pb-2">
                 {columns.map((col) => {
                   const colTasks = tasks.filter(t => t.kanban_status === col);
                   const config = COLUMN_COLORS[col];
                   
                   return (
                     <div key={col} className={`w-80 flex flex-col rounded-2xl border ${config.border} bg-white shadow-sm overflow-hidden`}>
                       {/* Column Header */}
                       <div className={`px-4 py-3 border-b ${config.border} ${config.bg} flex items-center justify-between shrink-0`}>
                          <h3 className={`text-xs font-bold uppercase tracking-widest ${config.text}`}>
                            {COLUMN_TITLES[col]}
                          </h3>
                          <span className={`text-[10px] font-black tabular-nums py-0.5 px-2 rounded-full ${config.text} ${config.badgeBg}`}>
                            {colTasks.length}
                          </span>
                       </div>

                       {/* Column Body / Scrollable Area */}
                       <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                          {colTasks.map((task, idx) => (
                            <Card key={task.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                              <CardContent className="p-4">
                                
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {task.priority || 'Low'}
                                    </span>
                                  </div>
                                  
                                  {/* Quick Actions Dropdown (Simulated with simple buttons on hover) */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -mt-1 -mr-1">
                                    {col !== 'TODO' && (
                                      <button onClick={() => moveTask(task.id, 'TODO')} className="p-1 text-slate-300 hover:text-slate-600 rounded" title="Move to To Do">
                                         <Icon name="arrow_back" size={14} />
                                      </button>
                                    )}
                                    {col !== 'DONE' && (
                                      <button onClick={() => moveTask(task.id, 'DONE')} className="p-1 text-slate-300 hover:text-emerald-600 rounded" title="Mark Done">
                                         <Icon name="check" size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <h4 className="text-sm font-bold text-slate-800 leading-snug mb-3">
                                  {task.task_description || task.wbs || 'Untitled Schedule Task'}
                                </h4>

                                {(task.start_date || task.end_date) && (
                                  <div className="flex items-center gap-1.5 mb-4 text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
                                    <Icon name="calendar_today" size={12} className="text-slate-400" />
                                    <span>
                                      {task.start_date || '?'} <span className="text-slate-300 mx-0.5">→</span> {task.end_date || '?'}
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                                  <div className="flex items-center gap-2">
                                    {task.assignee_name && task.assignee_name !== 'Unassigned' ? (
                                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200" title={task.assignee_name}>
                                        {task.assignee_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                      </div>
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 border-dashed" title="Unassigned">
                                        <Icon name="person" size={12} />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {task.est_cost && (
                                    <span className="text-[10px] font-bold text-slate-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 tabular-nums">
                                      ${Number(task.est_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                  )}
                                </div>

                              </CardContent>
                            </Card>
                          ))}
                          
                          {colTasks.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold">
                              Drag tasks here
                            </div>
                          )}
                       </div>
                     </div>
                   );
                 })}
               </div>
            )}
          </div>

        </div>
      </Main>
    </>
  );
}

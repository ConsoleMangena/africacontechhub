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
import type { Project } from "@/types/api";
import { toast } from "sonner";
import SupplyChainAggregator from "@/features/dashboards/builder/supply-aggregator";

export const Route = createFileRoute("/_authenticated/builder/group-buy")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: (search.projectId as string) || undefined,
  }),
});

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch();
  const navigate = useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId);

  const selectProject = (id: number) => {
    setSelectedProject(id);
    builderStore.selectProject(id);
    navigate({
      to: "/builder/group-buy",
      search: { projectId: String(id) },
      replace: true,
    });
  };

  const exitProject = useCallback(() => {
    setSelectedProject(null);
    builderStore.exitProject();
    navigate({
      to: "/builder/group-buy",
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



  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Select a project tile to activate the Group Buy Aggregator."
              projects={[]}
              loading
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })}
              primaryActionLabel="Open Portfolio"
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
          <div className="ms-auto flex items-center space-x-4">
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Pick a project to join aggregate material pools with neighboring builds and drastically reduce your logistics and unit costs."
              projects={projects}
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })}
              primaryActionLabel="Open Portfolio"
              emptyTitle="No projects ready"
              emptyDescription="Create a project from the builder portfolio first, then return here to use the Group Buy Aggregator."
            />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))] p-0">
        <SupplyChainAggregator projectId={resolvedProjectId} />
      </Main>
    </>
  );
}

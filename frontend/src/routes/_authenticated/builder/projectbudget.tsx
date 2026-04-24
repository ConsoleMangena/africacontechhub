import { createFileRoute } from "@tanstack/react-router";
import BOQMeasurements, { type BOQMeasurementsProps } from "@/features/dashboards/builder/boq-measurements";
import { useBuilderStore } from "@/stores/builder-store";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";

export const Route = createFileRoute("/_authenticated/builder/projectbudget")({
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: search.projectId ? Number(search.projectId) : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = projectId ?? builderStore.selectedProjectId ?? null;
  const boqMeasurementsProps: BOQMeasurementsProps = {
    initialProjectId: resolvedProjectId,
    onSelectProject: (nextProjectId: number) => {
      builderStore.selectProject(nextProjectId);
      navigate({
        to: "/builder/projectbudget",
        search: { projectId: nextProjectId },
        replace: true,
      });
    },
    onExitProject: () => {
      builderStore.exitProject();
      navigate({
        to: "/builder/projectbudget",
        search: { projectId: undefined },
        replace: true,
      });
    },
    onOpenPortfolio: () => {
      void navigate({ to: "/builder" });
    },
  };

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <BOQMeasurements {...boqMeasurementsProps} />
      </Main>
    </>
  );
}

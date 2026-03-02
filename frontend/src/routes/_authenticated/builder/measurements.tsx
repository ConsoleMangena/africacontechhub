import { createFileRoute } from "@tanstack/react-router";
import BOQMeasurements from "@/features/dashboards/builder/boq-measurements";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";

export const Route = createFileRoute("/_authenticated/builder/measurements")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <BOQMeasurements />
      </Main>
    </>
  );
}

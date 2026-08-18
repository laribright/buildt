import { Grid2X2 } from "lucide-react";

import { ProjectList } from "@/features/projects/project-list";
import type { ProjectFilters as ProjectFilterValues } from "@/features/projects/types";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { redirect } from "next/navigation";
import { listProjectsByProfileId } from "@/features/projects/project-model.server";

type BuildsSearchParams = {
  query?: string;
  status?: string;
  view?: string;
};

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: Promise<BuildsSearchParams>;
}) {
  const user = await retrieveCurrentUser();

  if (!user) redirect("/");
  const projects = await listProjectsByProfileId(user.id);

  const {
    query: queryParam,
    status: statusParam,
    view: viewParam,
  } = await searchParams;
  const query = queryParam ?? "";
  const status: ProjectFilterValues["status"] =
    statusParam === "active" || statusParam === "draft"
      ? statusParam
      : undefined;
  const view = viewParam === "list" ? "list" : "grid";

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-3">
          <Grid2X2 className="size-6" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">Projects</h1>
        </div>

        <ProjectList
          projects={projects}
          query={query}
          status={status}
          username={user.username}
          view={view}
        />
      </div>
    </main>
  );
}

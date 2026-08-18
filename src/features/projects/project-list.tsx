"use client";

import { Grid2X2, List } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  filterProjects,
  projectListHref,
  type ProjectListView,
} from "@/features/projects/project-helpers";
import { ProjectCard } from "@/features/projects/project-card";
import { ProjectFilters } from "@/features/projects/project-filters";
import type { Project, ProjectFilters as ProjectFilterValues } from "@/features/projects/types";
import { cn } from "@/lib/utils";

type ProjectListProps = {
  projects: Project[];
  query: string;
  status?: ProjectFilterValues["status"];
  username: string;
  view: ProjectListView;
};

export function ProjectList({
  projects,
  query: initialQuery,
  status: initialStatus,
  username,
  view: initialView,
}: ProjectListProps) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [view, setView] = useState(initialView);

  const filteredProjects = filterProjects(projects, { query, status });

  function syncUrl(next: {
    query: string;
    status?: ProjectFilterValues["status"];
    view: ProjectListView;
  }) {
    window.history.replaceState(null, "", projectListHref(next));
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    syncUrl({ query: nextQuery, status, view });
  }

  function changeStatus(nextStatus: ProjectFilterValues["status"] | undefined) {
    setStatus(nextStatus);
    syncUrl({ query, status: nextStatus, view });
  }

  function changeView(nextView: ProjectListView) {
    setView(nextView);
    syncUrl({ query, status, view: nextView });
  }

  return (
    <>
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ProjectFilters
          query={query}
          status={status}
          onQueryChange={changeQuery}
          onStatusChange={changeStatus}
        />

        <div className="flex w-full items-center justify-end lg:w-auto">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={cn(view === "grid" && "bg-background shadow-sm")}
              onClick={() => changeView("grid")}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Grid2X2 aria-hidden="true" />
            </Button>
            <Button
              aria-label="List view"
              aria-pressed={view === "list"}
              className={cn(view === "list" && "bg-background shadow-sm")}
              onClick={() => changeView("list")}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <List aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div
          className={cn(
            "mt-6 grid gap-5",
            view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
          )}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              username={username}
              variant={view}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
          <h2 className="font-semibold">No projects found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </>
  );
}

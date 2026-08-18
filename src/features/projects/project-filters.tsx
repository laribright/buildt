"use client";

import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectFilters as ProjectFilterValues } from "@/features/projects/types";

type ProjectFiltersProps = {
  query: string;
  status?: ProjectFilterValues["status"];
  onQueryChange: (query: string) => void;
  onStatusChange: (status: ProjectFilterValues["status"] | undefined) => void;
};

export function ProjectFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: ProjectFiltersProps) {
  return (
    <form
      className="flex flex-1 flex-wrap gap-3 lg:flex-nowrap"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="relative basis-full lg:w-72 lg:basis-auto lg:flex-none">
        <Input
          className="h-10 pr-10"
          name="query"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search"
          value={query}
        />
        <Button
          className="absolute top-1/2 right-1 -translate-y-1/2"
          size="icon-sm"
          type="submit"
          variant="ghost"
        >
          <Search aria-hidden="true" />
          <span className="sr-only">Search projects</span>
        </Button>
      </div>

      <label className="relative w-full lg:ml-auto lg:w-44 lg:flex-none">
        <span className="sr-only">Project status</span>
        <select
          className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          name="status"
          onChange={(event) => {
            const nextStatus = event.target.value;
            onStatusChange(
              nextStatus === "active" || nextStatus === "draft"
                ? nextStatus
                : undefined,
            );
          }}
          value={status ?? ""}
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </label>
    </form>
  );
}

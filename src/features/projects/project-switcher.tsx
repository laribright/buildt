"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { projectHref } from "@/features/projects/project-helpers";
import type { Project } from "@/features/projects/types";

type ProjectSwitcherProps = {
  currentProject: Project;
  projects: Project[];
  username: string;
};

export function ProjectSwitcher({
  currentProject,
  projects,
  username,
}: ProjectSwitcherProps) {
  return (
    <Popover>
      <PopoverTrigger className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <span className="min-w-0 truncate text-sm font-medium">
          {currentProject.name}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-72 gap-1 p-1.5">
        <p className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          Projects
        </p>
        <nav className="workspace-scrollbar max-h-72 overflow-y-auto" aria-label="Switch project">
          {projects.map((project) => {
            const isCurrent = project.id === currentProject.id;

            return (
              <Link
                key={project.id}
                href={projectHref(username, project.slug)}
                aria-current={isCurrent ? "page" : undefined}
                className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold">
                  {project.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                {isCurrent ? <Check className="size-4 shrink-0" /> : null}
              </Link>
            );
          })}
        </nav>
      </PopoverContent>
    </Popover>
  );
}

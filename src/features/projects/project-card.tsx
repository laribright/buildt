"use client";

import { Globe2, LockKeyhole, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { projectAction } from "@/features/projects/action";
import { PROJECT_INTENTS } from "@/features/projects/constants";
import {
  formatProjectUpdatedAt,
  projectHref,
} from "@/features/projects/project-helpers";
import type { Project, ProjectActionState } from "@/features/projects/types";
import { cn } from "@/lib/utils";

const initialProjectActionState: ProjectActionState = {
  success: false,
  message: null,
};

type ProjectCardProps = {
  project: Project;
  username: string;
  variant?: "grid" | "list";
};

export function ProjectCard({
  project,
  username,
  variant = "grid",
}: ProjectCardProps) {
  const isPrivate = project.visibility === "private";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [actionState, submitAction, isPending] = useActionState(
    projectAction,
    initialProjectActionState,
  );

  function openDeleteDialog() {
    setIsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  }

  if (actionState.success) return null;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
        variant === "list" && "w-full",
      )}
    >
      <Link
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        href={projectHref(username, project.slug)}
      >
        <span className="sr-only">Open {project.name}</span>
      </Link>
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{project.name}</h3>
          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger
              className="relative z-20 -mt-2 -mr-2 grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`Open actions for ${project.name}`}
            >
              <MoreVertical aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1.5">
              <Button
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={openDeleteDialog}
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatProjectUpdatedAt(project.updatedAt)}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs">
          {isPrivate ? (
            <LockKeyhole className="size-3" aria-hidden="true" />
          ) : (
            <Globe2 className="size-3" aria-hidden="true" />
          )}
          {isPrivate ? "Private" : "Public"}
        </span>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="gap-5 sm:max-w-lg">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-semibold">
              Delete {project.name}?
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Are you sure you want to delete this project? This action cannot
              be undone. Some projects may take a few minutes to finish
              deleting.
            </DialogDescription>
          </DialogHeader>

          <form action={submitAction}>
            <input
              name="intent"
              type="hidden"
              value={PROJECT_INTENTS.delete}
            />
            <input name="projectId" type="hidden" value={project.id} />
            {actionState.message && !actionState.success && (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {actionState.message}
              </p>
            )}
            <DialogFooter className="m-0 border-0 bg-transparent p-0">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button disabled={isPending} type="submit" variant="destructive">
                <Trash2 aria-hidden="true" />
                {isPending ? "Deleting..." : "Yes, delete this project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}

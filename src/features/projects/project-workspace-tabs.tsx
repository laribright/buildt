"use client";

import { Monitor, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectFileWorkspace } from "@/features/file-management/project-file-workspace";
import { cn } from "@/lib/utils";

export function ProjectWorkspaceTabs() {
  const { activeFileId, closeFile, openFile, openFiles, showPreview } =
    useProjectFileWorkspace();
  return (
    <div className="workspace-tab-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-3 pb-1">
      <Button
        variant={activeFileId === null ? "secondary" : "ghost"}
        size="sm"
        onClick={showPreview}
      >
        <Monitor />
        Preview
      </Button>
      {openFiles.map((file) => (
        <div
          key={file.id}
          className={cn(
            "flex h-8 shrink-0 items-center rounded-lg",
            activeFileId === file.id ? "bg-secondary" : "hover:bg-muted",
          )}
        >
          <button
            type="button"
            onClick={() => openFile(file)}
            className="min-w-0 truncate px-2 text-sm italic"
          >
            {file.name}
          </button>
          <button
            type="button"
            onClick={() => closeFile(file.id)}
            className="mr-1 rounded p-0.5 hover:bg-muted"
            aria-label={`Close ${file.name}`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

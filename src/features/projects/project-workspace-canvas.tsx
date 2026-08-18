"use client";

import { ProjectFileEditor } from "@/features/file-management/project-file-editor";
import { useProjectFileWorkspace } from "@/features/file-management/project-file-workspace";
import { ProjectPreview } from "@/features/projects/project-preview";
import type { Project } from "@/features/projects/types";

type ProjectWorkspaceCanvasProps = {
  project: Project;
};

export function ProjectWorkspaceCanvas({ project }: ProjectWorkspaceCanvasProps) {
  const { activeFile } = useProjectFileWorkspace();

  if (activeFile) {
    return <ProjectFileEditor file={activeFile} />;
  }

  return <ProjectPreview project={project} />;
}

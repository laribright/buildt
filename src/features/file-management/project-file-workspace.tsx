"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mapSandboxEntriesToProjectFiles } from "@/features/file-management/project-file-helpers";
import type { ProjectFile } from "@/features/file-management/types";
import { subscribeToProjectStatus } from "@/features/projects/project-client-events";
import type { Project } from "@/features/projects/types";

type SandboxEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
};

type ProjectFileWorkspaceValue = {
  activeFile: ProjectFile | null;
  activeFileId: string | null;
  closeFile: (fileId: string) => void;
  contents: Record<string, string>;
  files: ProjectFile[];
  openFile: (file: ProjectFile) => void;
  openFiles: ProjectFile[];
  projectId: string;
  refreshFiles: () => void;
  showPreview: () => void;
  updateFile: (fileId: string, content: string) => void;
};

const ProjectFileWorkspaceContext =
  createContext<ProjectFileWorkspaceValue | null>(null);

function flattenFiles(files: ProjectFile[]): ProjectFile[] {
  return files.flatMap((entry) => [
    entry,
    ...flattenFiles(entry.children ?? []),
  ]);
}

export function ProjectFileWorkspaceProvider({
  children,
  initialPreviewStatus,
  projectId,
}: {
  children: ReactNode;
  initialPreviewStatus: Project["previewStatus"];
  projectId: string;
}) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [previewStatus, setPreviewStatus] = useState(initialPreviewStatus);
  const [treeVersion, setTreeVersion] = useState(0);

  useEffect(
    () => subscribeToProjectStatus(projectId, setPreviewStatus),
    [projectId],
  );

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    const controller = new AbortController();

    async function loadTree() {
      try {
        const response = await fetch(`/api/projects/${projectId}/files`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { entries?: SandboxEntry[] };
        if (cancelled) return;
        setFiles(mapSandboxEntriesToProjectFiles(projectId, data.entries ?? []));
      } catch {
        // Ignore cancellation and transient sandbox failures.
      } finally {
        if (!cancelled && previewStatus === "building") {
          timeoutId = window.setTimeout(() => void loadTree(), 6_000);
        }
      }
    }

    void loadTree();

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [previewStatus, projectId, treeVersion]);

  const allFiles = useMemo(() => flattenFiles(files), [files]);
  const openFiles = openFileIds.flatMap((id) => {
    const match = allFiles.find((entry) => entry.id === id);
    return match ? [match] : [];
  });
  const activeFile = activeFileId
    ? (allFiles.find((entry) => entry.id === activeFileId) ?? null)
    : null;

  async function openFile(entry: ProjectFile) {
    if (entry.children) return;

    setOpenFileIds((current) =>
      current.includes(entry.id) ? current : [...current, entry.id],
    );
    setActiveFileId(entry.id);

    if (contents[entry.id] !== undefined) return;

    const response = await fetch(
      `/api/projects/${projectId}/files?path=${encodeURIComponent(entry.path)}`,
    );
    if (!response.ok) return;
    const data = (await response.json()) as { content?: string };
    setContents((current) => ({
      ...current,
      [entry.id]: data.content ?? "",
    }));
  }

  function closeFile(fileId: string) {
    setOpenFileIds((current) => {
      const index = current.indexOf(fileId);
      const next = current.filter((id) => id !== fileId);
      if (activeFileId === fileId)
        setActiveFileId(next[Math.max(0, index - 1)] ?? null);
      return next;
    });
  }

  return (
    <ProjectFileWorkspaceContext.Provider
      value={{
        activeFile,
        activeFileId,
        closeFile,
        contents,
        files,
        openFile,
        openFiles,
        projectId,
        refreshFiles: () => setTreeVersion((current) => current + 1),
        showPreview: () => setActiveFileId(null),
        updateFile: (fileId, content) =>
          setContents((current) => ({ ...current, [fileId]: content })),
      }}
    >
      {children}
    </ProjectFileWorkspaceContext.Provider>
  );
}

export function useProjectFileWorkspace() {
  const context = useContext(ProjectFileWorkspaceContext);
  if (!context)
    throw new Error(
      "useProjectFileWorkspace must be used inside ProjectFileWorkspaceProvider",
    );
  return context;
}

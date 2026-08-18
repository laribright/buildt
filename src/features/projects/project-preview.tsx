"use client";

import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Link2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { MockProjectPreview } from "@/features/projects/mock-project-preview";
import { PreviewBuildingAnimation } from "@/features/projects/preview-building-animation";
import { PreviewError } from "@/features/projects/preview-error";
import {
  projectPreviewHost,
  resolveProjectPreviewUrl,
} from "@/features/projects/project-helpers";
import { publishProjectStatus } from "@/features/projects/project-client-events";
import type { Project } from "@/features/projects/types";
import { createClient } from "@/lib/supabase/client";

type ProjectPreviewProps = {
  project: Project;
};

type ProjectPreviewPayload = {
  previewUrl?: string | null;
  previewStatus?: Project["previewStatus"];
  preview_url?: string | null;
  preview_status?: Project["previewStatus"];
};

function applyPreviewFields(
  current: Project,
  payload: ProjectPreviewPayload,
): Project {
  return {
    ...current,
    previewUrl: payload.previewUrl ?? payload.preview_url ?? current.previewUrl,
    previewStatus:
      payload.previewStatus ?? payload.preview_status ?? current.previewStatus,
  };
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const [liveProject, setLiveProject] = useState(project);
  const [history, setHistory] = useState([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pathDraft, setPathDraft] = useState("");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  useEffect(() => {
    if (project.previewStatus !== "ready" || !project.previewUrl) return;

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(
          `/api/projects/${project.id}/recover-preview`,
          {
            method: "POST",
            signal: controller.signal,
          },
        );
        if (!response.ok || controller.signal.aborted) return;

        publishProjectStatus(project.id, "building");
        setLiveProject((current) => ({
          ...current,
          previewStatus: "building",
        }));
      } catch {
        // The existing preview remains visible if recovery cannot be queued.
      }
    })();

    return () => controller.abort();
  }, [project.id, project.previewStatus, project.previewUrl]);

  // Poll — Supabase realtime for `projects` is often not enabled / uses snake_case.
  useEffect(() => {
    if (liveProject.previewStatus !== "building") return;
    let cancelled = false;
    let timeoutId: number | undefined;
    const controller = new AbortController();

    async function refreshFromApi() {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as ProjectPreviewPayload;
        if (cancelled) return;
        const status = data.previewStatus ?? data.preview_status;
        if (status) publishProjectStatus(project.id, status);
        setLiveProject((current) => {
          const next = applyPreviewFields(current, data);
          if (next.previewUrl && next.previewUrl !== current.previewUrl) {
            setPreviewReloadKey((key) => key + 1);
          }
          return next;
        });
      } catch {
        // Ignore transient poll errors.
      } finally {
        if (!cancelled) {
          timeoutId = window.setTimeout(() => void refreshFromApi(), 3_000);
        }
      }
    }

    void refreshFromApi();

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [liveProject.previewStatus, project.id]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`project-preview:${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${project.id}`,
        },
        (payload) => {
          const row = payload.new as ProjectPreviewPayload;
          const status = row.previewStatus ?? row.preview_status;
          if (status) publishProjectStatus(project.id, status);
          setLiveProject((current) => applyPreviewFields(current, row));
          setPreviewReloadKey((current) => current + 1);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [project.id]);

  const activePath = history[historyIndex];
  const previewUrl = liveProject.previewUrl ?? null;
  const resolvedPreviewUrl = resolveProjectPreviewUrl(previewUrl, activePath);
  const previewHost = previewUrl ? projectPreviewHost(previewUrl) : "preview";

  function navigateToPath(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const path = pathDraft.trim().replace(/^\/+/, "");
    if (path === activePath) return;
    const next = [...history.slice(0, historyIndex + 1), path];
    setHistory(next);
    setHistoryIndex(next.length - 1);
    setPathDraft(path);
  }

  function move(nextIndex: number) {
    setHistoryIndex(nextIndex);
    setPathDraft(history[nextIndex]);
  }

  function refreshPreview() {
    setPreviewReloadKey((current) => current + 1);
  }

  function openExternally() {
    if (!resolvedPreviewUrl) return;
    window.open(resolvedPreviewUrl, "_blank", "noopener,noreferrer");
  }

  const isBuilding = liveProject.previewStatus === "building";
  const isError = liveProject.previewStatus === "error";
  const isReady = liveProject.previewStatus === "ready";

  return (
    <section
      className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-muted/30"
      aria-label="App preview"
    >
      <div className="flex h-13 shrink-0 items-center justify-center border-b bg-background px-3">
        <div className="hidden min-w-0 items-center gap-1 rounded-lg bg-muted p-1 sm:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back"
            disabled={isBuilding || historyIndex === 0}
            onClick={() => move(historyIndex - 1)}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Forward"
            disabled={isBuilding || historyIndex === history.length - 1}
            onClick={() => move(historyIndex + 1)}
          >
            <ArrowRight />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh"
            disabled={isBuilding || !resolvedPreviewUrl}
            onClick={refreshPreview}
          >
            <RefreshCw />
          </Button>
          <form
            onSubmit={navigateToPath}
            className="flex min-w-0 max-w-80 items-center gap-1 px-2 py-1 text-xs text-muted-foreground"
          >
            <Link2 className="size-3.5 shrink-0" />
            <span className="max-w-48 truncate">{previewHost}/</span>
            <input
              value={pathDraft}
              onChange={(event) => setPathDraft(event.target.value)}
              aria-label="Preview path"
              disabled={isBuilding}
              className="min-w-8 flex-1 bg-transparent text-foreground outline-none disabled:opacity-50"
            />
          </form>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open preview"
            disabled={isBuilding || !resolvedPreviewUrl}
            onClick={openExternally}
          >
            <ExternalLink />
          </Button>
        </div>
      </div>

      <div className="workspace-scrollbar @container min-h-0 flex-1 overflow-y-auto">
        {isBuilding ? (
          <PreviewBuildingAnimation projectName={liveProject.name} />
        ) : null}

        {isError ? <PreviewError onRetry={refreshPreview} /> : null}

        {isReady && resolvedPreviewUrl ? (
          <iframe
            key={previewReloadKey}
            src={resolvedPreviewUrl}
            className="h-full w-full border-0 bg-background"
            title={`${liveProject.name} preview`}
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; clipboard-write"
          />
        ) : null}

        {isReady && !resolvedPreviewUrl ? (
          <div className="min-h-full p-4 sm:p-8">
            <MockProjectPreview />
          </div>
        ) : null}
      </div>
    </section>
  );
}

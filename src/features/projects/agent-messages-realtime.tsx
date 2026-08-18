"use client";

import { useEffect, useState } from "react";

import type { Profile } from "@/features/auth/types";
import { AgentActivitySidebar } from "@/features/projects/agent-activity-sidebar";
import { publishProjectStatus } from "@/features/projects/project-client-events";
import type { AgentMessage, Project } from "@/features/projects/types";
import { createClient } from "@/lib/supabase/client";

type AgentMessagesRealtimeProps = {
  projectId: string;
  initialMessages: AgentMessage[];
  project: Project;
  user: Profile;
};

type ProjectPollPayload = {
  previewUrl?: string | null;
  previewStatus?: Project["previewStatus"];
  preview_url?: string | null;
  preview_status?: Project["previewStatus"];
  messages?: AgentMessage[];
};

function mergeMessages(
  current: AgentMessage[],
  incoming: AgentMessage[],
): AgentMessage[] {
  if (incoming.length === 0) return current;
  const byId = new Map<string, AgentMessage>();
  for (const message of current) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function AgentMessagesRealtime({
  projectId,
  initialMessages,
  project,
  user,
}: AgentMessagesRealtimeProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [liveProject, setLiveProject] = useState(project);

  useEffect(() => {
    if (liveProject.previewStatus !== "building") return;
    let cancelled = false;
    let timeoutId: number | undefined;
    const controller = new AbortController();

    async function refreshProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as ProjectPollPayload;
        if (cancelled) return;
        const status = data.previewStatus ?? data.preview_status;
        if (status) publishProjectStatus(projectId, status);
        setLiveProject((current) => ({
          ...current,
          previewUrl: data.previewUrl ?? data.preview_url ?? current.previewUrl,
          previewStatus:
            data.previewStatus ??
            data.preview_status ??
            current.previewStatus,
        }));
        if (Array.isArray(data.messages)) {
          // Server list is source of truth (drops optimistic placeholders).
          setMessages(data.messages);
        }
      } catch {
        // Ignore poll errors.
      } finally {
        if (!cancelled) {
          timeoutId = window.setTimeout(() => void refreshProject(), 3_000);
        }
      }
    }

    void refreshProject();

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [liveProject.previewStatus, projectId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`project:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const row = payload.new as AgentMessage;
          setMessages((current) => mergeMessages(current, [row]));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          const row = payload.new as ProjectPollPayload;
          const status = row.previewStatus ?? row.preview_status;
          if (status) publishProjectStatus(projectId, status);
          setLiveProject((current) => ({
            ...current,
            previewUrl: row.previewUrl ?? row.preview_url ?? current.previewUrl,
            previewStatus:
              row.previewStatus ??
              row.preview_status ??
              current.previewStatus,
          }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId]);

  function handleMessageQueued(prompt: string) {
    const now = new Date().toISOString();
    setLiveProject((current) => ({
      ...current,
      previewStatus: "building",
    }));
    setMessages((current) =>
      mergeMessages(current, [
        {
          id: `optimistic-user-${now}`,
          projectId,
          agentRunId: null,
          role: "user",
          type: "text",
          content: prompt,
          payload: null,
          createdAt: new Date(now),
        },
        {
          id: `optimistic-status-${now}`,
          projectId,
          agentRunId: null,
          role: "assistant",
          type: "status",
          content: "Working on your project",
          payload: null,
          createdAt: new Date(now),
        },
      ]),
    );
  }

  return (
    <AgentActivitySidebar
      messages={messages}
      onMessageQueued={handleMessageQueued}
      project={liveProject}
      user={user}
    />
  );
}

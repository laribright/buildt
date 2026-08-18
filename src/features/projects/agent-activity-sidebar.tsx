"use client";

import {
  Bot,
  Check,
  ExternalLink,
  Gauge,
  Globe2,
  LoaderCircle,
  Rocket,
  Send,
  Sparkles,
} from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, useFormState } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { Profile } from "@/features/auth/types";
import { projectAction } from "@/features/projects/action";
import { PROJECT_INTENTS } from "@/features/projects/constants";
import {
  projectPromptSchema,
  type ProjectPromptValues,
} from "@/features/projects/schema";
import type {
  AgentMessage,
  Project,
  ProjectActionState,
} from "@/features/projects/types";

type AgentActivitySidebarProps = {
  project: Project;
  user: Profile;
  messages: AgentMessage[];
  onMessageQueued?: (prompt: string) => void;
};

const initialActionState: ProjectActionState = {
  success: false,
  message: null,
};

function isThoughtMessage(message: AgentMessage) {
  return message.type === "status" && message.payload?.kind === "thought";
}

export function AgentActivitySidebar({
  project,
  user,
  messages,
  onMessageQueued,
}: AgentActivitySidebarProps) {
  const [actionState, formAction, isPending] = useActionState(
    projectAction,
    initialActionState,
  );
  const handledSuccessKey = useRef<string | null>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<ProjectPromptValues>({
    resolver: zodResolver(projectPromptSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: { prompt: "" },
  });
  const { errors } = useFormState({ control: form.control });
  const promptField = useController({
    control: form.control,
    name: "prompt",
  });

  useEffect(() => {
    if (actionState.fieldErrors?.prompt?.[0]) {
      form.setError("prompt", {
        message: actionState.fieldErrors.prompt[0],
      });
    }
  }, [actionState.fieldErrors, form]);

  useEffect(() => {
    if (!actionState.success || !actionState.submittedPrompt) return;
    const key = actionState.submittedPrompt;
    if (handledSuccessKey.current === key) return;
    handledSuccessKey.current = key;
    onMessageQueued?.(actionState.submittedPrompt);
    form.reset({ prompt: "" });
  }, [actionState.success, actionState.submittedPrompt, form, onMessageQueued]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activity = activityScrollRef.current;
      if (!activity) return;
      activity.scrollTo({ top: activity.scrollHeight, behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages.length, project.previewStatus]);

  const promptError =
    errors.prompt?.message ?? actionState.fieldErrors?.prompt?.[0];
  const isBuilding = project.previewStatus === "building";
  const inputDisabled = isPending || isBuilding;
  const latestThought = [...messages].reverse().find(isThoughtMessage);

  return (
    <aside
      className="hidden min-h-0 flex-col border-r lg:flex"
      aria-label="Agent activity"
    >
      <div
        ref={activityScrollRef}
        className="workspace-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 text-sm"
      >
        {isBuilding ? (
          <div
            className="mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
            <div className="min-w-0 space-y-1">
              <p className="font-medium">Agent is working on your project…</p>
              {latestThought ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  {latestThought.content}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <p className="text-muted-foreground">
            No agent activity yet. Send a prompt to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              if (isThoughtMessage(message)) {
                return (
                  <div
                    key={message.id}
                    className="flex gap-3 rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2.5"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background">
                      <Sparkles className="size-4 text-primary" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Thought
                      </p>
                      <p className="text-sm leading-6 text-foreground/90 italic">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              }

              if (message.type === "status" || message.type === "duration") {
                return (
                  <div
                    key={message.id}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <span className="grid size-8 place-items-center rounded-lg border bg-background">
                      {message.type === "duration" ? (
                        <Gauge className="size-4" />
                      ) : message.content
                          .toLowerCase()
                          .includes("working") && isBuilding ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </span>
                    <span>{message.content}</span>
                  </div>
                );
              }

              if (message.type === "event") {
                return (
                  <p
                    key={message.id}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <span className="grid size-8 place-items-center rounded-lg border">
                      {message.payload?.kind === "published" ? (
                        <Globe2 className="size-4 text-primary" />
                      ) : (
                        <Check className="size-4 text-primary" />
                      )}
                    </span>
                    {message.content}
                  </p>
                );
              }

              if (message.role === "user") {
                return (
                  <div
                    key={message.id}
                    className="rounded-xl bg-muted/70 px-3 py-2.5"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      You
                    </p>
                    <p className="mt-1 text-base leading-7">{message.content}</p>
                  </div>
                );
              }

              return (
                <p key={message.id} className="text-base leading-7">
                  {message.content}
                </p>
              );
            })}
          </div>
        )}

        <article className="mt-5 rounded-xl bg-muted/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {project.deploymentUrl ? "Republish" : "Publish"}
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              Settings <ExternalLink className="size-3.5" />
            </button>
          </div>
          <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="flex min-w-0 items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="truncate">
                {project.deploymentUrl
                  ? `${user.name} published successfully`
                  : "Not published yet"}
              </span>
            </dd>
            <dt className="text-muted-foreground">Visibility</dt>
            <dd className="flex items-center gap-2">
              <Globe2 className="size-4" />
              {project.visibility === "public" ? "Public" : "Private"}
            </dd>
            <dt className="text-muted-foreground">Domains</dt>
            <dd className="truncate">
              {project.deploymentUrl ?? "No domain yet"}
            </dd>
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary">Review security</Button>
            <Button>
              <Rocket /> {project.deploymentUrl ? "Republish" : "Publish"}
            </Button>
          </div>
        </article>
      </div>

      <div className="border-t p-3">
        <form
          action={formAction}
          className="rounded-xl border bg-background p-3 shadow-sm"
          noValidate
        >
          <input name="intent" type="hidden" value={PROJECT_INTENTS.message} />
          <input name="projectId" type="hidden" value={project.id} />
          <label className="sr-only" htmlFor="agent-message">
            Message Agent
          </label>
          <textarea
            id="agent-message"
            className="min-h-14 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            placeholder={
              isBuilding ? "Agent is working…" : "Message Agent..."
            }
            aria-label="Message Agent"
            aria-invalid={Boolean(promptError)}
            aria-describedby={promptError ? "agent-message-error" : undefined}
            disabled={inputDisabled}
            rows={3}
            {...promptField.field}
          />
          {promptError ? (
            <p
              id="agent-message-error"
              className="mb-2 text-sm text-destructive"
              role="alert"
            >
              {promptError}
            </p>
          ) : null}
          {actionState.message ? (
            <p className="mb-2 text-sm text-destructive" role="alert">
              {actionState.message}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            {isBuilding || isPending ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin" />
                {isPending ? "Sending…" : "Building…"}
              </p>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              variant="secondary"
              size="icon-sm"
              aria-label={isPending ? "Sending message" : "Send message"}
              disabled={inputDisabled}
            >
              <Send />
            </Button>
          </div>
        </form>
      </div>
    </aside>
  );
}

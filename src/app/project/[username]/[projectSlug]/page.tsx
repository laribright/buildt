import { notFound, redirect } from "next/navigation";
import { Globe2 } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import {
  FileTreeToggle,
  FileTreeVisibilityProvider,
} from "@/features/file-management/file-tree-toggle";
import { ProjectFileTree } from "@/features/file-management/project-file-tree";
import { ProjectFileWorkspaceProvider } from "@/features/file-management/project-file-workspace";
import { WorkspacePanelResizer } from "@/features/file-management/workspace-panel-resizer";
import { CopyDeploymentLinkButton } from "@/features/publishing/copy-deployment-link-button";
import { ProjectWorkspaceCanvas } from "@/features/projects/project-workspace-canvas";
import { ProjectSwitcher } from "@/features/projects/project-switcher";
import { ProjectWorkspaceTabs } from "@/features/projects/project-workspace-tabs";
import { normalizeProjectUsername } from "@/features/projects/project-helpers";
import {
  findProjectByProfileIdAndSlug,
  listProjectsByProfileId,
} from "@/features/projects/project-model.server";
import { listAgentMessagesByProjectId } from "@/features/projects/agent-message-model.server";
import { AgentMessagesRealtime } from "@/features/projects/agent-messages-realtime";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string; username: string }>;
}) {
  const { projectSlug, username: usernameParam } = await params;
  const username = normalizeProjectUsername(usernameParam);
  const user = await retrieveCurrentUser();

  if (!user) redirect("/");

  const project = await findProjectByProfileIdAndSlug(user.id, projectSlug);

  if (!project) return notFound();

  const projects = await listProjectsByProfileId(user.id);
  const messages = await listAgentMessagesByProjectId(project.id);

  if (username !== user.username || !project) notFound();

  return (
    <FileTreeVisibilityProvider>
      <ProjectFileWorkspaceProvider
        initialPreviewStatus={project.previewStatus}
        projectId={project.id}
      >
        <main
          id="project-workspace"
          className="flex h-svh min-w-0 flex-col overflow-hidden bg-background text-foreground"
        >
          <header className="flex h-14 shrink-0 items-center border-b bg-muted/40">
            <div className="flex min-w-0 items-center gap-2 px-3 lg:w-(--agent-panel-width,352px) lg:border-r">
              <Link
                href="/~"
                aria-label="Buildt home"
                className="inline-flex shrink-0 items-center rounded-lg p-1.5 text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <BrandMark />
              </Link>
              <span
                className="hidden h-5 w-px shrink-0 bg-border sm:block"
                aria-hidden="true"
              />
              <ProjectSwitcher
                currentProject={project}
                projects={projects}
                username={user.username}
              />
              <div className="ml-auto hidden rounded-lg bg-muted p-1 sm:flex">
                <button
                  type="button"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium shadow-xs"
                >
                  Build
                </button>
              </div>
            </div>

            <ProjectWorkspaceTabs />

            <div className="ml-auto flex shrink-0 items-center gap-1 px-3">
              <Button variant="ghost" size="sm">
                <Globe2 />
                {project.deploymentUrl ? "Republish" : "Publish"}
              </Button>
              {project.deploymentUrl ? (
                <CopyDeploymentLinkButton
                  deploymentUrl={project.deploymentUrl}
                />
              ) : null}
              <FileTreeToggle />
            </div>
          </header>

          <div className="workspace-body grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[var(--agent-panel-width,352px)_1px_minmax(0,1fr)] xl:grid-cols-[var(--agent-panel-width,352px)_1px_minmax(0,1fr)_1px_var(--files-panel-width,380px)]">
            <AgentMessagesRealtime
              projectId={project.id}
              initialMessages={messages}
              project={project}
              user={user}
            />

            <WorkspacePanelResizer
              panel="agent"
              label="Resize agent panel"
              defaultWidth={352}
              minWidth={280}
              maxWidth={560}
            />

            <ProjectWorkspaceCanvas project={project} />

            <WorkspacePanelResizer
              panel="files"
              label="Resize files panel"
              defaultWidth={380}
              minWidth={280}
              maxWidth={600}
              className="workspace-files-resizer hidden xl:block"
            />

            <div
              id="project-files-panel"
              className="workspace-file-pane hidden min-h-0 min-w-0 xl:block"
            >
              <ProjectFileTree />
            </div>
          </div>
        </main>
      </ProjectFileWorkspaceProvider>
    </FileTreeVisibilityProvider>
  );
}

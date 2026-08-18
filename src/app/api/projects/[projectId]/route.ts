import { NextResponse } from "next/server";

import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { listAgentMessagesByProjectId } from "@/features/projects/agent-message-model.server";
import { findProjectById } from "@/features/projects/project-model.server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const user = await retrieveCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await findProjectById(projectId);

  if (!project || project.profileId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await listAgentMessagesByProjectId(projectId);

  return NextResponse.json({
    id: project.id,
    previewUrl: project.previewUrl,
    previewStatus: project.previewStatus,
    sandboxId: project.sandboxId,
    messages,
  });
}

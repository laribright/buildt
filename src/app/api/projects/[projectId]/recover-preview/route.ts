import { NextResponse } from "next/server";

import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { findProjectById } from "@/features/projects/project-model.server";

export async function POST(
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
  if (!project.sourceSnapshot) {
    return NextResponse.json(
      { error: "This project has no saved source snapshot" },
      { status: 409 },
    );
  }

  // TODO: Enqueue preview recovery for this project.
  return NextResponse.json(
    { error: "Preview recovery is not implemented yet." },
    { status: 501 },
  );
}

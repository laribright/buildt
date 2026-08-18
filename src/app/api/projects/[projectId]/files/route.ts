import { NextResponse } from "next/server";

import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { fileMutationSchema } from "@/features/file-management/schema";
import { findProjectById } from "@/features/projects/project-model.server";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const user = await retrieveCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await findProjectById(projectId);

  if (!project || project.profileId !== user.id || !project.sandboxId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const download = searchParams.get("download");

  // TODO: List sandbox files, read a file, or download a zip archive.
  void path;
  void download;

  return NextResponse.json(
    { error: "File listing is not implemented yet." },
    { status: 501 },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const user = await retrieveCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await context.params;
  const project = await findProjectById(projectId);
  if (!project || project.profileId !== user.id || !project.sandboxId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = fileMutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid project path" }, { status: 400 });
  }

  // TODO: Create a file or folder in the project sandbox.
  void parsed.data;

  return NextResponse.json(
    { error: "File creation is not implemented yet." },
    { status: 501 },
  );
}

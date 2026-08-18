import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { projects } from "@/db/schema/project";
import type { NewProject, Project } from "@/features/projects/types";

export async function createProject(data: NewProject): Promise<Project> {
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function findProjectById(
  projectId: string,
): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project ?? null;
}

export async function findProjectByProfileIdAndSlug(
  profileId: string,
  slug: string,
): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.profileId, profileId), eq(projects.slug, slug)))
    .limit(1);

  return project ?? null;
}

export async function listProjectsByProfileId(
  profileId: string,
  options?: { limit?: number },
): Promise<Project[]> {
  const query = db
    .select()
    .from(projects)
    .where(eq(projects.profileId, profileId))
    .orderBy(desc(projects.updatedAt));

  if (options?.limit) {
    return query.limit(options.limit);
  }

  return query;
}

export async function updateProjectSandbox(
  projectId: string,
  data: {
    sandboxId?: string | null;
    previewUrl?: string | null;
    previewStatus: Project["previewStatus"];
  },
): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return project;
}

export async function updateProjectSourceSnapshot(
  projectId: string,
  sourceSnapshot: Record<string, string>,
): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({ sourceSnapshot, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();
  return project;
}

export async function updateProjectDeployment(
  projectId: string,
  deploymentUrl: string,
): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({
      deploymentUrl,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, projectId));
}

// export function retrieveRecentProjects() {
//   return recentProjectRecords.slice(0, 4);
// }

// export function retrieveProjects() {
//   return recentProjectRecords;
// }

// export function retrieveProject(projectSlug: string) {
//   return recentProjectRecords.find((project) => project.id === projectSlug);
// }

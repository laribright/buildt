import type { Project, ProjectFilters } from "@/features/projects/types";

export function projectHref(username: string, projectSlug: string) {
  return `/@${encodeURIComponent(username.slice(1))}/${encodeURIComponent(projectSlug)}`;
}

export function normalizeProjectUsername(username: string) {
  return username.startsWith("@") ? username : `@${username}`;
}

export function projectPreviewHost(previewUrl: string) {
  return previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function resolveProjectPreviewUrl(
  previewUrl: string | null | undefined,
  path = "",
) {
  if (!previewUrl) return null;

  const base = previewUrl.replace(/\/+$/, "");
  const normalizedPath = path.trim().replace(/^\/+/, "");

  if (!normalizedPath) return base;

  return `${base}/${normalizedPath}`;
}

export type ProjectListView = "grid" | "list";

export type ProjectListParams = {
  query: string;
  status?: Project["status"];
  view: ProjectListView;
};

export function filterProjects(projects: Project[], filters: ProjectFilters) {
  const normalizedQuery = filters.query?.trim().toLocaleLowerCase();

  return projects.filter((project) => {
    const matchesQuery = normalizedQuery
      ? project.name.toLocaleLowerCase().includes(normalizedQuery)
      : true;
    const matchesStatus = filters.status
      ? project.status === filters.status
      : true;
    return matchesQuery && matchesStatus;
  });
}

export function projectListHref({ query, status, view }: ProjectListParams) {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (status) params.set("status", status);
  params.set("view", view);

  return `/builds?${params.toString()}`;
}

export function formatProjectUpdatedAt(updatedAt: Date) {
  const deltaMs = Date.now() - updatedAt.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (deltaMs < hourMs) {
    const minutes = Math.max(1, Math.round(deltaMs / minuteMs));
    return `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (deltaMs < dayMs) {
    const hours = Math.round(deltaMs / hourMs);
    return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(deltaMs / dayMs);
  if (days < 30) {
    return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.max(1, Math.round(days / 30));
  return `Updated ${months} month${months === 1 ? "" : "s"} ago`;
}

export function projectSlugFromName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "")
      .slice(0, 48) || "project"
  );
}

export function projectNameFromPrompt(prompt: string) {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  return trimmed.slice(0, 60) || "Untitled project";
}

export function formatAgentRunDuration(startedAt: Date, finishedAt: Date) {
  const minutes = Math.max(
    1,
    Math.round((finishedAt.getTime() - startedAt.getTime()) / 60_000),
  );
  return `Worked for ${minutes} minute${minutes === 1 ? "" : "s"}`;
}
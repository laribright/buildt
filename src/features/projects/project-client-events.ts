import type { Project } from "@/features/projects/types";

const PROJECT_STATUS_EVENT = "buildt:project-status";

type ProjectStatusDetail = {
  projectId: string;
  previewStatus: Project["previewStatus"];
};

export function publishProjectStatus(
  projectId: string,
  previewStatus: Project["previewStatus"],
) {
  window.dispatchEvent(
    new CustomEvent<ProjectStatusDetail>(PROJECT_STATUS_EVENT, {
      detail: { projectId, previewStatus },
    }),
  );
}

export function subscribeToProjectStatus(
  projectId: string,
  listener: (status: Project["previewStatus"]) => void,
) {
  const handleStatus = (event: Event) => {
    const detail = (event as CustomEvent<ProjectStatusDetail>).detail;
    if (detail.projectId === projectId) listener(detail.previewStatus);
  };
  window.addEventListener(PROJECT_STATUS_EVENT, handleStatus);
  return () => window.removeEventListener(PROJECT_STATUS_EVENT, handleStatus);
}

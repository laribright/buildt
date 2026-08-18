"use client";

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";

type WorkspacePanelResizerProps = {
  className?: string;
  defaultWidth: number;
  label: string;
  maxWidth: number;
  minWidth: number;
  panel: "agent" | "files";
};

export function WorkspacePanelResizer({
  className,
  defaultWidth,
  label,
  maxWidth,
  minWidth,
  panel,
}: WorkspacePanelResizerProps) {
  const propertyName =
    panel === "agent" ? "--agent-panel-width" : "--files-panel-width";

  function setPanelWidth(workspace: HTMLElement, width: number) {
    const styles = getComputedStyle(workspace);
    const filesAreHidden =
      workspace.parentElement?.hasAttribute("data-files-hidden") ?? false;
    const otherPanelWidth =
      panel === "agent"
        ? filesAreHidden
          ? 0
          : Number.parseFloat(styles.getPropertyValue("--files-panel-width")) || 380
        : Number.parseFloat(styles.getPropertyValue("--agent-panel-width")) || 352;
    const separatorWidth = filesAreHidden ? 1 : 2;
    const availableWidth =
      workspace.clientWidth - otherPanelWidth - separatorWidth - 420;
    const responsiveMaxWidth = Math.max(minWidth, Math.min(maxWidth, availableWidth));
    const clampedWidth = Math.min(
      responsiveMaxWidth,
      Math.max(minWidth, width),
    );
    workspace.style.setProperty(propertyName, `${clampedWidth}px`);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();

    const workspace = document.getElementById("project-workspace");
    if (!workspace) return;
    const workspaceElement = workspace;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handlePointerMove(pointerEvent: PointerEvent) {
      const workspaceBounds = workspaceElement.getBoundingClientRect();
      const width =
        panel === "agent"
          ? pointerEvent.clientX - workspaceBounds.left
          : workspaceBounds.right - pointerEvent.clientX;

      setPanelWidth(workspaceElement, width);
    }

    function stopResizing() {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const workspace = document.getElementById("project-workspace");
    if (!workspace) return;

    const currentWidth = Number.parseFloat(
      getComputedStyle(workspace).getPropertyValue(propertyName),
    ) || defaultWidth;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const panelDirection = panel === "agent" ? direction : -direction;

    setPanelWidth(workspace, currentWidth + panelDirection * 16);
  }

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative z-10 hidden cursor-col-resize touch-none bg-border outline-none lg:block",
        "focus-visible:bg-focus-accent",
        className,
      )}
    >
      <span className="absolute inset-y-0 -left-2 -right-2" />
    </div>
  );
}

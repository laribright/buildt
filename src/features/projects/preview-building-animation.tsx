"use client";

import { useEffect, useState } from "react";

const BUILD_BEATS = [
  "Understanding your brief",
  "Scaffolding the app shell",
  "Designing pages & routes",
  "Writing components",
  "Styling the interface",
  "Installing packages",
  "Bringing up preview",
] as const;

type PreviewBuildingAnimationProps = {
  projectName: string;
};

export function PreviewBuildingAnimation({
  projectName,
}: PreviewBuildingAnimationProps) {
  const [beatIndex, setBeatIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBeatIndex((current) => (current + 1) % BUILD_BEATS.length);
    }, 2_400);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="preview-build relative grid h-full min-h-80 place-items-center overflow-hidden bg-background"
      aria-label="Agent is building your project"
      role="status"
      aria-live="polite"
    >
      <div className="preview-build-glow pointer-events-none absolute inset-0" />
      <div className="preview-build-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-6 text-center">
        <div className="preview-build-orb relative size-40">
          <span className="preview-build-ring preview-build-ring-a" />
          <span className="preview-build-ring preview-build-ring-b" />
          <span className="preview-build-ring preview-build-ring-c" />
          <span className="preview-build-core absolute inset-[28%] rounded-full bg-primary" />
          <span className="preview-build-spark preview-build-spark-1" />
          <span className="preview-build-spark preview-build-spark-2" />
          <span className="preview-build-spark preview-build-spark-3" />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Agent building
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {projectName}
          </h2>
          <p
            key={beatIndex}
            className="preview-build-beat text-sm text-muted-foreground sm:text-base"
          >
            {BUILD_BEATS[beatIndex]}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <div className="preview-build-bar h-1 overflow-hidden rounded-full bg-muted">
            <span className="preview-build-bar-fill block h-full rounded-full bg-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            Live preview appears here when the first build finishes
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type FileTreeVisibility = {
  isOpen: boolean;
  toggle: () => void;
};

const FileTreeVisibilityContext = createContext<FileTreeVisibility | null>(null);

export function FileTreeVisibilityProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <FileTreeVisibilityContext.Provider
      value={{ isOpen, toggle: () => setIsOpen((current) => !current) }}
    >
      <div
        className="contents"
        data-files-hidden={isOpen ? undefined : ""}
      >
        {children}
      </div>
    </FileTreeVisibilityContext.Provider>
  );
}

export function FileTreeToggle() {
  const visibility = useContext(FileTreeVisibilityContext);

  if (!visibility) {
    throw new Error("FileTreeToggle must be used inside FileTreeVisibilityProvider");
  }

  const { isOpen, toggle } = visibility;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-controls="project-files-panel"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close files panel" : "Open files panel"}
      title={isOpen ? "Close files panel" : "Open files panel"}
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-transparent hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className="relative block size-5 rounded-[5px] border-2 border-current"
        aria-hidden="true"
      >
        <span className="absolute top-0 right-0 h-full w-1.5 rounded-r-xs bg-current" />
      </span>
    </button>
  );
}

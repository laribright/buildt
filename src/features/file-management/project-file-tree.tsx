"use client";

import { useEffect, useRef, useState } from "react";
import {
  Braces,
  ChevronRight,
  Download,
  File,
  FileCode2,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreVertical,
  Package,
  Search,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Tree, type NodeRendererProps } from "react-arborist";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FILE_INTENTS } from "@/features/file-management/constants";
import { useProjectFileWorkspace } from "@/features/file-management/project-file-workspace";
import type { ProjectFile } from "@/features/file-management/types";
import { cn } from "@/lib/utils";

const fileMenuActions: {
  icon: LucideIcon;
  intent: (typeof FILE_INTENTS)[keyof typeof FILE_INTENTS];
  label: string;
}[] = [
  {
    icon: FilePlus2,
    intent: FILE_INTENTS.createFile,
    label: "New file",
  },
  {
    icon: FolderPlus,
    intent: FILE_INTENTS.createFolder,
    label: "New folder",
  },
  {
    icon: Download,
    intent: FILE_INTENTS.downloadZip,
    label: "Download as zip",
  },
];

function FileIcon({ node }: { node: ProjectFile }) {
  if (node.children) return <Folder className="size-4" />;
  if (node.type === "typescript")
    return <FileCode2 className="size-4 text-primary" />;
  if (node.type === "json") return <Package className="size-4 text-primary" />;
  if (node.type === "script") return <Terminal className="size-4" />;
  if (node.type === "markdown") return <Braces className="size-4" />;
  return <File className="size-4" />;
}

function FileTreeNode({ node, style }: NodeRendererProps<ProjectFile>) {
  const { openFile } = useProjectFileWorkspace();
  return (
    <button
      type="button"
      style={style}
      onClick={() => (node.isLeaf ? openFile(node.data) : node.toggle())}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-1.5 text-left text-sm hover:bg-muted",
        node.isSelected && "bg-muted",
      )}
    >
      {node.isInternal ? (
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            node.isOpen && "rotate-90",
          )}
        />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
      {node.isInternal && node.isOpen ? (
        <FolderOpen className="size-4 shrink-0" />
      ) : (
        <FileIcon node={node.data} />
      )}
      <span className="truncate">{node.data.name}</span>
    </button>
  );
}

export function ProjectFileTree() {
  const [query, setQuery] = useState("");
  const [treeHeight, setTreeHeight] = useState(400);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const treeViewportRef = useRef<HTMLDivElement>(null);
  const { activeFileId, files, projectId, refreshFiles } =
    useProjectFileWorkspace();

  async function handleMenuAction(
    intent: (typeof FILE_INTENTS)[keyof typeof FILE_INTENTS],
  ) {
    setFeedback(null);
    if (intent === FILE_INTENTS.downloadZip) {
      const link = document.createElement("a");
      link.href = `/api/projects/${projectId}/files?download=zip`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMenuOpen(false);
      return;
    }

    const label = intent === FILE_INTENTS.createFile ? "file" : "folder";
    const path = window.prompt(
      `Enter the new ${label} path relative to the project root:`,
      intent === FILE_INTENTS.createFile ? "src/new-file.tsx" : "src/new-folder",
    );
    if (!path?.trim()) return;

    setIsPending(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, path }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Unable to create ${label}`);
      refreshFiles();
      setMenuOpen(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : `Unable to create ${label}`);
    } finally {
      setIsPending(false);
    }
  }

  useEffect(() => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setTreeHeight(Math.max(0, Math.floor(entry.contentRect.height)));
    });
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-l bg-background"
      aria-label="Project files"
    >
      <div className="border-b bg-muted/60 p-2">
        <div className="rounded-lg border bg-background px-3 py-2 text-center text-sm font-medium shadow-xs">
          Files
        </div>
      </div>
      <div className="flex items-center gap-1.5 p-3 pb-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
            aria-label="Search files"
            className="pl-8"
          />
        </div>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-muted"
            aria-label="More file options"
          >
            <MoreVertical className="size-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 gap-0.5 p-1.5">
            <div className="grid gap-0.5">
              {fileMenuActions.map(({ icon: Icon, intent, label }) => (
                <button
                  key={intent}
                  type="button"
                  onClick={() => void handleMenuAction(intent)}
                  disabled={isPending || !projectId}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
              {feedback ? (
                <p className="px-2.5 py-1 text-xs text-destructive" role="alert">
                  {feedback}
                </p>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div
        ref={treeViewportRef}
        className="min-h-0 flex-1 overflow-hidden px-2 pb-2"
      >
        <Tree<ProjectFile>
          data={files}
          width="100%"
          height={treeHeight}
          indent={18}
          rowHeight={32}
          openByDefault
          searchTerm={query}
          searchMatch={(node, term) =>
            node.data.name.toLowerCase().includes(term.toLowerCase())
          }
          selection={activeFileId ?? undefined}
          disableDrag
          disableDrop
          disableEdit
          aria-label="Files"
          className="workspace-scrollbar"
        >
          {FileTreeNode}
        </Tree>
      </div>
    </section>
  );
}

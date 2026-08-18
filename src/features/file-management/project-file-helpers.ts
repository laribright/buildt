import { posix } from "node:path";

import type { ProjectFile } from "@/features/file-management/types";

const PROJECT_SANDBOX_ROOT = "/home/user";

export function resolveProjectFilePath(path: string): string {
    const resolved = posix.resolve(PROJECT_SANDBOX_ROOT, path.trim());
    if (
        resolved === PROJECT_SANDBOX_ROOT ||
        !resolved.startsWith(`${PROJECT_SANDBOX_ROOT}/`)
    ) {
        throw new Error("Path must point to a file or folder inside the project");
    }
    return resolved;
}

type SandboxEntry = {
    name: string;
    path: string;
    type: "file" | "dir";
};

function fileTypeFromPath(path: string): ProjectFile["type"] {
    if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".jsx") || path.endsWith(".js")) return "script";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    return undefined;
}

/** Monaco language ids (tsx must still be "typescript" + jsx compiler options). */
export function monacoLanguageFromPath(path: string): string {
    if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".md")) return "markdown";
    return "plaintext";
}

function normalizePath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
}

export function mapSandboxEntriesToProjectFiles(
    projectId: string,
    entries: SandboxEntry[],
): ProjectFile[] {
    const byPath = new Map<string, ProjectFile>();

    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const path = normalizePath(entry.path);
        byPath.set(path, {
            id: `${projectId}:${path}`,
            name: entry.name,
            path,
            projectId,
            ...(entry.type === "dir"
                ? { children: [] as ProjectFile[] }
                : {
                      type: fileTypeFromPath(path),
                      language: monacoLanguageFromPath(path),
                  }),
        });
    }

    const roots: ProjectFile[] = [];

    for (const node of byPath.values()) {
        const parentPath = node.path.replace(/\/[^/]+$/, "") || "/";
        const parent = byPath.get(parentPath);

        if (parent?.children) {
            parent.children.push(node);
            continue;
        }

        if (parentPath === "/home/user") {
            roots.push(node);
        }
    }

    const sortNodes = (nodes: ProjectFile[]) => {
        nodes.sort((a, b) => {
            const aDir = Boolean(a.children);
            const bDir = Boolean(b.children);
            if (aDir !== bDir) return aDir ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        for (const node of nodes) {
            if (node.children) sortNodes(node.children);
        }
    };

    sortNodes(roots);
    return roots;
}

import "server-only";

import { posix } from "node:path";

import type { Sandbox } from "@e2b/code-interpreter";

const PROJECT_ROOT = "/home/user";
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".npm",
  ".vite",
  "dist",
  "node_modules",
]);

function resolveSnapshotPath(relativePath: string): string {
  if (!relativePath || relativePath.includes("\0")) {
    throw new Error("Invalid source snapshot path");
  }

  const normalized = posix.normalize(relativePath.replaceAll("\\", "/"));
  if (
    posix.isAbsolute(normalized) ||
    normalized === ".." ||
    normalized.startsWith("../")
  ) {
    throw new Error(
      `Source snapshot path escapes the project: ${relativePath}`,
    );
  }

  const absolutePath = posix.join(PROJECT_ROOT, normalized);
  if (!absolutePath.startsWith(`${PROJECT_ROOT}/`)) {
    throw new Error(
      `Source snapshot path escapes the project: ${relativePath}`,
    );
  }

  return absolutePath;
}

async function listSourceFiles(
  sandbox: Sandbox,
  directory = PROJECT_ROOT,
): Promise<string[]> {
  const entries = await sandbox.files.list(directory);
  const files: string[] = [];
  const directories: string[] = [];

  for (const entry of entries) {
    const name = posix.basename(entry.path);
    if (entry.type === "dir") {
      if (!IGNORED_DIRECTORIES.has(name)) directories.push(entry.path);
    } else {
      files.push(entry.path);
    }
  }

  const nested = await Promise.all(
    directories.map((path) => listSourceFiles(sandbox, path)),
  );
  return files.concat(...nested);
}

export async function snapshotProjectSource(
  sandbox: Sandbox,
): Promise<Record<string, string>> {
  const paths = await listSourceFiles(sandbox);
  const entries = await Promise.all(
    paths.map(async (absolutePath) => {
      const relativePath = posix.relative(PROJECT_ROOT, absolutePath);
      return [relativePath, await sandbox.files.read(absolutePath)] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function restoreProjectSource(
  sandbox: Sandbox,
  snapshot: Record<string, string>,
): Promise<void> {
  const files = Object.entries(snapshot).map(([relativePath, content]) => ({
    absolutePath: resolveSnapshotPath(relativePath),
    content,
  }));
  const directories = [
    ...new Set(files.map(({ absolutePath }) => posix.dirname(absolutePath))),
  ].sort((left, right) => left.length - right.length);

  for (const directory of directories) {
    if (directory !== PROJECT_ROOT) await sandbox.files.makeDir(directory);
  }

  await Promise.all(
    files.map(({ absolutePath, content }) =>
      sandbox.files.write(absolutePath, content),
    ),
  );
}

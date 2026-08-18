import "server-only";

import { posix } from "node:path";

import type { Sandbox } from "@e2b/code-interpreter";
import { getRegistryItems } from "shadcn/registry";
import ts from "typescript";

import { GENERATED_ROOT } from "@/features/projects/generated-project-template";

type RegistryItem = Awaited<ReturnType<typeof getRegistryItems>>[number];

const registryCache = new Map<string, RegistryItem>();

function dependencyName(specifier: string): string {
  if (specifier.startsWith("@")) {
    const versionAt = specifier.indexOf("@", 1);
    return versionAt === -1 ? specifier : specifier.slice(0, versionAt);
  }
  return specifier.split("@")[0];
}

function dependencyVersion(specifier: string): string {
  const name = dependencyName(specifier);
  return specifier.length > name.length + 1
    ? specifier.slice(name.length + 1)
    : "latest";
}

async function listSourceFiles(
  sandbox: Sandbox,
  root = `${GENERATED_ROOT}/src`,
): Promise<string[]> {
  const entries = await sandbox.files.list(root);
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.type === "dir" && !entry.name.startsWith("."))
      .map((entry) =>
        listSourceFiles(
          sandbox,
          entry.path.startsWith("/") ? entry.path : `${root}/${entry.name}`,
        ),
      ),
  );
  return entries
    .filter((entry) => entry.type !== "dir")
    .map((entry) =>
      entry.path.startsWith("/") ? entry.path : `${root}/${entry.name}`,
    )
    .concat(...nested);
}

async function requestedComponents(sandbox: Sandbox): Promise<Set<string>> {
  const requested = new Set<string>();
  for (const path of (await listSourceFiles(sandbox)).filter((value) =>
    /\.[cm]?[jt]sx?$/.test(value),
  )) {
    if (path.includes("/src/components/ui/")) continue;
    const source = await sandbox.files.read(path).catch(() => "");
    const tree = ts.createSourceFile(
      path,
      source,
      ts.ScriptTarget.Latest,
      true,
      path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const statement of tree.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      )
        continue;
      const match = statement.moduleSpecifier.text.match(
        /^@\/components\/ui\/([a-z0-9-]+)$/,
      );
      if (match) requested.add(match[1]);
    }
  }
  return requested;
}

async function fetchRegistryItems(names: string[]): Promise<RegistryItem[]> {
  const missing = names.filter((name) => !registryCache.has(name));
  if (missing.length) {
    const request = getRegistryItems(missing, {
      useCache: true,
      config: {
        style: "new-york",
        rsc: false,
        tsx: true,
        tailwind: {
          css: "src/index.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          utils: "@/lib/utils",
          lib: "@/lib",
          hooks: "@/hooks",
        },
      },
    });
    const items = await Promise.race([
      request,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Shadcn registry request timed out")),
          30_000,
        ),
      ),
    ]);
    for (const item of items) registryCache.set(item.name, item);
  }
  return names.flatMap((name) => {
    const item = registryCache.get(name);
    return item ? [item] : [];
  });
}

function registryTarget(
  item: RegistryItem,
  file: NonNullable<RegistryItem["files"]>[number],
): string {
  const basename = posix.basename(file.path);
  if (file.target) {
    const target = file.target.replace(/^~\//, "").replace(/^@\//, "src/");
    return posix.join(GENERATED_ROOT, target);
  }
  if (file.type === "registry:hook")
    return `${GENERATED_ROOT}/src/hooks/${basename}`;
  if (file.type === "registry:lib")
    return `${GENERATED_ROOT}/src/lib/${basename}`;
  if (file.type === "registry:ui")
    return `${GENERATED_ROOT}/src/components/ui/${basename}`;
  return `${GENERATED_ROOT}/src/components/${item.name}/${basename}`;
}

function normalizeRegistryImports(source: string): string {
  return source
    .replace(/@\/registry\/[^/]+\/ui\//g, "@/components/ui/")
    .replace(/@\/registry\/[^/]+\/hooks\//g, "@/hooks/")
    .replace(/@\/registry\/[^/]+\/lib\//g, "@/lib/");
}

export async function provisionGeneratedShadcnComponents(
  sandbox: Sandbox,
): Promise<{ installed: string[]; dependenciesAdded: boolean }> {
  const requested = await requestedComponents(sandbox);
  if (!requested.size) return { installed: [], dependenciesAdded: false };

  const missing: string[] = [];
  for (const name of requested) {
    if (
      !(await sandbox.files.exists(
        `${GENERATED_ROOT}/src/components/ui/${name}.tsx`,
      ))
    ) {
      missing.push(name);
    }
  }
  const pending = [...requested];
  const resolved = new Map<string, RegistryItem>();
  while (pending.length) {
    const batch = pending.splice(0);
    const items = await fetchRegistryItems(batch);
    for (const item of items) {
      if (resolved.has(item.name)) continue;
      resolved.set(item.name, item);
      for (const dependency of item.registryDependencies ?? []) {
        if (/^[a-z0-9-]+$/.test(dependency) && !resolved.has(dependency)) {
          pending.push(dependency);
        }
      }
    }
  }

  for (const name of requested) {
    if (!resolved.has(name)) {
      throw new Error(
        `Shadcn registry did not return the requested component: ${name}`,
      );
    }
  }

  const writes: Array<{ path: string; data: string }> = [];
  const packagePath = `${GENERATED_ROOT}/package.json`;
  const pkg = JSON.parse(await sandbox.files.read(packagePath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  pkg.dependencies = { ...(pkg.dependencies ?? {}) };
  pkg.devDependencies = { ...(pkg.devDependencies ?? {}) };
  const dependenciesBefore = JSON.stringify({
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
  });

  for (const item of resolved.values()) {
    for (const file of item.files ?? []) {
      const target = registryTarget(item, file);
      if (!file.content) continue;

      if (await sandbox.files.exists(target)) {
        const current = await sandbox.files.read(target);
        const normalized = normalizeRegistryImports(current);
        if (normalized !== current) {
          writes.push({ path: target, data: normalized });
        }
      } else {
        writes.push({
          path: target,
          data: normalizeRegistryImports(file.content),
        });
      }
    }
    for (const dependency of item.dependencies ?? []) {
      pkg.dependencies[dependencyName(dependency)] =
        dependencyVersion(dependency);
    }
    for (const dependency of item.devDependencies ?? []) {
      pkg.devDependencies[dependencyName(dependency)] =
        dependencyVersion(dependency);
    }
  }

  if (writes.length) await sandbox.files.write(writes);
  await sandbox.files.write(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  const dependenciesAdded =
    dependenciesBefore !==
    JSON.stringify({
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
    });
  return { installed: missing, dependenciesAdded };
}

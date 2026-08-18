import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { Sandbox } from "@e2b/code-interpreter";

const root = process.cwd();

function loadTypeScriptModule(file, dependencies = {}) {
  const source = fs.readFileSync(file, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: file,
    reportDiagnostics: true,
  });
  const errors = (output.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors.length > 0) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(errors, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
      }),
    );
  }
  const moduleRecord = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier in dependencies) return dependencies[specifier];
    throw new Error(`Unexpected template dependency: ${specifier}`);
  };
  Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output.outputText,
  )(moduleRecord.exports, localRequire, moduleRecord, file, path.dirname(file));
  return moduleRecord.exports;
}

const templatePath = path.join(
  root,
  "src/features/projects/generated-project-template.ts",
);
const template = loadTypeScriptModule(templatePath);
const files = template.GENERATED_PROJECT_FILES;

for (const [file, source] of Object.entries(files)) {
  if (!/\.(?:ts|tsx)$/.test(file)) continue;
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  if (tree.parseDiagnostics.length > 0) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(tree.parseDiagnostics, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => "/home/user",
        getNewLine: () => "\n",
      }),
    );
  }
}

if (!process.env.E2B_API_KEY) {
  throw new Error(
    "E2B_API_KEY is required for isolated generated-template verification.",
  );
}

const sandbox = await Sandbox.create({ timeoutMs: 10 * 60 * 1000 });
try {
  await sandbox.files.write(
    Object.entries(files).map(([file, data]) => ({ path: file, data })),
  );
  const install = await sandbox.commands.run("npm install", {
    cwd: "/home/user",
    timeoutMs: 5 * 60 * 1000,
  });
  if (install.exitCode !== 0) throw new Error(install.stderr || install.stdout);
  const build = await sandbox.commands.run("npm run build", {
    cwd: "/home/user",
    timeoutMs: 5 * 60 * 1000,
  });
  if (build.exitCode !== 0) throw new Error(build.stderr || build.stdout);
  console.log(
    "Generated UI template installed, type-checked, and built successfully in E2B.",
  );
  console.log(build.stdout.trim());
} finally {
  await sandbox.kill();
}

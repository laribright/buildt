import type { ProjectFile } from "@/features/file-management/types";

function file(
  projectId: string,
  path: string,
  content: string,
  language: string,
  type?: ProjectFile["type"],
): ProjectFile {
  return {
    content,
    id: `${projectId}:${path}`,
    language,
    name: path.split("/").at(-1) ?? path,
    path,
    projectId,
    type,
  };
}

function folder(
  projectId: string,
  path: string,
  children: ProjectFile[] = [],
): ProjectFile {
  return {
    children,
    id: `${projectId}:${path}`,
    name: path.split("/").at(-1) ?? path,
    path,
    projectId,
  };
}

export function retrieveProjectFiles(projectId: string): ProjectFile[] {
  return [
    folder(projectId, "artifacts"),
    folder(projectId, "lib", [
      folder(projectId, "lib/api-client-react", [
        folder(projectId, "lib/api-client-react/dist"),
        folder(projectId, "lib/api-client-react/src", [
          folder(projectId, "lib/api-client-react/src/generated"),
          file(
            projectId,
            "lib/api-client-react/src/custom-fetch.ts",
            `export async function customFetch<T>(\n  input: RequestInfo | URL,\n  init?: RequestInit,\n): Promise<T> {\n  const response = await fetch(input, init);\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json() as Promise<T>;\n}\n`,
            "typescript",
            "typescript",
          ),
          file(
            projectId,
            "lib/api-client-react/src/index.ts",
            `export { customFetch } from "./custom-fetch";\n\nexport type ApiResponse<T> = {\n  data: T;\n  success: boolean;\n};\n`,
            "typescript",
            "typescript",
          ),
        ]),
        file(
          projectId,
          "lib/api-client-react/package.json",
          `{\n  "name": "@app/api-client-react",\n  "version": "0.1.0",\n  "private": true,\n  "type": "module"\n}\n`,
          "json",
          "json",
        ),
        file(
          projectId,
          "lib/api-client-react/tsconfig.json",
          `{\n  "extends": "../../tsconfig.base.json",\n  "include": ["src/**/*.ts"]\n}\n`,
          "json",
          "json",
        ),
      ]),
    ]),
    folder(projectId, "api-spec"),
    folder(projectId, "api-zod"),
    folder(projectId, "db"),
    folder(projectId, "scripts"),
    folder(projectId, "src", [
      file(
        projectId,
        "src/App.tsx",
        `import "./index.css";\n\nexport default function App() {\n  return (\n    <main className="page">\n      <p>CHAPTER 01</p>\n      <h1>Hello, <em>World.</em></h1>\n      <p>A blank page is not empty space. It is a canvas holding absolute potential.</p>\n    </main>\n  );\n}\n`,
        "typescript",
        "typescript",
      ),
      file(
        projectId,
        "src/index.css",
        `:root {\n  font-family: system-ui, sans-serif;\n}\n\nbody {\n  margin: 0;\n  background: #fffaf5;\n}\n`,
        "css",
      ),
    ]),
    file(projectId, "package.json", `{\n  "name": "${projectId}",\n  "private": true,\n  "scripts": { "dev": "vite" }\n}\n`, "json", "json"),
    file(projectId, "post-merge.sh", "#!/bin/sh\nnpm install\n", "shell", "script"),
    file(projectId, "tsconfig.json", `{\n  "extends": "./tsconfig.base.json"\n}\n`, "json", "json"),
    file(projectId, "replit.md", `# ${projectId}\n\nGenerated project workspace.\n`, "markdown", "markdown"),
  ];
}

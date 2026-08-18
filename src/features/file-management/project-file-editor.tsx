"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/components/ui/theme-provider";
import type { BeforeMount } from "@monaco-editor/react";

import { useProjectFileWorkspace } from "@/features/file-management/project-file-workspace";
import type { ProjectFile } from "@/features/file-management/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

type ProjectFileEditorProps = {
  file: ProjectFile;
};

export function ProjectFileEditor({ file }: ProjectFileEditorProps) {
  const { contents, updateFile } = useProjectFileWorkspace();
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Sandbox files have no local @types/react — semantic checks spam false JSX errors.
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      reactNamespace: "React",
      allowJs: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    });
  };

  return (
    <section
      className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-background"
      aria-label={`${file.name} editor`}
    >
      <div className="flex h-10 shrink-0 items-center border-b px-3 text-xs text-muted-foreground">
        <span className="truncate">{file.path}</span>
      </div>
      <div className="min-h-0 flex-1">
        <MonacoEditor
          path={file.path}
          language={file.language ?? "plaintext"}
          value={contents[file.id] ?? ""}
          onChange={(value) => updateFile(file.id, value ?? "")}
          theme={editorTheme}
          beforeMount={handleBeforeMount}
          options={{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
        />
      </div>
    </section>
  );
}

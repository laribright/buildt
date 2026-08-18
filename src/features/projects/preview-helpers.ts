import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createGeneratedThemeCss,
  GENERATED_PROJECT_FILES,
} from "./generated-project-template";

export const SEED_APP_MARKER = "Your project is ready. Customize this page.";

export type VisualQualityAudit = { ok: boolean; errors: string[] };

const VITE_SEED_FILES: Record<string, string> = {
  "/home/user/package.json": `${JSON.stringify(
    {
      name: "buildt-app",
      private: true,
      version: "0.0.1",
      type: "module",
      scripts: {
        dev: "vite --host 0.0.0.0 --port 3000",
        build: "vite build",
        preview: "vite preview --host 0.0.0.0 --port 3000",
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.28.0",
      },
      devDependencies: {
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.6.3",
        vite: "^5.4.11",
      },
    },
    null,
    2,
  )}\n`,
  "/home/user/vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    // E2B public preview host is *.e2b.app — without this Vite returns 403.
    allowedHosts: true,
  },
});
`,
  "/home/user/tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`,
  "/home/user/tsconfig.node.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
`,
  "/home/user/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Buildt App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  "/home/user/src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
`,
  "/home/user/src/App.tsx": `export default function App() {
  return (
    <main className="app">
      <h1>Buildt App</h1>
      <p>Your project is ready. Customize this page.</p>
    </main>
  );
}
`,
  "/home/user/src/index.css": `:root {
  font-family: Inter, system-ui, sans-serif;
  line-height: 1.5;
  color: #0f172a;
  background: #f8fafc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}
`,
  "/home/user/src/vite-env.d.ts": `/// <reference types="vite/client" />
`,
};

function stripCodeFence(text: string) {
  return text
    .replace(/^```(?:tsx|ts|css|jsx|javascript|typescript)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/** Remove markdown fences / delimiters the model often leaves in file bodies. */
function sanitizeGeneratedSource(text: string, kind: "tsx" | "css") {
  let next = text.replace(/\r\n/g, "\n").trim();

  // Drop wrapper markers if the model echoed them inside a section.
  next = next
    .replace(/<<<APP_TSX>>>/gi, "")
    .replace(/<<<INDEX_CSS>>>/gi, "")
    .trim();

  // Remove every markdown fence line (``` / ```tsx / ```css).
  next = next
    .split("\n")
    .filter((line) => !/^\s*```/.test(line))
    .join("\n")
    .trim();

  // Also strip inline leftover fence ticks at start/end.
  next = stripCodeFence(next);

  if (kind === "tsx") {
    const importIdx = next.search(/^import\s/m);
    const exportIdx = next.search(/^export\s+default\s/m);
    const start = importIdx >= 0 ? importIdx : exportIdx;
    if (start > 0) next = next.slice(start).trim();
  }

  if (kind === "css") {
    const ruleIdx = next.search(/[:.{#*@[]/);
    if (ruleIdx > 0) next = next.slice(ruleIdx).trim();
  }

  if (next.includes("```")) {
    throw new Error(`Generated ${kind} still contains markdown fences`);
  }

  return `${next}\n`;
}

/** Writes a complete Vite + React + TS app at /home/user (Buildt contract). */
export async function seedMinimalViteProject(sandbox: Sandbox): Promise<void> {
  const missing: Array<{ path: string; data: string }> = [];
  for (const [path, content] of Object.entries(GENERATED_PROJECT_FILES)) {
    try {
      await sandbox.files.read(path);
    } catch {
      missing.push({ path, data: content });
    }
  }
  if (missing.length > 0) await sandbox.files.write(missing);

  const packagePath = "/home/user/package.json";
  const foundationPackage = JSON.parse(
    GENERATED_PROJECT_FILES[packagePath],
  ) as {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const currentPackage = JSON.parse(await sandbox.files.read(packagePath)) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };

  await sandbox.files.write([
    {
      path: packagePath,
      data: `${JSON.stringify(
        {
          ...currentPackage,
          scripts: {
            ...foundationPackage.scripts,
            ...(currentPackage.scripts ?? {}),
          },
          dependencies: {
            ...foundationPackage.dependencies,
            ...(currentPackage.dependencies ?? {}),
          },
          devDependencies: {
            ...foundationPackage.devDependencies,
            ...(currentPackage.devDependencies ?? {}),
          },
        },
        null,
        2,
      )}\n`,
    },
    ...[
      "/home/user/components.json",
      "/home/user/vite.config.ts",
      "/home/user/tsconfig.json",
      "/home/user/tsconfig.app.json",
      "/home/user/tsconfig.node.json",
      "/home/user/src/lib/utils.ts",
    ].map((path) => ({ path, data: GENERATED_PROJECT_FILES[path] })),
  ]);
}

export async function inspectAppCustomization(
  sandbox: Sandbox,
): Promise<{ customized: boolean; reason: string }> {
  try {
    const app = await sandbox.files.read("/home/user/src/App.tsx");
    const entries = await listProjectSandboxEntries(sandbox, "/home/user/src");
    const tsxSources = await Promise.all(
      entries
        .filter((entry) => entry.type === "file" && entry.path.endsWith(".tsx"))
        .map((entry) => sandbox.files.read(entry.path)),
    );
    const visibleSource = tsxSources.join("\n");
    const stillSeed =
      app.includes(SEED_APP_MARKER) ||
      (app.includes("Buildt App") && app.includes("Customize this page"));
    const hasMeaningfulUi =
      visibleSource.length >= 200 &&
      /<(main|section|header)[\s>]/.test(visibleSource) &&
      /<h1[\s>]/.test(visibleSource);
    if (stillSeed) {
      return {
        customized: false,
        reason: "the starter marker is still present in src/App.tsx",
      };
    }
    if (!hasMeaningfulUi) {
      return {
        customized: false,
        reason:
          "generated TSX does not contain a complete visible application shell",
      };
    }
    return {
      customized: true,
      reason: "generated application source is present",
    };
  } catch (error) {
    return {
      customized: false,
      reason:
        error instanceof Error
          ? error.message
          : "src/App.tsx could not be inspected",
    };
  }
}

/** Catch common "it renders, but looks unfinished" failures before preview. */
export async function auditVisualQuality(
  sandbox: Sandbox,
): Promise<VisualQualityAudit> {
  const errors: string[] = [];
  const entries = await listProjectSandboxEntries(sandbox, "/home/user/src");
  const tsxPaths = entries
    .filter(
      (entry) =>
        entry.type === "file" &&
        entry.path.endsWith(".tsx") &&
        !entry.path.includes("/src/components/ui/") &&
        !entry.path.endsWith("/ui-foundation-smoke.tsx"),
    )
    .map((entry) => entry.path);
  const [tsxSources, css] = await Promise.all([
    Promise.all(tsxPaths.map((path) => sandbox.files.read(path))),
    sandbox.files.read("/home/user/src/index.css"),
  ]);
  const app = tsxSources.join("\n");

  if (!css.includes(":root"))
    errors.push("Missing centralized design tokens in :root.");
  if (!/\bhover:/.test(app))
    errors.push("Missing deliberate Tailwind hover states.");
  if (!/\bfocus-visible:/.test(app))
    errors.push("Missing accessible Tailwind focus-visible states.");
  if (!/\b(?:sm|md|lg|xl):/.test(app))
    errors.push("Responsive behavior needs deliberate Tailwind breakpoints.");
  if (!/\boverflow-x-(?:hidden|clip)\b/.test(app)) {
    errors.push("The page does not guard against horizontal overflow.");
  }
  if (/Welcome to Our|Feature One|Lorem ipsum|SaaS Product/i.test(app)) {
    errors.push("Visible copy still contains generic template language.");
  }
  if (
    /https?:\/\//.test(app) &&
    /<img[\s>]/.test(app) &&
    !/onError=/.test(app)
  ) {
    errors.push("Remote images need a graceful onError fallback.");
  }

  return { ok: errors.length === 0, errors };
}

/** Verify the generated product matches the request before visual polishing. */
export async function auditProductFidelity(
  sandbox: Sandbox,
  request: string,
): Promise<VisualQualityAudit> {
  const app = await sandbox.files.read("/home/user/src/App.tsx");
  const { text } = await generateText({
    model: openai("gpt-4o"),
    maxOutputTokens: 1_200,
    prompt: [
      "You are a strict product acceptance reviewer.",
      "Compare the requested product with the React source.",
      "Return PASS only if the implementation clearly represents the requested product and includes its essential visible workflows.",
      "Otherwise return 1-5 short concrete defects, one per line. Focus on missing or unrelated product UI, not subjective aesthetics.",
      "",
      `Request: ${request}`,
      "",
      "App.tsx:",
      app,
    ].join("\n"),
  });
  if (text.trim().toUpperCase() === "PASS") return { ok: true, errors: [] };
  const errors = text
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  return {
    ok: errors.length === 0,
    errors: errors.map((error) => `Product fidelity: ${error}`),
  };
}

/** Last-chance cleanup before vite build if the model left ``` fences in source. */
export async function scrubMarkdownFencesFromSources(
  sandbox: Sandbox,
): Promise<void> {
  const entries = await listProjectSandboxEntries(sandbox, "/home/user/src");
  const sourcePaths = entries
    .filter(
      (entry) =>
        entry.type === "file" &&
        (entry.path.endsWith(".tsx") ||
          entry.path.endsWith(".ts") ||
          entry.path.endsWith(".css")),
    )
    .map((entry) => entry.path);

  for (const path of sourcePaths) {
    try {
      const raw = await sandbox.files.read(path);
      if (!raw.includes("```")) continue;
      const kind = path.endsWith(".css") ? "css" : "tsx";
      await sandbox.files.write(path, sanitizeGeneratedSource(raw, kind));
    } catch {
      // File may be missing; validate will catch that.
    }
  }
}

/** Generate UI in two bounded passes so a multi-file response cannot leave
 * later files truncated and one coherent implementation owns the result. */
export async function customizeAppWithAi(
  sandbox: Sandbox,
  input: {
    prompt: string;
    projectPrompt?: string;
    isFollowUp?: boolean;
  },
): Promise<void> {
  const userGoal = input.projectPrompt?.trim() || input.prompt;
  const followUp = input.isFollowUp ? input.prompt.trim() : null;
  const currentApp = await sandbox.files
    .read("/home/user/src/App.tsx")
    .catch(() => "");

  const { text: appText } = await generateText({
    model: openai("gpt-4o"),
    maxOutputTokens: 16_000,
    maxRetries: 1,
    timeout: { totalMs: 120_000 },
    prompt: [
      "You are an award-winning digital product designer and senior React engineer.",
      "Write a COMPLETE /home/user/src/App.tsx for a production-quality React experience.",
      "Use Tailwind CSS v4 and official Shadcn/UI registry components.",
      "The result must feel art-directed for this exact product, never generated from a generic template.",
      "",
      "Product to build:",
      userGoal,
      followUp
        ? `\nFollow-up change request (apply on top of that product):\n${followUp}`
        : "",
      "",
      "Live web research:",
      "- A researchWeb tool is available. Use it only when live/current public web information is useful for this request.",
      "- Do not call it unnecessarily.",
      "- After research results return, continue generating the application.",
      "",
      "Architecture rules:",
      ...(followUp
        ? [
            "- FOLLOW-UP EDIT CONTRACT: preserve every unrelated route, workflow, component, interaction, data set, and piece of product-specific content from the existing App.tsx.",
            "- Make the smallest coherent change that satisfies the follow-up. Do not redesign, simplify, or replace the rest of the application.",
            "- Keep existing imports and state unless the requested change or a verified error requires modifying them.",
          ]
        : []),
      "- react-router-dom is already installed. BrowserRouter wraps App in main.tsx.",
      "- You may use any official Shadcn/UI registry component. Import each primitive from its exact file, for example Button from @/components/ui/button and Calendar from @/components/ui/calendar; the pipeline provisions requested registry source automatically.",
      "- NEVER import from @/components/ui because no barrel/index module exists. Use only the official public API of each component and never invent export names.",
      '- Button does not accept `as` or `href`. For link-styled buttons, use `<Button asChild><a href="/...">Label</a></Button>` or place a React Router Link inside Button with `asChild`.',
      "- Select root (`Select`) does not accept `className`. Put layout classes on `SelectTrigger` (and other Select parts), never on `Select` itself.",
      "- Slider `onValueChange` receives `number[]`. Store slider state as `useState<number[]>([min, max])` (not a fixed tuple `[number, number]`), or wrap with `(value) => setRange([value[0] ?? min, value[1] ?? max])`.",
      "- Use Tailwind utility classes and semantic colours. Do not depend on bespoke component CSS.",
      "- Keep small apps focused; for larger apps, create domain components in src/features/<domain>/ and pages in src/pages/.",
      "- Add routes only when the request genuinely needs them. A focused page should not be forced into multiple routes.",
      "- Implement meaningful interactions with React state: navigation, tabs, filters, forms, chat selection, or dialogs as appropriate.",
      "- Use React, React Router, Lucide, Tailwind, and official Shadcn registry components. Do not import unrelated npm libraries that are not already declared.",
      "- Prefer Tailwind-built product UI, diagrams, colour blocks, patterns, and Lucide icons over stock photography.",
      "- VERIFIED ASSET INVENTORY: empty. Therefore do not render img, picture, source, CSS url(), or image imports in this generation.",
      "- Never invent local asset paths, Unsplash IDs, CDN URLs, or any remote image URL.",
      "- Replace photography, logos, avatars, and screenshots with intentional Tailwind-built gradients, patterns, colour blocks, typographic marks, Lucide icons, or product-interface mockups.",
      "- Text contrast and comprehension must never depend on an image loading.",
      "- If a future verified asset inventory is supplied, use only its exact entries and give every content image meaningful alt text plus explicit dimensions or a stable aspect-ratio container.",
      "- Automatic JSX runtime: do NOT import React unless referencing the React namespace.",
      "- This project uses strict TypeScript. Explicitly type component props, callback parameters, object arrays, and empty useState arrays (for example useState<Message[]>([])); never rely on implicit any or an inferred never[] state.",
      "- main.tsx already imports index.css. Do not import any CSS from App.tsx.",
      "- Use responsive mobile-first Tailwind classes and semantic tokens such as bg-background, text-foreground, bg-primary, text-muted-foreground, border-border, and ring-ring.",
      "- Use normal public APIs documented by Shadcn/UI. Registry source and transitive component/npm dependencies are provisioned from the exact @/components/ui/<name> imports you write.",
      "- Tabs exports exactly Tabs, TabsList, TabsTrigger, and TabsContent. There is no Tab export; use TabsTrigger for each selectable tab.",
      "- Include realistic product-specific loading, empty, error, hover, focus, active, and disabled states where relevant.",
      "- Keep controls conventionally sized. Avoid giant empty regions, excessive gradients, glassmorphism, rounded-card repetition, and heavy shadows.",
      "- Do not produce a dashboard unless the requested product is genuinely a dashboard.",
      "- Never use generic AI copy such as 'Elevate your experience', 'Unlock your potential', or 'Revolutionize'.",
      "",
      "Completeness requirements:",
      "- Build the exact requested product. Derive its recognizable UI primitives from the request.",
      "- A chat app needs a conversation list, presence, message history, composer, and working conversation selection.",
      "- A dashboard needs useful navigation, metrics, primary workflows, and realistic populated states.",
      "- A landing page needs a complete narrative from hero through proof, product demonstration, and final CTA.",
      "- Never substitute an unrelated dashboard or marketplace for the requested product.",
      "- Avoid repetitive filler cards and huge empty areas. Every region must have a purpose.",
      "- Every visible sentence must be specific to this product. No generic filler.",
      "- Do not use emoji or hand-drawn SVG as interface icons. Use Lucide React.",
      "- Use semantic HTML and accessible labels. Buttons must be real buttons.",
      "",
      followUp
        ? ["Existing App.tsx to improve rather than discard:", currentApp].join(
            "\n",
          )
        : "",
      "When finished researching (if needed), return ONLY the complete raw App.tsx source. No markdown fences and no explanation.",
      "Finish every component, array, JSX element, and closing brace before responding.",
    ].join("\n"),
  });
  const app = sanitizeGeneratedSource(appText, "tsx");

  const writes = [{ path: "/home/user/src/App.tsx", data: app }];
  if (!input.isFollowUp) {
    writes.push({
      path: "/home/user/src/index.css",
      data: createGeneratedThemeCss(),
    });
  }
  await sandbox.files.write(writes);
}

/** Ensure Vite will accept the E2B public hostname (avoids blank iframe / 403). */
export async function ensureViteAllowedHosts(sandbox: Sandbox): Promise<void> {
  const path = "/home/user/vite.config.ts";
  let current = "";
  try {
    current = await sandbox.files.read(path);
  } catch {
    await sandbox.files.write(path, VITE_SEED_FILES[path]);
    return;
  }

  if (current.includes("allowedHosts")) return;

  const patched = current.includes("server:")
    ? current.replace(/server:\s*\{/, "server: {\n    allowedHosts: true,")
    : VITE_SEED_FILES[path];

  await sandbox.files.write(
    path,
    patched.includes("allowedHosts") ? patched : VITE_SEED_FILES[path],
  );
}

/**
 * Recursively list project files under /home/user for the Files sidebar.
 * Skips dependency/build noise.
 */
export async function listProjectSandboxEntries(
  sandbox: Sandbox,
  root = "/home/user",
): Promise<Array<{ name: string; path: string; type: "file" | "dir" }>> {
  const skip = new Set(["node_modules", "dist", ".npm", ".git", ".vite"]);

  async function walk(
    dir: string,
  ): Promise<Array<{ name: string; path: string; type: "file" | "dir" }>> {
    const entries = await sandbox.files.list(dir);
    const out: Array<{ name: string; path: string; type: "file" | "dir" }> = [];

    for (const entry of entries) {
      if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
      const type = entry.type === "dir" ? "dir" : "file";
      const path = entry.path.startsWith("/")
        ? entry.path
        : `${dir}/${entry.name}`;
      out.push({ name: entry.name, path, type });
      if (type === "dir") {
        out.push(...(await walk(path)));
      }
    }

    return out;
  }

  return walk(root);
}

/**
 * If the agent scaffolded into /home/user/<folder>/ instead of /home/user/,
 * move that Vite app up so required paths match Buildt's contract.
 */
export async function flattenNestedViteProject(
  sandbox: Sandbox,
): Promise<{ moved: boolean; from?: string }> {
  try {
    await sandbox.files.read("/home/user/package.json");
    return { moved: false };
  } catch {
    // Root package.json missing — look for a nested Vite app.
  }

  const entries = await sandbox.files.list("/home/user");
  const dirs = entries.filter(
    (entry) => entry.type === "dir" && !entry.name.startsWith("."),
  );

  for (const dir of dirs) {
    const nestedPkg = `/home/user/${dir.name}/package.json`;
    try {
      await sandbox.files.read(nestedPkg);
    } catch {
      continue;
    }

    await sandbox.commands.run(
      `shopt -s dotglob && mv "/home/user/${dir.name}"/* /home/user/ && rmdir "/home/user/${dir.name}"`,
      { cwd: "/home/user", timeoutMs: 60_000 },
    );
    return { moved: true, from: `/home/user/${dir.name}` };
  }

  return { moved: false };
}

export function createBuildRepairPrompt(buildError: string): string {
  return [
    "npm run build failed in /home/user. Fix the project so `npm run build` succeeds.",
    "Use readFile / writeFile / runCommand as needed. Keep the Vite + React + TS layout.",
    "Common fixes:",
    '- remove unused `import React from "react"` when using the automatic JSX runtime',
    "- if a file is only `export default Foo` with no function/const Foo defined, write a real component for Foo",
    "- if a file imports './Something.css' (or any .css) that does not exist: either write that CSS file OR remove the import (preferred: put styles in src/index.css and delete the css import)",
    "- never leave broken relative imports",
    "- never import from @/components/ui because no barrel module exists; use exact modules such as @/components/ui/button, @/components/ui/card, and @/components/ui/tabs",
    "- Button does not support `as` or direct `href` props; use Button with `asChild` and nest an anchor or React Router Link inside it",
    "- Select root does not accept className; move className to SelectTrigger or other Select parts",
    "- Slider onValueChange receives number[]; use useState<number[]>([min, max]) or adapt tuple setters so TypeScript accepts number[]",
    "- @/components/ui/tabs exports Tabs, TabsList, TabsTrigger, and TabsContent; replace any invented Tab API with TabsTrigger",
    "- satisfy strict TypeScript: define prop interfaces/types, type callback parameters, and type empty array state such as useState<Message[]>([])",
    "- the verified asset inventory is empty: remove invented local/remote images and replace them with Tailwind or Lucide visuals; never create empty placeholder asset files",
    "Keep the existing scripts.build command and fix every TypeScript error; do not weaken or bypass type-checking.",
    "",
    "Build error:",
    buildError,
  ].join("\n");
}

/** Pull stdout/stderr out of E2B CommandExitError when present. */
export function formatSandboxCommandError(error: unknown): string {
  if (error && typeof error === "object" && "result" in error) {
    const result = (
      error as {
        result?: { error?: string; stdout?: string; stderr?: string };
      }
    ).result;
    if (result) {
      return [result.error, result.stderr, result.stdout]
        .filter(Boolean)
        .join("\n")
        .trim();
    }
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function waitForHealthyPreview(
  sandbox: Sandbox,
  port = 3000,
  {
    timeoutMs = 60_000,
    intervalMs = 1_500,
  }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<string> {
  const localUrl = `http://127.0.0.1:${port}`;
  const publicUrl = `https://${sandbox.getHost(port)}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const bodyPath = `/tmp/preview-body-${Date.now()}`;
    try {
      const result = await sandbox.commands.run(
        `curl -sS -o ${bodyPath} -w "%{http_code}" ${localUrl}`,
        { timeoutMs: 15_000 },
      );
      const status = Number(result.stdout.trim());
      if (status >= 200 && status <= 299) {
        const body = (await sandbox.files.read(bodyPath)).toLowerCase();
        if (body.includes("<html") || body.includes("<!doctype")) {
          return publicUrl;
        }
      }
    } catch {
      // Keep polling until deadline.
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `Preview never became healthy on localhost:${port} within ${timeoutMs}ms (public would be ${publicUrl})`,
  );
}

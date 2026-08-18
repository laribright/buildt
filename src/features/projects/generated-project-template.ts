export const GENERATED_ROOT = "/home/user";

const packageJson = {
  name: "buildt-generated-app",
  private: true,
  version: "0.1.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc -b && vite build",
    preview: "vite preview",
  },
  dependencies: {
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "lucide-react": "^0.468.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "tailwind-merge": "^2.5.5",
    "tw-animate-css": "^1.3.0",
  },
  devDependencies: {
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    tailwindcss: "^4.1.0",
    typescript: "^5.6.3",
    vite: "^5.4.11",
  },
};

const defaultColors = {
  background: "oklch(0.99 0 0)",
  foreground: "oklch(0.16 0.01 260)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.16 0.01 260)",
  primary: "oklch(0.36 0.16 260)",
  primaryForeground: "oklch(0.98 0 0)",
  secondary: "oklch(0.94 0.02 260)",
  secondaryForeground: "oklch(0.16 0.01 260)",
  muted: "oklch(0.95 0.01 260)",
  mutedForeground: "oklch(0.48 0.02 260)",
  accent: "oklch(0.91 0.05 250)",
  accentForeground: "oklch(0.16 0.01 260)",
  border: "oklch(0.88 0.01 260)",
  input: "oklch(0.88 0.01 260)",
  ring: "oklch(0.36 0.16 260)",
};

export function createGeneratedThemeCss(): string {
  const value = (key: keyof typeof defaultColors) => defaultColors[key];
  const radius = ".75rem";
  return `@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
@theme inline{--color-background:var(--background);--color-foreground:var(--foreground);--color-card:var(--card);--color-card-foreground:var(--card-foreground);--color-popover:var(--popover);--color-popover-foreground:var(--popover-foreground);--color-primary:var(--primary);--color-primary-foreground:var(--primary-foreground);--color-secondary:var(--secondary);--color-secondary-foreground:var(--secondary-foreground);--color-muted:var(--muted);--color-muted-foreground:var(--muted-foreground);--color-accent:var(--accent);--color-accent-foreground:var(--accent-foreground);--color-destructive:var(--destructive);--color-destructive-foreground:var(--destructive-foreground);--color-border:var(--border);--color-input:var(--input);--color-ring:var(--ring);--radius-sm:calc(var(--radius) - 4px);--radius-md:calc(var(--radius) - 2px);--radius-lg:var(--radius);--radius-xl:calc(var(--radius) + 4px)}
:root{--background:${value("background")};--foreground:${value("foreground")};--card:${value("card")};--card-foreground:${value("cardForeground")};--popover:${value("card")};--popover-foreground:${value("cardForeground")};--primary:${value("primary")};--primary-foreground:${value("primaryForeground")};--secondary:${value("secondary")};--secondary-foreground:${value("secondaryForeground")};--muted:${value("muted")};--muted-foreground:${value("mutedForeground")};--accent:${value("accent")};--accent-foreground:${value("accentForeground")};--destructive:oklch(0.58 0.22 27);--destructive-foreground:oklch(0.98 0 0);--border:${value("border")};--input:${value("input")};--ring:${value("ring")};--radius:${radius}}
.dark{--background:oklch(0.15 0.01 260);--foreground:oklch(0.97 0.01 260);--card:oklch(0.2 0.01 260);--card-foreground:var(--foreground);--popover:var(--card);--popover-foreground:var(--foreground);--primary:oklch(0.76 0.14 255);--primary-foreground:oklch(0.16 0.02 260);--secondary:oklch(0.27 0.02 260);--secondary-foreground:var(--foreground);--muted:oklch(0.25 0.01 260);--muted-foreground:oklch(0.7 0.02 260);--accent:oklch(0.31 0.04 255);--accent-foreground:var(--foreground);--destructive:oklch(0.7 0.19 24);--destructive-foreground:oklch(0.98 0 0);--border:oklch(1 0 0/.14);--input:oklch(1 0 0/.18);--ring:oklch(0.7 0.12 255)}
@layer base{*{@apply border-border}html{font-family:ui-sans-serif,system-ui,sans-serif}body{@apply min-h-screen bg-background text-foreground antialiased}button,a,input,textarea,select{@apply outline-ring}}
`;
}

export const GENERATED_PROJECT_FILES: Record<string, string> = {
  "/home/user/package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
  "/home/user/components.json": `${JSON.stringify({ $schema: "https://ui.shadcn.com/schema.json", style: "new-york", rsc: false, tsx: true, tailwind: { css: "src/index.css", baseColor: "neutral", cssVariables: true }, aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" } }, null, 2)}\n`,
  "/home/user/vite.config.ts": `import { fileURLToPath } from "node:url";\nimport { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins:[react(),tailwindcss()], resolve:{alias:{"@":fileURLToPath(new URL("./src",import.meta.url))}}, server:{host:"0.0.0.0",port:3000,allowedHosts:true} });\n`,
  "/home/user/tsconfig.json": `{"files":[],"references":[{"path":"./tsconfig.app.json"},{"path":"./tsconfig.node.json"}]}\n`,
  "/home/user/tsconfig.app.json": `{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["ES2020","DOM","DOM.Iterable"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","allowImportingTsExtensions":true,"isolatedModules":true,"moduleDetection":"force","noEmit":true,"jsx":"react-jsx","strict":true,"baseUrl":".","paths":{"@/*":["./src/*"]}},"include":["src"]}\n`,
  "/home/user/tsconfig.node.json": `{"compilerOptions":{"target":"ES2022","lib":["ES2023"],"module":"ESNext","skipLibCheck":true,"moduleResolution":"bundler","noEmit":true,"strict":true,"baseUrl":".","paths":{"@/*":["./src/*"]}},"include":["vite.config.ts"]}\n`,
  "/home/user/index.html": `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Buildt App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
  "/home/user/src/vite-env.d.ts": `/// <reference types="vite/client" />\n`,
  "/home/user/src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\nexport function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs));}\n`,
  "/home/user/src/main.tsx": `import { StrictMode } from "react";import{createRoot}from"react-dom/client";import{BrowserRouter}from"react-router-dom";import App from"./App";import"./index.css";createRoot(document.getElementById("root")!).render(<StrictMode><BrowserRouter><App/></BrowserRouter></StrictMode>);\n`,
  "/home/user/src/App.tsx": `export default function App(){return <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground"><section className="space-y-4 text-center"><h1 className="text-4xl font-bold">Buildt App</h1><p className="text-muted-foreground">Your project is ready. Customize this page.</p><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Get started</button></section></main>}\n`,
  "/home/user/src/index.css": createGeneratedThemeCss(),
};

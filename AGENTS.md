<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Rules

### Commands

- Never install packages or run `npm`, `pnpm`, `yarn`, `bun`, or `npx shadcn` installation commands.
- Never start development servers or processes that open or listen on a port.
- If a task requires a missing package or shadcn component, stop and tell me exactly what must be installed.

### Packages and Documentation

- Research current official documentation before using any package or framework API.
- Recommend the latest stable version compatible with the existing project.
- Never use deprecated packages, APIs, or outdated patterns.
- Never install, change, or upgrade packages without informing me and receiving approval.

### Architecture

- Use feature-based modular architecture organized by business domain.
- Domains such as `auth`, `projects`, `publishing`, and `file-management` are features.
- Pages are routes, not features. Never create a feature based on a page name.
- Keep route-specific layout and one-off presentation directly in its `page.tsx`. Do not create page-wrapper components such as `ProjectsOverview` or dashboard-specific feature components merely to make a route look thin.
- Extract genuinely reusable domain UI, such as `NewProjectForm`, and compose it from the route.
- Keep feature directories flat by default. Do not create `components`, `helpers`, `schemas`, or `types` subdirectories unless explicitly requested or the feature genuinely requires further organization.
- Prefer explicit flat feature filenames such as `action.ts`, `schema.ts`, `constants.ts`, `types.ts`, `auth-dialog.tsx`, `new-project-form.tsx`, and `project-model.server.ts`.
- Put reusable feature helper functions in a flat `<domain>-helpers.ts` module, such as `projects/project-helpers.ts`. Do not name a helper module after one operation, such as `filter-projects.ts`, when it belongs to the domain's shared helpers.
- Name components after their concrete responsibility. Avoid vague names such as `ProjectCreator`, `ProjectsOverview`, `AuthActions`, or `WelcomeDialog` when names such as `NewProjectForm`, `AuthDialog`, or `UserMenu` are accurate.
- Use helpers, never services, when business logic genuinely needs a helper module.
- Models must only communicate with the database; they must contain no UI, HTTP, redirect, or workflow logic.
- Keep collection filtering, searching, sorting, formatting, and other in-memory transformations in feature helpers, not in `*-model.server.ts` files.
- Model records must contain plain domain data only. Never put React components, Lucide icons, Tailwind classes, or other presentation details in a model.
- Read user and project data from their server model and pass it into UI components as typed props. Never hardcode model-owned names, emails, visibility, image paths, or similar record fields inside presentation components.
- Temporary fixture records may stand in for database results inside `*-model.server.ts` until the database client is connected, but consumers must still access them through model retrieval functions.
- Routes handle HTTP concerns, helpers contain business logic, and components handle presentation.
- Keep route query-string parsing and navigation in the route or its dedicated interactive filter component. Pass plain typed filter values to feature helpers.
- Extract a repeated, independently meaningful UI unit such as `ProjectCard`; keep route-only section composition, headings, grids, and wrappers inline in `page.tsx`.

### Forms and Server Actions

- Put each feature's Server Actions in `features/<domain>/action.ts` and mark the module with `"use server"`.
- Name the shared auth Server Action `authAction`.
- Use shared intent constants from `constants.ts` in the UI, Zod schema, and Server Action. Never repeat intent string literals such as `login`, `signup`, `google`, `github`, or `logout` across files.
- Give every intent its own explicit `switch` case in the Server Action, even when the temporary implementations are similar.
- Use Zod for both client and server validation and React Hook Form for client form state. Set React Hook Form validation mode to `"all"` unless explicitly requested otherwise.
- Use `useActionState` with the form's native `action` prop for pending state and Server Action results.
- Do not use `startTransition`, `requestSubmit`, or ref-based double-submit workarounds for forms.
- Preserve submitted field values after successful and failed submissions unless clearing the form is an explicit product requirement.
- Return server-side Zod field errors through the action state and render them alongside React Hook Form errors.
- Use `Object.fromEntries(formData)` before validating ordinary form submissions with Zod instead of manually calling `formData.get` for every field.

### Demo Data

- Use `Codewithlari` as the demo user name and `test@test.com` as the demo email address unless real model data is available.

### UI and Styling

- Reuse shadcn/ui components wherever possible.
- Extend existing shadcn components instead of creating competing primitives.
- Build mobile behavior deliberately. Toolbars, filters, cards, dialogs, sidebars, and list/grid controls must remain usable without horizontal overflow at narrow widths.
- Interactive navigation must use real links and the canonical routes defined by the product; project listings and project navigation use `/builds`.
- Always use semantic design tokens such as `background`, `foreground`, `primary`, `muted`, `border`, and `destructive`.
- Never hardcode palette colours such as `red-500`, `gray-200`, `white`, `black`, or arbitrary hex values, and avoid arbitrary dimensions such as `h-[52px]` when a design-system value exists.
- Add missing semantic tokens to the global theme with light and dark values before using them.

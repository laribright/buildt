import {
  pgEnum,
  pgTable,
  jsonb,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { profiles } from "./profile";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "archived",
]);

export const previewStatusEnum = pgEnum("preview_status", [
  "idle",
  "building",
  "ready",
  "error",
]);

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "private",
  "public",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    prompt: text("prompt").notNull(),
    status: projectStatusEnum("status").notNull().default("draft"),
    visibility: projectVisibilityEnum("visibility")
      .notNull()
      .default("private"),
    previewStatus: previewStatusEnum("preview_status")
      .notNull()
      .default("idle"),
    sandboxId: text("sandbox_id"),
    previewUrl: text("preview_url"),
    deploymentUrl: text("deployment_url"),
    imageUrl: text("image_url"),
    sourceSnapshot: jsonb("source_snapshot").$type<Record<string, string>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("projects_profile_id_slug_idx").on(table.profileId, table.slug),
  ],
);

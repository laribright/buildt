import {
  pgEnum,
  pgTable,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { profiles } from "./profile";
import { projects } from "./project";

export const agentRunStatusEnum = pgEnum("agent_run_status", [
  "queued",
  "running",
  "succeeded",
  "needs_attention",
  "failed",
  "cancelled",
]);

export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  status: agentRunStatusEnum("status").notNull().default("queued"),
  errorMessage: text("error_message"),
  lifecycleStage: text("lifecycle_stage").notNull().default("queued"),
  attempt: integer("attempt").notNull().default(0),
  generationData: jsonb("generation_data").$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

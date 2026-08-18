import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { agentRuns } from "./agent-run";
import { projects } from "./project";

export const agentMessageRoleEnum = pgEnum("agent_message_role", [
  "user",
  "assistant",
  "system",
]);

/** Shapes the left agent activity sidebar (transcript + timeline). */
export const agentMessageTypeEnum = pgEnum("agent_message_type", [
  "text",
  "status",
  "actions",
  "output",
  "duration",
  "event",
]);

export const agentMessages = pgTable("agent_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  agentRunId: uuid("agent_run_id").references(() => agentRuns.id, {
    onDelete: "cascade",
  }),
  role: agentMessageRoleEnum("role").notNull(),
  type: agentMessageTypeEnum("type").notNull().default("text"),
  content: text("content").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
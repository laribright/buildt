import { z } from "zod";

import { PROJECT_INTENTS } from "@/features/projects/constants";

export const projectPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "At least 10 characters is required")
    .max(2_000, "Your prompt must contain 2,000 characters or fewer"),
});

const createProjectSchema = projectPromptSchema.extend({
  intent: z.literal(PROJECT_INTENTS.create),
});

const deleteProjectSchema = z.object({
  intent: z.literal(PROJECT_INTENTS.delete),
  projectId: z.string().trim().min(1, "A project is required"),
});

const messageProjectSchema = projectPromptSchema.extend({
  intent: z.literal(PROJECT_INTENTS.message),
  projectId: z.string().trim().min(1, "A project is required"),
});

const publishProjectSchema = z.object({
  intent: z.literal(PROJECT_INTENTS.publish),
  projectId: z.string().trim().min(1, "A project is required"),
});

export const projectActionSchema = z.discriminatedUnion("intent", [
  createProjectSchema,
  deleteProjectSchema,
  messageProjectSchema,
  publishProjectSchema,
]);

export type ProjectPromptValues = z.infer<typeof projectPromptSchema>;

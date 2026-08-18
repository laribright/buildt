import { z } from "zod";

import { FILE_INTENTS } from "@/features/file-management/constants";

const projectIdField = {
  projectId: z.string().trim().min(1, "A project is required"),
};

const pathField = {
  path: z.string().trim().min(1).max(240),
};

export const fileActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal(FILE_INTENTS.createFile),
    ...projectIdField,
    ...pathField,
  }),
  z.object({
    intent: z.literal(FILE_INTENTS.createFolder),
    ...projectIdField,
    ...pathField,
  }),
  z.object({
    intent: z.literal(FILE_INTENTS.downloadZip),
    ...projectIdField,
  }),
]);

export type FileActionValues = z.infer<typeof fileActionSchema>;

export const fileMutationSchema = z.object({
  intent: z.enum([FILE_INTENTS.createFile, FILE_INTENTS.createFolder]),
  path: z.string().trim().min(1).max(240),
});

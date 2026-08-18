import { z } from "zod";

import { SETTINGS_THEMES } from "@/features/settings/constants";

export const settingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .max(80, "Name must contain at most 80 characters"),
  theme: z.enum([
    SETTINGS_THEMES.light,
    SETTINGS_THEMES.dark,
    SETTINGS_THEMES.system,
  ]),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

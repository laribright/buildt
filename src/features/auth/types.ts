import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { profiles } from "@/db/schema/profile";

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export type AuthActionState = {
  success: boolean;
  message: string | null;
  fieldErrors?: {
    confirmPassword?: string[];
    email?: string[];
    intent?: string[];
    name?: string[];
    password?: string[];
  };
};

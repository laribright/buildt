"use server";

import { settingsSchema } from "@/features/settings/schema";
import type { SettingsActionState } from "@/features/settings/types";
import { retrieveCurrentUser } from "../auth/auth-helpers";
import { revalidatePath } from "next/cache";
import { updateProfileName } from "../auth/user-model.server";

export async function settingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const result = settingsSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      message: "Please correct the highlighted settings.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const user = await retrieveCurrentUser();
  if (!user) {
    return {
      success: false,
      message: "You must be signed in to save settings.",
    };
  }

  await updateProfileName(user.id, result.data.name);

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Settings saved.",
  };
}

"use server";

import { FILE_INTENTS } from "@/features/file-management/constants";
import { fileActionSchema } from "@/features/file-management/schema";
import type { FileActionState } from "@/features/file-management/types";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";

export async function fileAction(
  _previousState: FileActionState,
  formData: FormData,
): Promise<FileActionState> {
  const result = fileActionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      message: "The submitted file action is invalid.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const user = await retrieveCurrentUser();
  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const data = result.data;

  switch (data.intent) {
    case FILE_INTENTS.createFile: {
      // TODO: Create a file in the project sandbox.
      return {
        success: false,
        message: "Create file is not implemented yet.",
      };
    }
    case FILE_INTENTS.createFolder: {
      // TODO: Create a folder in the project sandbox.
      return {
        success: false,
        message: "Create folder is not implemented yet.",
      };
    }
    case FILE_INTENTS.downloadZip: {
      // TODO: Download the project sandbox as a zip archive.
      return {
        success: false,
        message: "Download zip is not implemented yet.",
      };
    }
  }
}

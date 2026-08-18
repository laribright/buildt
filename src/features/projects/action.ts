"use server";

import { PROJECT_INTENTS } from "@/features/projects/constants";
import { projectActionSchema } from "@/features/projects/schema";
import type { ProjectActionState } from "@/features/projects/types";
import { retrieveCurrentUser } from "../auth/auth-helpers";

export async function projectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const result = projectActionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      message: "The submitted project values are invalid.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const user = await retrieveCurrentUser();
  if (!user) {
    return { success: false, message: "You must be signed in." };
  }

  const data = result.data;

  switch (data.intent) {
    case PROJECT_INTENTS.create: {
      // TODO: Create the project and trigger the generation workflow.
      return {
        success: false,
        message: "Project creation is not implemented yet.",
      };
    }
    case PROJECT_INTENTS.message: {
      // TODO: Queue a follow-up build for the project.
      return {
        success: false,
        message: "Follow-up messaging is not implemented yet.",
      };
    }
    case PROJECT_INTENTS.publish: {
      console.log("Publish project submitted:", data);

      return {
        success: true,
        message: null,
      };
    }
    case PROJECT_INTENTS.delete: {
      console.log("Delete project submitted:", data);

      return {
        success: true,
        message: null,
      };
    }
  }
}

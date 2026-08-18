"use client";

import { useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, useFormState } from "react-hook-form";

import { projectAction } from "@/features/projects/action";
import { ProjectExamples } from "@/features/projects/project-examples";
import { ProjectPromptForm } from "@/features/projects/project-prompt-form";
import {
  projectPromptSchema,
  type ProjectPromptValues,
} from "@/features/projects/schema";
import type { ProjectActionState } from "@/features/projects/types";

const initialProjectActionState: ProjectActionState = {
  success: false,
  message: null,
};

export function NewProjectForm() {
  const [actionState, submitAction, isPending] = useActionState(
    projectAction,
    initialProjectActionState,
  );
  const form = useForm<ProjectPromptValues>({
    resolver: zodResolver(projectPromptSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      prompt: "",
    },
  });
  const { errors } = useFormState({ control: form.control });
  const promptField = useController({
    control: form.control,
    name: "prompt",
  });

  return (
    <>
      <ProjectPromptForm
        action={submitAction}
        actionState={actionState}
        error={errors.prompt}
        field={promptField.field}
        isPending={isPending}
      />
      <ProjectExamples
        onSelect={(prompt) => {
          form.setValue("prompt", prompt, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
    </>
  );
}

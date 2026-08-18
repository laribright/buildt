import { ArrowRight } from "lucide-react";
import type { ControllerRenderProps, FieldError } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { PROJECT_INTENTS } from "@/features/projects/constants";
import type { ProjectPromptValues } from "@/features/projects/schema";
import type { ProjectActionState } from "@/features/projects/types";

type ProjectPromptFormProps = {
  action: (formData: FormData) => void;
  actionState: ProjectActionState;
  error?: FieldError;
  field: ControllerRenderProps<ProjectPromptValues, "prompt">;
  isPending: boolean;
};

export function ProjectPromptForm({
  action,
  actionState,
  error,
  field,
  isPending,
}: ProjectPromptFormProps) {
  const errorMessage = error?.message ?? actionState.fieldErrors?.prompt?.[0];

  return (
    <form
      action={action}
      className="project-prompt-shell relative isolate flex h-44 w-full flex-col rounded-2xl border border-transparent bg-card p-6 text-card-foreground shadow-lg sm:h-40"
      noValidate
    >
      <input name="intent" type="hidden" value={PROJECT_INTENTS.create} />
      <label className="sr-only" htmlFor="app-prompt">
        Describe the app you want to build
      </label>
      <textarea
        id="app-prompt"
        className="w-full flex-1 resize-none border-0 bg-transparent p-0 text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
        placeholder="Build an app that..."
        rows={3}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? "app-prompt-error" : undefined}
        {...field}
      />
      {errorMessage && (
        <p
          className="mb-2 text-sm font-medium text-destructive"
          id="app-prompt-error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <div className="flex items-center justify-end">
        <Button
          className="size-12 rounded-full shadow-md"
          disabled={isPending}
          type="submit"
          size="icon-lg"
          aria-label={isPending ? "Submitting project prompt" : "Start building"}
        >
          <ArrowRight className="size-7" />
        </Button>
      </div>
    </form>
  );
}

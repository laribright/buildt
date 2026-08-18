import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PROJECT_EXAMPLES } from "@/features/projects/constants";

type ProjectExamplesProps = {
  onSelect: (example: string) => void;
};

export function ProjectExamples({ onSelect }: ProjectExamplesProps) {
  return (
    <section className="mt-10 w-full" aria-labelledby="examples-title">
      <h2
        className="mb-4 text-center text-sm font-medium text-muted-foreground"
        id="examples-title"
      >
        Try an example prompt
      </h2>
      <div className="flex flex-wrap gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {PROJECT_EXAMPLES.map((example) => (
          <Button
            className="h-12 w-fit max-w-full justify-start gap-2 rounded-xl px-3 text-sm font-normal shadow-sm whitespace-normal sm:h-14 sm:w-full sm:gap-3 sm:px-5"
            key={example}
            type="button"
            variant="outline"
            onClick={() => onSelect(example)}
          >
            <Sparkles
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
              fill="currentColor"
            />
            <span>{example}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}

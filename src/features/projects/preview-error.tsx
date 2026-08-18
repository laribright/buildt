import { Button } from "@/components/ui/button";

type PreviewErrorProps = {
  onRetry?: () => void;
};

export function PreviewError({ onRetry }: PreviewErrorProps) {
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="max-w-sm text-center">
        <h2 className="text-lg font-semibold">Preview unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load this project preview.
        </p>
        {onRetry ? (
          <Button className="mt-5" type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function BrandMark() {
  return (
    <span className="relative block h-9 w-6 text-primary" aria-hidden="true">
      <span className="absolute top-0 left-0 h-3 w-3 rounded-sm bg-current shadow-sm" />
      <span className="absolute top-3 left-2 h-3 w-3 rounded-sm bg-current shadow-sm" />
      <span className="absolute bottom-0 left-0 h-3 w-3 rounded-sm bg-current shadow-sm" />
    </span>
  );
}

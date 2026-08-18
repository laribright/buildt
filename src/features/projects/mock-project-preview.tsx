export function MockProjectPreview() {
  return (
    <div className="grid min-h-full overflow-hidden rounded-[2.5rem] border bg-card p-6 text-center shadow-sm sm:p-8">
      <div className="place-self-center">
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs tracking-[0.2em] text-primary">
          CHAPTER 01
        </span>
        <h1 className="mt-12 font-serif text-[clamp(2.75rem,12cqi,6rem)] leading-none">
          Hello, <em className="text-primary">World.</em>
        </h1>
        <p className="mx-auto mt-10 max-w-xl text-[clamp(1rem,4cqi,1.5rem)] leading-relaxed text-muted-foreground">
          A blank page is not empty space. It is a canvas holding absolute
          potential.
        </p>
      </div>
    </div>
  );
}

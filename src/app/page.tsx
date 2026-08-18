import { BrandMark } from "@/components/brand-mark";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthDialog } from "@/features/auth/auth-dialog";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await retrieveCurrentUser();

  if (user) {
    redirect("/~");
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-background px-4 pt-5 text-foreground sm:px-6 lg:px-11">
      <header className="fixed inset-x-0 top-0 z-50 flex h-24 items-center justify-between bg-background px-4 sm:px-6 lg:px-11">
        <a
          className="inline-flex items-center gap-2 text-3xl leading-none font-extrabold tracking-tighter sm:gap-3 sm:text-4xl"
          href="#"
          aria-label="Buildt home"
        >
          <BrandMark />
          <span>Buildt</span>
        </a>

        <AuthDialog />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start pt-28 pb-10 sm:justify-center sm:py-14">
        <section className="text-center">
          <h1 className="m-0 text-4xl leading-none font-extrabold tracking-tighter sm:text-5xl lg:text-6xl">
            What will you <span className="text-primary">build?</span>
          </h1>
          <p className="mt-4 mb-8 text-base text-muted-foreground sm:text-lg">
            Build full-stack applications with AI in minutes.
          </p>
        </section>

        <NewProjectForm />
      </main>

      <footer className="mt-auto flex w-full items-center justify-between gap-4 border-t border-border py-4 text-xs text-muted-foreground sm:text-sm">
        <p>© 2026 Buildt. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-8" aria-label="Legal">
          <a
            className="transition-colors hover:text-foreground"
            href="#privacy"
          >
            Privacy
          </a>
          <a className="transition-colors hover:text-foreground" href="#terms">
            Terms
          </a>
        </nav>
      </footer>

      <ThemeSwitcher />
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { NewProjectForm } from "@/features/projects/new-project-form";
import { ProjectCard } from "@/features/projects/project-card";
import { redirect } from "next/navigation";
import { listProjectsByProfileId } from "@/features/projects/project-model.server";

export default async function HomePage() {
  const user = await retrieveCurrentUser();
  if (!user) redirect("/");

  const recentProjects = await listProjectsByProfileId(user.id, { limit: 4 });

  return (
    <main className="px-4 pb-10 sm:px-7 lg:px-10">
      <section
        className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center py-10 sm:py-8"
        aria-labelledby="dashboard-title"
      >
        <div className="text-center">
          <div className="mb-6 flex justify-center text-primary">
            <BrandMark />
          </div>
          <p className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">
            Buildt
          </p>
          <h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            id="dashboard-title"
          >
            Hi <span className="text-primary">{user.name}</span>, what do you
            want to build?
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Turn your ideas into full-stack apps with AI.
          </p>
        </div>

        <div className="mt-8">
          <NewProjectForm />
        </div>
      </section>

      <div className="mx-auto mt-10 w-full max-w-6xl">
        <section id="projects" aria-labelledby="recent-projects-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold" id="recent-projects-title">
              Recent Projects
            </h2>
            <Button
              className="gap-2"
              nativeButton={false}
              render={<Link href="/builds" />}
              variant="outline"
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                username={user.username}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import { inngest } from "@/inngest/client";

export const projectBuild = inngest.createFunction(
  {
    id: "project-build",
    triggers: [{ event: "project/build.requested" }],
  },
  async ({ event }) => {
    // TODO: Implement the project-build workflow.
    const { projectId, runId } = event.data as {
      projectId: string;
      runId: string;
    };

    return {
      projectId,
      runId,
      status: "todo" as const,
    };
  },
);

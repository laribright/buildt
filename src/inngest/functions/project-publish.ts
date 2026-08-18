import { inngest } from "@/inngest/client";

export const projectPublish = inngest.createFunction(
  {
    id: "project-publish",
    triggers: [{ event: "project/publish.requested" }],
  },
  async ({ event, step }) => {
    const { projectId } = event.data as { projectId: string };

    await step.run("noop-publish", async () => {
      return { projectId, status: "stub" as const };
    });

    return { projectId };
  },
);

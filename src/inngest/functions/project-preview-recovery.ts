import { inngest } from "@/inngest/client";

export const projectPreviewRecovery = inngest.createFunction(
  {
    id: "project-preview-recovery",
    retries: 1,
    triggers: [{ event: "project/preview.recovery.requested" }],
  },
  async ({ event }) => {
    // TODO: Implement the project preview-recovery workflow.
    const { projectId } = event.data as { projectId: string };

    return {
      projectId,
      recovered: false,
      status: "todo" as const,
    };
  },
);

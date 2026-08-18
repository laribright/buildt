import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { agentMessages } from "@/db/schema/agent-message";
import type { agentRuns } from "@/db/schema/agent-run";
import type { projects } from "@/db/schema/project";

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
export type AgentRun = InferSelectModel<typeof agentRuns>;
export type NewAgentRun = InferInsertModel<typeof agentRuns>;
export type AgentMessage = InferSelectModel<typeof agentMessages>;
export type NewAgentMessage = InferInsertModel<typeof agentMessages>;

export type ProjectActionState = {
  success: boolean;
  message: string | null;
  /** Echoed after a successful Message Agent submit for optimistic UI. */
  submittedPrompt?: string | null;
  fieldErrors?: {
    prompt?: string[];
    projectId?: string[];
  };
};

export type ProjectFilters = {
  query?: string;
  status?: Project["status"];
};

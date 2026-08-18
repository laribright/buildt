import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { agentRuns } from "@/db/schema/agent-run";
import type { AgentRun, NewAgentRun } from "@/features/projects/types";

export async function createAgentRun(data: NewAgentRun): Promise<AgentRun> {
  const [run] = await db.insert(agentRuns).values(data).returning();
  return run;
}

export async function updateAgentRunStatus(
  runId: string,
  status: AgentRun["status"],
  errorMessage?: string | null,
): Promise<AgentRun> {
  const now = new Date();
  const values: Partial<NewAgentRun> = {
    status,
    updatedAt: now,
    errorMessage: errorMessage ?? null,
  };

  if (status === "running") {
    values.startedAt = now;
  }

  if (
    status === "succeeded" ||
    status === "failed" ||
    status === "needs_attention" ||
    status === "cancelled"
  ) {
    values.finishedAt = now;
  }

  const [run] = await db
    .update(agentRuns)
    .set(values)
    .where(eq(agentRuns.id, runId))
    .returning();

  return run;
}

export async function updateAgentRunProgress(
  runId: string,
  data: Pick<NewAgentRun, "lifecycleStage"> &
    Partial<Pick<NewAgentRun, "attempt" | "generationData">>,
): Promise<AgentRun> {
  const [run] = await db
    .update(agentRuns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agentRuns.id, runId))
    .returning();
  return run;
}

export async function findAgentRunById(
  runId: string,
): Promise<AgentRun | null> {
  const [run] = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.id, runId))
    .limit(1);

  return run ?? null;
}

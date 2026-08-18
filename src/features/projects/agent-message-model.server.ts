import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { agentMessages } from "@/db/schema/agent-message";
import type { AgentMessage, NewAgentMessage } from "@/features/projects/types";

export async function createAgentMessage(
  data: NewAgentMessage,
): Promise<AgentMessage> {
  const [message] = await db.insert(agentMessages).values(data).returning();
  return message;
}

export async function listAgentMessagesByProjectId(
  projectId: string,
): Promise<AgentMessage[]> {
  return db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.projectId, projectId))
    .orderBy(asc(agentMessages.createdAt));
}
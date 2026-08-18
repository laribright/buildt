import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema/profile";
import type { NewProfile, Profile } from "@/features/auth/types";

export async function findProfileBySupabaseUserId(
  supabaseUserId: string,
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.supabaseUserId, supabaseUserId))
    .limit(1);

  return profile ?? null;
}

export async function createProfile(data: NewProfile): Promise<Profile> {
  const [profile] = await db.insert(profiles).values(data).returning();
  return profile;
}

export async function updateProfileName(
  profileId: string,
  name: string,
): Promise<Profile> {
  const [profile] = await db
    .update(profiles)
    .set({ name, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning();

  return profile;
}

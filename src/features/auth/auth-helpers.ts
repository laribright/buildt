import "server-only";

import { findProfileBySupabaseUserId } from "@/features/auth/user-model.server";
import type { Profile } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function retrieveCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return findProfileBySupabaseUserId(user.id);
}

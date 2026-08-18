import { NextResponse } from "next/server";

import {
  createProfile,
  findProfileBySupabaseUserId,
} from "@/features/auth/user-model.server";
import { createClient } from "@/lib/supabase/server";

function profileUsername(seed: string) {
  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 20);

  return `@${slug || "user"}-${crypto.randomUUID().slice(0, 4)}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/~";

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=1`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=1`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const existing = await findProfileBySupabaseUserId(user.id);

    if (!existing) {
      const email = user.email?.trim();
      if (!email) {
        return NextResponse.redirect(`${origin}/?auth_error=1`);
      }

      const name =
        (typeof user.user_metadata.full_name === "string" &&
          user.user_metadata.full_name.trim()) ||
        (typeof user.user_metadata.name === "string" &&
          user.user_metadata.name.trim()) ||
        email.split("@")[0] ||
        "User";

      await createProfile({
        supabaseUserId: user.id,
        email,
        name,
        username: profileUsername(name),
        avatarUrl:
          typeof user.user_metadata.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : null,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
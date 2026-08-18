"use server";

import { AUTH_INTENTS } from "@/features/auth/constants";
import { authActionSchema } from "@/features/auth/schema";
import type { AuthActionState } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createProfile } from "./user-model.server";
import { headers } from "next/headers";

function profileUsername(seed: string) {
  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 20);

  return `@${slug || "user"}-${crypto.randomUUID().slice(0, 4)}`;
}

export async function authAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = authActionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      message: "The submitted authentication values are invalid.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;
  const supabase = await createClient();

  switch (data.intent) {
    case AUTH_INTENTS.google:
    case AUTH_INTENTS.github: {
       const origin = (await headers()).get("origin");
      const { data: oauthData, error } = await supabase.auth.signInWithOAuth({
        provider: data.intent,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error || !oauthData.url) {
        return {
          success: false,
          message: error?.message ?? "Unable to start the OAuth flow.",
        };
      }

      redirect(oauthData.url);
    }
    case AUTH_INTENTS.login: {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      redirect("/~");
    }
    case AUTH_INTENTS.signup: {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            name: data.name,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const user = signUpData.user;
      if (!user) {
        return {
          success: false,
          message: "Signup succeeded but no user was returned.",
        };
      }

      await createProfile({
        supabaseUserId: user.id,
        name: data.name ?? null,
        username: profileUsername(data.name || data.email.split("@")[0]!),
        avatarUrl: null,
        email: data.email,
      });

      redirect("/~");
    }
    case AUTH_INTENTS.logout: {
      await supabase.auth.signOut();
      redirect('/')
    }
  }
}

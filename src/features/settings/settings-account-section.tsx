"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_INTENTS } from "@/features/auth/constants";

type SettingsAccountSectionProps = {
  email: string;
  isLoggingOut: boolean;
  logoutAction: (formData: FormData) => void;
};

export function SettingsAccountSection({
  email,
  isLoggingOut,
  logoutAction,
}: SettingsAccountSectionProps) {
  return (
    <section className="p-6">
      <h2 className="text-lg font-semibold">Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account session.
      </p>

      <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="font-semibold">Log out of Buildt</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          End the current session for {email}.
        </p>
        <input name="intent" type="hidden" value={AUTH_INTENTS.logout} />
        <Button
          className="mt-5 gap-2"
          disabled={isLoggingOut}
          formAction={logoutAction}
          type="submit"
          variant="destructive"
        >
          <LogOut aria-hidden="true" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import type { ControllerRenderProps } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/features/auth/types";
import type { SettingsValues } from "@/features/settings/schema";

type SettingsProfileSectionProps = {
  clientError?: string;
  nameField: ControllerRenderProps<SettingsValues, "name">;
  serverError?: string;
  user: Profile;
};

export function SettingsProfileSection({
  clientError,
  nameField,
  serverError,
  user,
}: SettingsProfileSectionProps) {
  const error = clientError ?? serverError;

  return (
    <section className="p-6">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your personal information and avatar.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-4">
        <div className="relative mx-auto size-28 overflow-hidden rounded-full bg-muted ring-4 ring-background shadow-md sm:col-span-1">
          <Image
            alt={`${user.name}'s avatar`}
            className="object-cover"
            fill
            sizes="7rem"
            src={user.avatarUrl ?? "/images/default-user-avatar.png"}
          />
        </div>

        <div className="grid gap-5 sm:col-span-3">
          <div className="grid gap-2">
            <Label htmlFor="settings-name">Full name</Label>
            <Input
              aria-describedby={error ? "settings-name-error" : undefined}
              aria-invalid={Boolean(error)}
              id="settings-name"
              {...nameField}
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear on your workspace.
            </p>
            {error && (
              <p
                className="text-sm text-destructive"
                id="settings-name-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              disabled
              id="settings-email"
              type="email"
              value={user.email}
            />
            <p className="text-xs text-muted-foreground">
              This is your account email address.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

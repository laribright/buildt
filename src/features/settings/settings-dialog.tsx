"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useActionState, useState } from "react";
import { useController, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authAction } from "@/features/auth/action";
import type {
  AuthActionState,
  Profile,
} from "@/features/auth/types";
import { settingsAction } from "@/features/settings/action";
import { SETTINGS_THEMES } from "@/features/settings/constants";
import {
  settingsSchema,
  type SettingsValues,
} from "@/features/settings/schema";
import { SettingsAccountSection } from "@/features/settings/settings-account-section";
import { SettingsAppearanceSection } from "@/features/settings/settings-appearance-section";
import { SettingsProfileSection } from "@/features/settings/settings-profile-section";
import type { SettingsActionState } from "@/features/settings/types";
import { cn } from "@/lib/utils";

const initialSettingsActionState: SettingsActionState = {
  success: false,
  message: null,
};

const initialAuthActionState: AuthActionState = {
  success: false,
  message: null,
};

type SettingsDialogProps = {
  user: Profile;
};

type SettingsSection = "account" | "appearance" | "profile";

export function SettingsDialog({ user }: SettingsDialogProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [settingsState, submitSettings, isSaving] = useActionState(
    settingsAction,
    initialSettingsActionState,
  );
  const [, submitAuth, isLoggingOut] = useActionState(
    authAction,
    initialAuthActionState,
  );
  const form = useForm<SettingsValues>({
    defaultValues: {
      name: user.name,
      theme: SETTINGS_THEMES.system,
    },
    mode: "all",
    resolver: zodResolver(settingsSchema),
  });
  const nameField = useController({
    control: form.control,
    name: "name",
  });
  const themeField = useController({
    control: form.control,
    name: "theme",
  });
  return (
    <Dialog>
      <DialogTrigger
        className="flex h-11 w-full items-center gap-4 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span:last-child]:hidden"
      >
        <Settings className="size-5 shrink-0" aria-hidden="true" />
        <span>Settings</span>
      </DialogTrigger>

      <DialogContent
        className="flex max-h-svh flex-col gap-0 overflow-hidden p-0 sm:min-h-152 sm:max-w-4xl"
        showCloseButton
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <Settings className="size-5" aria-hidden="true" />
            User Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Manage your profile, appearance, and account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 md:grid-cols-4">
          <aside className="flex border-b p-4 md:col-span-1 md:flex-col md:border-r md:border-b-0">
            <nav
              className="flex gap-1 overflow-x-auto md:flex-col"
              aria-label="Settings sections"
            >
              <Button
                className={cn(
                  "justify-start gap-3",
                  activeSection === "profile" && "bg-muted text-foreground",
                )}
                onClick={() => setActiveSection("profile")}
                type="button"
                variant="ghost"
              >
                <UserRound aria-hidden="true" />
                Profile
              </Button>
              <Button
                className={cn(
                  "justify-start gap-3",
                  activeSection === "appearance" && "bg-muted text-foreground",
                )}
                onClick={() => setActiveSection("appearance")}
                type="button"
                variant="ghost"
              >
                <Sun aria-hidden="true" />
                Appearance
              </Button>
              <Button
                className={cn(
                  "justify-start gap-3",
                  activeSection === "account" && "bg-muted text-foreground",
                )}
                onClick={() => setActiveSection("account")}
                type="button"
                variant="ghost"
              >
                <ShieldCheck aria-hidden="true" />
                Account
              </Button>
            </nav>
          </aside>

          <form
            action={submitSettings}
            className="flex min-h-0 flex-col md:col-span-3"
          >
            {activeSection !== "profile" && (
              <input
                name={nameField.field.name}
                type="hidden"
                value={nameField.field.value}
              />
            )}
            {activeSection !== "appearance" && (
              <input
                name={themeField.field.name}
                type="hidden"
                value={themeField.field.value}
              />
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeSection === "profile" && (
                <SettingsProfileSection
                  clientError={form.formState.errors.name?.message}
                  nameField={nameField.field}
                  serverError={settingsState.fieldErrors?.name?.[0]}
                  user={user}
                />
              )}

              {activeSection === "appearance" && (
                <SettingsAppearanceSection themeField={themeField.field} />
              )}

              {activeSection === "account" && (
                <SettingsAccountSection
                  email={user.email}
                  isLoggingOut={isLoggingOut}
                  logoutAction={submitAuth}
                />
              )}
            </div>

            {activeSection !== "account" && (
              <DialogFooter className="m-0 rounded-none px-6 py-4">
                {settingsState.message && (
                  <p
                    className={cn(
                      "mr-auto self-center text-sm",
                      settingsState.success
                        ? "text-muted-foreground"
                        : "text-destructive",
                    )}
                    role="status"
                  >
                    {settingsState.message}
                  </p>
                )}
                <DialogClose render={<Button type="button" variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

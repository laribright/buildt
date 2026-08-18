"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import type { ControllerRenderProps } from "react-hook-form";

import {
  SETTINGS_THEMES,
  SETTINGS_THEME_OPTIONS,
} from "@/features/settings/constants";
import type { SettingsValues } from "@/features/settings/schema";
import { cn } from "@/lib/utils";

const themeIcons = {
  [SETTINGS_THEMES.dark]: Moon,
  [SETTINGS_THEMES.light]: Sun,
  [SETTINGS_THEMES.system]: Laptop,
};

type SettingsAppearanceSectionProps = {
  themeField: ControllerRenderProps<SettingsValues, "theme">;
};

export function SettingsAppearanceSection({
  themeField,
}: SettingsAppearanceSectionProps) {
  const { setTheme } = useTheme();

  return (
    <section className="p-6">
      <h2 className="text-lg font-semibold">Appearance</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how the application looks for you.
      </p>

      <fieldset className="mt-6">
        <legend className="mb-3 font-medium">Theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {SETTINGS_THEME_OPTIONS.map((option) => {
            const Icon = themeIcons[option.value];
            const isSelected = themeField.value === option.value;

            return (
              <label
                className={cn(
                  "relative flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors hover:bg-accent",
                  isSelected &&
                    "border-primary bg-primary/5 ring-1 ring-primary",
                )}
                key={option.value}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  name={themeField.name}
                  onBlur={themeField.onBlur}
                  onChange={(event) => {
                    themeField.onChange(event);
                    setTheme(option.value);
                  }}
                  ref={themeField.ref}
                  type="radio"
                  value={option.value}
                />
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "ml-auto size-4 shrink-0 rounded-full border",
                    isSelected &&
                      "border-primary bg-primary ring-2 ring-background ring-offset-2 ring-offset-primary",
                  )}
                  aria-hidden="true"
                />
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      className="fixed right-5 bottom-5 z-40 size-11 rounded-full bg-background shadow-lg sm:right-6 sm:bottom-6"
      onClick={toggleTheme}
      size="icon-lg"
      type="button"
      variant="outline"
      aria-label="Toggle color theme"
    >
      <Moon className="dark:hidden" aria-hidden="true" />
      <Sun className="hidden dark:block" aria-hidden="true" />
    </Button>
  );
}

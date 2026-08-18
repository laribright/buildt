"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authAction } from "@/features/auth/action";
import { AUTH_INTENTS } from "@/features/auth/constants";
import type {
  AuthActionState,
  Profile,
} from "@/features/auth/types";
import { cn } from "@/lib/utils";

const initialAuthActionState: AuthActionState = {
  success: false,
  message: null,
};

type UserMenuProps = {
  user: Profile;
  variant?: "avatar" | "sidebar";
};

export function UserMenu({ user, variant = "avatar" }: UserMenuProps) {
  const [, submitAction, isPending] = useActionState(
    authAction,
    initialAuthActionState,
  );

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "avatar"
            ? "grid size-10 place-items-center rounded-full bg-muted text-sm font-semibold hover:bg-accent"
            : "flex h-12 w-full items-center gap-4 overflow-hidden rounded-md px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span:last-child]:hidden",
        )}
        aria-label="Open user menu"
      >
        {variant === "avatar" ? (
          user.name.charAt(0).toUpperCase()
        ) : (
          <>
            <span className="relative flex size-4 shrink-0 items-center justify-center">
              <span className="absolute grid size-8 place-items-center rounded-full bg-muted font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="min-w-0 text-left text-sm">
              <span className="block font-semibold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        align={variant === "sidebar" ? "start" : "end"}
        className="w-56"
        side={variant === "sidebar" ? "top" : "bottom"}
      >
        <PopoverHeader className="px-2 py-1">
          <PopoverTitle>{user.name}</PopoverTitle>
          <PopoverDescription>{user.email}</PopoverDescription>
        </PopoverHeader>
        <form action={submitAction}>
          <Button
            className="w-full justify-start gap-2"
            disabled={isPending}
            name="intent"
            type="submit"
            value={AUTH_INTENTS.logout}
            variant="ghost"
          >
            <LogOut aria-hidden="true" />
            {isPending ? "Logging out..." : "Log out"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

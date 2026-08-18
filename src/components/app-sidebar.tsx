"use client";

import { Grid2X2, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/features/auth/user-menu";
import type { Profile } from "@/features/auth/types";
import { SettingsDialog } from "@/features/settings/settings-dialog";

const navigationItems = [
  { id: "home", label: "Home", href: "/~", icon: Home },
  { id: "projects", label: "Projects", href: "/builds", icon: Grid2X2 },
] as const;

type AppSidebarProps = {
  user: Profile;
};

function isNavActive(pathname: string, href: string) {
  if (href.startsWith("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-5 pt-6 pb-4 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-11 gap-4 px-3 text-2xl font-extrabold tracking-tight group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span:last-child]:hidden"
              render={<Link href="/~" aria-label="Buildt home" />}
              size="lg"
              tooltip="Buildt"
            >
              <span className="relative flex size-4 shrink-0 items-center justify-center">
                <span className="absolute scale-75">
                  <BrandMark />
                </span>
              </span>
              <span>Buildt</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-5 pt-5 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    className="h-11 gap-4 px-3 text-muted-foreground data-active:bg-primary/10 data-active:text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span:last-child]:hidden"
                    isActive={isNavActive(pathname, href)}
                    render={<Link href={href} />}
                    size="lg"
                    tooltip={label}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        <SidebarGroup className="px-5 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SettingsDialog user={user} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-5 pb-6 group-data-[collapsible=icon]:px-2">
        <SidebarSeparator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu user={user} variant="sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

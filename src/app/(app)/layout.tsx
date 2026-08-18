import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { retrieveCurrentUser } from "@/features/auth/auth-helpers";
import { UserMenu } from "@/features/auth/user-menu";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await retrieveCurrentUser();

  if (!user) redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-7">
          <SidebarTrigger
            className="size-10 rounded-lg"
            size="icon-lg"
            variant="outline"
          />
          <UserMenu user={user} />
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

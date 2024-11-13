"use client";

import { InferSelectModel } from "drizzle-orm";
import { AnimatePresence, motion } from "framer-motion";
import invariant from "invariant";
import { Album, ArrowLeft, Gauge, Images, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "~/components/nav-user";
import { StudioSwitcher } from "~/components/studio-switcher";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import type * as schema from "~/db/schema";
import { isPhotographer, isAdmin, isClient } from "~/role";

interface AppSidebarProps {
  studios: InferSelectModel<typeof schema.Studios>[];
  activeStudio?: InferSelectModel<typeof schema.Studios>;
}

export function AppSidebar({ studios, activeStudio }: AppSidebarProps) {
  const pathname = usePathname();
  const session = useSession();
  const sidebar = useSidebar();

  invariant(session.data?.user, "User is required");

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {activeStudio && studios.length > 0 ? (
          <SidebarHeader className="gap-0">
            <AnimatePresence initial={false}>
              {sidebar.state === "expanded" ? (
                <motion.div
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -10, height: 0 }}
                >
                  <Button
                    asChild
                    variant="link"
                    className="items-center p-0 px-2 text-xs [&_svg]:size-3"
                  >
                    <Link href="/">
                      <ArrowLeft className="-translate-y-px" />
                      Frontpage
                    </Link>
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <SidebarGroupLabel>Studio</SidebarGroupLabel>

            {activeStudio ? (
              <StudioSwitcher studios={studios} activeStudio={activeStudio} />
            ) : null}
          </SidebarHeader>
        ) : null}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <Gauge />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin(session.data?.user) ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/a/users")}
                  tooltip="Users"
                >
                  <Link href="/dashboard/admin/users">
                    <Users />
                    Users
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}

        {isPhotographer(session.data?.user) ? (
          <SidebarGroup>
            <SidebarGroupLabel>Studio</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/p/albums")}
                  tooltip="Albums"
                >
                  <Link href="/dashboard/photographer/albums">
                    <Images />
                    Albums
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/p/clients")}
                  tooltip="Clients"
                >
                  <Link href="/dashboard/photographer/clients">
                    <Users />
                    Clients
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}

        {isClient(session.data?.user) ? (
          <SidebarGroup>
            <SidebarGroupLabel>Client</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  // asChild
                  isActive={pathname?.startsWith("/c/albums")}
                  tooltip="My Albums"
                >
                  <Album />
                  My Albums
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import { InferSelectModel } from "drizzle-orm";
import { AnimatePresence, motion } from "framer-motion";
import invariant from "invariant";
import { Album, ArrowLeft, Gauge, Home, Images, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import type * as schema from "~/db/schema";
import { isAdmin, isClient, isPhotographer } from "~/role";

interface AppSidebarProps {
  teams: InferSelectModel<typeof schema.Teams>[];
  activeTeam: InferSelectModel<typeof schema.Teams>;
}

export function AppSidebar({ teams, activeTeam }: AppSidebarProps) {
  const pathname = usePathname();
  const session = useSession();
  const sidebar = useSidebar();

  invariant(session.data?.user, "User is required");

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {teams.length > 0 ? (
          <SidebarGroup className="items-start">
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
            <SidebarGroupLabel>Team</SidebarGroupLabel>
            <TeamSwitcher teams={teams} activeTeam={activeTeam} />
          </SidebarGroup>
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
                  <Link href="/dashboard/a/users">
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
                  <Link href="/dashboard/p/albums">
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
                  <Link href="/dashboard/p/clients">
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

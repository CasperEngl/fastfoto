"use client";

import { InferSelectModel } from "drizzle-orm";
import { Album, Home, LogIn, LogOut, Settings, Users } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {teams.length > 0 ? (
          <SidebarGroup>
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
                tooltip="Home"
              >
                <Link href="/">
                  <Home />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {isAdmin(session.data?.user) ? (
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
          ) : null}

          {isPhotographer(session.data?.user) ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/p/albums")}
                  tooltip="Albums"
                >
                  <Link href="/dashboard/p/albums">
                    <Album />
                    Albums
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : null}

          {isClient(session.data?.user) ? (
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
          ) : null}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {session.data?.user ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname?.startsWith("/u/settings")}
                tooltip="Settings"
              >
                <Link href="/dashboard/u/settings">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}

          <SidebarMenuItem>
            {session.data?.user ? (
              <SidebarMenuButton
                onClick={() => signOut({ callbackUrl: "/login" })}
                tooltip="Sign Out"
              >
                <LogOut />
                Sign Out
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild tooltip="Sign In">
                <Link href="/login">
                  <LogIn />
                  Sign In
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

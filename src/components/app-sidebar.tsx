"use client";

import { Album, Home, Settings, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SheetDescription, SheetTitle } from "~/components/ui/sheet";
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
} from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/use-mobile";
import { isAdmin, isClient, isPhotographer } from "~/role";

export function AppSidebar() {
  const pathname = usePathname();
  const session = useSession();
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon" variant="inset">
      {isMobile ? (
        <SidebarHeader className="sr-only">
          <SheetTitle>Mobile Navigation</SheetTitle>
          <SheetDescription>
            Use the hamburger menu to navigate to other pages.
          </SheetDescription>
        </SidebarHeader>
      ) : null}
      <SidebarContent>
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
                  <Link href="/a/users">
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
                  <Link href="/p/albums">
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

        {session.data?.user ? (
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/u/settings")}
                  tooltip="Settings"
                >
                  <Link href="/u/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

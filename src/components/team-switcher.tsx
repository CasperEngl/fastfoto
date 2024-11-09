"use client";

import { InferSelectModel } from "drizzle-orm";
import { ChevronsUpDown, Cog, GalleryVerticalEnd, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { changeTeam } from "~/actions";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import type * as schema from "~/db/schema";

export function TeamSwitcher({
  teams,
  activeTeam,
}: {
  teams: InferSelectModel<typeof schema.Teams>[];
  activeTeam: InferSelectModel<typeof schema.Teams>;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border bg-white data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center overflow-clip rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam.logo ? (
                  <Image
                    src={activeTeam.logo}
                    alt={activeTeam.name}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                ) : (
                  <GalleryVerticalEnd className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[max-content] rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team) => (
              <div key={team.name} className="flex items-center gap-2">
                <DropdownMenuItem
                  onClick={() => changeTeam(team.id)}
                  className="flex-1 gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center overflow-clip rounded-sm border">
                    {team.logo ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={32}
                        height={32}
                        className="rounded-sm"
                      />
                    ) : (
                      <GalleryVerticalEnd className="size-4" />
                    )}
                  </div>
                  <span className="whitespace-nowrap">{team.name}</span>
                </DropdownMenuItem>

                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="size-8 [&_svg]:size-4"
                >
                  <Link
                    href={`/dashboard/t/settings?teamId=${team.id}`}
                    title="Team settings"
                  >
                    <Cog />
                  </Link>
                </Button>
              </div>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

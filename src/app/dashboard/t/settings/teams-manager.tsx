"use client";

import { InferSelectModel } from "drizzle-orm";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { TeamSettingsForm } from "~/app/dashboard/t/settings/team-settings-form";
import { useContentBreakpoint } from "~/app/hooks/use-content-breakpoint";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type * as schema from "~/db/schema";

const pluralize = new Intl.PluralRules("en-US");

export type ManagedTeam = InferSelectModel<typeof schema.Teams> & {
  members: Array<
    InferSelectModel<typeof schema.Users> & {
      role: InferSelectModel<typeof schema.TeamMembers>["role"];
    }
  >;
};

export function TeamsManager({
  teams,
  userManagableTeams,
}: {
  teams: Array<ManagedTeam>;
  userManagableTeams: Array<string>;
}) {
  const [teamId, setTeamId] = useQueryState(
    "teamId",
    parseAsString.withDefault(teams[0].id),
  );
  const selectedTeam = teams.find((team) => team.id === teamId) ?? teams[0];
  const isMobile = useContentBreakpoint("md");

  return (
    <div className="flex flex-col items-start gap-4">
      {isMobile ? (
        <Select value={teamId} onValueChange={(value) => setTeamId(value)}>
          <SelectTrigger className="inline-flex w-auto">
            <SelectValue>
              <div className="pr-2">
                {teams.find((team) => team.id === teamId)?.name}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <div>
                  <div>{team.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {pluralize.select(team.members.length) === "one"
                      ? `${team.members.length} member`
                      : `${team.members.length} members`}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex w-full overflow-clip rounded-md border">
          <div className="border-r p-2">
            <Sidebar
              collapsible="none"
              className="min-w-max max-w-[300px] rounded-md bg-transparent"
            >
              <SidebarContent className="sticky top-0">
                <SidebarMenu>
                  {teams.map((team) => (
                    <SidebarMenuItem key={team.id}>
                      <SidebarMenuButton
                        isActive={team.id === teamId}
                        onClick={() => setTeamId(team.id)}
                        className="flex h-auto w-full items-center gap-3 p-3 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent/50 data-[active=true]:text-sidebar-accent-foreground"
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={team.logo ?? undefined}
                            alt={`${team.name} logo`}
                          />
                          <AvatarFallback>
                            {team.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="truncate text-base text-foreground">
                            {team.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pluralize.select(team.members.length) === "one"
                              ? `${team.members.length} member`
                              : `${team.members.length} members`}
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: team.id === teamId ? 1 : 0,
                            x: team.id === teamId ? 0 : -10,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="size-6 text-muted-foreground/50" />
                        </motion.div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </div>

          <div className="flex-1 p-8">
            <TeamSettingsForm
              key={selectedTeam.id}
              team={selectedTeam}
              userManagableTeams={userManagableTeams}
            />
          </div>
        </div>
      )}

      {isMobile && (
        <div className="w-full rounded-md border">
          <div className="p-4">
            <TeamSettingsForm
              key={selectedTeam.id}
              team={selectedTeam}
              userManagableTeams={userManagableTeams}
            />
          </div>
        </div>
      )}
    </div>
  );
}

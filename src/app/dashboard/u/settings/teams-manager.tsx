"use client";

import { InferSelectModel } from "drizzle-orm";
import { parseAsString, useQueryState } from "nuqs";
import { TeamSettingsForm } from "~/app/dashboard/u/settings/team-settings-form";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarHeader,
} from "~/components/ui/sidebar";
import type * as schema from "~/db/schema";

const pluralize = new Intl.PluralRules("en-US");

export function TeamsManager({
  teams,
}: {
  teams: Array<
    InferSelectModel<typeof schema.Teams> & {
      members: Array<InferSelectModel<typeof schema.Users>>;
    }
  >;
}) {
  const [teamId, setTeamId] = useQueryState(
    "teamId",
    parseAsString.withDefault(teams[0].id),
  );
  const selectedTeam = teams.find((team) => team.id === teamId) ?? teams[0];

  return (
    <div className="flex overflow-clip rounded-md border border-border">
      <Sidebar
        collapsible="none"
        className="grid-cols-4 divide-y divide-border border-r"
      >
        <SidebarHeader className="p-3">
          <div className="text-lg text-foreground">Teams</div>
          <div className="text-sm text-foreground">
            Select a team to manage its members and permissions.
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[400px] [&_[data-radix-scroll-area-content]]:divide-y [&_[data-radix-scroll-area-content]]:divide-border">
            {[
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
              ...teams,
            ].map((team) => (
              <SidebarGroupContent key={team.id}>
                <button className="block p-3 text-left">
                  <div className="text-base text-foreground">{team.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {pluralize.select(team.members.length) === "one"
                      ? `${team.members.length} member`
                      : `${team.members.length} members`}
                  </div>
                </button>
              </SidebarGroupContent>
            ))}
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 p-8">
        <TeamSettingsForm team={selectedTeam} />
      </div>
    </div>
  );
}

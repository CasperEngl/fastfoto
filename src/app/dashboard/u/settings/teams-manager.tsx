"use client";

import { InferSelectModel } from "drizzle-orm";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { TeamSettingsForm } from "~/app/dashboard/u/settings/team-settings-form";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
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
        <SidebarContent>
          <ScrollArea className="h-[400px]">
            {teams.map((team) => (
              <SidebarGroupContent key={team.id} className="border-b">
                <button
                  className="flex w-full items-center gap-3 p-3 text-left"
                  onClick={() => setTeamId(team.id)}
                >
                  <div className="flex-1">
                    <div className="text-base text-foreground">{team.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pluralize.select(team.members.length) === "one"
                        ? `${team.members.length} member`
                        : `${team.members.length} members`}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {team.id === teamId && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                      >
                        <ChevronRight className="size-6 text-muted-foreground/50" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </SidebarGroupContent>
            ))}
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 p-8">
        <TeamSettingsForm key={selectedTeam.id} team={selectedTeam} />
      </div>
    </div>
  );
}

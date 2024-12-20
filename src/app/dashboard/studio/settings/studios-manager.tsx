"use client";

import { InferSelectModel } from "drizzle-orm";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { parseAsString, useQueryState } from "nuqs";
import { StudioSettingsForm } from "~/app/dashboard/studio/settings/studio-settings-form";
import { useContentBreakpoint } from "~/app/hooks/use-content-breakpoint";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
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
import { pluralize } from "~/lib/plural-rules";

export type ManagedStudio = InferSelectModel<typeof schema.Studios> & {
  users: Array<
    InferSelectModel<typeof schema.Users> & {
      role: InferSelectModel<typeof schema.StudioMembers>["role"];
    }
  >;
  pendingInvitations: Array<InferSelectModel<typeof schema.UserInvitations>>;
};

export function StudiosManager({ studios }: { studios: Array<ManagedStudio> }) {
  const session = useSession();
  const [studioId, setStudioId] = useQueryState(
    "studio",
    parseAsString.withDefault(studios[0]?.id ?? ""),
  );
  const selectedStudio =
    studios.find((studio) => studio.id === studioId) ?? studios[0];
  const isMobile = useContentBreakpoint("md", {
    direction: "down",
  });

  const isPersonalStudio = (studio: ManagedStudio) =>
    studio.users.length === 1 &&
    studio.users.some((member) => {
      if (!session.data?.user?.id) {
        return false;
      }

      const isUser = member.id === session.data.user.id;
      const isOwner = member.role === "owner";

      return isUser && isOwner;
    });

  return (
    <div className="flex flex-col items-start gap-4">
      {isMobile ? (
        <Select value={studioId} onValueChange={(value) => setStudioId(value)}>
          <SelectTrigger className="inline-flex w-auto">
            <SelectValue>
              <div className="pr-2">
                {studios.find((studio) => studio.id === studioId)?.name}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {studios.map((studio) => (
              <SelectItem key={studio.id} value={studio.id}>
                <div>
                  {isPersonalStudio(studio) ? (
                    <div>
                      <Badge variant="secondary" className="-ml-0.5">
                        Personal
                      </Badge>
                    </div>
                  ) : null}

                  <div>{studio.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {pluralize.select(studio.users.length) === "one"
                      ? `${studio.users.length} member`
                      : `${studio.users.length} members`}
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
                  {studios.map((studio) => (
                    <SidebarMenuItem key={studio.id}>
                      <SidebarMenuButton
                        isActive={studio.id === studioId}
                        onClick={() => setStudioId(studio.id)}
                        className="flex h-auto w-full items-center gap-3 p-3 hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent/50 data-[active=true]:text-sidebar-accent-foreground"
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={studio.logo ?? undefined}
                            alt={`${studio.name} logo`}
                          />
                          <AvatarFallback>
                            {studio.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          {isPersonalStudio(studio) ? (
                            <div>
                              <Badge variant="secondary" className="-ml-0.5">
                                Personal
                              </Badge>
                            </div>
                          ) : null}

                          <div className="truncate text-base text-foreground">
                            {studio.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pluralize.select(studio.users.length) === "one"
                              ? `${studio.users.length} member`
                              : `${studio.users.length} members`}
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: studio.id === studioId ? 1 : 0,
                            x: studio.id === studioId ? 0 : -10,
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
            {selectedStudio ? (
              <StudioSettingsForm
                key={selectedStudio.id}
                studio={selectedStudio}
              />
            ) : (
              <Alert>
                <AlertDescription>
                  <p>Please select a studio to manage its settings</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <div className="w-full rounded-md border">
          <div className="p-4">
            {selectedStudio ? (
              <StudioSettingsForm
                key={selectedStudio.id}
                studio={selectedStudio}
              />
            ) : (
              <Alert>
                <AlertDescription>
                  <p>Please select a studio to manage its settings</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

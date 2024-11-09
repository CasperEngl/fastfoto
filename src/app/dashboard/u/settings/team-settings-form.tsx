"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { updateTeam } from "~/app/dashboard/u/settings/actions";
import { ManagedTeam } from "~/app/dashboard/u/settings/teams-manager";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { UploadButton } from "~/lib/uploadthing";
import { cn } from "~/lib/utils";

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  members: z.array(z.string()).default([]),
});

export function TeamSettingsForm({
  team,
  userManagableTeams,
}: {
  team: ManagedTeam;
  userManagableTeams: Array<string>;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof teamFormSchema>>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team.name,
      members: team.members.map((member) => member.id),
    },
  });
  const canManageTeam = userManagableTeams.includes(team.id);

  return (
    <fieldset className="space-y-8" disabled={!canManageTeam}>
      <div className="flex items-center gap-x-6">
        <Avatar className="size-24">
          <AvatarImage
            src={team.logo ?? undefined}
            alt={team.name ?? "Team Logo"}
          />
          <AvatarFallback>{team.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <UploadButton
          className={cn(
            !canManageTeam
              ? "[&_[data-ut-element=button]]:cursor-default [&_[data-ut-element=button]]:bg-primary [&_[data-ut-element=button]]:opacity-50"
              : null,
          )}
          endpoint="teamLogo"
          input={{
            teamId: team.id,
          }}
          onClientUploadComplete={() => {
            toast.success("Team logo updated");
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast.error(`Error uploading logo: ${error.message}`);
          }}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await updateTeam({
                id: team.id,
                ...values,
              });
              toast.success("Team updated successfully");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to update team",
              );
            }
          })}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Team name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the team name that will be displayed across the
                  platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update team"}
          </Button>
        </form>
      </Form>
    </fieldset>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { updateTeam } from "~/app/dashboard/u/settings/actions";
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
import type * as schema from "~/db/schema";

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  members: z.array(z.string()).default([]),
});

export function TeamSettingsForm({
  team,
}: {
  team: InferSelectModel<typeof schema.Teams> & {
    members: Array<InferSelectModel<typeof schema.Users>>;
  };
}) {
  const form = useForm<z.infer<typeof teamFormSchema>>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: team.name,
      members: team.members.map((member) => member.id),
    },
  });

  return (
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
              error instanceof Error ? error.message : "Failed to update team",
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
  );
}

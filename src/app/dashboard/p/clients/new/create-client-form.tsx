"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SelectedClient } from "~/app/dashboard/p/albums/selected-client";
import { createClient } from "~/app/dashboard/p/clients/new/actions";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";

const formSchema = z.object({
  emails: z.array(z.string()).default([]).catch([]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateClientForm({
  users,
}: {
  users: InferSelectModel<typeof Users>[];
}) {
  const session = useSession();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: [],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          invariant(session.data?.user?.id, "User ID is required");

          try {
            await createClient(values);
            form.reset();
            router.refresh();
            toast.success("Client created successfully");
          } catch (error) {
            toast.error("Failed to create client");
            console.error("Error creating client:", error);
          }
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Users</FormLabel>
              <div>
                <Combobox
                  options={users.map((user) => ({
                    value: user.email,
                    label: user.name ?? "",
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  multiple
                />
              </div>

              {field.value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {field.value
                    .toSorted((a, b) => {
                      const userA =
                        users.find((u) => u.email === a)?.name ?? "";
                      const userB =
                        users.find((u) => u.email === b)?.name ?? "";
                      return userA.localeCompare(userB);
                    })
                    .map((selectedEmail) => {
                      const user = users.find((u) => u.email === selectedEmail);

                      return (
                        <div
                          key={selectedEmail}
                          className="flex items-center gap-x-2 rounded-full border bg-muted px-2 py-1.5 has-[button:hover]:border-destructive has-[button:hover]:bg-destructive/10"
                        >
                          {user ? (
                            isAdmin(session.data?.user) ? (
                              <Link
                                key={user.id}
                                href={`/dashboard/a/users/${user.id}`}
                                className="group h-8"
                              >
                                <SelectedClient
                                  image={user.image}
                                  name={user.name}
                                />
                              </Link>
                            ) : (
                              <SelectedClient
                                image={user.image}
                                name={user.name}
                              />
                            )
                          ) : null}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              form.setValue(
                                "emails",
                                field.value.filter(
                                  (id) => id !== selectedEmail,
                                ),
                                { shouldDirty: true },
                              );
                            }}
                          >
                            <span className="sr-only">Remove user</span>
                            <X className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Client"}
        </Button>
      </form>
    </Form>
  );
}

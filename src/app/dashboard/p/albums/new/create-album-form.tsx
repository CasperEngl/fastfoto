"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Users } from "~/db/schema";
import { createAlbum } from "./actions";
import { SelectedUser } from "~/app/dashboard/p/albums/selected-user";
import { isAdmin, isPhotographer } from "~/role";
import Link from "next/link";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  users: z.array(z.string()).default([]).catch([]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAlbumForm({
  users,
}: {
  users: InferSelectModel<typeof Users>[];
}) {
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      users: searchParams.get("userId") ? [searchParams.get("userId")!] : [],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            invariant(
              isPhotographer(session.data?.user),
              "User must be a photographer",
            );

            try {
              const album = await createAlbum({
                ...values,
                studioId: session.data.user.studioId,
              });
              toast.success("Album created successfully");
              router.push(`/dashboard/p/albums/${album.id}`);
              router.refresh();
            } catch (error) {
              toast.error("Failed to create album");
              console.error("Error creating album:", error);
            }
          });
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="users"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users</FormLabel>
              <div>
                <Combobox
                  options={users.map((user) => ({
                    value: user.id,
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
                      const userA = users.find((u) => u.id === a)?.name ?? "";
                      const userB = users.find((u) => u.id === b)?.name ?? "";

                      return userA.localeCompare(userB);
                    })
                    .map((userId) => {
                      const user = users.find((u) => u.id === userId);

                      return (
                        <div
                          key={userId}
                          className="flex items-center gap-x-2 rounded-full border bg-muted px-2 py-1.5 has-[button:hover]:border-destructive has-[button:hover]:bg-destructive/10"
                        >
                          {user ? (
                            isAdmin(session.data?.user) ? (
                              <Link
                                key={user.id}
                                href={`/dashboard/a/users/${user.id}`}
                                className="group h-8"
                              >
                                <SelectedUser
                                  image={user.image}
                                  name={user.name}
                                />
                              </Link>
                            ) : (
                              <SelectedUser
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
                                "users",
                                field.value.filter((id) => id !== userId),
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Album name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Album description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Album"}
        </Button>
      </form>
    </Form>
  );
}

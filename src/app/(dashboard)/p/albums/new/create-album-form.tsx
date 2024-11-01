"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { InferSelectModel } from "drizzle-orm";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Combobox } from "~/components/ui/combobox";
import { Textarea } from "~/components/ui/textarea";
import { Users } from "~/db/schema";
import { createAlbum } from "./actions";
import { useSession } from "next-auth/react";
import invariant from "invariant";

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
            invariant(session.data?.user?.id, "User ID is required");

            try {
              const album = await createAlbum({
                ...values,
                ownerId: session.data.user.id,
              });
              toast.success("Album created successfully");
              router.push(`/p/albums/${album.id}/edit`);
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      users: searchParams.get("userId") ? [searchParams.get("userId")!] : [],
    },
  });

  const mutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: (album) => {
      toast.success("Album created successfully");
      router.push(`/p/albums/${album.id}/edit`);
      router.refresh();
    },
    onError: (error) => {
      toast.error("Failed to create album");
      console.error("Error creating album:", error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          invariant(session.data?.user?.id, "User ID is required");

          return mutation.mutate({
            ...values,
            ownerId: session.data.user.id,
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

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Album"}
        </Button>
      </form>
    </Form>
  );
}

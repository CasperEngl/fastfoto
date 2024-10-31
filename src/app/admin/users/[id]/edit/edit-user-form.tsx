"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateUser } from "~/app/admin/users/[id]/edit/actions";
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
import { Users } from "~/db/schema";

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function EditUserForm({
  user,
}: {
  user: InferSelectModel<typeof Users>;
}) {
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  invariant(params.id?.toString(), "User ID is required");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(async () => {
            try {
              await updateUser({
                ...data,
                userId: params.id!.toString(),
              });
              toast.success("User updated successfully");
            } catch (error) {
              toast.error("Failed to update user");
            }
          });
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
                <Input
                  placeholder="Enter name"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                This is the user's full name that will be displayed across the
                platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                The email address will be used for login and notifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}

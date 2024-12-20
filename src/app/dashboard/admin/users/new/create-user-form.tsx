"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createUser } from "~/app/dashboard/admin/users/new/actions";
import {
  CreateUserFormValues,
  createUserSchema,
} from "~/app/dashboard/admin/users/new/schema";
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

export function CreateUserForm() {
  const router = useRouter();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await createUser(data);
            form.reset();
            router.refresh();
            toast.success("User created successfully");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Failed to create user",
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
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Enter the user&apos;s full name.
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
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Enter the user&apos;s email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
}

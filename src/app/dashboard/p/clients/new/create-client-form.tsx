"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import invariant from "invariant";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { createClient } from "~/app/dashboard/p/clients/new/actions";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

const formSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .default([])
    .catch([]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateClientForm() {
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
            const emailsArray = values.emails
              .join(",")
              .split(",")
              .map((email) => email.trim())
              .filter(Boolean);

            await createClient({ ...values, emails: emailsArray });
            form.reset();
            router.push("/dashboard/p/clients");
            toast.success("Clients added successfully");
          } catch (error) {
            toast.error("Failed to add clients");
            console.error("Error creating clients:", error);
          }
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Emails</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter email addresses (comma-separated)..."
                  className="min-h-[100px]"
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((email) => email.trim())
                      .filter(Boolean);
                    field.onChange(emails);
                  }}
                  value={field.value.join(", ")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Clients"}
        </Button>
      </form>
    </Form>
  );
}

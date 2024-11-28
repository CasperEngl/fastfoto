"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { createStudio } from "./actions";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Studio name must be at least 2 characters")
    .max(50, "Studio name must be less than 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateStudioForm() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const studio = await createStudio(data);
      toast.success("Studio created", {
        description: `Successfully created studio "${data.name}"`,
      });
      router.push(`/dashboard/studio/settings?studio=${studio.id}`);
    } catch (error) {
      toast.error("Failed to create studio.", {
        description: "Please try again.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Studio Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Awesome Studio"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed for your studio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Studio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  requestEmailChange,
  updateProfile,
} from "~/app/dashboard/account/settings/actions";
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
import { propertiesChanged } from "~/lib/utils";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Please enter an email.",
    })
    .email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-x-6">
        <Avatar className="size-24">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "Avatar"}
          />
          <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <UploadButton
          endpoint="profileImage"
          onClientUploadComplete={() => {
            toast.success("Profile picture updated");

            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast.error(`Error uploading image: ${error.message}`);
          }}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            if (propertiesChanged(values, user)) {
              await updateProfile({ name: values.name });
              toast.success("Profile updated successfully");
            }

            if (values.email !== user.email) {
              await requestEmailChange(values.email).then(() =>
                toast.success(
                  "Verification email sent. Please check your inbox.",
                ),
              );
            }

            router.refresh();
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
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
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
                  <Input placeholder="Your email" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  This is the email associated with your account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

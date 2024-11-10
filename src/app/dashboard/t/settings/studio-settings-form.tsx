"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash-es";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { match } from "ts-pattern";
import * as z from "zod";
import { ManagedStudio } from "~/app/dashboard/t/settings/studios-manager";
import { removeMember, updateStudio } from "~/app/dashboard/u/settings/actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { UploadButton } from "~/lib/uploadthing";
import { cn } from "~/lib/utils";

const studioFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  members: z.array(z.string()).default([]),
});

export function StudioSettingsForm({
  studio,
  userManagableStudios,
}: {
  studio: ManagedStudio;
  userManagableStudios: Array<string>;
}) {
  const router = useRouter();
  const [isRemoving, startTransition] = useTransition();
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof studioFormSchema>>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      name: studio.name,
      members: studio.members.map((member) => member.id),
    },
  });
  const canManageStudio = userManagableStudios.includes(studio.id);

  return (
    <fieldset className="space-y-8" disabled={!canManageStudio}>
      <div className="flex items-center gap-x-6">
        <Avatar className="size-24">
          <AvatarImage
            src={studio.logo ?? undefined}
            alt={studio.name ?? "Studio Logo"}
          />
          <AvatarFallback>{studio.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <UploadButton
          className={cn(
            !canManageStudio
              ? "[&_[data-ut-element=button]]:cursor-default [&_[data-ut-element=button]]:bg-primary [&_[data-ut-element=button]]:opacity-50"
              : null,
          )}
          endpoint="studioLogo"
          input={{
            studioId: studio.id,
          }}
          onClientUploadComplete={() => {
            toast.success("Studio logo updated");
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast.error(`Error uploading logo: ${error.message}`);
          }}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await updateStudio({
                id: studio.id,
                ...values,
              });
              router.refresh();
              toast.success("Studio updated successfully");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to update studio",
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
                  <Input placeholder="Studio name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the studio name that will be displayed across the
                  platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Studio Members</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  {canManageStudio && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {studio.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={member.image ?? undefined}
                          alt={member.name ?? "Member"}
                        />
                        <AvatarFallback>
                          {member.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={match(member.role)
                          .with("owner", () => "destructive" as const)
                          .with("admin", () => "outline" as const)
                          .with("member", () => "default" as const)
                          .exhaustive()}
                      >
                        {capitalize(member.role)}
                      </Badge>
                    </TableCell>
                    {canManageStudio ? (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0"
                          disabled={removingMemberId === member.id}
                          onClick={() => {
                            setRemovingMemberId(member.id);
                            startTransition(async () => {
                              try {
                                await removeMember(studio.id, member.id);
                                toast.success(
                                  `${member.name} removed from studio`,
                                );
                              } catch (error) {
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to remove member",
                                );
                              } finally {
                                setRemovingMemberId(null);
                                router.refresh();
                              }
                            });
                          }}
                        >
                          {removingMemberId === member.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <X className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update studio"}
          </Button>
        </form>
      </Form>
    </fieldset>
  );
}

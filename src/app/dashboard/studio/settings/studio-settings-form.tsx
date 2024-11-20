"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash-es";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { match } from "ts-pattern";
import * as z from "zod";
import {
  addMember,
  cancelInvitation,
  removeMember,
  updateStudio,
} from "~/app/dashboard/studio/settings/actions";
import { StudioSettingsContext } from "~/app/dashboard/studio/settings/studio-settings-context";
import { ManagedStudio } from "~/app/dashboard/studio/settings/studios-manager";
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
import { dayjs } from "~/lib/dayjs";
import { UploadButton } from "~/lib/uploadthing";
import { cn } from "~/lib/utils";

const studioFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  members: z.array(z.string()).default([]),
});

const addMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function StudioSettingsForm({ studio }: { studio: ManagedStudio }) {
  const router = useRouter();
  const [isRemoving, startTransition] = useTransition();
  const { userManagableStudios } = use(StudioSettingsContext);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [cancellingInvitationId, setCancellingInvitationId] = useState<
    string | null
  >(null);
  const form = useForm<z.infer<typeof studioFormSchema>>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      name: studio.name,
      members: studio.users.map((member) => member.id),
    },
  });
  const addMemberForm = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
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

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>

      {canManageStudio ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add Member</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email address of the member you want to add to this
            studio.
          </p>

          <Form {...addMemberForm}>
            <form
              onSubmit={addMemberForm.handleSubmit(async (values) => {
                try {
                  const res = await addMember(studio.id, values.email);
                  console.log("RES", res);
                  addMemberForm.reset();
                  router.refresh();
                  toast.success("Member added successfully");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to add member",
                  );
                }
              })}
              className="mt-4 flex items-end gap-2"
            >
              <FormField
                control={addMemberForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter member's email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={addMemberForm.formState.isSubmitting}
              >
                {addMemberForm.formState.isSubmitting
                  ? "Adding..."
                  : "Add Member"}
              </Button>
            </form>
          </Form>
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Studio Members</h3>

        {studio.pendingInvitations.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pending Invitations</TableHead>
                  <TableHead>Sent</TableHead>
                  {canManageStudio ? (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {studio.pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{invitation.email}</span>
                        <span className="text-sm text-muted-foreground">
                          Pending acceptance
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dayjs(invitation.createdAt).fromNow()}
                    </TableCell>
                    {canManageStudio ? (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0"
                          disabled={cancellingInvitationId === invitation.id}
                          onClick={async () => {
                            setCancellingInvitationId(invitation.id);
                            try {
                              await cancelInvitation(invitation.id);
                              toast.success("Invitation cancelled");
                              router.refresh();
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Failed to cancel invitation",
                              );
                            } finally {
                              setCancellingInvitationId(null);
                            }
                          }}
                        >
                          {cancellingInvitationId === invitation.id ? (
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
        ) : null}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                {canManageStudio ? (
                  <TableHead className="w-[100px]">Actions</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {studio.users.map((member) => (
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
                          startTransition(async () => {
                            setRemovingMemberId(member.id);

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
      </div>
    </fieldset>
  );
}

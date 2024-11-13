"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deletePhoto } from "~/app/dashboard/studio/albums/[id]/actions";
import { updateAlbum } from "~/app/dashboard/studio/albums/actions";
import { SelectedClient } from "~/app/dashboard/studio/albums/selected-client";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
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
import { Textarea } from "~/components/ui/textarea";
import * as schema from "~/db/schema";
import { UploadDropzone } from "~/lib/uploadthing";
import { cn } from "~/lib/utils";
import { isAdmin } from "~/role";

const albumFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  clients: z.array(z.string()).default([]).catch([]),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

interface OptimisticPhoto extends InferSelectModel<typeof schema.Photos> {
  isRemoving?: boolean;
}

export function EditAlbumForm({
  album,
  studioClients,
}: {
  album: InferSelectModel<typeof schema.Albums> & {
    photos: InferSelectModel<typeof schema.Photos>[];
    clients: InferSelectModel<typeof schema.StudioClients>[];
  };
  studioClients: Array<
    InferSelectModel<typeof schema.StudioClients> & {
      user: InferSelectModel<typeof schema.Users>;
    }
  >;
}) {
  const session = useSession();
  const router = useRouter();
  const params = useParams();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const [optimisticPhotos, setOptimisticPhotos] = useOptimistic<
    OptimisticPhoto[]
  >(
    album.photos.map((photo) => ({
      ...photo,
      isRemoving: false,
    })),
  );

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      name: album.name ?? "",
      description: album.description ?? "",
      clients: album.clients.map((client) => client.id),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          startUpdateTransition(async () => {
            invariant(params.id, "id is required");

            try {
              await updateAlbum(params.id.toString(), {
                name: values.name,
                description: values.description || null,
                clients: values.clients || [],
              });
              toast.success("Album updated successfully");
              form.reset(form.getValues());
            } catch (error) {
              toast.error("Failed to update album");
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
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormDescription>
                This is the album name that will be displayed across the
                platform.
              </FormDescription>
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
                <Textarea placeholder="Enter description" rows={5} {...field} />
              </FormControl>
              <FormDescription>
                A brief description of the album's contents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clients</FormLabel>
              <div className="space-y-4">
                <Combobox
                  options={studioClients.map((studioClient) => ({
                    value: studioClient.id,
                    label: studioClient.user.name ?? "",
                  }))}
                  placeholder="Select clients..."
                  value={field.value}
                  onValueChange={field.onChange}
                  multiple
                />
              </div>
              <FormDescription>
                The clients this album is shared with.
              </FormDescription>
              <FormMessage />

              {field.value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {field.value
                    .toSorted((a, b) => {
                      const userA =
                        studioClients.find(
                          (studioClient) => studioClient.id === a,
                        )?.user.name ?? "";
                      const userB =
                        studioClients.find((u) => u.id === b)?.user.name ?? "";

                      return userA.localeCompare(userB);
                    })
                    .map((userId) => {
                      const studioClient = studioClients.find(
                        (u) => u.id === userId,
                      );

                      return (
                        <div
                          key={userId}
                          className="flex items-center gap-x-2 rounded-full border bg-muted px-2 py-1.5 has-[button:hover]:border-destructive has-[button:hover]:bg-destructive/10"
                        >
                          {studioClient ? (
                            isAdmin(session.data?.user) ? (
                              <Link
                                key={studioClient.id}
                                href={`/dashboard/admin/users/${studioClient.id}`}
                                className="group h-8"
                              >
                                <SelectedClient
                                  image={studioClient.user.image}
                                  name={studioClient.user.name}
                                />
                              </Link>
                            ) : (
                              <SelectedClient
                                image={studioClient.user.image}
                                name={studioClient.user.name}
                              />
                            )
                          ) : null}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              form.setValue(
                                "clients",
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
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>

          <p
            className={cn(
              "mt-2 max-w-prose text-pretty text-sm",
              form.formState.isDirty ? "text-destructive" : "text-green-500",
            )}
          >
            {form.formState.isDirty ? (
              <span>
                ⚠️ Unsaved changes detected. Please save your changes by
                clicking "Save Changes".
              </span>
            ) : (
              <span>✓ All changes saved</span>
            )}
          </p>
        </div>

        <div>
          <FormLabel>Photos</FormLabel>

          <div className="space-y-6">
            <UploadDropzone
              endpoint="albumPhotos"
              input={{
                albumId: album.id,
              }}
              onClientUploadComplete={(res) => {
                if (res) {
                  startUpdateTransition(() => {
                    setOptimisticPhotos([
                      ...optimisticPhotos,
                      ...res.map((photo) => ({
                        url: photo.url,
                        key: photo.key,
                        albumId: album.id,
                        id: Math.random().toString(),
                        caption: "",
                        order: 0,
                        updatedAt: new Date(),
                        uploadedAt: new Date(),
                      })),
                    ]);
                  });
                  router.refresh();
                  toast.success("Photos uploaded successfully!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {optimisticPhotos.map((photo, index) => (
                <div
                  key={photo.url}
                  className="relative aspect-square"
                  style={{ opacity: photo.isRemoving ? 0.5 : 1 }}
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2"
                    disabled={photo.isRemoving}
                    onClick={() => {
                      startRemoveTransition(async () => {
                        try {
                          // Mark the photo as removing
                          const updatedPhotos = optimisticPhotos.map((p) =>
                            p.key === photo.key
                              ? { ...p, isRemoving: true }
                              : p,
                          );
                          setOptimisticPhotos(updatedPhotos);

                          await deletePhoto(album.id, photo.key);

                          toast.success("Photo deleted successfully");
                          router.refresh();
                        } catch (error) {
                          // Revert the removing state on error
                          const revertedPhotos = optimisticPhotos.map((p) =>
                            p.key === photo.key
                              ? { ...p, isRemoving: false }
                              : p,
                          );
                          setOptimisticPhotos(revertedPhotos);
                          toast.error("Failed to delete photo");
                        }
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete photo</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

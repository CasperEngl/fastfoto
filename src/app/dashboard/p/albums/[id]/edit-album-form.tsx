"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deletePhoto } from "~/app/dashboard/p/albums/[id]/actions";
import { updateAlbum } from "~/app/dashboard/p/albums/actions";
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
import { Albums, Photos, Users } from "~/db/schema";
import { UploadDropzone } from "~/lib/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";
import { isAdmin } from "~/role";
import { useSession } from "next-auth/react";

function SelectedUser({
  image,
  name,
}: {
  image: string | null;
  name: string | null;
}) {
  return (
    <div className="flex items-center gap-x-2">
      <Avatar className="size-8">
        <AvatarImage src={image ?? undefined} alt={name ?? ""} />
        <AvatarFallback>
          {name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm group-hover:underline">{name}</span>
    </div>
  );
}

const albumFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  users: z.array(z.string()).default([]).catch([]),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

interface OptimisticPhoto extends InferSelectModel<typeof Photos> {
  isRemoving?: boolean;
}

export function EditAlbumForm({
  album,
  users,
}: {
  album: InferSelectModel<typeof Albums> & {
    photos: InferSelectModel<typeof Photos>[];
    users: InferSelectModel<typeof Users>[];
  };
  users: InferSelectModel<typeof Users>[];
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
      users: album.users.map((user) => user.id),
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
                users: values.users || [],
              });
              toast.success("Album updated successfully");
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
                <Textarea placeholder="Enter description" {...field} />
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
          name="users"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <div className="space-y-4">
                <Combobox
                  options={users.map((user) => ({
                    value: user.id,
                    label: user.name ?? "",
                  }))}
                  placeholder="Select users..."
                  value={field.value}
                  onValueChange={field.onChange}
                  multiple
                />
              </div>
              <FormDescription>The user who owns this album.</FormDescription>
              <FormMessage />

              {field.value.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {field.value
                    .toSorted((a, b) => {
                      const userA = users.find((u) => u.id === a)?.name ?? "";
                      const userB = users.find((u) => u.id === b)?.name ?? "";

                      return userA.localeCompare(userB);
                    })
                    .map((userId) => {
                      const user = users.find((u) => u.id === userId);

                      return user ? (
                        isAdmin(session.data?.user) ? (
                          <Link
                            key={user.id}
                            href={`/dashboard/a/users/${user.id}`}
                            className="block group"
                          >
                            <SelectedUser image={user.image} name={user.name} />
                          </Link>
                        ) : (
                          <SelectedUser image={user.image} name={user.name} />
                        )
                      ) : null;
                    })}
                </div>
              ) : null}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>

        <div className="space-y-4">
          <FormLabel>Album Photos</FormLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                  className="rounded-lg object-cover"
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
                          p.key === photo.key ? { ...p, isRemoving: true } : p,
                        );
                        setOptimisticPhotos(updatedPhotos);

                        await deletePhoto(photo.key);

                        toast.success("Photo deleted successfully");
                        router.refresh();
                      } catch (error) {
                        // Revert the removing state on error
                        const revertedPhotos = optimisticPhotos.map((p) =>
                          p.key === photo.key ? { ...p, isRemoving: false } : p,
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
        </div>
      </form>
    </Form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useOptimistic, useTransition } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import { Albums, Photos, Users } from "~/db/schema";
import { UploadDropzone } from "~/lib/uploadthing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { deletePhoto } from "~/app/p/albums/[id]/edit/actions";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { InferSelectModel } from "drizzle-orm";
import { updateAlbum } from "~/app/p/albums/actions";
import invariant from "invariant";

const albumFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

export function EditAlbumForm({
  album,
  users,
}: {
  album: InferSelectModel<typeof Albums> & {
    photos: InferSelectModel<typeof Photos>[];
  };
  users: InferSelectModel<typeof Users>[];
}) {
  const router = useRouter();
  const params = useParams();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const [optimisticPhotos, addOptimisticPhoto] = useOptimistic(
    album.photos,
    (_state, newPhotos: InferSelectModel<typeof Photos>[]) => newPhotos,
  );

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      name: album.name ?? "",
      description: album.description ?? "",
      userId: album.userId ?? "",
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
                userId: values.userId,
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
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The user who owns this album.</FormDescription>
              <FormMessage />
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
              <div key={photo.url} className="relative aspect-square">
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
                  disabled={isRemoving}
                  onClick={() => {
                    startRemoveTransition(async () => {
                      try {
                        const newPhotos = optimisticPhotos.filter(
                          (p) => p.key !== photo.key,
                        );
                        addOptimisticPhoto(newPhotos);
                        await deletePhoto(photo.key);
                        toast.success("Photo deleted successfully");
                        router.refresh();
                      } catch (error) {
                        toast.error("Failed to delete photo");
                        addOptimisticPhoto(album.photos);
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

          {optimisticPhotos.length < 10 && (
            <UploadDropzone
              endpoint="albumPhotos"
              input={{
                albumId: album.id,
              }}
              onClientUploadComplete={(res) => {
                if (res) {
                  startUpdateTransition(() => {
                    addOptimisticPhoto([
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
          )}
        </div>
      </form>
    </Form>
  );
}

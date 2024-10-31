"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { InferSelectModel } from "drizzle-orm";
import { Albums } from "~/db/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadDropzone } from "~/lib/uploadthing";
import { useState } from "react";
import Image from "next/image";

const albumFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

type UploadedPhoto = {
  url: string;
};

export function EditAlbumForm({
  album,
  updateAlbum,
}: {
  album: InferSelectModel<typeof Albums>;
  updateAlbum: (data: AlbumFormValues & { photos: string[] }) => Promise<void>;
}) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      name: album.name ?? "",
      description: album.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: AlbumFormValues) =>
      updateAlbum({
        ...values,
        photos: uploadedPhotos.map((photo) => photo.url),
      }),
    onSuccess: () => {
      toast.success("Album updated successfully");
    },
    onError: () => {
      toast.error("Failed to update album");
    },
  });

  const removePhoto = (indexToRemove: number) => {
    setUploadedPhotos((photos) =>
      photos.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
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

        <div className="space-y-4">
          <FormLabel>Album Photos</FormLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {uploadedPhotos.map((photo, index) => (
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
                  onClick={() => removePhoto(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {uploadedPhotos.length < 10 && (
            <UploadDropzone
              endpoint="albumPhotos"
              input={{
                albumId: album.id,
              }}
              onClientUploadComplete={(res) => {
                if (res) {
                  const newPhotos = res.map((file) => ({ url: file.url }));
                  setUploadedPhotos((current) => [...current, ...newPhotos]);
                  toast.success("Photos uploaded successfully!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
          )}
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}

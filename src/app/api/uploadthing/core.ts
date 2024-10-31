import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/auth";
import crypto from "crypto";
import { z } from "zod";
import { db } from "~/db/client";
import { Photos } from "~/db/schema";

const f = createUploadthing();

export const ourFileRouter = {
  albumPhotos: f({ image: { maxFileSize: "16MB", maxFileCount: 10 } })
    .input(
      z.object({
        albumId: z.string().uuid(),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id, albumId: input.albumId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const albumId = metadata.albumId;
      if (!albumId) {
        throw new Error("Album ID is required");
      }

      await db
        .insert(Photos)
        .values({
          id: crypto.randomUUID(),
          albumId: albumId,
          url: file.url,
          uploadedAt: new Date(),
          order: 0,
        })
        .execute();

      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/auth";
import crypto from "crypto";
import { z } from "zod";
import { db } from "~/db/client";
import { Photos, Users } from "~/db/schema";
import { eq } from "drizzle-orm";

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
          key: file.key,
          order: 0,
        })
        .execute();

      return { url: file.url };
    }),
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(Users)
        .set({
          image: file.url,
          updatedAt: new Date(),
        })
        .where(eq(Users.id, metadata.userId))
        .execute();

      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const utapi = new UTApi();

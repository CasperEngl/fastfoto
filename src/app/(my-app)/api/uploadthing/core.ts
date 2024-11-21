import crypto from "crypto";
import { eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersFilters from "~/db/filters/studio-members";
import * as schema from "~/db/schema";

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
        .insert(schema.Photos)
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
        .update(schema.Users)
        .set({
          image: file.url,
          updatedAt: new Date(),
        })
        .where(eq(schema.Users.id, metadata.userId))
        .execute();

      return { url: file.url };
    }),
  studioLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(
      z.object({
        studioId: z.string().uuid(),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      const studioManager = await db.query.StudioMembers.findFirst({
        where: studioMembersFilters.isStudioManager(
          input.studioId,
          session.user.id,
        ),
        columns: {
          id: true,
        },
      });

      if (!studioManager) {
        throw new UploadThingError("Unauthorized - Must be a studio manager");
      }

      return { userId: session.user.id, studioId: input.studioId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(schema.Studios)
        .set({
          logo: file.url,
          updatedAt: new Date(),
        })
        .where(eq(schema.Studios.id, metadata.studioId))
        .execute();

      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const utapi = new UTApi();

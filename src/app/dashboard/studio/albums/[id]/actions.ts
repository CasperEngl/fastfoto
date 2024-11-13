"use server";

import { and, eq } from "drizzle-orm";
import invariant from "invariant";
import { cookies } from "next/headers";
import { utapi } from "~/app/api/uploadthing/core";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isAlbum } from "~/db/queries/albums.queries";
import { isStudioMember } from "~/db/queries/studio-member.queries";
import { isStudio } from "~/db/queries/studio.queries";
import { Photos } from "~/db/schema";

export async function deletePhoto(albumId: string, key: string) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const album = await tx.query.Albums.findFirst({
      where: isAlbum(albumId),
      with: {
        studio: true,
      },
    });

    if (!album) {
      throw new Error("Album not found");
    }

    if (album.studioId !== selectedStudioId) {
      throw new Error("Unauthorized");
    }

    const studioMember = await tx.query.StudioMembers.findFirst({
      where: and(
        isStudio(album.studioId),
        isStudioMember(album.studioId, session.user.id),
      ),
      columns: {
        id: true,
      },
    });

    if (!studioMember) {
      throw new Error("Unauthorized");
    }

    const photo = await tx.query.Photos.findFirst({
      where: eq(Photos.key, key),
      with: {
        album: true,
      },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    // Proceed with deletion if authorized
    await utapi.deleteFiles(key);
    await tx.delete(Photos).where(eq(Photos.key, key));
  });
}
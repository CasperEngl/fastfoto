"use server";

import { eq } from "drizzle-orm";
import { utapi } from "~/app/api/uploadthing/core";
import { db } from "~/db/client";
import { Photos, Albums } from "~/db/schema";
import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { isPhotographer } from "~/role";

export async function deletePhoto(key: string) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  await db.transaction(async (tx) => {
    const photo = await tx.query.Photos.findFirst({
      where: eq(Photos.key, key),
      with: {
        album: true,
      },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    // Check if the user owns the album
    if (photo.album.userId !== session.user?.id) {
      throw new Error("Unauthorized");
    }

    // Proceed with deletion if authorized
    await utapi.deleteFiles(key);
    await tx.delete(Photos).where(eq(Photos.key, key));
  });
}

"use server";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { utapi } from "~/app/api/uploadthing/core";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Photos } from "~/db/schema";
import { hasPhotographerUserType } from "~/role";

export async function deletePhoto(key: string) {
  const session = await auth();

  if (!hasPhotographerUserType(session?.user)) {
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

    // Proceed with deletion if authorized
    await utapi.deleteFiles(key);
    await tx.delete(Photos).where(eq(Photos.key, key));
  });
}

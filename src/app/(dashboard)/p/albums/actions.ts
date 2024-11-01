"use server";

import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums, UsersToAlbums } from "~/db/schema";
import { isPhotographer } from "~/role";

export async function deleteAlbum(albumId: string) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  const album = await db.query.Albums.findFirst({
    where: eq(Albums.id, albumId),
  });

  if (!album) {
    throw new Error("Album not found");
  }

  await db.delete(Albums).where(eq(Albums.id, albumId));
  revalidatePath("/p/albums");
}

export async function updateAlbum(
  albumId: string,
  data: Omit<InferInsertModel<typeof Albums>, "ownerId"> & {
    users: string[];
  },
) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  const album = await db.query.Albums.findFirst({
    where: eq(Albums.id, albumId),
  });

  if (!album) {
    throw new Error("Album not found");
  }

  await db.transaction(async (tx) => {
    // Update album details
    await tx
      .update(Albums)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(Albums.id, albumId));

    // Delete existing user relationships
    await tx.delete(UsersToAlbums).where(eq(UsersToAlbums.albumId, albumId));

    // Insert new user relationships
    if (data.users.length > 0) {
      await tx.insert(UsersToAlbums).values(
        data.users.map((userId) => ({
          userId,
          albumId,
        })),
      );
    }
  });

  revalidatePath("/p/albums");
}

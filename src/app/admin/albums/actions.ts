"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums, Photos } from "~/db/schema";

export async function deleteAlbum(albumId: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.delete(Albums).where(eq(Albums.id, albumId));
  revalidatePath("/admin/albums");
}

interface UpdateAlbumInput {
  name: string;
  description: string | null;
  photos: string[];
}

export async function updateAlbum(albumId: string, data: UpdateAlbumInput) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(Albums)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(Albums.id, albumId));

    if (data.photos.length > 0) {
      await tx.insert(Photos).values(
        data.photos.map((url, index) => ({
          url,
          albumId: albumId,
          order: index,
        })),
      );
    }
  });

  revalidatePath("/admin/albums");
}

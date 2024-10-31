"use server";

import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
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

  if (album.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(Albums).where(eq(Albums.id, albumId));
  revalidatePath("/p/albums");
}

export async function updateAlbum(
  albumId: string,
  data: InferInsertModel<typeof Albums>,
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

  if (album.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.update(Albums).set(data).where(eq(Albums.id, albumId));

  revalidatePath("/p/albums");
}

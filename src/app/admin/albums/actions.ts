"use server";

import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";

export async function deleteAlbum(albumId: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.delete(Albums).where(eq(Albums.id, albumId));
  revalidatePath("/admin/albums");
}

export async function updateAlbum(
  albumId: string,
  data: InferInsertModel<typeof Albums>,
) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  await db
    .update(Albums)
    .set({
      name: data.name,
      description: data.description,
    })
    .where(eq(Albums.id, albumId));

  revalidatePath("/admin/albums");
}

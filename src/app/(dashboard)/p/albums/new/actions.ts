"use server";

import { InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db/client";
import { Albums, UsersToAlbums } from "~/db/schema";

export async function createAlbum(
  data: InferInsertModel<typeof Albums> & {
    users: string[];
  },
) {
  const [album] = await db.transaction(async (tx) => {
    const [newAlbum] = await tx
      .insert(Albums)
      .values({
        name: data.name,
        description: data.description,
      })
      .returning();

    // Insert the user-album relationships
    if (data.users.length > 0) {
      await tx.insert(UsersToAlbums).values(
        data.users.map((userId) => ({
          userId,
          albumId: newAlbum.id,
        })),
      );
    }

    return [newAlbum];
  });

  revalidatePath("/p/albums");
  return album;
}

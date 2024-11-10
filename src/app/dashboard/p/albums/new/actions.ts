"use server";

import { InferInsertModel } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums, UsersToAlbums } from "~/db/schema";
import { isPhotographer } from "~/role";

export async function createAlbum(
  data: InferInsertModel<typeof Albums> & {
    users: string[];
  },
) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  const [album] = await db.transaction(async (tx) => {
    invariant(isPhotographer(session.user), "User must be a photographer");

    const [newAlbum] = await tx
      .insert(Albums)
      .values({
        name: data.name,
        description: data.description,
        studioId: session.user.studioId,
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

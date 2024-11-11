"use server";

import { InferInsertModel } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isUserPhotographer } from "~/db/queries/users.queries";
import { Albums, UsersToAlbums } from "~/db/schema";

export async function createAlbum(
  data: InferInsertModel<typeof Albums> & {
    users: string[];
  },
) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const photographerUser = await tx.query.Users.findFirst({
      where: isUserPhotographer(session.user.id),
      columns: {
        id: true,
      },
    });

    if (!photographerUser) {
      throw new Error("Unauthorized");
    }

    invariant(selectedStudioId, "Must select a studio");

    const [album] = await tx
      .insert(Albums)
      .values({
        name: data.name,
        description: data.description,
        studioId: selectedStudioId,
      })
      .returning();

    // Insert the user-album relationships
    if (data.users.length > 0) {
      await tx.insert(UsersToAlbums).values(
        data.users.map((userId) => ({
          userId,
          albumId: album.id,
        })),
      );
    }

    revalidatePath("/dashboard/p/albums");

    return album;
  });
}

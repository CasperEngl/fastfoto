"use server";

import { and, eq, InferInsertModel } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isAlbum } from "~/db/queries/albums.queries";
import { isStudioMember } from "~/db/queries/studio-member.queries";
import { isStudio } from "~/db/queries/studio.queries";
import * as schema from "~/db/schema";

export async function deleteAlbum(albumId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const album = await tx.query.Albums.findFirst({
      where: eq(schema.Albums.id, albumId),
    });

    if (!album) {
      throw new Error("Album not found");
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

    await tx.delete(schema.Albums).where(eq(schema.Albums.id, albumId));

    revalidatePath("/dashboard/studio/albums");
  });
}

export async function updateAlbum(
  albumId: string,
  data: Omit<InferInsertModel<typeof schema.Albums>, "studioId"> & {
    clients: string[];
  },
) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  invariant(session?.user?.id, "Unauthorized");
  invariant(selectedStudioId, "Unauthorized");

  const album = await db.query.Albums.findFirst({
    where: isAlbum(albumId),
    with: {
      studio: true,
    },
  });

  if (!album) {
    throw new Error("Album not found");
  }

  // Add this check to ensure the album belongs to the selected studio
  if (album.studioId !== selectedStudioId) {
    throw new Error("Unauthorized");
  }

  const studioMember = await db.query.StudioMembers.findFirst({
    where: isStudioMember(album.studioId, session.user.id),
    columns: {
      id: true,
    },
  });

  if (!studioMember) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    // Update album details
    await tx
      .update(schema.Albums)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(isAlbum(albumId));

    // Delete existing user relationships
    await tx
      .delete(schema.AlbumClients)
      .where(eq(schema.AlbumClients.albumId, albumId));

    // Insert new user relationships
    if (data.clients.length > 0) {
      await tx.insert(schema.AlbumClients).values(
        data.clients.map((clientId) => ({
          studioClientId: clientId,
          albumId,
        })),
      );
    }

    revalidatePath("/dashboard/studio/albums");
  });
}
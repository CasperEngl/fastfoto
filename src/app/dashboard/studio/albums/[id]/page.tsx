import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteAlbumButton } from "~/app/dashboard/studio/albums/[id]/delete-album-button";
import { EditAlbumForm } from "~/app/dashboard/studio/albums/[id]/edit-album-form";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioClientsQuery from "~/db/queries/studio-clients.query";
import { Albums } from "~/db/schema";
import { isPhotographer } from "~/role";

export default async function AlbumPage({
  params,
}: {
  params: Promise<unknown>;
}) {
  const { id } = z.object({ id: z.string() }).parse(await params);
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  const album = await db.query.Albums.findFirst({
    where: eq(Albums.id, id),
    with: {
      photos: true,
      albumClients: {
        with: {
          studioClient: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!album) {
    return notFound();
  }

  const transformedAlbum = {
    ...album,
    studioClients:
      album.albumClients.map((albumClient) => albumClient.studioClient) ?? [],
  };

  const studioClients = await db.query.StudioClients.findMany({
    where: studioClientsQuery.studioFilter(album.studioId),
    with: {
      user: true,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Album</h1>
        <DeleteAlbumButton albumId={id} />
      </div>
      <EditAlbumForm album={transformedAlbum} studioClients={studioClients} />
    </div>
  );
}

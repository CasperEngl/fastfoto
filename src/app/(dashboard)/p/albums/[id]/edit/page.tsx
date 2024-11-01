import { eq, getTableColumns } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteAlbumButton } from "~/app/(dashboard)/p/albums/[id]/edit/delete-album-button";
import { EditAlbumForm } from "~/app/(dashboard)/p/albums/[id]/edit/edit-album-form";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { isPhotographer } from "~/role";

export default async function AlbumEditPage({
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
      usersToAlbums: {
        with: {
          user: true,
        },
      },
    },
  }).then((album) => {
    if (!album) {
      return null;
    }
    return {
      ...album,
      users: album?.usersToAlbums.map((userToAlbum) => userToAlbum.user),
    };
  });
  if (!album) {
    return notFound();
  }
  console.log("album", album.id);
  const users = await db.query.Users.findMany();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Album</h1>
        <DeleteAlbumButton albumId={id} />
      </div>
      <EditAlbumForm album={album} users={users} />
    </div>
  );
}

import { eq } from "drizzle-orm";
import invariant from "invariant";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { isAdmin, isPhotographer } from "~/role";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";

export default async function AlbumsPage() {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  invariant(session.user.id, "User ID is required");

  const albums = await db.query.Albums.findMany({
    where: isAdmin(session.user)
      ? undefined
      : eq(Albums.ownerId, session.user.id),
    with: {
      photos: true,
      usersToAlbums: {
        with: {
          user: true,
        },
      },
    },
  });

  // We no longer need to filter albums after fetching since we're filtering in the query
  const transformedAlbums = albums.map((album) => ({
    ...album,
    users: album.usersToAlbums.map(({ user }) => user),
  }));

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <Button asChild>
          <Link href="/p/albums/new">
            <Plus className="size-4" />
            Create Album
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={transformedAlbums} />
    </div>
  );
}

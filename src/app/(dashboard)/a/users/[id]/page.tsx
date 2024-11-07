import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EditUserForm } from "~/app/(dashboard)/a/users/[id]/edit-user-form";
import { auth } from "~/auth";
import { AlbumCard } from "~/components/album-card";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Users, UsersToAlbums } from "~/db/schema";
import { isAdmin } from "~/role";
import { DeleteUserButton } from "./delete-user-button";

export default async function UserEditPage({
  params,
}: {
  params: Promise<unknown>;
}) {
  const { id } = z.object({ id: z.string() }).parse(await params);
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  // Get user and their albums
  const user = await db.query.Users.findFirst({
    where: eq(Users.id, id),
  });

  if (!user) {
    return notFound();
  }

  const albums = await db.query.UsersToAlbums.findMany({
    where: eq(UsersToAlbums.userId, id),
    with: {
      album: {
        with: {
          photos: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        <DeleteUserButton userId={id} />
      </div>
      <EditUserForm user={user} />

      {/* Albums Section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">User Albums</h2>
          <Button asChild>
            <Link href={`/p/albums/new?userId=${id}`}>Create Album</Link>
          </Button>
        </div>
        {albums.length === 0 ? (
          <p className="text-muted-foreground">
            No albums found for this user.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {albums.map(({ album }) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

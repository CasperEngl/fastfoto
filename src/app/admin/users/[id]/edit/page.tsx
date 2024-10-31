import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditUserForm } from "~/app/admin/users/[id]/edit/edit-user-form";
import { auth } from "~/auth";
import { AlbumCard } from "~/components/album-card";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums, Users } from "~/db/schema";
import { isAdmin } from "~/role";
import { DeleteUserButton } from "./delete-user-button";

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  // Get user and their albums
  const [user] = await db.select().from(Users).where(eq(Users.id, params.id));
  const albums = await db.query.Albums.findMany({
    where: eq(Albums.userId, params.id),
    with: { photos: true },
  });

  if (!user) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Users</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        </div>
        <DeleteUserButton userId={params.id} />
      </div>
      <EditUserForm user={user} />

      {/* Albums Section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">User Albums</h2>
          <Button asChild>
            <Link href={`/p/albums/new?userId=${params.id}`}>Create Album</Link>
          </Button>
        </div>
        {albums.length === 0 ? (
          <p className="text-muted-foreground">
            No albums found for this user.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { CreateAlbumForm } from "~/app/(dashboard)/p/albums/new/create-album-form";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isPhotographer } from "~/role";

export default async function CreateAlbumPage() {
  const session = await auth();
  const users = await db.query.Users.findMany();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Album</h1>
      </div>
      <CreateAlbumForm users={users} />
    </div>
  );
}

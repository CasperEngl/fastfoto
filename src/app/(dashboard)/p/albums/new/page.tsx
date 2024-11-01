import { CreateAlbumForm } from "~/app/(dashboard)/p/albums/new/create-album-form";
import { db } from "~/db/client";

export default async function CreateAlbumPage() {
  const users = await db.query.Users.findMany();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Album</h1>
      </div>
      <CreateAlbumForm users={users} />
    </div>
  );
}

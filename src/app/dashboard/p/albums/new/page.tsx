import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CreateAlbumForm } from "~/app/dashboard/p/albums/new/create-album-form";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { Alert } from "~/components/ui/alert";
import { db } from "~/db/client";
import { hasPhotographerUserType } from "~/role";

export default async function CreateAlbumPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;
  const users = await db.query.Users.findMany();

  if (!hasPhotographerUserType(session?.user)) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Album</h1>
      </div>
      {selectedStudioId ? (
        <CreateAlbumForm users={users} selectedStudioId={selectedStudioId} />
      ) : (
        <Alert variant="destructive">
          <p>
            Please select a studio in the top left corner to create an album.
          </p>
        </Alert>
      )}
    </div>
  );
}

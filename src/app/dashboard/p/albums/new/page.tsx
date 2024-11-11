import invariant from "invariant";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CreateAlbumForm } from "~/app/dashboard/p/albums/new/create-album-form";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { Alert } from "~/components/ui/alert";
import { db } from "~/db/client";
import { studioClients } from "~/db/queries/studio-clients.queries";
import { isPhotographer } from "~/role";

export default async function CreateAlbumPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  invariant(selectedStudioId, "Studio is required");

  const clients = await db.query.StudioClients.findMany({
    where: studioClients(selectedStudioId),
    with: {
      user: true,
    },
  });

  const transformedClients = clients.map((client) => client.user);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Album</h1>
      </div>
      {selectedStudioId ? (
        <CreateAlbumForm
          clients={transformedClients}
          selectedStudioId={selectedStudioId}
        />
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

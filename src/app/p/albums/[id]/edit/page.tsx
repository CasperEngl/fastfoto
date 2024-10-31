import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteAlbumButton } from "~/app/p/albums/[id]/edit/delete-album-button";
import { EditAlbumForm } from "~/app/p/albums/[id]/edit/edit-album-form";
import { updateAlbum } from "~/app/p/albums/actions";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";

export default async function AlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return notFound();
  }

  const album = await db.query.Albums.findFirst({
    where: eq(Albums.id, id),
    with: { photos: true },
  });
  const users = await db.query.Users.findMany();

  if (!album) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/admin/albums">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Albums</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Album</h1>
        </div>
        <DeleteAlbumButton albumId={id} />
      </div>
      <EditAlbumForm
        album={album}
        users={users}
        updateAlbum={async (data) => {
          "use server";
          await updateAlbum(id, {
            name: data.name,
            description: data.description || null,
            userId: data.userId,
          });
        }}
      />
    </div>
  );
}

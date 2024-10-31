import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteAlbumButton } from "~/app/admin/albums/[id]/edit/delete-album-button";
import { EditAlbumForm } from "~/app/admin/albums/[id]/edit/edit-album-form";
import { updateAlbum } from "~/app/admin/albums/actions";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";

export default async function AlbumEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return notFound();
  }

  const [album] = await db
    .select()
    .from(Albums)
    .where(eq(Albums.id, params.id));

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
        <DeleteAlbumButton albumId={params.id} />
      </div>
      <EditAlbumForm
        album={album}
        updateAlbum={async (data) => {
          "use server";
          await updateAlbum(params.id, {
            name: data.name,
            description: data.description || null,
            photos: data.photos,
          });
        }}
      />
    </div>
  );
}

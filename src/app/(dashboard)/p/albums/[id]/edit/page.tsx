import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
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
            <Link href="/p/albums">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Albums</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Album</h1>
        </div>
        <DeleteAlbumButton albumId={id} />
      </div>
      <EditAlbumForm album={album} users={users} />
    </div>
  );
}

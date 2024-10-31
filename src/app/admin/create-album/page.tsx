import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateAlbumForm } from "~/app/admin/create-album/create-album-form";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export default async function CreateAlbumPage() {
  const users = await db.select().from(Users);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/admin/albums">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Albums</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Album</h1>
      </div>
      <CreateAlbumForm users={users} />
    </div>
  );
}

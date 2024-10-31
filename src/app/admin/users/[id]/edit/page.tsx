import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { EditUserForm } from "~/app/admin/users/[id]/edit/edit-user-form";
import { db } from "~/db/client";
import { Users, Albums } from "~/db/schema";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "~/auth";
import { DeleteUserButton } from "./delete-user-button";
import Image from "next/image";

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
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
      <EditUserForm
        user={user}
        updateUser={async ({ email, name }) => {
          "use server";

          if (!session?.user?.isAdmin) {
            throw new Error("Unauthorized");
          }

          await db
            .update(Users)
            .set({ email, name })
            .where(eq(Users.id, params.id));

          revalidatePath("/admin/users");
        }}
      />

      {/* Albums Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">User Albums</h2>
        {albums.length === 0 ? (
          <p className="text-muted-foreground">
            No albums found for this user.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/admin/albums/${album.id}/edit`}
                className="flex flex-col rounded-lg border p-4 hover:bg-muted"
              >
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span>{album.name}</span>
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {album.description ? album.description : "No description"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {album.photos.slice(0, 4).map((photo) => (
                      <div className="relative aspect-square">
                        <Image
                          key={photo.id}
                          src={photo.url}
                          alt={photo.caption || ""}
                          className="rounded-md object-cover"
                          fill
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="mt-4 w-full">Edit Album</Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

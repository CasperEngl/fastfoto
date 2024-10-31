import { desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { AlbumCard } from "~/components/album-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/db/client";
import { Albums, Users } from "~/db/schema";
import { isAdmin } from "~/role";

export default async function AdminPage() {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  const recentUsers = await db.query.Users.findMany({
    limit: 4,
    orderBy: desc(Users.createdAt),
  });

  const recentAlbums = await db.query.Albums.findMany({
    limit: 4,
    orderBy: desc(Albums.createdAt),
    with: { photos: true },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        Admin Dashboard
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="ghost" asChild>
              <Link href="/admin/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Albums</CardTitle>
            <Button variant="ghost" asChild>
              <Link href="/admin/albums">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2">
              {recentAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

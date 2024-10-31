import { desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/db/client";
import { Albums, Users } from "~/db/schema";

export default async function AdminPage() {
  const recentUsers = await db
    .select()
    .from(Users)
    .orderBy(desc(Users.createdAt))
    .limit(3);

  const recentAlbums = await db
    .select()
    .from(Albums)
    .orderBy(desc(Albums.createdAt))
    .limit(3);

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
            <div className="space-y-4">
              {recentAlbums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{album.name}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {album.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { desc, eq } from "drizzle-orm";
import invariant from "invariant";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { isAdmin, isPhotographer } from "~/role";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// Define items per page constant
const ITEMS_PER_PAGE = 10;

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: Promise<unknown>;
}) {
  const { page } = z
    .object({
      page: z.string().optional(),
    })
    .parse(await searchParams);
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  invariant(session.user.id, "User ID is required");

  // Parse page number from query params
  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log("currentPage", currentPage);
  console.log("offset", offset);

  // Get total count for pagination
  const totalCount = await db.query.Albums.findMany({
    where: isAdmin(session.user)
      ? undefined
      : eq(Albums.ownerId, session.user.id),
  }).then((results) => results.length);

  // Fetch paginated albums
  const albums = await db.query.Albums.findMany({
    where: isAdmin(session.user)
      ? undefined
      : eq(Albums.ownerId, session.user.id),
    orderBy: desc(Albums.updatedAt),
    with: {
      photos: true,
      usersToAlbums: {
        with: {
          user: true,
        },
      },
    },
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const transformedAlbums = albums.map((album) => ({
    ...album,
    users: album.usersToAlbums.map(({ user }) => user),
  }));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <Button asChild>
          <Link href="/p/albums/new">
            <Plus className="size-4" />
            Create Album
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={transformedAlbums}
        pagination={{
          currentPage,
          totalPages,
        }}
      />
    </div>
  );
}

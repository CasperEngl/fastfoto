import { and, asc, count, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import invariant from "invariant";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { AlbumsDataTable } from "~/app/dashboard/p/albums/albums-data-table";
import { ITEMS_PER_PAGE } from "~/app/dashboard/p/albums/config";
import { TEAM_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { searchParamsCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { isAdmin, isPhotographer } from "~/role";

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, filters, sort } = searchParamsCache.parse(await searchParams);
  const session = await auth();
  const cookieStore = await cookies();
  const userTeamId = cookieStore.get(TEAM_COOKIE_NAME)?.value;

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  if (!userTeamId) {
    return notFound();
  }

  invariant(session.user.id, "User ID is required");

  // Parse page number from query params
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let whereClause = isAdmin(session.user)
    ? undefined
    : eq(Albums.teamId, userTeamId);

  const nameFilter = filters.find((filter) => filter.id === "name");

  if (nameFilter) {
    whereClause = and(whereClause, ilike(Albums.name, `%${nameFilter.value}%`));

    whereClause = or(
      whereClause,
      sql`SIMILARITY(${Albums.name}, ${nameFilter.value}) > 0.1`,
    );
  }

  let orderByClause: SQL<unknown>[] = [desc(Albums.updatedAt)];

  if (sort.length > 0) {
    orderByClause = [];
    for (const column of sort) {
      // @ts-expect-error column.id should be a valid Albums column
      const albumsColumn = Albums[column.id];

      if (!albumsColumn) {
        console.warn(`Invalid column: ${column.id}`);
        continue;
      }

      orderByClause = [
        ...orderByClause,
        column.desc ? desc(albumsColumn) : asc(albumsColumn),
      ];
    }
  }

  // Fetch paginated albums
  const albums = await db.query.Albums.findMany({
    where: whereClause,
    orderBy: orderByClause,
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
  }).then((albums) => {
    return albums.map((album) => ({
      ...album,
      users: album.usersToAlbums.map(({ user }) => user),
    }));
  });

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(Albums)
    .where(whereClause);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <Button asChild>
          <Link href="/dashboard/p/albums/new">
            <Plus className="size-4" />
            Create Album
          </Link>
        </Button>
      </div>

      <AlbumsDataTable
        data={albums}
        currentPage={page}
        totalPages={totalPages}
        totalResults={totalCount}
      />
    </div>
  );
}

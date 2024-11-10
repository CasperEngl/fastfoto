import { and, asc, count, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import invariant from "invariant";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { AlbumsDataTable } from "~/app/dashboard/p/albums/albums-data-table";
import { ITEMS_PER_PAGE } from "~/app/dashboard/p/albums/config";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { dataTableCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { isAdmin, isPhotographer } from "~/role";

const debug = {
  log: (...args: unknown[]) => console.log("[Albums Page]", ...args),
  error: (...args: unknown[]) => console.error("[Albums Page Error]", ...args),
};

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  debug.log("Rendering albums page with searchParams:", await searchParams);

  const { page, filters, sort } = dataTableCache.parse(await searchParams);
  debug.log("Parsed table cache:", { page, filters, sort });

  const session = await auth();
  const cookieStore = await cookies();
  const userStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  debug.log("Auth context:", {
    userId: session?.user?.id,
    userStudioId,
    isPhotographer: isPhotographer(session?.user),
  });

  if (!isPhotographer(session?.user)) {
    debug.log("Access denied: User is not a photographer");
    return notFound();
  }

  invariant(session.user.id, "User ID is required");

  // Parse page number from query params
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let whereClause = isAdmin(session.user)
    ? undefined
    : !userStudioId
      ? sql`false`
      : eq(Albums.studioId, userStudioId);

  debug.log("Initial where clause:", {
    isAdmin: isAdmin(session.user),
    whereClause,
  });

  const nameFilter = filters.find((filter) => filter.id === "name");

  if (nameFilter) {
    debug.log("Applying name filter:", nameFilter.value);
    whereClause = and(whereClause, ilike(Albums.name, `%${nameFilter.value}%`));

    whereClause = or(
      whereClause,
      sql`SIMILARITY(${Albums.name}, ${nameFilter.value}) > 0.1`,
    );
  }

  let orderByClause: SQL<unknown>[] = [desc(Albums.updatedAt)];

  if (sort.length > 0) {
    debug.log("Applying sort:", sort);
    orderByClause = [];
    for (const column of sort) {
      // @ts-expect-error column.id should be a valid Albums column
      const albumsColumn = Albums[column.id];

      if (!albumsColumn) {
        debug.error(`Invalid sort column:`, column.id);
        continue;
      }

      orderByClause = [
        ...orderByClause,
        column.desc ? desc(albumsColumn) : asc(albumsColumn),
      ];
    }
  }

  debug.log("Executing albums query with:", {
    whereClause,
    orderByClause,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  debug.log("Initial where clause:", {
    isAdmin: isAdmin(session.user),
    whereClause,
  });

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
    debug.log("Retrieved albums count:", albums.length);
    return albums.map((album) => ({
      ...album,
      users: album.usersToAlbums.map(({ user }) => user),
    }));
  });

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(Albums)
    .where(whereClause);

  debug.log("Query results:", {
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    currentPage: page,
  });

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

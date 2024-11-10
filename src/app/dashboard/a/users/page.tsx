import { and, asc, count, desc, ilike, or, sql, SQL } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { ITEMS_PER_PAGE } from "~/app/dashboard/a/users/config";
import { UsersDataTable } from "~/app/dashboard/a/users/users-data-table";
import { auth } from "~/auth";
import { searchParamsCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isAdmin } from "~/role";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, filters, sort } = searchParamsCache.parse(await searchParams);
  console.log("page", page);
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  const offset = (page - 1) * ITEMS_PER_PAGE;

  let whereClause: SQL<unknown> | undefined;
  let orderByClause: SQL<unknown>[] = [];

  const nameFilter = filters.find((filter) => filter.id === "name");

  if (nameFilter) {
    whereClause = and(
      whereClause,
      ilike(schema.Users.name, `%${nameFilter.value}%`),
    );

    whereClause = or(
      whereClause,
      sql`SIMILARITY(${schema.Users.name}, ${nameFilter.value}) > 0.3`,
    );
  }

  // Add any user-specified sort criteria after the match priority
  if (sort.length > 0) {
    for (const column of sort) {
      // @ts-expect-error column.id should be a valid Users column
      const usersColumn = schema.Users[column.id];

      if (!usersColumn) {
        console.warn(`Invalid column: ${column.id}`);
        continue;
      }

      orderByClause = [
        ...orderByClause,
        column.desc ? desc(usersColumn) : asc(usersColumn),
      ];
    }
  }

  const users = await db.query.Users.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(schema.Users)
    .where(whereClause);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/dashboard/a/users/new">
            <Plus className="size-4" />
            Create User
          </Link>
        </Button>
      </div>

      <UsersDataTable
        data={users}
        currentPage={page}
        totalPages={totalPages}
        totalResults={totalCount}
      />
    </div>
  );
}

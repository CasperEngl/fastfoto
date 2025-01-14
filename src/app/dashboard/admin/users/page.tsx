import { asc, count, desc, ilike, or, sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { ITEMS_PER_PAGE } from "~/app/dashboard/admin/users/config";
import { UsersDataTable } from "~/app/dashboard/admin/users/users-data-table";
import { auth } from "~/auth";
import { dataTableCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isAdmin } from "~/role";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, filters, sort } = dataTableCache.parse(await searchParams);
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  const offset = (page - 1) * ITEMS_PER_PAGE;

  const nameFilter = filters.find((filter) => filter.id === "name");
  const whereClause = nameFilter
    ? or(
        ilike(schema.Users.name, `%${nameFilter.value}%`),
        sql`SIMILARITY(${schema.Users.name}, ${nameFilter.value}) > 0.3`,
      )
    : undefined;
  const orderByClause = sort
    .filter((column) => {
      // @ts-expect-error column.id should be a valid Users column
      return !!schema.Users[column.id];
    })
    .map((column) => {
      // @ts-expect-error column.id should be a valid Users column
      const usersColumn = schema.Users[column.id];

      return column.desc ? desc(usersColumn) : asc(usersColumn);
    });

  const users = await db.query.Users.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const [result] = await db
    .select({ count: count() })
    .from(schema.Users)
    .where(whereClause);

  const totalCount = result?.count ?? 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/dashboard/admin/users/new">
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

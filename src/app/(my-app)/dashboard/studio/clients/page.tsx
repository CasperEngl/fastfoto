import { count, desc, eq, sql } from "drizzle-orm";
import invariant from "invariant";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { ITEMS_PER_PAGE } from "~/app/(my-app)/dashboard/studio/albums/config";
import { ClientsDataTable } from "~/app/(my-app)/dashboard/studio/clients/clients-data-table";
import { STUDIO_COOKIE_NAME } from "~/app/(my-app)/globals";
import { auth } from "~/auth";
import { dataTableCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isPhotographer } from "~/role";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, filters, sort } = dataTableCache.parse(await searchParams);
  const session = await auth();
  const cookieStore = await cookies();
  const userStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  invariant(session.user.id, "User ID is required");

  // Parse page number from query params
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Fetch paginated clients
  const clients = await db.query.StudioClients.findMany({
    where(fields, operators) {
      if (!userStudioId) {
        return sql`false`;
      }

      return operators.eq(fields.studioId, userStudioId);
    },
    orderBy: desc(schema.StudioClients.createdAt),
    with: {
      user: true,
    },
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const [result] = await db
    .select({ count: count() })
    .from(schema.StudioClients)
    .where(
      !userStudioId
        ? sql`false`
        : eq(schema.StudioClients.studioId, userStudioId),
    );

  const totalCount = result?.count ?? 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button asChild>
          <Link href="/dashboard/studio/clients/new">
            <Plus className="size-4" />
            Add Clients
          </Link>
        </Button>
      </div>

      <ClientsDataTable
        data={clients}
        currentPage={page}
        totalPages={totalPages}
        totalResults={totalCount}
      />
    </div>
  );
}

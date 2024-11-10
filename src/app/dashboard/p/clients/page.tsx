import { count, desc, eq } from "drizzle-orm";
import invariant from "invariant";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { ITEMS_PER_PAGE } from "~/app/dashboard/p/albums/config";
import { TEAM_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { searchParamsCache } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isPhotographer } from "~/role";
import { ClientsDataTable } from "./clients-data-table";

export default async function ClientsPage({
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

  // Fetch paginated clients
  const clients = await db.query.TeamClients.findMany({
    where(fields, operators) {
      return operators.eq(fields.teamId, userTeamId);
    },
    orderBy: desc(schema.TeamClients.createdAt),
    with: {
      user: true,
    },
    limit: ITEMS_PER_PAGE,
    offset,
  });

  console.log("clients", clients);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(schema.TeamClients)
    .where(eq(schema.TeamClients.teamId, userTeamId));

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button asChild>
          <Link href="/dashboard/p/clients/new">
            <Plus className="size-4" />
            Add Client
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

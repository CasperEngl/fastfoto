import Link from "next/link";
import { notFound } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";
import { Button } from "~/components/ui/button";

export default async function AlbumsPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return notFound();
  }

  const albums = await db.select().from(Albums);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <Button asChild>
          <Link href="/admin/albums/new">Create Album</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={albums} />
    </div>
  );
}

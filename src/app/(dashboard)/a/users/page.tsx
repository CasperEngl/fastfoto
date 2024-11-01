import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { columns } from "~/app/(dashboard)/a/users/columns";
import { DataTable } from "~/app/(dashboard)/a/users/data-table";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";

export default async function UsersPage() {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    return notFound();
  }

  const users = await db.select().from(Users);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/a/users/new">
            <Plus className="size-4" />
            Create User
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

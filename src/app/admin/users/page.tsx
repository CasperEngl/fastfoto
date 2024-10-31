import Link from "next/link";
import { notFound } from "next/navigation";
import { columns } from "~/app/admin/users/columns";
import { DataTable } from "~/app/admin/users/data-table";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return notFound();
  }

  const users = await db.select().from(Users);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/admin/users/new">Create User</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

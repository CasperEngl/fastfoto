import Link from "next/link";
import { notFound } from "next/navigation";
import { columns } from "~/app/admin/users/columns";
import { DataTable } from "~/app/admin/users/data-table";
import { auth } from "~/auth";
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
        <Link
          href="/admin/create-user"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Create User
        </Link>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

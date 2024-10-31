import { columns } from "~/app/admin/users/columns";
import { DataTable } from "~/app/admin/users/data-table";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export default async function UsersPage() {
  const users = await db.select().from(Users);

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Users</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

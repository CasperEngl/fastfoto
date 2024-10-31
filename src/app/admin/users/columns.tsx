"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { UserActions } from "~/app/admin/users/user-actions";
import { Checkbox } from "~/components/ui/checkbox";
import { Users } from "~/db/schema";

export const columns: ColumnDef<InferSelectModel<typeof Users>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/admin/users/${row.original.id}/edit`}
        className="hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isAdmin",
    header: "Admin Status",
    cell: ({ row }) => <div>{row.getValue("isAdmin") ? "Admin" : "User"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return <UserActions user={user} />;
    },
  },
];

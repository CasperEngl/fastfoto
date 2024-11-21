"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { UserActions } from "~/app/(my-app)/dashboard/admin/users/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
      <div className="flex items-center gap-x-3">
        <Avatar className="size-8">
          <AvatarImage
            src={row.original.image ?? undefined}
            alt={row.getValue("name")}
          />
          <AvatarFallback>
            {row.original.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/dashboard/admin/users/${row.original.id}`}
          className="hover:underline"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "userType",
    header: "User Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("userType")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
    meta: {
      align: "end",
    },
  },
];

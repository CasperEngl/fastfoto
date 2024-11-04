"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { AlbumActions } from "./album-actions";
import { Checkbox } from "~/components/ui/checkbox";
import { Albums, Photos, Users } from "~/db/schema";
import { useSession } from "next-auth/react";
import { isAdmin } from "~/role";

export const columns: ColumnDef<
  InferSelectModel<typeof Albums> & {
    users: InferSelectModel<typeof Users>[];
    photos: InferSelectModel<typeof Photos>[];
  }
>[] = [
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
        href={`/p/albums/${row.original.id}/edit`}
        className="hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "users",
    header: "Users",
    cell: ({ row }) => {
      const session = useSession();

      return (
        <div className="flex flex-col gap-y-1">
          {row.original.users.map((user) =>
            isAdmin(session.data?.user) ? (
              <Link
                key={user.id}
                href={`/a/users/${user.id}/edit`}
                className="hover:underline"
              >
                {user.name}
              </Link>
            ) : (
              <span key={user.id}>{user.name}</span>
            ),
          )}
        </div>
      );
    },
  },
  {
    id: "photoCount",
    header: "Photos",
    cell: ({ row }) => row.original.photos.length,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const album = row.original;
      return <AlbumActions album={album} />;
    },
    enableSorting: false,
    enableHiding: false,
    meta: {
      align: "end",
    },
  },
];
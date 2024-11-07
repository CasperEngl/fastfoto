"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { InferSelectModel } from "drizzle-orm";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox";
import { Albums, Photos, Users } from "~/db/schema";
import { isAdmin } from "~/role";
import { AlbumActions } from "./album-actions";

export type AlbumColumn = InferSelectModel<typeof Albums> & {
  users: InferSelectModel<typeof Users>[];
  photos: InferSelectModel<typeof Photos>[];
};

export const columns = [
  {
    accessorKey: "id",
    enableSorting: false,
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
    enableSorting: false,
    cell: ({ row }) => (
      <span className="line-clamp-3">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "users",
    header: "Users",
    enableSorting: false,
    cell: ({ row }) => {
      const session = useSession();

      return (
        <div className="flex flex-col gap-y-1">
          {row.original.users.map((user) =>
            isAdmin(session.data?.user) ? (
              <Link
                key={user.id}
                href={`/a/users/${user.id}/edit`}
                className="block hover:underline"
              >
                {user.name}
              </Link>
            ) : (
              <span key={user.id} className="block">
                {user.name}
              </span>
            ),
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "photos",
    header: "Photos",
    enableSorting: false,
    cell: ({ row }) => row.original.photos.length,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {dayjs(row.original.updatedAt).format("MMM D, YYYY h:mm A")}
      </span>
    ),
    meta: {
      align: "end",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const album = row.original;
      return <AlbumActions album={album} />;
    },
    enableSorting: false,
    meta: {
      align: "end",
    },
  },
] satisfies ColumnDef<AlbumColumn>[];

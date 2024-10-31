"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { AlbumActions } from "./album-actions";
import { Checkbox } from "~/components/ui/checkbox";
import { Albums, Photos, Users } from "~/db/schema";

export const columns: ColumnDef<
  InferSelectModel<typeof Albums> & {
    user: InferSelectModel<typeof Users>;
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
        href={`/admin/albums/${row.original.id}/edit`}
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
    accessorKey: "user",
    header: "Owned by",
    cell: ({ row }) => row.original.user.name,
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

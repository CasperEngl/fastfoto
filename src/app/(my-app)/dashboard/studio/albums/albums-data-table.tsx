"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import { InferSelectModel } from "drizzle-orm";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { AlbumActions } from "~/app/(my-app)/dashboard/studio/albums/album-actions";
import { ITEMS_PER_PAGE } from "~/app/(my-app)/dashboard/studio/albums/config";
import { DataTable, dataTableParsers } from "~/components/data-table";
import { Pagination } from "~/components/pagination";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import * as schema from "~/db/schema";
import { isAdmin } from "~/role";

export type AlbumColumn = InferSelectModel<typeof schema.Albums> & {
  users: InferSelectModel<typeof schema.Users>[];
  photos: InferSelectModel<typeof schema.Photos>[];
};

interface DataTableProps {
  data: AlbumColumn[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}

export function AlbumsDataTable({
  data,
  currentPage,
  totalPages,
  totalResults,
}: DataTableProps) {
  const [searchParams, setSearchParams] = useQueryStates(dataTableParsers, {
    shallow: false,
  });

  const table = useReactTable({
    data,
    columns: [
      {
        accessorKey: "id",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
            href={`/dashboard/studio/albums/${row.original.id}`}
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
          <span className="line-clamp-3 max-w-[18rem]">
            {row.getValue("description")}
          </span>
        ),
      },
      {
        accessorKey: "users",
        header: "Users",
        enableSorting: false,
        cell: ({ row }) => {
          const [open, setOpen] = useState(false);
          const session = useSession();
          const previewCount = 2;

          return (
            <div className="flex flex-col items-start gap-y-1">
              {row.original.users.slice(0, previewCount).map((user) =>
                isAdmin(session.data?.user) ? (
                  <Link
                    key={user.id}
                    href={`/dashboard/admin/users/${user.id}`}
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
              {row.original.users.length > previewCount && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="text-sm text-muted-foreground hover:underline"
                      onMouseEnter={() => setOpen(true)}
                      onMouseLeave={() => setOpen(false)}
                    >
                      +{row.original.users.length - previewCount} more
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="max-w-min px-4 py-2"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                  >
                    <div className="flex flex-col gap-y-1">
                      {row.original.users.slice(previewCount).map((user) =>
                        isAdmin(session.data?.user) ? (
                          <Link
                            key={user.id}
                            href={`/dashboard/admin/users/${user.id}`}
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
                  </PopoverContent>
                </Popover>
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
    ],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages ?? -1,
    state: {
      sorting: searchParams.sort,
      columnFilters: searchParams.filters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: ITEMS_PER_PAGE,
      },
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        const newValue = updater(searchParams.sort);
        setSearchParams({
          sort: newValue,
        });
      } else {
        setSearchParams({
          sort: updater,
        });
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        setSearchParams({
          filters: updater(searchParams.filters),
        });
      } else {
        setSearchParams({
          filters: updater,
        });
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        setSearchParams({
          page:
            updater({
              pageIndex: searchParams.page - 1,
              pageSize: ITEMS_PER_PAGE,
            }).pageIndex + 1,
        });
      } else {
        setSearchParams({
          page: updater.pageIndex + 1,
        });
      }
    },
  });

  return (
    <div>
      <div className="py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);

            setSearchParams({
              page: 1,
            });
          }}
          className="max-w-sm"
        />
      </div>

      <ScrollArea className="max-w-full">
        <DataTable table={table} />

        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        onNextPage={() => {
          setSearchParams({ page: currentPage + 1 });
        }}
        onPreviousPage={() => {
          setSearchParams({ page: currentPage - 1 });
        }}
      />
    </div>
  );
}

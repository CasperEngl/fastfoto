"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import { InferSelectModel } from "drizzle-orm";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { ClientActions } from "~/app/dashboard/p/clients/client-actions";
import { ITEMS_PER_PAGE } from "~/app/dashboard/p/clients/config";
import { DataTable, dataTableParsers } from "~/components/data-table";
import { Pagination } from "~/components/pagination";
import { Checkbox } from "~/components/ui/checkbox";
import * as schema from "~/db/schema";
import { isAdmin } from "~/role";

export type ClientColumn = InferSelectModel<typeof schema.TeamClients> & {
  user: InferSelectModel<typeof schema.Users>;
};

interface DataTableProps {
  data: ClientColumn[];
  totalPages: number;
  totalResults: number;
  currentPage: number;
}

export function ClientsDataTable({
  data,
  currentPage,
  totalResults,
  totalPages,
}: DataTableProps) {
  const [searchParams, setSearchParams] = useQueryStates(dataTableParsers, {
    shallow: false,
  });
  const session = useSession();

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
        accessorKey: "user.name",
        header: "Name",
        cell: ({ row }) => {
          const user = row.original.user;
          return isAdmin(session.data?.user) ? (
            <Link
              href={`/dashboard/a/users/${user.id}`}
              className="hover:underline"
            >
              {user.name}
            </Link>
          ) : (
            <span>{user.name}</span>
          );
        },
      },
      {
        accessorKey: "client.email",
        header: "Email",
        cell: ({ row }) => row.original.user.email,
      },
      {
        accessorKey: "createdAt",
        header: "Added On",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {dayjs(row.original.createdAt).format("MMM D, YYYY")}
          </span>
        ),
        meta: {
          align: "end",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const client = row.original;
          return <ClientActions client={client} />;
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
      <DataTable table={table} />

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

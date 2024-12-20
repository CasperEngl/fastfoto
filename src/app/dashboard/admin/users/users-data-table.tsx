"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import { InferSelectModel } from "drizzle-orm";
import { Camera, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { match } from "ts-pattern";
import { ITEMS_PER_PAGE } from "~/app/dashboard/admin/users/config";
import { UserActions } from "~/app/dashboard/admin/users/user-actions";
import { DataTable, dataTableParsers } from "~/components/data-table";
import { Pagination } from "~/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Users } from "~/db/schema";

type UserColumn = InferSelectModel<typeof Users>;

interface DataTableProps {
  data: UserColumn[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}

export function UsersDataTable({
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
        id: "select",
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
              className="whitespace-nowrap hover:underline"
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
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted">
              {match(row.original.userType)
                .with("admin", () => (
                  <ShieldCheck className="size-4 text-gray-600" />
                ))
                .with("photographer", () => (
                  <Camera className="size-4 text-gray-600" />
                ))
                .with("client", () => <User className="size-4 text-gray-600" />)
                .exhaustive()}
            </span>

            <span className="capitalize">{row.getValue("userType")}</span>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Added On",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {dayjs(row.original.createdAt).format("YYYY/MM/DD • HH:mm")}
          </span>
        ),
        meta: {
          align: "end",
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated On",
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {dayjs(row.original.updatedAt).format("YYYY/MM/DD • HH:mm")}
          </span>
        ),
        meta: {
          align: "end",
        },
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
      <div className="flex items-center py-4">
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

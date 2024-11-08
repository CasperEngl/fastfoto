"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import { Camera, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { match } from "ts-pattern";
import { ITEMS_PER_PAGE } from "~/app/dashboard/a/users/config";
import { UserActions } from "~/app/dashboard/a/users/user-actions";
import { DataTable, searchParamsParsers } from "~/components/data-table";
import { Pagination } from "~/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Users } from "~/db/schema";

type UserColumn = InferSelectModel<typeof Users>;

interface DataTableProps {
  data: UserColumn[];
  totalPages: number;
  currentPage: number;
}

export function UsersDataTable({
  data,
  currentPage,
  totalPages,
}: DataTableProps) {
  const [searchParams, setSearchParams] = useQueryStates(searchParamsParsers, {
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
              href={`/dashboard/a/users/${row.original.id}`}
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
          <div className="flex gap-2 items-center">
            <span className="flex items-center justify-center size-8 rounded-full bg-muted">
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
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <DataTable table={table} />

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

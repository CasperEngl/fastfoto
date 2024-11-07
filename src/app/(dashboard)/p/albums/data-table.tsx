"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { parseAsInteger, parseAsJson, useQueryState } from "nuqs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useQueryState(
    "sort",
    parseAsJson<SortingState>((value) => {
      if (!Array.isArray(value)) return [];
      return value;
    }).withDefault([]),
  );

  const [columnFilters, setColumnFilters] = useQueryState(
    "filters",
    parseAsJson<ColumnFiltersState>((value) => {
      if (!Array.isArray(value)) return [];
      return value;
    }).withDefault([]),
  );

  const [pageIndex, setPageIndex] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(sorting || []) : updater;
      setSorting(newValue || []);
    },
    onColumnFiltersChange: (updater) => {
      const newValue =
        typeof updater === "function" ? updater(columnFilters || []) : updater;
      setColumnFilters(newValue || []);
    },
    state: {
      sorting: sorting || [],
      columnFilters: columnFilters || [],
      pagination: {
        pageIndex: pageIndex || 0,
        pageSize: 10,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: pageIndex || 0,
          pageSize: 10,
        });

        console.log(newState);

        setPageIndex(newState.pageIndex);
      }
    },
    manualPagination: true,
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        align === "start"
                          ? "text-start"
                          : align === "center"
                            ? "text-center"
                            : align === "end"
                              ? "text-end"
                              : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align;
                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          align === "start"
                            ? "text-start"
                            : align === "center"
                              ? "text-center"
                              : align === "end"
                                ? "text-end"
                                : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          {pagination.currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?page=${pagination.currentPage - 1}`}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <div className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage >= pagination.totalPages}
            asChild
          >
            <Link
              href={`?page=${pagination.currentPage + 1}`}
              className="disabled:pointer-events-none"
            >
              Next
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

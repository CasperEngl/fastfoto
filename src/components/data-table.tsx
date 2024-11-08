import {
  ColumnFiltersState,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { Table as ReactTable } from "@tanstack/table-core";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsJson,
} from "nuqs/server";
import { columns } from "~/app/dashboard/a/users/columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

export const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  sort: parseAsJson<SortingState>((value) => {
    if (!Array.isArray(value)) return [];
    return value;
  }).withDefault([]),
  filters: parseAsJson<ColumnFiltersState>((value) => {
    if (!Array.isArray(value)) return [];
    return value;
  }).withDefault([]),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

export function DataTable<TData>({ table }: { table: ReactTable<TData> }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align;
                const isSortable = header.column.getCanSort();

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap",
                      align === "start"
                        ? "text-start"
                        : align === "center"
                          ? "text-center"
                          : align === "end"
                            ? "text-end"
                            : "",
                      isSortable && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {isSortable ? (
                        <div className="w-4">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="size-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="size-4" />
                          ) : (
                            <ArrowUpDown className="size-4" />
                          )}
                        </div>
                      ) : null}
                    </div>
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
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        align === "start"
                          ? "text-start"
                          : align === "center"
                            ? "text-center"
                            : align === "end"
                              ? "text-end"
                              : "",
                      )}
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

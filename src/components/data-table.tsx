import {
  ColumnFiltersState,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { Table as ReactTable } from "@tanstack/table-core";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsJson,
} from "nuqs/server";
import { match } from "ts-pattern";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { cn } from "~/lib/utils";

export const dataTableParsers = {
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

export const dataTableCache = createSearchParamsCache(dataTableParsers);

export function DataTable<TData>({ table }: { table: ReactTable<TData> }) {
  const isMobile = useBreakpoint("sm");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="hidden sm:table-header-group">
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
                      match(align)
                        .with("start", () => "text-start")
                        .with("center", () => "text-center")
                        .with("end", () => "text-end")
                        .otherwise(() => ""),
                      isSortable && "select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        match(align)
                          .with("start", () => "justify-start")
                          .with("center", () => "justify-center")
                          .with("end", () => "justify-end")
                          .otherwise(() => ""),
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {isSortable ? (
                        <div className="w-4">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="size-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronsUpDown className="size-4" />
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
        <TableBody className="sm:table-row-group">
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="flex flex-col border-b p-4 last:border-b-0 hover:bg-inherit sm:table-row sm:p-0"
              >
                {row.getVisibleCells().map((cell) => {
                  const header = cell.column.columnDef.header;
                  const align = !isMobile
                    ? cell.column.columnDef.meta?.align
                    : null;

                  return (
                    <TableCell
                      key={cell.id}
                      className="border-b-0 py-2 sm:table-cell sm:py-4"
                    >
                      <div
                        className={cn(
                          "flex flex-col gap-1",
                          match(align)
                            .with("start", () => "items-start")
                            .with("center", () => "items-center")
                            .with("end", () => "items-end")
                            .otherwise(() => ""),
                        )}
                      >
                        <span className="font-medium text-muted-foreground sm:hidden">
                          {typeof header === "string" ? header : <header />}
                        </span>
                        <span className="break-all sm:break-normal">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

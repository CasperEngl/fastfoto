import { flexRender, Table } from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "~/components/ui/table";

interface DataTableProps<TData> {
  table: Table<TData>;
}

import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsJson,
} from "nuqs/server";

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

export function DataTable<TData>({ table }: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <UITable>
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
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
    </div>
  );
}

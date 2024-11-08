import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsJson,
} from "nuqs/server";

export const albumsSearchParamsParsers = {
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

export const albumSearchParamsCache = createSearchParamsCache(
  albumsSearchParamsParsers,
);

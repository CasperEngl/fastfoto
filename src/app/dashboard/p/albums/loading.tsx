import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function AlbumsLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Albums</h1>
        <Button asChild>
          <Link href="/dashboard/p/albums/new">
            <Plus className="size-4" />
            Create Album
          </Link>
        </Button>
      </div>

      <div className="py-4">
        <Skeleton className="h-9 w-[320px] max-w-sm" />
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors">
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-left align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-right align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
                <th className="h-12 px-4 text-right align-middle">
                  <Skeleton className="h-4 w-full" />
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b transition-colors">
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-4 text-right align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                  <td className="p-4 text-right align-middle">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-8 w-[100px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { toast } from "sonner";
import { deleteAlbum } from "~/app/dashboard/studio/albums/actions";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Albums } from "~/db/schema";

export function AlbumActions({
  album,
}: {
  album: InferSelectModel<typeof Albums>;
}) {
  const [, deleteAction, isPending] = useActionState(
    async (prev: null, albumId: string) => {
      if (!confirm("Are you sure you want to delete this album?")) return null;

      try {
        await deleteAlbum(albumId);
        toast.success("Album deleted successfully");
        return null;
      } catch (error) {
        toast.error("Failed to delete album");
        return null;
      }
    },
    null,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(album.id);
            toast.success("Album ID copied to clipboard");
          }}
        >
          Copy album ID
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/studio/albums/${album.id}`}>Edit album</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => deleteAction(album.id)}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete album"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

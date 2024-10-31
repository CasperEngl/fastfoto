"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Albums } from "~/db/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { deleteAlbum } from "./actions";
import Link from "next/link";

export function AlbumActions({
  album,
}: {
  album: InferSelectModel<typeof Albums>;
}) {
  const deleteAlbumMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      toast.success("Album deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete album");
    },
  });

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
          <Link href={`/admin/albums/${album.id}/edit`}>Edit album</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => deleteAlbumMutation.mutate(album.id)}
          disabled={deleteAlbumMutation.isPending}
        >
          {deleteAlbumMutation.isPending ? "Deleting..." : "Delete album"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

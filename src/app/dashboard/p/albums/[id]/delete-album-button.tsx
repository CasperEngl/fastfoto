"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { deleteAlbum } from "~/app/dashboard/p/albums/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

export function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, deleteAction, isPending] = useActionState(
    async (_prev: null, albumId: string) => {
      if (!confirm("Are you sure you want to delete this album?")) return null;

      try {
        await deleteAlbum(albumId);
        toast.success("Album deleted successfully");
        setOpen(false);
        router.push("/dashboard/p/albums");

        return null;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete album",
        );

        return null;
      }
    },
    null,
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          <span>Delete Album</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the album
            and all its photos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteAction(albumId)}
            disabled={isPending}
            asChild
          >
            <Button variant="destructive">
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

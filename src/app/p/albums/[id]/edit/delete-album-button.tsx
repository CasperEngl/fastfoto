"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { useState } from "react";
import { deleteAlbum } from "~/app/p/albums/actions";

export function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteAlbumMutation = useMutation({
    mutationFn: async () => {
      await deleteAlbum(albumId);
    },
    onSuccess: () => {
      toast.success("Album deleted successfully");
      setOpen(false);
      router.push("/p/albums");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete album",
      );
    },
  });

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
          <AlertDialogCancel disabled={deleteAlbumMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteAlbumMutation.mutate()}
            disabled={deleteAlbumMutation.isPending}
            asChild
          >
            <Button variant="destructive">
              {deleteAlbumMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

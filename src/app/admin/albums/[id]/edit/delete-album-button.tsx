"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAlbum } from "~/app/admin/albums/actions";

export function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteAlbum(albumId);
    },
    onSuccess: () => {
      toast.success("Album deleted successfully");
      router.push("/admin/albums");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete album",
      );
    },
  });

  return (
    <Button
      variant="destructive"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete Album</span>
    </Button>
  );
}

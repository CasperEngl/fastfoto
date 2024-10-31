"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteUser } from "~/app/admin/users/actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteUser(userId);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      router.push("/admin/users");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
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
      <span>Delete User</span>
    </Button>
  );
}

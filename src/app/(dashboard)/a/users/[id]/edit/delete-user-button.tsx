"use client";

import { useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteUser } from "~/app/(dashboard)/a/users/actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteUser(userId);
            toast.success("User deleted successfully");
            router.push("/a/users");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Failed to delete user",
            );
          }
        })
      }
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete User</span>
    </Button>
  );
}

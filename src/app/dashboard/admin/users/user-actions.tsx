"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { toast } from "sonner";
import { deleteUser } from "~/app/dashboard/admin/users/actions";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Users } from "~/db/schema";

export function UserActions({
  user,
}: {
  user: InferSelectModel<typeof Users>;
}) {
  const [, deleteAction, isPending] = useActionState(
    async (prev: null, userId: string) => {
      if (!confirm("Are you sure you want to delete this user?")) return null;

      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");
        return null;
      } catch (error) {
        toast.error("Failed to delete user");
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
            navigator.clipboard.writeText(user.id);
            toast.success("User ID copied to clipboard");
          }}
        >
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/admin/users/${user.id}`}>Edit user</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => deleteAction(user.id)}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

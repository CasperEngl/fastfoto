"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Users } from "~/db/schema";
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
import Link from "next/link";
import { deleteUser } from "~/app/(dashboard)/a/users/actions";

export function UserActions({
  user,
}: {
  user: InferSelectModel<typeof Users>;
}) {
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
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
            navigator.clipboard.writeText(user.id);
            toast.success("User ID copied to clipboard");
          }}
        >
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/a/users/${user.id}/edit`}>Edit user</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => deleteUserMutation.mutate(user.id)}
          disabled={deleteUserMutation.isPending}
        >
          {deleteUserMutation.isPending ? "Deleting..." : "Delete user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

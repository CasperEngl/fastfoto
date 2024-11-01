"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Users } from "~/db/schema";
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
import { useTransition } from "react";

export function UserActions({
  user,
}: {
  user: InferSelectModel<typeof Users>;
}) {
  const [isPending, startTransition] = useTransition();

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
          onClick={() =>
            startTransition(async () => {
              try {
                if (!confirm("Are you sure you want to delete this user?"))
                  return;
                await deleteUser(user.id);
                toast.success("User deleted successfully");
              } catch (error) {
                toast.error("Failed to delete user");
              }
            })
          }
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

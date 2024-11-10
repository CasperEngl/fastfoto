"use client";

import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteClient } from "~/app/dashboard/p/clients/actions";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import * as schema from "~/db/schema";

export function ClientActions({
  client,
}: {
  client: InferSelectModel<typeof schema.StudioClients>;
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
            navigator.clipboard.writeText(client.userId);
            toast.success("Client ID copied to clipboard");
          }}
        >
          Copy client ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            if (!confirm("Are you sure you want to delete this client?"))
              return;

            startTransition(async () => {
              try {
                await deleteClient(client.userId);
                toast.success("Client deleted successfully");
              } catch (error) {
                toast.error("Failed to delete client");
              }
            });
          }}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete client"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteStudio } from "~/app/dashboard/account/settings/actions";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface DeleteStudioButtonProps {
  studioId: string;
  studioName: string;
}

export function DeleteStudioButton({
  studioId,
  studioName,
}: DeleteStudioButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const handleDelete = async () => {
    if (confirmationText !== studioName) {
      toast.error("Please type the studio name correctly to confirm deletion");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStudio(studioId);
      toast.success("Studio deleted successfully");
      router.push("/dashboard/studio/settings");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete studio",
      );
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 size-4" />
          Delete Studio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Studio</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              This action cannot be undone and will permanently delete all
              associated data including albums, photos, and client
              relationships.
            </p>
            <p>
              Please type{" "}
              <span className="font-bold text-black">"{studioName}"</span> to
              confirm deletion.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirmationText">Studio Name</Label>
          <Input
            id="confirmationText"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type the studio name to confirm"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== studioName}
          >
            {isDeleting ? "Deleting..." : "Delete Studio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

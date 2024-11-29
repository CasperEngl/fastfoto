"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface DeleteStudioButtonProps {
  studioId: string;
  studioName: string;
}

const deleteStudioSchema = z.object({
  confirmationText: z.string().refine((value) => value.length > 0, {
    message: "Please type the studio name to confirm deletion",
  }),
});

type DeleteStudioFormValues = z.infer<typeof deleteStudioSchema>;

export function DeleteStudioButton({
  studioId,
  studioName,
}: DeleteStudioButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DeleteStudioFormValues>({
    resolver: zodResolver(deleteStudioSchema),
    defaultValues: {
      confirmationText: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  async function onSubmit(data: DeleteStudioFormValues) {
    if (data.confirmationText !== studioName) {
      form.setError("confirmationText", {
        message: "The studio name you typed does not match",
      });
      return;
    }

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
      setIsOpen(false);
    }
  }

  if (!isOpen && form.formState.isDirty) {
    form.reset();
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confirmationText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Studio Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Type the studio name to confirm"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Deleting..." : "Delete Studio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

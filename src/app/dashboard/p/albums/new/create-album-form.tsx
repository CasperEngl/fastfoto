"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import invariant from "invariant";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SelectedClient } from "~/app/dashboard/p/albums/selected-client";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import * as schema from "~/db/schema";
import { isAdmin, isPhotographer } from "~/role";
import { createAlbum } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  clients: z.array(z.string()).default([]).catch([]),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAlbumForm({
  clients,
  selectedStudioId,
}: {
  clients: Array<InferSelectModel<typeof schema.Users>>;
  selectedStudioId: string;
}) {
  const session = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      clients: [],
    },
  });

  function findClientName(clientId: string) {
    return clients.find((client) => client.id === clientId)?.name ?? "";
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            invariant(
              isPhotographer(session.data?.user),
              "User must be a photographer",
            );

            try {
              const album = await createAlbum({
                ...values,
                studioId: selectedStudioId,
              });
              toast.success("Album created successfully");
              router.push(`/dashboard/p/albums/${album.id}`);
              router.refresh();
            } catch (error) {
              toast.error("Failed to create album");
              console.error("Error creating album:", error);
            }
          });
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="clients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clients</FormLabel>
              <div>
                <Combobox
                  options={clients.map((client) => ({
                    value: client.id,
                    label: client.name ?? "",
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  multiple
                />
              </div>

              {field.value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {field.value
                    .toSorted((a, b) => {
                      const clientA = findClientName(a);
                      const clientB = findClientName(b);

                      return clientA.localeCompare(clientB);
                    })
                    .map((clientId) => {
                      const client = clients.find(
                        (client) => client.id === clientId,
                      );

                      return (
                        <div
                          key={clientId}
                          className="flex items-center gap-x-2 rounded-full border bg-muted px-2 py-1.5 has-[button:hover]:border-destructive has-[button:hover]:bg-destructive/10"
                        >
                          {client ? (
                            isAdmin(session.data?.user) ? (
                              <Link
                                key={client.id}
                                href={`/dashboard/a/users/${client.id}`}
                                className="group h-8"
                              >
                                <SelectedClient
                                  image={client.image}
                                  name={client.name}
                                />
                              </Link>
                            ) : (
                              <SelectedClient
                                image={client.image}
                                name={client.name}
                              />
                            )
                          ) : null}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              form.setValue(
                                "clients",
                                field.value.filter((id) => id !== clientId),
                                { shouldDirty: true },
                              );
                            }}
                          >
                            <span className="sr-only">Remove client</span>
                            <X className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Album name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Album description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Album"}
        </Button>
      </form>
    </Form>
  );
}

import { notFound } from "next/navigation";
import { CreateClientForm } from "~/app/(my-app)/dashboard/studio/clients/new/create-client-form";
import { auth } from "~/auth";
import { isPhotographer } from "~/role";

export default async function CreateClientPage() {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add clients</h1>
      </div>
      <CreateClientForm />
    </div>
  );
}

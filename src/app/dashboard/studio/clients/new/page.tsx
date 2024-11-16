import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { isPhotographer } from "~/role";
import { CreateClientForm } from "./create-client-form";

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

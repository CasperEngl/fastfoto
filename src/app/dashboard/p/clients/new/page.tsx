import { notFound } from "next/navigation";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { hasPhotographerUserType } from "~/role";
import { CreateClientForm } from "./create-client-form";

export default async function CreateClientPage() {
  const session = await auth();
  const users = await db.query.Users.findMany();

  if (!hasPhotographerUserType(session?.user)) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Client</h1>
      </div>
      <CreateClientForm users={users} />
    </div>
  );
}

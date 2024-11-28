import { redirect } from "next/navigation";
import { auth } from "~/auth";
import { CreateStudioForm } from "./create-studio-form";

export default async function NewStudioPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create a new studio</h1>
        <p className="text-muted-foreground">
          Set up a new studio to start managing your photos
        </p>
      </div>
      <CreateStudioForm />
    </div>
  );
}

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { EditUserForm } from "~/app/admin/users/[id]/edit/edit-user-form";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "~/auth";
import { DeleteUserButton } from "./delete-user-button";

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return notFound();
  }

  const [user] = await db.select().from(Users).where(eq(Users.id, params.id));

  if (!user) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Users</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
        </div>
        <DeleteUserButton userId={params.id} />
      </div>
      <EditUserForm
        user={user}
        updateUser={async ({ email, name }) => {
          "use server";

          if (!session?.user?.isAdmin) {
            throw new Error("Unauthorized");
          }

          await db
            .update(Users)
            .set({ email, name })
            .where(eq(Users.id, params.id));

          revalidatePath("/admin/users");
        }}
      />
    </div>
  );
}

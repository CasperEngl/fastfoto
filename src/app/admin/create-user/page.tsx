import { redirect } from "next/navigation";
import { auth } from "~/auth";
import { CreateUserForm } from "./create-user-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function CreateUserPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  );
}

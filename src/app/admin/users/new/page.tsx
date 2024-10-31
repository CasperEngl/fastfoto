import { CreateUserForm } from "~/app/admin/users/new/create-user-form";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Users</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
      </div>
      <CreateUserForm />
    </div>
  );
}

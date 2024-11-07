import { CreateUserForm } from "~/app/dashboard/a/users/new/create-user-form";

export default function CreateUserPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
      </div>
      <CreateUserForm />
    </div>
  );
}

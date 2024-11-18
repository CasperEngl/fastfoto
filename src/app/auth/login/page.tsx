import { redirect } from "next/navigation";
import { auth } from "~/auth";
import { LoginForm } from "~/components/login-form";

export default async function Page() {
  const session = await auth();

  if (session) {
    return redirect("/");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}

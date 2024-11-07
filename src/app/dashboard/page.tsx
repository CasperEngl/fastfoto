import Link from "next/link";
import { SignOutButton } from "~/app/sign-out-button";
import { auth } from "~/auth";
import { Button } from "~/components/ui/button";

export default async function DashboardHome() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {session ? (
        <SignOutButton />
      ) : (
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div>
  );
}

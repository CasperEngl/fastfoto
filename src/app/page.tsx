import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "~/auth";
import { Button } from "~/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {session ? (
        <form
          action={async () => {
            "use server";
            await signOut();
            revalidatePath("/");
            redirect("/");
          }}
        >
          <Button>Sign out</Button>
        </form>
      ) : (
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div>
  );
}

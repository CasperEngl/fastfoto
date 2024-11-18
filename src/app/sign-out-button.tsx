"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "~/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [, action, isPending] = useActionState(async () => {
    await signOut();
    await router.push("/auth/login");
  }, null);

  return (
    <form action={action}>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    </form>
  );
}

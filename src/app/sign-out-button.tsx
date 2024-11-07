"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button>Sign out</Button>
    </form>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut();
      }}
    >
      <Button>Sign out</Button>
    </form>
  );
}

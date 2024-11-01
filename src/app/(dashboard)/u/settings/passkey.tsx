"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/webauthn";
import { Button } from "~/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function PasskeyForm() {
  const session = useSession();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      {session.status === "authenticated" ? (
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                await signIn("passkey", { action: "register" });
              } catch (error) {
                toast("Failed to register passkey");
              }
            })
          }
        >
          {isPending ? "Registering..." : "Register new Passkey"}
        </Button>
      ) : session.status === "unauthenticated" ? (
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                await signIn("passkey");
              } catch (error) {
                toast("Failed to sign in with passkey");
              }
            })
          }
        >
          {isPending ? "Signing in..." : "Sign in with Passkey"}
        </Button>
      ) : null}
    </div>
  );
}

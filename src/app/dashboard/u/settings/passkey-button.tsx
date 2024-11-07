"use client";

import { signIn } from "next-auth/webauthn";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

export function PasskeyButton() {
  const [, registerAction, isRegisterPending] = useActionState(async () => {
    try {
      await signIn("passkey", { action: "register" });
      return true;
    } catch (error) {
      toast("Failed to register passkey");
      return false;
    }
  }, false);

  return (
    <Button disabled={isRegisterPending} onClick={registerAction}>
      {isRegisterPending ? "Registering..." : "Register new Passkey"}
    </Button>
  );
}

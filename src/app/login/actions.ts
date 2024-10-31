"use server";

import { signIn } from "~/auth";

export async function loginMagicLink(options: { email: string }) {
  return await signIn("resend", {
    ...options,
    redirectTo: "/",
  });
}

export async function loginPasskey() {
  return await signIn("passkey", {
    redirectTo: "/",
  });
}

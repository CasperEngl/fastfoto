"use server";

import invariant from "invariant";
import { revalidatePath } from "next/cache";
import "server-only";
import { auth } from "~/auth";

export async function changeTeam(team: string) {
  const session = await auth();

  invariant(session?.user, "User is required");

  session.user.teamId = team;

  revalidatePath("/dashboard");

  return session;
}

"use server";

import { cookies } from "next/headers";
import "server-only";
import { TEAM_COOKIE_NAME } from "~/app/globals";

export async function changeTeam(teamId: string) {
  const cookieStore = await cookies();

  cookieStore.set(TEAM_COOKIE_NAME, teamId);

  return teamId;
}

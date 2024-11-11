"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import "server-only";
import { STUDIO_COOKIE_NAME } from "~/app/globals";

export async function changeStudio(studioId: string) {
  const cookieStore = await cookies();

  cookieStore.set(STUDIO_COOKIE_NAME, studioId);

  revalidatePath("/dashboard");

  return studioId;
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";

export async function updateUser({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    throw new Error("Unauthorized");
  }

  await db.update(Users).set({ email, name }).where(eq(Users.id, userId));

  revalidatePath("/a/users");
}

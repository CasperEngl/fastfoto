"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    throw new Error("Unauthorized");
  }

  if (userId === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  await db.delete(Users).where(eq(Users.id, userId));
  revalidatePath("/a/users");
}

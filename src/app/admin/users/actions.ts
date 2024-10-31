"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized");
  }

  if (userId === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  return;

  await db.delete(Users).where(eq(Users.id, userId));
  revalidatePath("/admin/users");
}

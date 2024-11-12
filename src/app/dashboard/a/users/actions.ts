"use server";

import { eq } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { auditLog } from "~/db/audit-log";
import { db } from "~/db/client";
import { isUserAdmin } from "~/db/queries/users.queries";
import { Users } from "~/db/schema";

export async function deleteUser(userId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const adminUser = await tx.query.Users.findFirst({
      where: isUserAdmin(session.user.id),
      columns: {
        id: true,
      },
    });

    if (!adminUser) {
      throw new Error("Unauthorized");
    }

    if (userId === session.user.id) {
      throw new Error("Cannot delete your own account");
    }

    await tx.delete(Users).where(eq(Users.id, userId));

    await auditLog({
      action: "DELETE",
      entityType: "Users",
      entityId: userId,
      details: `Deleted user with ID ${userId}`,
    });

    revalidatePath("/dashboard/a/users");
  });
}

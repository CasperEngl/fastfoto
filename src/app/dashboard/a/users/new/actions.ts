"use server";

import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";
import { createUserSchema, type CreateUserFormValues } from "./schema";
import { isUserAdmin } from "~/db/queries/users.queries";
import invariant from "invariant";
import { auditLog } from "~/db/audit-log";

export async function createUser(data: CreateUserFormValues) {
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

    const validated = createUserSchema.parse(data);

    const [user] = await tx
      .insert(Users)
      .values({
        name: validated.name,
        email: validated.email,
      })
      .returning();

    if (user) {
      await auditLog({
        action: "CREATE",
        entityType: "Users",
        entityId: user.id,
        details: `Created user with ID ${user.id}`,
      });
    }

    revalidatePath("/dashboard/a/users");

    return user;
  });
}

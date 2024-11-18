"use server";

import invariant from "invariant";
import { revalidatePath } from "next/cache";
import {
  CreateUserFormValues,
  createUserSchema,
} from "~/app/dashboard/admin/users/new/schema";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as usersFilters from "~/db/filters/users";
import { Users } from "~/db/schema";

export async function createUser(data: CreateUserFormValues) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const adminUser = await tx.query.Users.findFirst({
      where: usersFilters.isUserAdmin(session.user.id),
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

    revalidatePath("/dashboard/admin/users");

    return user;
  });
}

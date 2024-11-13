"use server";

import { eq, InferInsertModel } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isUserAdmin } from "~/db/queries/users.queries";
import * as schema from "~/db/schema";
import { validateAllowedProperties } from "~/lib/validate-allowed-properties";

export async function updateUser(
  options: Partial<InferInsertModel<typeof schema.Users>> & {
    id: string;
  },
) {
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

    if (
      options.id === session?.user.id &&
      options.userType !== session.user.userType
    ) {
      throw new Error("You cannot modify your own user type");
    }

    const updateData = {
      email: options.email,
      name: options.name,
      userType: options.userType,
    } satisfies Partial<InferInsertModel<typeof schema.Users>>;

    validateAllowedProperties(options, updateData, ["id"]);

    await tx
      .update(schema.Users)
      .set(updateData)
      .where(eq(schema.Users.id, options.id));

    revalidatePath("/dashboard/admin/users");
  });
}

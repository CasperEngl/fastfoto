"use server";

import { eq, InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { validateAllowedProperties } from "~/lib/validate-allowed-properties";
import { isAdmin } from "~/role";

export async function updateUser(
  options: Partial<InferInsertModel<typeof Users>> & {
    id: string;
  },
) {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    throw new Error("Unauthorized");
  }

  if (
    session?.user.id === options.id &&
    options.userType !== session.user.userType
  ) {
    throw new Error("You cannot modify your own user type");
  }

  const updateData = {
    email: options.email,
    name: options.name,
    userType: options.userType,
  } satisfies Partial<InferInsertModel<typeof Users>>;

  validateAllowedProperties(options, updateData, ["id"]);

  await db.update(Users).set(updateData).where(eq(Users.id, options.id));

  revalidatePath("/a/users");
}

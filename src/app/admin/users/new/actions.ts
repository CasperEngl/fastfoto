"use server";

import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";
import { isAdmin } from "~/role";
import { createUserSchema, type CreateUserFormValues } from "./schema";

export async function createUser(data: CreateUserFormValues) {
  const session = await auth();

  if (!isAdmin(session?.user)) {
    throw new Error("Unauthorized");
  }

  const validated = createUserSchema.parse(data);

  try {
    await db.insert(Users).values({
      name: validated.name,
      email: validated.email,
    });

    revalidatePath("/admin/users");
  } catch (error) {
    throw new Error("Failed to create user");
  }
}

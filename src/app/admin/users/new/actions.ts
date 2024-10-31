"use server";

import { revalidatePath } from "next/cache";
import { createUserSchema, type CreateUserFormValues } from "./schema";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export async function createUser(data: CreateUserFormValues) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
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

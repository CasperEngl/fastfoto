"use server";

import { eq } from "drizzle-orm";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users } from "~/db/schema";

export async function updateProfile(options: {
  name?: string;
  email?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await db
    .update(Users)
    .set({
      name: options.name,
      email: options.email,
    })
    .where(eq(Users.id, session.user.id));
}

"use server";

import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { StudioMembers, Studios } from "~/db/schema";

export async function createStudio({ name }: { name: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const studio = await db.transaction(async (tx) => {
    invariant(session.user?.id, "User ID is required");

    const [studio] = await tx
      .insert(Studios)
      .values({
        name,
        createdById: session.user.id,
      })
      .returning();

    invariant(studio, "Failed to create studio");

    await tx.insert(StudioMembers).values({
      userId: session.user.id,
      studioId: studio.id,
      role: "owner",
    });

    return studio;
  });

  revalidatePath("/dashboard");

  return studio;
}

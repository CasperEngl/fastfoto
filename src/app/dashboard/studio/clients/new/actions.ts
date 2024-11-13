"use server";

import { inArray } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { isStudioManager } from "~/db/queries/studio-member.queries";
import * as schema from "~/db/schema";

export async function createClient(data: { emails: string[] }) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");
    invariant(selectedStudioId, "Must select a studio");

    const studioAdmin = await tx.query.StudioMembers.findFirst({
      where: isStudioManager(selectedStudioId, session.user.id),
      columns: {
        id: true,
      },
    });

    if (!studioAdmin) {
      throw new Error("Unauthorized");
    }

    // Find existing users
    const existingUsers = await tx.query.Users.findMany({
      where: inArray(schema.Users.email, data.emails),
    });

    const existingEmails = new Set(existingUsers.map((user) => user.email));

    // Create new users for emails that don't exist
    const newUserEmails = data.emails.filter(
      (email) => !existingEmails.has(email),
    );
    const newUsers = await tx
      .insert(schema.Users)
      .values(
        newUserEmails.map((email) => ({
          email,
          emailVerified: null,
        })),
      )
      .returning();

    // Combine existing and new users
    const allUsers = [...existingUsers, ...newUsers];

    // Create studio clients for all users
    await tx
      .insert(schema.StudioClients)
      .values(
        allUsers.map((user) => ({
          studioId: selectedStudioId,
          userId: user.id,
        })),
      )
      .onConflictDoNothing();

    revalidatePath("/dashboard/studio/clients");
  });
}
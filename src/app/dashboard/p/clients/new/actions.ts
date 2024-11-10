"use server";

import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isPhotographer } from "~/role";

export async function createClient(data: { emails: string[] }) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    invariant(session.user?.id, "User ID is required");
    invariant(isPhotographer(session.user), "User must be a photographer");

    const users = await tx.query.Users.findMany({
      where(fields, operators) {
        return operators.inArray(fields.email, data.emails);
      },
    });

    for (const user of users) {
      await tx.insert(schema.TeamClients).values({
        teamId: session.user.teamId,
        userId: user.id,
      });
    }

    return null;
  });

  revalidatePath("/dashboard/p/clients");
}

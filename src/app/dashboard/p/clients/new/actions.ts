"use server";

import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isPhotographer } from "~/role";

export async function createClient(data: { emails: string[] }) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    invariant(session.user?.id, "User ID is required");
    invariant(selectedStudioId, "User must select a studio");

    const users = await tx.query.Users.findMany({
      where(fields, operators) {
        return operators.inArray(fields.email, data.emails);
      },
    });

    for (const user of users) {
      await tx.insert(schema.StudioClients).values({
        studioId: selectedStudioId,
        userId: user.id,
      });
    }

    return null;
  });

  revalidatePath("/dashboard/p/clients");
}

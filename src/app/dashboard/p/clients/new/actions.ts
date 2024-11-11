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

    const users = await tx.query.Users.findMany({
      where: inArray(schema.Users.email, data.emails),
    });

    for (const user of users) {
      await tx.insert(schema.StudioClients).values({
        studioId: selectedStudioId,
        userId: user.id,
      });
    }

    revalidatePath("/dashboard/p/clients");
  });
}

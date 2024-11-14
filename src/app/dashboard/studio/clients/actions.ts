"use server";

import { eq } from "drizzle-orm";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import "server-only";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioClientsQuery from "~/db/queries/studio-clients.query";
import * as studioMembersQuery from "~/db/queries/studio-members.query";
import * as schema from "~/db/schema";

export async function deleteClient(userId: string) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");
    invariant(selectedStudioId, "Must select a studio");

    const studioAdmin = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(
        selectedStudioId,
        session.user.id,
      ),
      columns: {
        id: true,
      },
    });

    if (!studioAdmin) {
      throw new Error("Unauthorized");
    }

    const client = await tx.query.StudioClients.findFirst({
      where: studioClientsQuery.isStudioClient(selectedStudioId, userId),
    });

    if (!client) {
      throw new Error("Client not found or unauthorized");
    }

    if (client.studioId !== selectedStudioId) {
      throw new Error("Unauthorized");
    }

    await tx
      .delete(schema.StudioClients)
      .where(eq(schema.StudioClients.userId, userId));

    revalidatePath("/dashboard/studio/clients");
  });
}

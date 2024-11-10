"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import "server-only";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isPhotographer } from "~/role";

export async function deleteClient(clientId: string) {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    throw new Error("Unauthorized");
  }

  const client = await db.query.TeamClients.findFirst({
    where: eq(schema.TeamClients.userId, clientId),
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Verify user belongs to the client's team
  if (client.teamId !== session.user.teamId) {
    throw new Error("Unauthorized - Client belongs to different team");
  }

  await db
    .delete(schema.TeamClients)
    .where(eq(schema.TeamClients.userId, clientId));

  revalidatePath("/dashboard/p/clients");
}

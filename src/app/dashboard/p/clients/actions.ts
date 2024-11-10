"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import "server-only";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { hasPhotographerUserType } from "~/role";

export async function deleteClient(clientId: string) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  if (!hasPhotographerUserType(session?.user)) {
    throw new Error("Unauthorized");
  }

  const client = await db.query.StudioClients.findFirst({
    where: eq(schema.StudioClients.userId, clientId),
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Verify user belongs to the client's studio
  if (client.studioId !== selectedStudioId) {
    throw new Error("Unauthorized - Client belongs to different studio");
  }

  await db
    .delete(schema.StudioClients)
    .where(eq(schema.StudioClients.userId, clientId));

  revalidatePath("/dashboard/p/clients");
}

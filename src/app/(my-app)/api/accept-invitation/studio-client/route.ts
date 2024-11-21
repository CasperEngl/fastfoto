import { and, eq } from "drizzle-orm";
import invariant from "invariant";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import {
  getInvitation,
  redirectToLogin,
  updateInvitationStatus,
} from "~/app/(my-app)/api/accept-invitation/_lib/utils";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export async function GET(request: NextRequest) {
  const session = await auth();
  const searchParams = request.nextUrl.searchParams;
  const invitationId = searchParams.get("invitation");

  if (!session) {
    return redirectToLogin(invitationId, "studio_client");
  }

  if (!invitationId) {
    return redirect(`/dashboard?error=Invalid+invitation`);
  }

  await db.transaction(async (tx) => {
    invariant(session.user?.id, "User is required");
    invariant(session.user?.email, "User email is required");

    const invitation = await getInvitation(
      tx,
      invitationId,
      session.user.email,
      "studio_client",
    );

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Check if user is already a client
    const existingClient = await tx.query.StudioClients.findFirst({
      where: and(
        eq(schema.StudioClients.studioId, invitation.studioId),
        eq(schema.StudioClients.userId, session.user.id),
      ),
    });

    if (existingClient) {
      throw new Error("You are already a client of this studio");
    }

    // Add user as a client
    await tx.insert(schema.StudioClients).values({
      studioId: invitation.studioId,
      userId: session.user.id,
    });

    await updateInvitationStatus(tx, invitationId, "accepted");
  });

  return redirect("/dashboard");
}

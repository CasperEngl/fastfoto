import { and, eq } from "drizzle-orm";
import invariant from "invariant";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export async function GET(request: NextRequest) {
  const session = await auth();
  const searchParams = request.nextUrl.searchParams;
  const invitationId = searchParams.get("invitation");

  if (!session) {
    return redirect(
      `/auth/login?redirect=${encodeURIComponent(
        `/api/accept-invitation?invitation=${invitationId}`,
      )}`,
    );
  }

  if (!invitationId) {
    return redirect(`/dashboard?error=Invalid+invitation`);
  }

  await db.transaction(async (tx) => {
    invariant(session.user?.id, "User ID is required");
    invariant(session.user?.email, "User email is required");

    // Find the invitation
    const invitation = await tx.query.UserInvitations.findFirst({
      where: and(
        eq(schema.UserInvitations.id, invitationId),
        eq(schema.UserInvitations.status, "pending"),
        eq(schema.UserInvitations.email, session.user.email),
        eq(schema.UserInvitations.type, "studio_member"),
      ),
      with: {
        studio: true,
      },
    });

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    // Check if user is already a member
    const existingMember = await tx.query.StudioMembers.findFirst({
      where: and(
        eq(schema.StudioMembers.studioId, invitation.studioId),
        eq(schema.StudioMembers.userId, session.user.id),
      ),
    });

    if (existingMember) {
      throw new Error("You are already a member of this studio");
    }

    // Add user as a member
    await tx.insert(schema.StudioMembers).values({
      studioId: invitation.studioId,
      userId: session.user.id,
      role: invitation.role ?? "member",
    });

    // Update invitation status
    await tx
      .update(schema.UserInvitations)
      .set({
        status: "accepted",
      })
      .where(eq(schema.UserInvitations.id, invitationId));
  });

  return redirect("/dashboard/studio");
}

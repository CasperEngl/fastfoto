"use server";

import dayjs from "dayjs";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { StudioMemberInvitationEmail } from "emails/studio-member-invitation-email";
import invariant from "invariant";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersQuery from "~/db/queries/studio-members.query";
import * as schema from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";

// Add debug logging
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[studio-settings]", ...args);
  }
};

export async function updateStudio(
  data: Omit<InferInsertModel<typeof schema.Studios>, "createdById"> & {
    id: string;
  },
) {
  debug("updateStudio called", { studioId: data.id, name: data.name });
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");
    debug("Starting studio update transaction", { userId: session.user.id });

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(data.id, session.user.id),
      columns: {
        id: true,
      },
    });

    debug("Studio manager check", {
      hasPermission: !!studioManager,
      managerId: studioManager?.id,
    });

    if (!studioManager) {
      debug("Authorization failed for studio update");
      throw new Error("Not authorized to update studio");
    }

    // Update the studio
    const [updatedStudio] = await tx
      .update(schema.Studios)
      .set({
        name: data.name,
      })
      .where(eq(schema.Studios.id, data.id))
      .returning();

    debug("Studio updated successfully", {
      studioId: updatedStudio?.id,
      newName: updatedStudio?.name,
    });

    return updatedStudio;
  });
}

export async function removeMember(studioId: string, memberId: string) {
  debug("removeMember called", { studioId, memberId });
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");
    debug("Starting remove member transaction", { userId: session.user.id });

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
        role: true,
      },
    });

    debug("Studio manager check", {
      hasPermission: !!studioManager,
      managerRole: studioManager?.role,
    });

    if (!studioManager) {
      debug("Authorization failed for member removal");
      throw new Error("Not authorized to remove studio members");
    }

    // Get the member to be removed
    const memberToRemove = await tx.query.StudioMembers.findFirst({
      where: (members, { and, eq }) =>
        and(eq(members.studioId, studioId), eq(members.userId, memberId)),
    });

    debug("Member to remove", {
      found: !!memberToRemove,
      memberRole: memberToRemove?.role,
    });

    if (!memberToRemove) {
      debug("Member not found for removal");
      throw new Error("Member not found");
    }

    // Prevent removing the studio owner
    if (memberToRemove.role === "owner") {
      debug("Attempted to remove studio owner");
      throw new Error("Cannot remove the studio owner");
    }

    // If user is admin, they can't remove other admins
    if (studioManager.role === "admin" && memberToRemove.role === "admin") {
      debug("Admin attempted to remove another admin");
      throw new Error("Admins cannot remove other admins");
    }

    // Remove the member
    await tx
      .delete(schema.StudioMembers)
      .where(
        and(
          eq(schema.StudioMembers.studioId, studioId),
          eq(schema.StudioMembers.userId, memberId),
        ),
      );

    debug("Member removed successfully", { studioId, memberId });
  });
}

export async function addMember(studioId: string, email: string) {
  debug("addMember called", { studioId, email });
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");
    debug("Starting add member transaction", { userId: session.user.id });

    // Get studio details for the email
    const studio = await tx.query.Studios.findFirst({
      where: (studios, { eq }) => eq(studios.id, studioId),
      columns: {
        id: true,
        name: true,
      },
    });

    debug("Studio check", {
      found: !!studio,
      studioName: studio?.name,
    });

    if (!studio) {
      debug("Studio not found");
      throw new Error("Studio not found");
    }

    // Check if user has permission to add members
    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
      },
      with: {
        user: true,
      },
    });

    debug("Studio manager check", {
      hasPermission: !!studioManager,
      managerName: studioManager?.user.name,
    });

    if (!studioManager) {
      debug("Authorization failed for adding member");
      throw new Error("Not authorized to add studio members");
    }

    // Check for existing pending invitation
    const existingInvitation = await tx.query.UserInvitations.findFirst({
      where: (invites, { and, eq }) =>
        and(
          eq(invites.studioId, studioId),
          eq(invites.email, email.toLowerCase()),
          eq(invites.type, "studio_member"),
          eq(invites.status, "pending"),
        ),
    });

    debug("Existing invitation check", {
      hasPendingInvite: !!existingInvitation,
    });

    if (existingInvitation) {
      debug("Duplicate invitation attempt");
      throw new Error("An invitation is already pending for this email");
    }

    // Check if user is already a member (if they exist)
    const existingUser = await tx.query.Users.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      const existingMember = await tx.query.StudioMembers.findFirst({
        where: (members, { and, eq }) =>
          and(
            eq(members.studioId, studioId),
            eq(members.userId, existingUser.id),
          ),
      });

      if (existingMember) {
        throw new Error("User is already a member of this studio");
      }
    }

    // Create invitation for all users (existing and non-existing)
    const [invitation] = await tx
      .insert(schema.UserInvitations)
      .values({
        studioId,
        email: email.toLowerCase(),
        type: "studio_member",
        role: "member",
        invitedById: session.user.id,
        expiresAt: dayjs().add(7, "day").toDate(),
        status: "pending",
      })
      .returning();

    invariant(invitation, "Invitation not found");

    // Create invitation URL - direct to register or accept based on user existence
    const baseUrl = existingUser
      ? `${env.APP_URL}/dashboard/invitations/accept`
      : `${env.APP_URL}/auth/register`;
    const inviteUrl = `${baseUrl}?invitation=${invitation.id}`;

    debug("Invite URL", {
      baseUrl,
      inviteUrl,
    });

    debug("Sending invitation email", {
      to: email.toLowerCase(),
      studioName: studio.name,
      inviterName: studioManager.user.name,
    });

    // Send invitation email
    await resend.emails.send({
      from: "Fast Foto <noreply@fastfoto.com>",
      to: email.toLowerCase(),
      subject: `${studioManager.user.name} invited you to join ${studio.name} on Fast Foto`,
      react: StudioMemberInvitationEmail({
        studioName: studio.name,
        inviterName: studioManager.user.name ?? studioManager.user.email,
        inviteUrl,
        role: invitation.role ?? "member",
      }),
    });

    debug("Invitation created and email sent successfully", {
      invitationId: invitation.id,
    });

    return invitation;
  });
}

export async function cancelInvitation(invitationId: string) {
  debug("cancelInvitation called", { invitationId });
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");
    debug("Starting cancel invitation transaction", {
      userId: session.user.id,
    });

    // Get the invitation with studio details
    const invitation = await tx.query.UserInvitations.findFirst({
      where: (invites, { eq }) => eq(invites.id, invitationId),
      with: {
        studio: {
          with: {
            studioMembers: {
              where: studioMembersQuery.userFilter(session.user.id),
            },
          },
        },
      },
    });

    debug("Invitation check", {
      found: !!invitation,
      studioId: invitation?.studioId,
    });

    if (!invitation) {
      debug("Invitation not found");
      throw new Error("Invitation not found");
    }

    // Check if user has permission to cancel invitations
    const hasPermission = invitation.studio.studioMembers.some((member) => {
      invariant(session.user?.id, "Not authenticated");

      return (
        member.role === "owner" ||
        member.role === "admin" ||
        member.userId === session.user.id
      );
    });

    debug("Permission check", { hasPermission });

    if (!hasPermission) {
      debug("Authorization failed for canceling invitation");
      throw new Error("Not authorized to cancel invitations");
    }

    // Cancel the invitation
    const [canceledInvitation] = await tx
      .update(schema.UserInvitations)
      .set({
        status: "expired",
      })
      .where(eq(schema.UserInvitations.id, invitationId))
      .returning();

    debug("Invitation canceled successfully", { invitationId });

    return canceledInvitation;
  });
}

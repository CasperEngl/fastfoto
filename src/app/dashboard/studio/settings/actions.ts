"use server";

import dayjs from "dayjs";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { StudioMemberInvitationEmail } from "emails/studio-member-invitation-email";
import invariant from "invariant";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersQuery from "~/db/queries/studio-members.query";
import * as schema from "~/db/schema";
import { env } from "~/env";
import { resend, resendFrom } from "~/resend";

export async function updateStudio(
  data: Omit<InferInsertModel<typeof schema.Studios>, "createdById"> & {
    id: string;
  },
) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(data.id, session.user.id),
      columns: {
        id: true,
      },
    });

    if (!studioManager) {
      throw new Error("Not authorized to update studio");
    }

    const [updatedStudio] = await tx
      .update(schema.Studios)
      .set({
        name: data.name,
      })
      .where(eq(schema.Studios.id, data.id))
      .returning();

    return updatedStudio;
  });
}

export async function removeMember(studioId: string, memberId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!studioManager) {
      throw new Error("Not authorized to remove studio members");
    }

    const memberToRemove = await tx.query.StudioMembers.findFirst({
      where: (members, { and, eq }) =>
        and(eq(members.studioId, studioId), eq(members.userId, memberId)),
    });

    if (!memberToRemove) {
      throw new Error("Member not found");
    }

    if (memberToRemove.role === "owner") {
      throw new Error("Cannot remove the studio owner");
    }

    if (studioManager.role === "admin" && memberToRemove.role === "admin") {
      throw new Error("Admins cannot remove other admins");
    }

    await tx
      .delete(schema.StudioMembers)
      .where(
        and(
          eq(schema.StudioMembers.studioId, studioId),
          eq(schema.StudioMembers.userId, memberId),
        ),
      );
  });
}

export async function addMember(studioId: string, email: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studio = await tx.query.Studios.findFirst({
      where: (studios, { eq }) => eq(studios.id, studioId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!studio) {
      throw new Error("Studio not found");
    }

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
      },
      with: {
        user: true,
      },
    });

    if (!studioManager) {
      throw new Error("Not authorized to add studio members");
    }

    const existingUser = await tx.query.Users.findFirst({
      where: eq(schema.Users.email, email.toLowerCase()),
    });

    if (existingUser && existingUser.userType !== "photographer") {
      throw new Error("Only photographers can be added as studio members");
    }

    const existingInvitation = await tx.query.UserInvitations.findFirst({
      where: (invites, { and, eq }) =>
        and(
          eq(invites.studioId, studioId),
          eq(invites.email, email.toLowerCase()),
          eq(invites.type, "studio_member"),
          eq(invites.status, "pending"),
        ),
    });

    if (existingInvitation) {
      throw new Error("An invitation is already pending for this email");
    }

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
        metadata: {
          userType: "photographer",
        },
      })
      .returning();

    invariant(invitation, "Invitation not found");

    const baseUrl = existingUser
      ? `${env.APP_URL}/api/accept-invitation/studio-member`
      : `${env.APP_URL}/auth/register`;
    const inviteUrl = `${baseUrl}?invitation=${invitation.id}`;

    await resend.emails.send({
      from: resendFrom,
      to: email.toLowerCase(),
      subject: `${studioManager.user.name} invited you to join ${studio.name} on Fast Foto`,
      react: StudioMemberInvitationEmail({
        studioName: studio.name,
        inviterName: studioManager.user.name ?? studioManager.user.email,
        inviteUrl,
        role: invitation.role ?? "member",
      }),
    });

    return invitation;
  });
}

export async function cancelInvitation(invitationId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

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

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const hasPermission = invitation.studio.studioMembers.some((member) => {
      invariant(session.user?.id, "Not authenticated");

      return (
        member.role === "owner" ||
        member.role === "admin" ||
        member.userId === session.user.id
      );
    });

    if (!hasPermission) {
      throw new Error("Not authorized to cancel invitations");
    }

    const [canceledInvitation] = await tx
      .update(schema.UserInvitations)
      .set({
        status: "expired",
      })
      .where(eq(schema.UserInvitations.id, invitationId))
      .returning();

    return canceledInvitation;
  });
}

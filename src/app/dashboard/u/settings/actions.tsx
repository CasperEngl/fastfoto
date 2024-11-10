"use server";

import { and, eq, InferInsertModel } from "drizzle-orm";
import VerifyEmailChangeEmail from "emails/verify-email-change";
import invariant from "invariant";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";

export async function updateProfile(data: { name: string }) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  await db
    .update(schema.Users)
    .set({ name: data.name })
    .where(eq(schema.Users.id, session.user.id!));
}

export async function requestEmailChange(newEmail: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  // Generate verification token
  const token = nanoid();
  const verificationLink = `${env.APP_URL}/api/verify-email?token=${token}`;

  // Store the pending email
  await db
    .update(schema.Users)
    .set({ pendingEmail: newEmail })
    .where(eq(schema.Users.id, session.user.id!));

  await db.insert(schema.VerificationTokens).values({
    identifier: session.user.email!,
    token,
    expires: new Date(Date.now() + ms("1d")),
  });

  await resend.emails.send({
    from: "Fast Foto <noreply@casperengelmann.com>",
    to: newEmail,
    subject: "Verify your email change",
    react: <VerifyEmailChangeEmail verificationLink={verificationLink} />,
  });
}

export async function createStudio(data: { name: string }) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Create the studio
  const [studio] = await db
    .insert(schema.Studios)
    .values({
      name: data.name,
      createdById: session.user.id,
    })
    .returning();

  // Add the creator as the studio owner
  await db.insert(schema.StudioMembers).values({
    studioId: studio.id,
    userId: session.user.id,
    role: "owner",
  });

  return studio;
}

export async function deleteStudio(studioId: string) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user is the studio owner
  const studioMember = await db.query.StudioMembers.findFirst({
    where: (members, { and, eq }) => {
      invariant(session?.user?.id, "Not authenticated");

      return and(
        eq(members.studioId, studioId),
        eq(members.userId, session.user.id),
        eq(members.role, "owner"),
      );
    },
  });

  if (!studioMember) {
    throw new Error("Not authorized to delete studio");
  }

  // Delete studio members first (due to foreign key constraints)
  await db
    .delete(schema.StudioMembers)
    .where(eq(schema.StudioMembers.studioId, studioId));

  // Delete the studio
  await db.delete(schema.Studios).where(eq(schema.Studios.id, studioId));
}

export async function leaveStudio(studioId: string) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Check if user is the owner
  const studioMember = await db.query.StudioMembers.findFirst({
    where: (members, { and, eq }) => {
      invariant(session?.user?.id, "Not authenticated");

      return and(
        eq(members.studioId, studioId),
        eq(members.userId, session.user.id!),
      );
    },
  });

  if (!studioMember) {
    throw new Error("Not a member of this studio");
  }

  if (studioMember.role === "owner") {
    throw new Error("Studio owner cannot leave. Delete the studio instead.");
  }

  // Remove user from studio
  await db
    .delete(schema.StudioMembers)
    .where(
      and(
        eq(schema.StudioMembers.studioId, studioId),
        eq(schema.StudioMembers.userId, session.user.id),
      ),
    );
}

export async function updateStudio(
  data: Omit<InferInsertModel<typeof schema.Studios>, "createdById"> & {
    id: string;
  },
) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user is the studio owner or admin
  const studioMember = await db.query.StudioMembers.findFirst({
    where: (members, { and, eq, or }) => {
      invariant(session?.user?.id, "Not authenticated");

      const isStudioMember = and(
        eq(members.studioId, data.id),
        eq(members.userId, session.user.id),
      );

      const hasPermission = or(
        eq(members.role, "owner"),
        eq(members.role, "admin"),
      );

      return and(isStudioMember, hasPermission);
    },
  });

  if (!studioMember) {
    throw new Error("Not authorized to update studio");
  }

  // Update the studio
  const [updatedStudio] = await db
    .update(schema.Studios)
    .set({
      name: data.name,
    })
    .where(eq(schema.Studios.id, data.id))
    .returning();

  return updatedStudio;
}

export async function removeMember(studioId: string, memberId: string) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user has permission to remove members (owner or admin)
  const currentUserMember = await db.query.StudioMembers.findFirst({
    where: (members, { and, eq, or }) => {
      invariant(session?.user?.id, "Not authenticated");

      const isStudioMember = and(
        eq(members.studioId, studioId),
        eq(members.userId, session.user.id),
      );

      const hasPermission = or(
        eq(members.role, "owner"),
        eq(members.role, "admin"),
      );

      return and(isStudioMember, hasPermission);
    },
  });

  if (!currentUserMember) {
    throw new Error("Not authorized to remove studio members");
  }

  // Get the member to be removed
  const memberToRemove = await db.query.StudioMembers.findFirst({
    where: (members, { and, eq }) =>
      and(eq(members.studioId, studioId), eq(members.userId, memberId)),
  });

  if (!memberToRemove) {
    throw new Error("Member not found");
  }

  // Prevent removing the studio owner
  if (memberToRemove.role === "owner") {
    throw new Error("Cannot remove the studio owner");
  }

  // If user is admin, they can't remove other admins
  if (currentUserMember.role === "admin" && memberToRemove.role === "admin") {
    throw new Error("Admins cannot remove other admins");
  }

  // Remove the member
  await db
    .delete(schema.StudioMembers)
    .where(
      and(
        eq(schema.StudioMembers.studioId, studioId),
        eq(schema.StudioMembers.userId, memberId),
      ),
    );
}

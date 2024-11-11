"use server";

import { and, eq, InferInsertModel } from "drizzle-orm";
import VerifyEmailChangeEmail from "emails/verify-email-change";
import invariant from "invariant";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import {
  isStudioManager,
  isStudioMember,
  isStudioOwner,
} from "~/db/queries/studio-member.queries";
import { isUserPhotographer } from "~/db/queries/users.queries";
import * as schema from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";

export async function updateProfile(data: { name: string }) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  await db
    .update(schema.Users)
    .set({ name: data.name })
    .where(eq(schema.Users.id, session.user.id!));
}

export async function requestEmailChange(newEmail: string) {
  const session = await auth();

  // Generate verification token
  const token = nanoid();
  const verificationLink = `${env.APP_URL}/api/verify-email?token=${token}`;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    // Store the pending email
    await tx
      .update(schema.Users)
      .set({ pendingEmail: newEmail })
      .where(eq(schema.Users.id, session.user.id));

    await tx.insert(schema.VerificationTokens).values({
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
  });
}

export async function createStudio(data: { name: string }) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const photographerUser = await tx.query.Users.findFirst({
      where: isUserPhotographer(session.user.id),
      columns: {
        id: true,
      },
    });

    if (!photographerUser) {
      throw new Error("Unauthorized");
    }

    // Create the studio
    const [studio] = await tx
      .insert(schema.Studios)
      .values({
        name: data.name,
        createdById: session.user.id,
      })
      .returning();

    // Add the creator as the studio owner
    await tx.insert(schema.StudioMembers).values({
      studioId: studio.id,
      userId: session.user.id,
      role: "owner",
    });

    return studio;
  });
}

export async function deleteStudio(studioId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioOwner = await tx.query.StudioMembers.findFirst({
      where: isStudioOwner(studioId, session.user.id),
      columns: {
        id: true,
      },
    });

    if (!studioOwner) {
      throw new Error("Not authorized to update studio");
    }

    // Delete studio members first (due to foreign key constraints)
    await tx
      .delete(schema.StudioMembers)
      .where(eq(schema.StudioMembers.studioId, studioId));

    // Delete the studio
    await tx.delete(schema.Studios).where(eq(schema.Studios.id, studioId));
  });
}

export async function leaveStudio(studioId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioMember = await tx.query.StudioMembers.findFirst({
      where: isStudioMember(studioId, session.user.id),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!studioMember) {
      throw new Error("Not a member of this studio");
    }

    if (studioMember.role === "owner") {
      throw new Error("Studio owner cannot leave. Delete the studio instead.");
    }

    // Remove user from studio
    await tx
      .delete(schema.StudioMembers)
      .where(
        and(
          eq(schema.StudioMembers.studioId, studioId),
          eq(schema.StudioMembers.userId, session.user.id),
        ),
      );
  });
}

export async function updateStudio(
  data: Omit<InferInsertModel<typeof schema.Studios>, "createdById"> & {
    id: string;
  },
) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: isStudioManager(data.id, session.user.id),
      columns: {
        id: true,
      },
    });

    if (!studioManager) {
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

    return updatedStudio;
  });
}

export async function removeMember(studioId: string, memberId: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    const studioManager = await tx.query.StudioMembers.findFirst({
      where: isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!studioManager) {
      throw new Error("Not authorized to remove studio members");
    }

    // Get the member to be removed
    const memberToRemove = await tx.query.StudioMembers.findFirst({
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
    if (studioManager.role === "admin" && memberToRemove.role === "admin") {
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
  });
}

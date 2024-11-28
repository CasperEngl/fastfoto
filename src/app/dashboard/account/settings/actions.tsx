"use server";

import { and, eq } from "drizzle-orm";
import VerifyEmailChangeEmail from "emails/verify-email-change";
import invariant from "invariant";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersFilters from "~/db/filters/studio-members";
import * as usersFilters from "~/db/filters/users";
import * as schema from "~/db/schema";
import { env } from "~/env";
import { resend, resendFrom } from "~/resend";

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
      from: resendFrom,
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
      where: usersFilters.isUserPhotographer(session.user.id),
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

    invariant(studio?.id, "Studio ID is required");

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

    // Get all studios where the user is an owner
    const ownedStudios = await tx.query.StudioMembers.findMany({
      where: and(
        studioMembersFilters.userFilter(session.user.id),
        studioMembersFilters.hasStudioRole("owner"),
      ),
      columns: {
        id: true,
        studioId: true,
      },
    });

    console.log("ownedStudios", ownedStudios);

    // Check if user is owner of this studio
    const isOwnerOfThisStudio = ownedStudios.some(
      (studio) => studio.studioId === studioId,
    );

    if (!isOwnerOfThisStudio) {
      throw new Error("Not authorized to delete studio");
    }

    if (ownedStudios.length === 1) {
      throw new Error(
        "Cannot delete your last studio. You must have at least one studio.",
      );
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
      where: studioMembersFilters.isStudioMember(studioId, session.user.id),
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

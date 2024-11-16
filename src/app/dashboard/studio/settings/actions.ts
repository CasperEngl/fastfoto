"use server";

import { and, eq, InferInsertModel } from "drizzle-orm";
import invariant from "invariant";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersQuery from "~/db/queries/studio-members.query";
import * as schema from "~/db/schema";
import { Users } from "~/db/schema";

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
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
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

export async function addMember(studioId: string, email: string) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Not authenticated");

    // Check if user has permission to add members
    const studioManager = await tx.query.StudioMembers.findFirst({
      where: studioMembersQuery.isStudioManager(studioId, session.user.id),
      columns: {
        id: true,
      },
    });

    if (!studioManager) {
      throw new Error("Not authorized to add studio members");
    }

    // Find or create user
    let user = await tx.query.Users.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      // Create new user if doesn't exist
      const [newUser] = await tx
        .insert(Users)
        .values({
          name: email.split("@")[0],
          email: email.toLowerCase(),
          emailVerified: null,
        })
        .returning();
      user = newUser;
    }

    invariant(user, "User not found");

    // Check if user is already a member
    const existingMember = await tx.query.StudioMembers.findFirst({
      where: (members, { and, eq }) =>
        and(eq(members.studioId, studioId), eq(members.userId, user.id)),
    });

    if (existingMember) {
      throw new Error("User is already a member of this studio");
    }

    // Add user as a member
    const [newMember] = await tx
      .insert(schema.StudioMembers)
      .values({
        studioId,
        userId: user.id,
        role: "member",
      })
      .returning();

    return newMember;
  });
}

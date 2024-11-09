"use server";

import { and, eq, InferInsertModel } from "drizzle-orm";
import VerifyEmailChangeEmail from "emails/verify-email-change";
import invariant from "invariant";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { TeamMembers, Teams, Users, VerificationTokens } from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";

export async function updateProfile(data: { name: string }) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  await db
    .update(Users)
    .set({ name: data.name })
    .where(eq(Users.id, session.user.id!));
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
    .update(Users)
    .set({ pendingEmail: newEmail })
    .where(eq(Users.id, session.user.id!));

  await db.insert(VerificationTokens).values({
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

export async function createTeam(data: { name: string }) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Create the team
  const [team] = await db
    .insert(Teams)
    .values({
      name: data.name,
      createdById: session.user.id,
    })
    .returning();

  // Add the creator as the team owner
  await db.insert(TeamMembers).values({
    teamId: team.id,
    userId: session.user.id,
    role: "owner",
  });

  return team;
}

export async function deleteTeam(teamId: string) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user is the team owner
  const teamMember = await db.query.TeamMembers.findFirst({
    where: (members, { and, eq }) => {
      invariant(session?.user?.id, "Not authenticated");

      return and(
        eq(members.teamId, teamId),
        eq(members.userId, session.user.id),
        eq(members.role, "owner"),
      );
    },
  });

  if (!teamMember) {
    throw new Error("Not authorized to delete team");
  }

  // Delete team members first (due to foreign key constraints)
  await db.delete(TeamMembers).where(eq(TeamMembers.teamId, teamId));

  // Delete the team
  await db.delete(Teams).where(eq(Teams.id, teamId));
}

export async function leaveTeam(teamId: string) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Check if user is the owner
  const teamMember = await db.query.TeamMembers.findFirst({
    where: (members, { and, eq }) => {
      invariant(session?.user?.id, "Not authenticated");

      return and(
        eq(members.teamId, teamId),
        eq(members.userId, session.user.id!),
      );
    },
  });

  if (!teamMember) {
    throw new Error("Not a member of this team");
  }

  if (teamMember.role === "owner") {
    throw new Error("Team owner cannot leave. Delete the team instead.");
  }

  // Remove user from team
  await db
    .delete(TeamMembers)
    .where(
      and(
        eq(TeamMembers.teamId, teamId),
        eq(TeamMembers.userId, session.user.id),
      ),
    );
}

export async function updateTeam(
  data: Omit<InferInsertModel<typeof Teams>, "createdById"> & {
    id: string;
  },
) {
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user is the team owner or admin
  const teamMember = await db.query.TeamMembers.findFirst({
    where: (members, { and, eq, or }) => {
      invariant(session?.user?.id, "Not authenticated");

      const isTeamMember = and(
        eq(members.teamId, data.id),
        eq(members.userId, session.user.id),
      );

      const hasPermission = or(
        eq(members.role, "owner"),
        eq(members.role, "admin"),
      );

      return and(isTeamMember, hasPermission);
    },
  });

  if (!teamMember) {
    throw new Error("Not authorized to update team");
  }

  // Update the team
  const [updatedTeam] = await db
    .update(Teams)
    .set({
      name: data.name,
    })
    .where(eq(Teams.id, data.id))
    .returning();

  return updatedTeam;
}

export async function removeMember(teamId: string, memberId: string) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const session = await auth();

  invariant(session?.user?.id, "Not authenticated");

  // Verify user has permission to remove members (owner or admin)
  const currentUserMember = await db.query.TeamMembers.findFirst({
    where: (members, { and, eq, or }) => {
      invariant(session?.user?.id, "Not authenticated");

      const isTeamMember = and(
        eq(members.teamId, teamId),
        eq(members.userId, session.user.id),
      );

      const hasPermission = or(
        eq(members.role, "owner"),
        eq(members.role, "admin"),
      );

      return and(isTeamMember, hasPermission);
    },
  });

  if (!currentUserMember) {
    throw new Error("Not authorized to remove team members");
  }

  // Get the member to be removed
  const memberToRemove = await db.query.TeamMembers.findFirst({
    where: (members, { and, eq }) =>
      and(eq(members.teamId, teamId), eq(members.userId, memberId)),
  });

  if (!memberToRemove) {
    throw new Error("Member not found");
  }

  // Prevent removing the team owner
  if (memberToRemove.role === "owner") {
    throw new Error("Cannot remove the team owner");
  }

  // If user is admin, they can't remove other admins
  if (currentUserMember.role === "admin" && memberToRemove.role === "admin") {
    throw new Error("Admins cannot remove other admins");
  }

  // Remove the member
  await db
    .delete(TeamMembers)
    .where(
      and(eq(TeamMembers.teamId, teamId), eq(TeamMembers.userId, memberId)),
    );
}

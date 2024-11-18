"use server";

import { eq } from "drizzle-orm";
import invariant from "invariant";
import { z } from "zod";
import { RegisterFormSchema } from "~/app/auth/register/schema";
import { signIn } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export async function register(data: z.infer<typeof RegisterFormSchema>) {
  await db.transaction(async (tx) => {
    const validated = RegisterFormSchema.parse(data);

    const [user] = await tx
      .insert(schema.Users)
      .values({
        email: validated.email,
        name: validated.name,
      })
      .returning();

    invariant(user, "User not created");

    if (!validated.invitationId) {
      return;
    }

    const invitation = await tx.query.UserInvitations.findFirst({
      where: eq(schema.UserInvitations.id, validated.invitationId),
    });

    invariant(invitation, "Invalid invitation");

    if (invitation.status !== "pending") {
      throw new Error("Invitation has already been used");
    }

    if (invitation.email !== validated.email) {
      throw new Error("Email does not match invitation");
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error("Invitation has expired");
    }

    await tx
      .update(schema.UserInvitations)
      .set({ status: "accepted" })
      .where(eq(schema.UserInvitations.id, invitation.id));

    if (invitation.type === "studio_client") {
      await tx.insert(schema.StudioClients).values({
        studioId: invitation.studioId,
        userId: user.id,
      });

      await tx
        .update(schema.Users)
        .set({
          userType: "client",
        })
        .where(eq(schema.Users.id, user.id));
    }

    if (invitation.type === "studio_member") {
      await tx.insert(schema.StudioMembers).values({
        studioId: invitation.studioId,
        userId: user.id,
        role: invitation.role ?? "member",
      });

      await tx
        .update(schema.Users)
        .set({
          userType: "photographer",
        })
        .where(eq(schema.Users.id, user.id));
    }
  });

  const theUser = await db.query.Users.findFirst({
    where: eq(schema.Users.email, data.email),
  });

  console.log("theUser", theUser);

  return await signIn("resend", {
    email: data.email,
    redirectTo: "/dashboard",
  });
}

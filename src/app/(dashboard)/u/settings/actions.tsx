"use server";

import { eq } from "drizzle-orm";
import VerifyEmailChangeEmail from "emails/verify-email-change";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users, VerificationTokens } from "~/db/schema";
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
  const verificationLink = `${env.COOLIFY_URL}/api/verify-email?token=${token}`;

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

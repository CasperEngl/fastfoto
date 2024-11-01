"use server";

import { eq } from "drizzle-orm";
import ms from "ms";
import { nanoid } from "nanoid";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users, VerificationTokens } from "~/db/schema";
import { resend } from "~/email";

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

  // Send verification email
  await resend.emails.send({
    from: "Fast Foto <noreply@casperengelmann.com>",
    to: newEmail,
    subject: "Verify your email change",
    html: `
      <p>Click the link below to verify your email change:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}">
        Verify Email
      </a>
    `,
  });
}

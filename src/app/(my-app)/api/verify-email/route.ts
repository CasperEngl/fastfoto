import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { Users, VerificationTokens } from "~/db/schema";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const session = await auth();

  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing-token", request.url));
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify token
    const [verificationToken] = await db
      .select()
      .from(VerificationTokens)
      .where(eq(VerificationTokens.token, token));

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        new URL("/u/settings?error=invalid-token", request.url),
      );
    }

    // Get the pending email
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.id, session.user.id!));

    if (!user?.pendingEmail) {
      return NextResponse.redirect(
        new URL("/u/settings?error=invalid-token", request.url),
      );
    }

    // Update the email and clear pending email
    await db
      .update(Users)
      .set({
        email: user.pendingEmail,
        pendingEmail: null,
        emailVerified: new Date(),
      })
      .where(eq(Users.id, session.user.id!));

    // Delete the verification token
    await db
      .delete(VerificationTokens)
      .where(eq(VerificationTokens.token, token));

    return NextResponse.redirect(
      new URL("/u/settings?verified=true", request.url),
    );
  } catch (error) {
    return NextResponse.redirect(
      new URL("/u/settings?error=invalid-token", request.url),
    );
  }
}

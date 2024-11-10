import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, InferSelectModel } from "drizzle-orm";
import LoginMagicLinkEmail from "emails/login-magic-link";
import invariant from "invariant";
import NextAuth from "next-auth";
import Passkey from "next-auth/providers/passkey";
import Resend from "next-auth/providers/resend";
import { revalidatePath } from "next/cache";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";
import { isPhotographer } from "~/role";

declare module "next-auth" {
  interface User extends InferSelectModel<typeof schema.Users> {
    studioId?: string;
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: updateSession,
} = NextAuth({
  debug: env.APP_DEBUG,
  pages: {
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: schema.Users,
    accountsTable: schema.Accounts,
    authenticatorsTable: schema.Authenticators,
    verificationTokensTable: schema.VerificationTokens,
    sessionsTable: schema.Sessions,
  }),
  experimental: {
    enableWebAuthn: true,
  },
  callbacks: {
    session: async ({ session, user }) => {
      console.log("[Auth] Session callback - User:", {
        id: user.id,
        type: user.userType,
        email: user.email,
      });

      if (user.userType === "photographer") {
        try {
          const userStudios = await db.query.StudioMembers.findMany({
            where: eq(schema.StudioMembers.userId, user.id),
            with: {
              studio: true,
            },
          });

          console.log("[Auth] Photographer studios found:", userStudios.length);

          const userPersonalStudio = userStudios?.find(
            (studio) => studio.role === "owner",
          );
          const selectedStudioId =
            session.user.studioId ?? userPersonalStudio?.studioId;

          if (!selectedStudioId) {
            console.error("[Auth] No studio found for photographer:", user.id);
          }

          invariant(selectedStudioId, "Photographer must have a studio");

          session.user = {
            ...user,
            studioId: selectedStudioId,
          };

          console.log(
            "[Auth] Session updated with studioId:",
            selectedStudioId,
          );
        } catch (error) {
          console.error("[Auth] Error in session callback:", error);
          throw error;
        }
      } else {
        session.user = user;
        console.log("[Auth] Non-photographer session created");
      }

      return session;
    },
    signIn: async ({ user }) => {
      console.log("[Auth] Sign in callback started for user:", {
        id: user.id,
        email: user.email,
      });

      setTimeout(async () => {
        try {
          invariant(user.id, "User ID is required");

          if (isPhotographer(user)) {
            console.log("[Auth] Creating personal studio for photographer");

            const [existingPersonalStudio] = await db
              .select()
              .from(schema.Studios)
              .innerJoin(
                schema.StudioMembers,
                eq(schema.Studios.id, schema.StudioMembers.studioId),
              )
              .where(
                and(
                  eq(schema.StudioMembers.userId, user.id),
                  eq(schema.StudioMembers.role, "owner"),
                ),
              );

            if (!existingPersonalStudio) {
              console.log("[Auth] No personal studio found, creating new one");

              const [studio] = await db
                .insert(schema.Studios)
                .values({
                  name: user.name ? `${user.name}'s Studio` : "My Studio",
                  createdById: user.id,
                })
                .returning();

              await db.insert(schema.StudioMembers).values({
                userId: user.id,
                studioId: studio.id,
                role: "owner",
              });

              console.log("[Auth] Created new studio:", studio.id);
              revalidatePath("/dashboard", "layout");
            } else {
              console.log(
                "[Auth] Existing personal studio found:",
                existingPersonalStudio.studios.id,
              );
            }
          }
        } catch (error) {
          console.error("[Auth] Error in signIn callback:", error);
          // We don't throw here to prevent login failures, but log the error
        }
      }, 100);

      return true;
    },
  },
  providers: [
    Passkey,
    Resend({
      apiKey: env.RESEND_KEY,
      from: '"Fast Foto" <noreply@casperengelmann.com>',
      async sendVerificationRequest(params) {
        try {
          console.log(
            "[Auth] Sending verification email to:",
            params.identifier,
          );

          await resend.emails.send({
            from: "Fast Foto <noreply@casperengelmann.com>",
            to: params.identifier,
            subject: "Sign in to Fast Foto",
            react: (
              <LoginMagicLinkEmail
                loginUrl={params.url}
                expiresAt={params.expires.getTime()}
              />
            ),
          });

          console.log("[Auth] Verification email sent successfully");
        } catch (error) {
          console.error("[Auth] Error sending verification email:", error);
          throw error;
        }
      },
    }),
  ],
});

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, InferSelectModel } from "drizzle-orm";
import LoginMagicLinkEmail from "emails/login-magic-link";
import invariant from "invariant";
import NextAuth from "next-auth";
import Passkey from "next-auth/providers/passkey";
import Resend from "next-auth/providers/resend";
import { revalidatePath } from "next/cache";
import { db } from "~/db/client";
import * as studioMembersFilters from "~/db/filters/studio-members";
import * as schema from "~/db/schema";
import { env } from "~/env";
import { resend, resendFrom } from "~/resend";
import { isPhotographer } from "~/role";

declare module "next-auth" {
  interface User extends InferSelectModel<typeof schema.Users> {}
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
    signIn: "/auth/login",
    newUser: "/auth/register",
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
    session({ session, user }) {
      session.user = user;

      return session;
    },
    signIn: async ({ user }) => {
      setTimeout(async () => {
        try {
          invariant(user.id, "User ID is required");

          if (isPhotographer(user)) {
            const existingPersonalStudio =
              await db.query.StudioMembers.findFirst({
                where: and(
                  studioMembersFilters.userFilter(user.id),
                  studioMembersFilters.hasStudioRole("owner"),
                ),
              });

            if (!existingPersonalStudio) {
              const [studio] = await db
                .insert(schema.Studios)
                .values({
                  name: user.name ? `${user.name}'s Studio` : "My Studio",
                  createdById: user.id,
                })
                .returning();

              invariant(studio?.id, "Studio ID is required");

              await db.insert(schema.StudioMembers).values({
                userId: user.id,
                studioId: studio.id,
                role: "owner",
              });

              revalidatePath("/dashboard");
            }
          }
        } catch (error) {
          // Silent error to prevent login failures
        }
      }, 100);

      return true;
    },
  },
  providers: [
    Passkey,
    Resend({
      apiKey: env.RESEND_KEY,
      from: resendFrom,
      async sendVerificationRequest(params) {
        try {
          await resend.emails.send({
            from: resendFrom,
            to: params.identifier,
            subject: "Sign in to Fast Foto",
            react: (
              <LoginMagicLinkEmail
                loginUrl={params.url}
                expiresAt={params.expires.getTime()}
              />
            ),
          });
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
});

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
      if (user.userType === "photographer") {
        const userStudios = await db.query.StudioMembers.findMany({
          where: eq(schema.StudioMembers.userId, user.id),
          with: {
            studio: true,
          },
        });
        const userPersonalStudio = userStudios?.find(
          (studio) => studio.role === "owner",
        );
        const selectedStudioId =
          session.user.studioId ?? userPersonalStudio?.studioId;

        invariant(selectedStudioId, "Photographer must have a studio");

        session.user = {
          ...user,
          studioId: selectedStudioId,
        };
      } else {
        session.user = user;
      }

      return session;
    },
    signIn: async ({ user }) => {
      setTimeout(async () => {
        invariant(user.id, "User ID is required");

        if (isPhotographer(user)) {
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

            revalidatePath("/dashboard", "layout");
          }
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
      },
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials.email || !credentials.password) {
    //       return null;
    //     }

    //     const { email, password } = z
    //       .object({
    //         email: z.string().email(),
    //         password: z.string(),
    //       })
    //       .parse(credentials);

    //     const [user] = await db
    //       .select()
    //       .from(Users)
    //       .where(eq(Users.email, email));

    //     if (!user) {
    //       return null;
    //     }

    //     return {
    //       id: user.id,
    //       name: user.name,
    //       email: user.email,
    //       image: user.image,
    //       isAdmin: user.isAdmin,
    //     };
    //   },
    // }),
  ],
});

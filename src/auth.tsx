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
    teamId?: string;
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
        const userTeams = await db.query.TeamMembers.findMany({
          where: eq(schema.TeamMembers.userId, user.id),
          with: {
            team: true,
          },
        });
        const userPersonalTeam = userTeams?.find(
          (team) => team.role === "owner",
        );
        const selectedTeamId = session.user.teamId ?? userPersonalTeam?.teamId;

        invariant(selectedTeamId, "Photographer must have a team");

        session.user = {
          ...user,
          teamId: selectedTeamId,
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
          const [existingPersonalTeam] = await db
            .select()
            .from(schema.Teams)
            .innerJoin(
              schema.TeamMembers,
              eq(schema.Teams.id, schema.TeamMembers.teamId),
            )
            .where(
              and(
                eq(schema.TeamMembers.userId, user.id),
                eq(schema.TeamMembers.role, "owner"),
              ),
            );

          if (!existingPersonalTeam) {
            const [team] = await db
              .insert(schema.Teams)
              .values({
                name: user.name ? `${user.name}'s Team` : "My Team",
                createdById: user.id,
              })
              .returning();

            await db.insert(schema.TeamMembers).values({
              userId: user.id,
              teamId: team.id,
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

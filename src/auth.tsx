import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, InferSelectModel } from "drizzle-orm";
import LoginMagicLinkEmail from "emails/login-magic-link";
import invariant from "invariant";
import NextAuth from "next-auth";
import Passkey from "next-auth/providers/passkey";
import Resend from "next-auth/providers/resend";
import { revalidatePath } from "next/cache";
import { db } from "~/db/client";
import {
  Accounts,
  Authenticators,
  Sessions,
  Teams,
  Users,
  UsersToTeams,
  VerificationTokens,
} from "~/db/schema";
import { resend } from "~/email";
import { env } from "~/env";

declare module "next-auth" {
  interface User extends InferSelectModel<typeof Users> {
    teamId: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: env.APP_DEBUG,
  pages: {
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: Users,
    accountsTable: Accounts,
    authenticatorsTable: Authenticators,
    verificationTokensTable: VerificationTokens,
    sessionsTable: Sessions,
  }),
  experimental: {
    enableWebAuthn: true,
  },
  callbacks: {
    session: async ({ session, user }) => {
      const userTeams = await db.query.UsersToTeams.findMany({
        where: eq(UsersToTeams.userId, user.id),
        with: {
          team: true,
        },
      });
      console.log("userTeams", userTeams);
      const userPersonalTeam = userTeams?.find((team) => team.role === "owner");
      const selectedTeamId = session.user.teamId ?? userPersonalTeam?.teamId;

      invariant(selectedTeamId, "User must have a team");

      session.user = {
        ...user,
        teamId: selectedTeamId,
      };

      return session;
    },
    signIn: async ({ user }) => {
      setTimeout(async () => {
        invariant(user.id, "User ID is required");

        // Ensure user has a personal team
        const [existingPersonalTeam] = await db
          .select()
          .from(Teams)
          .innerJoin(UsersToTeams, eq(Teams.id, UsersToTeams.teamId))
          .where(
            and(
              eq(UsersToTeams.userId, user.id),
              eq(UsersToTeams.role, "owner"),
            ),
          );

        if (!existingPersonalTeam) {
          // Create personal team
          const [team] = await db
            .insert(Teams)
            .values({
              name: user.name ? `${user.name}'s Team` : "My Team",
              createdById: user.id,
            })
            .returning();

          // Associate user with team as owner
          await db.insert(UsersToTeams).values({
            userId: user.id,
            teamId: team.id,
            role: "owner",
          });

          revalidatePath("/dashboard", "layout");
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

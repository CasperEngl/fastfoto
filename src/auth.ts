import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/db/client";
import {
  Accounts,
  Users,
  Authenticators,
  VerificationTokens,
  Sessions,
} from "~/db/schema";
import Passkey from "next-auth/providers/passkey";
import { eq, InferSelectModel } from "drizzle-orm";

declare module "next-auth" {
  interface User extends InferSelectModel<typeof Users> {}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    session: async ({ session }) => {
      const [user] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, session.user.email));

      session.user = user;

      return session;
    },
  },
  providers: [
    Passkey({}),
    Resend({
      from: '"Fast Foto" <noreply@casperengelmann.com>',
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

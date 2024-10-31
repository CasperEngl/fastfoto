import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/db/client";
import { Accounts, Users } from "~/db/schema";

declare module "next-auth" {
  interface User {
    isAdmin: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: Users,
    accountsTable: Accounts,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session }) => {
      const [user] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, session.user.email));

      session.user.isAdmin = user.isAdmin;

      return session;
    },
  },
  providers: [
    Resend({
      from: '"Fast Foto" <noreply@casperengelmann.com>',
    }),
  ],
});

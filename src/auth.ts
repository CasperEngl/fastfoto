import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "~/db/client";
import { Accounts, Users } from "~/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: Users,
    accountsTable: Accounts,
  }),
  session: {
    strategy: "jwt",
  },
  providers: [
    Resend({
      from: '"Fast Foto" <noreply@casperengelmann.com>',
    }),
  ],
});

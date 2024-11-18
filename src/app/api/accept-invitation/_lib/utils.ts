import { and, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { Session } from "next-auth";
import { redirect } from "next/navigation";
import * as schema from "~/db/schema";

export type InvitationType =
  (typeof schema.invitationType)["enumValues"][number];

export function redirectToLogin(
  invitationId: string | null,
  type: InvitationType,
) {
  return redirect(
    `/auth/login?redirect=${encodeURIComponent(
      `/api/accept-invitation/${type}?invitation=${invitationId}`,
    )}`,
  );
}

export async function getInvitation(
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  invitationId: string,
  email: string,
  type: InvitationType,
) {
  return tx.query.UserInvitations.findFirst({
    where: and(
      eq(schema.UserInvitations.id, invitationId),
      eq(schema.UserInvitations.status, "pending"),
      eq(schema.UserInvitations.email, email),
      eq(schema.UserInvitations.type, type),
    ),
    with: {
      studio: true,
    },
  });
}

export async function updateInvitationStatus(
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  invitationId: string,
  status: "pending" | "accepted" | "expired",
) {
  await tx
    .update(schema.UserInvitations)
    .set({ status })
    .where(eq(schema.UserInvitations.id, invitationId));
}

export function validateSession(
  session: Session | null,
): asserts session is Session {
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }
}

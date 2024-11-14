"use server";

import { PgTableWithColumns } from "drizzle-orm/pg-core";
import invariant from "invariant";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as usersQuery from "~/db/queries/users.query";
import * as schema from "./schema";

type AuditAction = (
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "APPROVE"
  | "REJECT"
) &
  string & {};

// Get all table names from schema
type EntityType<T extends keyof typeof schema = keyof typeof schema> = {
  [K in keyof typeof schema]: (typeof schema)[K] extends PgTableWithColumns<any>
    ? (typeof schema)[K]["$inferSelect"]
    : never;
}[T];

type AuditLogParams<T extends keyof typeof schema, Values = EntityType<T>> = {
  action: AuditAction;
  entityType: T;
  entityId: string;
  details: string;
  extra?: Partial<Values> & Record<string, unknown>;
};

/**
 * Logs admin actions for audit purposes
 * @throws Will throw an error if user is not an admin
 */
export async function auditLog<T extends keyof typeof schema>(
  params: AuditLogParams<T> | Array<AuditLogParams<T>>,
) {
  const session = await auth();

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");

    const adminUser = await tx.query.Users.findFirst({
      where: usersQuery.isUserAdmin(session.user.id),
      with: {
        adminAuditLogs: true,
      },
    });

    if (!adminUser) {
      throw new Error("Unauthorized");
    }

    // Convert single param to array for unified processing
    const paramsArray = Array.isArray(params) ? params : [params];

    await tx.insert(schema.AdminAuditLogs).values(
      paramsArray.map((param) => {
        invariant(session.user?.id, "Unauthorized");

        return {
          ...param,
          adminId: session.user.id,
        };
      }),
    );
  });
}

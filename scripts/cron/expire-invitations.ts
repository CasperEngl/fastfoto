import { and, eq, lt } from "drizzle-orm";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

const now = new Date();

const log = (...args: any[]) => {
  console.log(`[Expire Invitations] ${new Date().toISOString()}`, ...args);
};

const invitations = await db
  .update(schema.UserInvitations)
  .set({
    status: "expired",
  })
  .where(
    and(
      eq(schema.UserInvitations.status, "pending"),
      lt(schema.UserInvitations.expiresAt, now),
    ),
  )
  .returning();

log(`Expiring ${invitations.length} invitations`);

for (const invitation of invitations) {
  log(`Expiring invitation ${invitation.id} for ${invitation.email}`);
}

log("Job completed successfully");

process.exit(0);

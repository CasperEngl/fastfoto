import { and, eq, lt } from "drizzle-orm";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

const now = new Date();

await db
  .update(schema.UserInvitations)
  .set({
    status: "expired",
  })
  .where(
    and(
      eq(schema.UserInvitations.status, "pending"),
      lt(schema.UserInvitations.expiresAt, now),
    ),
  );

process.exit(0);

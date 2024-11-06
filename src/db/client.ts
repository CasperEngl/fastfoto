import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { env } from "~/env";

export const pool = postgres(
  process.env.NODE_ENV === "production"
    ? env.DATABASE_URL
    : env.DATABASE_URL_EXTERNAL,
  { max: 1, debug: true },
);

export const db = drizzle(pool, { schema, logger: true });

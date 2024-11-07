import { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { env } from "~/env";

class QueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.debug("===BEGIN_QUERY===");
    console.debug(query);
    console.debug(params);
    console.debug("===END_QUERY===");
  }
}

export const pool = postgres(
  process.env.NODE_ENV === "production"
    ? env.DATABASE_URL
    : env.DATABASE_URL_EXTERNAL,
  { max: 1 },
);

export const db = drizzle(pool, {
  schema,
  logger: new QueryLogger(),
});

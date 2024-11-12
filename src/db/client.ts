import { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { env } from "~/env";

class QueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (env.APP_DEBUG === true) {
      console.debug("===BEGIN_QUERY===");
      console.debug(query);
      console.debug(params);
      console.debug("===END_QUERY===");
    }
  }
}

export const dbCredentials = {
  host: env.POSTGRES_HOST,
  port: 5432,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === "production",
} as const;

export const pool = postgres({
  ...dbCredentials,
  max: 1,
});

export const db = drizzle(pool, {
  schema,
  logger: new QueryLogger(),
});

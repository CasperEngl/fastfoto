import { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Resource } from "sst";
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

export const pool = postgres({
  ...Resource.MyPostgres,
  max: 1,
});

export const db = drizzle(pool, {
  schema,
  logger: new QueryLogger(),
});

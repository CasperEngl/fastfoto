import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { env } from "~/env";

export const pool = postgres(env.DATABASE_URL_EXTERNAL, { max: 1 });

export const db = drizzle(pool, { schema });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import * as schema from "~/db/schema";

export const pool = postgres(env.DATABASE_URL, { max: 1 });

export const db = drizzle(pool, { schema });

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import drizzleConfig from "drizzle.config";
import invariant from "invariant";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { env } from "~/env";

export const pool = postgres(env.DATABASE_URL_EXTERNAL, { max: 1 });

export const db = drizzle(pool, { schema });

invariant(drizzleConfig.out, "drizzleConfig.out is required");

await migrate(db, { migrationsFolder: drizzleConfig.out });

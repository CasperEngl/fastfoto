import postgres from "postgres";
import { env } from "~/env";

export const pool = postgres(env.AUTH_DRIZZLE_URL, { max: 1 });

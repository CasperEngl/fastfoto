import { defineConfig } from "drizzle-kit";
import { env } from "~/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: 5432,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
});

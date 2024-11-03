import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import invariant from "invariant";
import { env } from "~/env";

config({
  path: ".env.local",
});

invariant(env.DATABASE_URL, "DATABASE_URL is required");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});

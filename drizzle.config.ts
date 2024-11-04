import { defineConfig } from "drizzle-kit";
import { env } from "~/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? env.DATABASE_URL
        : env.DATABASE_URL_EXTERNAL,
  },
});

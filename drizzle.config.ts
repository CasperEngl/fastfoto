import { defineConfig } from "drizzle-kit";
import invariant from "invariant";
import { env } from "~/env";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? env.DATABASE_URL
    : env.DATABASE_URL_EXTERNAL;

invariant(dbUrl, "dbUrl is required");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});

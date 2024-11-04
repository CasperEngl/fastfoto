import { defineConfig } from "drizzle-kit";
import invariant from "invariant";

invariant(
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL_EXTERNAL,
  process.env.NODE_ENV === "production"
    ? "DATABASE_URL is required"
    : "DATABASE_URL_EXTERNAL is required",
);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_URL!
        : process.env.DATABASE_URL_EXTERNAL!,
  },
});

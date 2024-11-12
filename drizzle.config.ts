import { defineConfig } from "drizzle-kit";
import { dbCredentials } from "~/db/client";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: dbCredentials,
});

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import invariant from "invariant";

config({
  path: ".env.local",
});

invariant(process.env.AUTH_DRIZZLE_URL, "AUTH_DRIZZLE_URL is required");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.AUTH_DRIZZLE_URL,
  },
});

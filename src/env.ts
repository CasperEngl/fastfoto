import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(
  config({
    path: ".env.local",
  }),
);

export const env = createEnv({
  server: {
    COOLIFY_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(1),
    DATABASE_URL_EXTERNAL: z.string().url(),
    DATABASE_URL: z.string().url(),
    RESEND_KEY: z.string().min(1),
  },
  runtimeEnv: {
    COOLIFY_URL: process.env.COOLIFY_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL_EXTERNAL: process.env.DATABASE_URL_EXTERNAL,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_KEY: process.env.RESEND_KEY,
  },
});

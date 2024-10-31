import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    AUTH_DRIZZLE_URL: z.string().url(),
    AUTH_RESEND_KEY: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DRIZZLE_URL: process.env.AUTH_DRIZZLE_URL,
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
  },
});

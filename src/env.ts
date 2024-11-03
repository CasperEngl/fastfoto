import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url(),
    RESEND_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_KEY: process.env.RESEND_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});

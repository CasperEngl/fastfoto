import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(
  config({
    path: ".env.local",
  }),
);

// console.log(
//   "process.env",
//   JSON.stringify(
//     process.env,
//     (key, value) => {
//       if (key.toLowerCase().includes("postgres")) {
//         return "[redacted]";
//       }
//       return value;
//     },
//     2,
//   ),
// );

export const env = createEnv({
  server: {
    APP_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    RESEND_KEY: z.string().min(1),
    AXIOM_DATASET: z.string().min(1),
    AXIOM_TOKEN: z.string().min(1),
    APP_DEBUG: z.boolean().default(false),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_HOST: z.string().min(1),
  },
  runtimeEnv: {
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_USER: process.env.POSTGRES_USER,
    APP_DEBUG: process.env.APP_DEBUG === "true",
    APP_URL:
      process.env.NODE_ENV === "production"
        ? "https://fastfoto.casperengelmann.com"
        : "http://localhost:3000",
    AUTH_SECRET: process.env.AUTH_SECRET,
    AXIOM_DATASET:
      process.env.NODE_ENV === "production" ? "fastfoto-prod" : "fastfoto-dev",
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    RESEND_KEY: process.env.RESEND_KEY,
  },
});

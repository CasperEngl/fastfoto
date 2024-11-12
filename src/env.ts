import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { Resource } from "sst";
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
    APP_DEBUG: z.coerce.boolean().default(false),
    APP_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AXIOM_DATASET: z.string().min(1),
    AXIOM_TOKEN: z.string().min(1),
    RESEND_KEY: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
  },
  runtimeEnv: {
    APP_DEBUG: process.env.APP_DEBUG,
    APP_URL: "https://fastfoto.casperengelmann.com",
    AUTH_SECRET: Resource.AuthSecret.value,
    AXIOM_DATASET:
      process.env.NODE_ENV === "production" ? "fastfoto-prod" : "fastfoto-dev",
    AXIOM_TOKEN: Resource.AxiomToken.value,
    RESEND_KEY: Resource.ResendKey.value,
    UPLOADTHING_TOKEN: Resource.UploadThingToken.value,
  },
});

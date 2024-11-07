import pino from "pino";
import { env } from "~/env";

export const logger = pino(
  { level: "info" },
  pino.transport({
    target: "@axiomhq/pino",
    options: {
      dataset: env.AXIOM_DATASET,
      token: env.AXIOM_TOKEN,
    },
  }),
);

import { eq } from "drizzle-orm";
import * as schema from "~/db/schema";

export const isStudio = (studioId: string) => eq(schema.Studios.id, studioId);
